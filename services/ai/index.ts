
import { CustomizationConfig, Metadata, Provider, CATEGORIES } from '../../types/index';
import { generateGroq, verifyGroq } from './groq';
import { generateGemini, verifyGemini } from './gemini';
import { generateOpenAI, verifyOpenAI } from './openai';

export async function verifyApiKey(provider: Provider, key: string): Promise<boolean> {
  if (!key) return false;
  switch (provider) {
    case 'groq': return verifyGroq(key);
    case 'gemini': return verifyGemini(key);
    case 'openai': return verifyOpenAI(key);
    default: return false;
  }
}

export async function generateMetadata(
  provider: Provider,
  apiKeys: string[], 
  base64Image: string | null,
  filename: string,
  modelIds: string[], // Changed from single modelId to array
  customization: CustomizationConfig,
  mediaType: 'image' | 'video' // Add mediaType param
): Promise<Metadata> {
  
  if (!apiKeys || apiKeys.length === 0) {
    throw new Error(`No API Keys found for ${provider}. Please add keys in Settings.`);
  }

  if (!modelIds || modelIds.length === 0) {
    throw new Error("No models available for generation.");
  }

  const isFilenameMode = customization.generationSource === 'filename';

  // Common Prompt Construction
  let keywordInstruction = "";
  switch (customization.keywordFormat) {
    case 'single': keywordInstruction = "Ensure every keyword is strictly a SINGLE word (no spaces)."; break;
    case 'double': keywordInstruction = "Ensure every keyword is strictly a TWO-word phrase."; break;
    default: keywordInstruction = "Keywords can be single words or short phrases as appropriate.";
  }

  // Exclusion Instructions for Title and Description
  const titleExclusion = customization.excludeTitleWords.trim() 
    ? `Do NOT use the following words in the title: ${customization.excludeTitleWords}.` 
    : "";
    
  const descExclusion = customization.excludeDescriptionWords.trim() 
    ? `Do NOT use the following words in the description: ${customization.excludeDescriptionWords}.` 
    : "";

  const analysisTarget = isFilenameMode 
    ? "the provided filename" 
    : (mediaType === 'video' ? "the video preview frame" : "the image");
  
  const systemPrompt = `
    You are an expert SEO metadata generator. Analyze ${analysisTarget}.

    **TITLE OPTIMIZATION STRATEGY:**
    - **TARGET LENGTH & STRICT ADHERENCE:** Generate a title that is highly descriptive, comprehensive, and elaborate. It must strive to utilize **at least 90%** of the specified ${customization.titleLength} characters, aiming for the maximum possible detail within this limit. **ABSOLUTELY DO NOT exceed ${customization.titleLength} characters.** Conversely, **DO NOT provide short, terse, or generic titles;** actively expand on details, context, emotions, and potential use cases to thoroughly fill the requested length and achieve a character count very close to the target.
    - Style: A compelling, rich, and natural sentence that immediately captures what buyers are looking for with ample detail.
    - Tone: Highly descriptive and informative, as if providing a thorough summary to a meticulous client.
    - NO COLONS EVER: Absolutely never use colons (:) anywhere in the title.
    - NO PREFIXES: No "Title:", "Description:", etc.
    - NO TECH JARGON: Never mention "image", "video", "svg", "vector", "preview", "file", "format".
    - FORBIDDEN PHRASES: "this image", "this video", "shown in this", "depicted in this", "includes", "shows", "this picture", "this photo", "this illustration", "this graphic", "featured in this", "displays", "contains", "presents".
    - FORBIDDEN GENERIC WORDS: Never use generic words like "image", "video", "svg", "jpg", "png", "photo", "picture", "graphic", "illustration" in titles.
    - DIRECT TITLE ONLY: Write titles as if you're directly describing the scene, not describing an image of the scene.
    - Focus: Direct, elaborate description of the scene/subject. Benefits, emotions, specific use cases, environmental context, actions, and detailed visual elements.
    - Optimization: Use powerful, evocative words (stunning, professional, modern, elegant, dynamic, vibrant, intricate, serene, bustling, authentic) and trending keywords.
    - Grammar: Natural sentence flow. No choppy phrasing.
    - SPECIFICITY WINS: "Confident businesswoman presenting quarterly results in bright modern office with detailed charts and engaged colleagues, conveying success and collaboration" beats "Woman in office".
    - COMMERCIAL APPEAL: Focus on business value, lifestyle benefits, or emotional impact with rich narrative.

    1. Title: Craft the title to be highly descriptive and comprehensive, aiming to utilize at least 90% of the space up to ${customization.titleLength} characters, without exceeding the ${customization.titleLength} character limit. ${titleExclusion}
    2. Description: Write a detailed description. Target length: ${customization.descriptionLength} chars. ${descExclusion}
    3. Keywords: List exactly ${customization.keywordCount} keywords. ${keywordInstruction}
    4. Category: Select the best fit category from the specific list below. Return it in the EXACT format "ID: Category Name" (e.g. "17: Social Issues").

    **CATEGORY LIST:**
    ${CATEGORIES.join('\n')}
    
    Output strictly valid JSON in this format:
    { "title": "...", "description": "...", "keywords": ["...", "..."], "category": "..." }
  `;

  let userPrompt = "";
  if (isFilenameMode) {
      userPrompt = `Generate metadata for the file named: "${filename}". Infer the subject and context from the filename.`;
  } else if (mediaType === 'video') {
      userPrompt = `Generate metadata based on this video preview frame. This is a VIDEO file. Describe the likely action, scene, or subject of the video based on this visual frame.`;
  } else {
      userPrompt = `Generate metadata based on this image.`;
  }

  const imagePayload = isFilenameMode ? null : base64Image;

  let metadata: Metadata | null = null;
  let lastError: any = null;

  // --- MODEL LOOP ---
  for (const modelId of modelIds) {
    // --- KEY LOOP ---
    for (let i = 0; i < apiKeys.length; i++) {
        const key = apiKeys[i];
        try {
            if (provider === 'groq') {
                metadata = await generateGroq(key, imagePayload, userPrompt, modelId, systemPrompt);
            } else if (provider === 'gemini') {
                metadata = await generateGemini(key, imagePayload, userPrompt, modelId, systemPrompt);
            } else if (provider === 'openai') {
                metadata = await generateOpenAI(key, imagePayload, userPrompt, modelId, systemPrompt);
            }
            
            // If we got here, success!
            if (metadata) break; 

        } catch (e: any) {
            console.warn(`Failed: Model=${modelId}, KeyIndex=${i}, Provider=${provider}:`, e.message);
            lastError = e;
            // Continue to next key
        }
    }
    // If we have metadata from the Key loop, break the Model loop
    if (metadata) break;
  }

  if (!metadata) {
      throw new Error(lastError?.message || "All models and keys failed to generate metadata.");
  }

  return postProcessMetadata(metadata, customization);
}

function postProcessMetadata(metadata: Metadata, customization: CustomizationConfig): Metadata {
  const result = { ...metadata };
  
  // 1. Process Exclusions (Keywords)
  const exclusions = customization.excludeKeywords
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 0);
    
  if (exclusions.length > 0) {
    result.keywords = result.keywords.filter(
      k => !exclusions.includes(k.toLowerCase())
    );
  }

  // 2. Process Inclusions (Keywords)
  const inclusions = customization.includeKeywords
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  if (inclusions.length > 0) {
    const newKeywords = [...result.keywords];
    inclusions.forEach(inc => {
        if (!newKeywords.some(k => k.toLowerCase() === inc.toLowerCase())) {
            newKeywords.unshift(inc);
        }
    });
    result.keywords = newKeywords;
  }
  
  return result;
}