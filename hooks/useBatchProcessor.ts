

import { useState, useRef, useCallback, useEffect } from 'react';
import { BatchItem, Metadata, AVAILABLE_MODELS, CustomizationConfig, Provider, MAX_BATCH_SIZE, UserProfile } from '../types/index';
import { generateMetadata } from '../services/ai/index';
import { resizeImage, extractVideoFrame, generateId } from '../services/utils';
import { hasSufficientCredits, deductCredits } from '../services/creditService';

export function useBatchProcessor(
  activeProvider: Provider, 
  activeModelId: string, 
  keys: { [key in Provider]: string[] },
  customization: CustomizationConfig,
  autoSwitch: boolean,
  selectedKeyIndex: number,
  autoModelSwitch: boolean,
  onNotify?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void,
  userProfile?: UserProfile | null,
  onProfileUpdate?: (p: UserProfile) => void
) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const itemsRef = useRef<BatchItem[]>(items);
  const processingRef = useRef(false);
  const profileRef = useRef<UserProfile | null | undefined>(userProfile);

  // Keep refs in sync for async callbacks
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { profileRef.current = userProfile; }, [userProfile]);

  const addFiles = async (files: File[]) => {
    if (items.length + files.length > MAX_BATCH_SIZE) {
        onNotify?.("Limit Reached", `You can only upload up to ${MAX_BATCH_SIZE} files.`, 'warning');
        return;
    }

    setIsUploading(true);
    const startTime = Date.now(); // Start timer for UX delay

    const newItems: BatchItem[] = [];
    
    // Process sequentially to handle async frame extraction for videos
    for (const file of files) {
        const isVideo = file.type.startsWith('video/');
        let previewUrl = "";
        
        try {
            if (isVideo) {
                // Extract frame for video
                previewUrl = await extractVideoFrame(file);
            } else {
                // Standard URL for image
                previewUrl = URL.createObjectURL(file); 
            }

            const initialMetadata: Metadata = { title: '', description: '', keywords: [], category: '' };

            newItems.push({
                id: generateId(),
                file,
                mediaType: isVideo ? 'video' : 'image',
                previewUrl,
                metadata: initialMetadata,
                status: 'idle',
                history: [initialMetadata],
                historyIndex: 0
            });

        } catch (e) {
            console.error("Failed to process file:", file.name, e);
            onNotify?.("Upload Error", `Failed to process ${file.name}`, 'error');
        }
    }

    // Force minimum loading time of 1 seconds for professional feel
    const MIN_LOADING_TIME = 1000;
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < MIN_LOADING_TIME) {
        await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsedTime));
    }

    setItems(prev => {
        const updated = [...prev, ...newItems];
        return updated;
    });
    
    if (!selectedId && newItems.length > 0) {
        setSelectedId(newItems[0].id);
    }
    
    setIsUploading(false);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const clearAll = useCallback(() => {
    if (window.confirm("Are you sure you want to delete all assets?")) {
        setItems([]);
        setSelectedId(null);
    }
  }, []);

  // Update without pushing to history (transient state like typing)
  const updateMetadata = (id: string, field: keyof Metadata, value: any) => {
    setItems(prev => prev.map(i => {
        if (i.id !== id) return i;
        return { ...i, metadata: { ...i.metadata, [field]: value } };
    }));
  };

  // Commit current state to history
  const captureSnapshot = (id: string) => {
    setItems(prev => prev.map(i => {
        if (i.id !== id) return i;
        
        const lastHistory = i.history[i.historyIndex];
        // Compare to avoid duplicate history entries
        if (JSON.stringify(lastHistory) === JSON.stringify(i.metadata)) {
            return i;
        }

        // Slice history if we are branching (redoing then editing)
        const currentHistory = i.history.slice(0, i.historyIndex + 1);
        const newHistory = [...currentHistory, i.metadata];
        
        // Limit history size to prevent memory bloat
        if (newHistory.length > 50) newHistory.shift();

        return { 
            ...i, 
            history: newHistory,
            historyIndex: newHistory.length - 1
        };
    }));
  };

  const undo = (id: string) => {
    setItems(prev => prev.map(i => {
        if (i.id !== id || i.historyIndex <= 0) return i;
        const newIndex = i.historyIndex - 1;
        return {
            ...i,
            metadata: i.history[newIndex],
            historyIndex: newIndex
        };
    }));
  };

  const redo = (id: string) => {
    setItems(prev => prev.map(i => {
        if (i.id !== id || i.historyIndex >= i.history.length - 1) return i;
        const newIndex = i.historyIndex + 1;
        return {
            ...i,
            metadata: i.history[newIndex],
            historyIndex: newIndex
        };
    }));
  };

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);
    
    const currentModelConfig = AVAILABLE_MODELS.find(m => m.id === activeModelId);
    const rpm = currentModelConfig?.rpm || 10;
    const delayMs = (60000 / rpm) * 1.1; 

    const processNext = async () => {
      if (!processingRef.current) { setIsProcessing(false); return; }

      const currentIndex = itemsRef.current.findIndex(i => i.status === 'pending');
      if (currentIndex === -1) {
        processingRef.current = false;
        setIsProcessing(false);
        onNotify?.("Batch Complete", "All items in the queue have been processed.", 'success');
        return;
      }

      // Check credits immediately before processing item
      if (profileRef.current) {
         if (!hasSufficientCredits(profileRef.current, 1)) {
             processingRef.current = false;
             setIsProcessing(false);
             onNotify?.("Insufficient Credits", "You have run out of daily credits.", 'error');
             return;
         }
      }

      const item = itemsRef.current[currentIndex];
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing' } : i));
      setSelectedId(item.id);

      try {
        const isImageMode = customization.generationSource === 'image';
        let base64 = null;
        
        if (isImageMode) {
            if (item.mediaType === 'video') {
                base64 = item.previewUrl;
            } else {
                 base64 = await resizeImage(item.file, 800);
            }
        }

        const providerKeys = keys[activeProvider];
        let keysToUse: string[] = [];
        if (autoSwitch) {
            keysToUse = providerKeys;
        } else {
            const key = providerKeys[selectedKeyIndex];
            if (key) keysToUse = [key];
        }
        if (keysToUse.length === 0) throw new Error("No valid API Key available.");

        let modelsToTry = [activeModelId];
        if (autoModelSwitch) {
            const otherModels = AVAILABLE_MODELS
                .filter(m => m.provider === activeProvider && m.id !== activeModelId)
                .map(m => m.id);
            modelsToTry = [...modelsToTry, ...otherModels];
        }

        const metadata = await generateMetadata(
            activeProvider, 
            keysToUse, 
            base64, 
            item.file.name,
            modelsToTry, 
            customization,
            item.mediaType
        );

        // Deduct Credit on Success
        if (profileRef.current) {
            try {
                const updatedProfile = await deductCredits(profileRef.current, 1);
                onProfileUpdate?.(updatedProfile);
            } catch (creditError) {
                console.error("Credit deduction failed", creditError);
                // We don't fail the generation, but we log it
            }
        }

        setItems(prev => prev.map(i => {
            if (i.id === item.id) {
                 // Push generated metadata to history so user can undo the generation if they want
                 const newHistory = [...i.history.slice(0, i.historyIndex + 1), metadata];
                 return { 
                     ...i, 
                     status: 'completed', 
                     metadata,
                     history: newHistory,
                     historyIndex: newHistory.length - 1
                 };
            }
            return i;
        }));
      } catch (error: any) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', error: error.message || "Failed" } : i));
      }

      if (processingRef.current) {
         const hasMore = itemsRef.current.some(i => i.status === 'pending');
         if (hasMore) {
             await new Promise(resolve => setTimeout(resolve, delayMs));
             processNext();
         } else {
             processingRef.current = false;
             setIsProcessing(false);
             onNotify?.("Batch Complete", "Queue processing finished.", 'success');
         }
      }
    };
    await processNext();
  }, [activeProvider, activeModelId, keys, customization, autoSwitch, selectedKeyIndex, autoModelSwitch, onProfileUpdate]);

  const startQueue = () => {
    if (keys[activeProvider].length === 0) {
      onNotify?.("Missing API Key", `Please add a ${activeProvider.toUpperCase()} API Key in your Profile.`, 'warning');
      return false;
    }
    
    const pendingCount = items.filter(i => i.status === 'idle' || i.status === 'error').length;
    if (pendingCount === 0) return false;

    // Pre-flight credit check
    if (userProfile && !hasSufficientCredits(userProfile, 1)) {
        onNotify?.("Insufficient Credits", "You do not have enough credits to start generation.", 'error');
        return false;
    }

    setItems(prev => prev.map(i => (i.status === 'idle' || i.status === 'error') ? { ...i, status: 'pending', error: undefined } : i));
    setTimeout(processQueue, 100);
    return true;
  };

  const stopQueue = () => {
    processingRef.current = false;
    setIsProcessing(false);
    onNotify?.("Stopped", "Processing queue stopped by user.", 'info');
  };

  const regenerateSingle = (id: string) => {
    if (isProcessing) return;
    if (keys[activeProvider].length === 0) {
        onNotify?.("Missing API Key", `Please add a ${activeProvider.toUpperCase()} API Key.`, 'warning');
        return;
    }

    // Credit check
    if (userProfile && !hasSufficientCredits(userProfile, 1)) {
        onNotify?.("Insufficient Credits", "You do not have enough credits to regenerate.", 'error');
        return;
    }

    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'pending', error: undefined } : i));
    setTimeout(processQueue, 100);
  };

  return {
    items,
    selectedId,
    setSelectedId,
    isProcessing,
    isUploading,
    addFiles,
    removeItem,
    clearAll,
    updateMetadata,
    captureSnapshot,
    startQueue,
    stopQueue,
    regenerateSingle,
    undo,
    redo
  };
}