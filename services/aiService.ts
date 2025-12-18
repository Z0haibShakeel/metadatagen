import { Metadata, CustomizationConfig, Provider } from '../types';

// --- Verification ---

export async function verifyApiKey(provider: Provider, key: string): Promise<boolean> {
  if (!key) return false;

  try {
    if (provider === 'groq') {
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        method: "GET",
        headers: { "Authorization": `Bearer ${key}` }
      });
      return response.ok;
    } 
    else if (provider === 'gemini') {
      // Lightweight verification using a dummy generation call via REST API
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "ping" }] }]
          })
        });
        return response.ok;
      } catch (e) {
        return false;
      }
    } 
    else if (provider === 'openai') {
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: { "Authorization": `Bearer ${key}` }
      });
      return response.ok;
    }
  } catch (e) {
    return false;
  }
  return false;
}

// --- Internal Single Request Logic ---

async function makeRequest(
  provider: Provider,
  apiKey: string,
  base64Image: string,
  modelId: string,
  systemPrompt: string
): Promise<Metadata> {
  // 1. Groq
  if (provider === 'groq') {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: [
              { type: "text", text: "Generate metadata." },
              { type: "image_url", image_url: { url: base64Image } }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Status ${response.status}`);
    }
    const data = await response.json();
    return parseJson(data.choices[0].message.content);
  }

  // 2. Gemini (REST API)
  if (provider === 'gemini') {
    const [mimeType, data] = base64Image.split(';base64,');
    const actualMime = mimeType.replace('data:', '');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt + "\n\nReturn strict JSON." },
              { inline_data: { mime_type: actualMime, data: data } }
            ]
          }],
          generationConfig: {
            response_mime_type: "application/json"
          }
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Status ${response.status}`);
    }
    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No content returned from Gemini");
    return parseJson(text);
  }

  // 3. OpenAI
  if (provider === 'openai') {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: [
              { type: "text", text: "Generate metadata." },
              { type: "image_url", image_url: { url: base64Image } }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Status ${response.status}`);
    }
    const data = await response.json();
    return parseJson(data.choices[0].message.content);
  }

  throw new Error("Invalid Provider");
}

// --- Main Generation Function with Auto-Switching ---

export async function generateMetadata(
  provider: Provider,
  apiKeys: string[], 
  base64Image: string,
  modelId: string,
  customization: CustomizationConfig
): Promise<Metadata> {
  
  if (!apiKeys || apiKeys.length === 0) {
    throw new Error(`No API Keys found for ${provider}. Please add keys in Settings.`);
  }

  // Common Prompt Construction
  let keywordInstruction = "";
  switch (customization.keywordFormat) {
    case 'single': keywordInstruction = "Ensure every keyword is strictly a SINGLE word (no spaces)."; break;
    case 'double': keywordInstruction = "Ensure every keyword is strictly a TWO-word phrase."; break;
    default: keywordInstruction = "Keywords can be single words or short phrases as appropriate.";
  }

  const systemPrompt = `
    You are an expert SEO metadata generator. Analyze the image.
    1. Title: Create a descriptive title. Target length: ${customization.titleLength} chars.
    2. Description: Write a detailed description. Target length: ${customization.descriptionLength} chars.
    3. Keywords: List exactly ${customization.keywordCount} keywords. ${keywordInstruction}
    
    Output strictly valid JSON in this format:
    { "title": "...", "description": "...", "keywords": ["...", "..."] }
  `;

  let metadata: Metadata | null = null;
  let lastError: any = null;

  // Try each key sequentially
  for (let i = 0; i < apiKeys.length; i++) {
    const key = apiKeys[i];
    try {
      metadata = await makeRequest(provider, key, base64Image, modelId, systemPrompt);
      
      // If successful, break loop
      if (metadata) break; 

    } catch (e: any) {
      console.warn(`Key ${i + 1}/${apiKeys.length} failed for ${provider}:`, e.message);
      lastError = e;
      
      // If it's the last key, rethrow the error
      if (i === apiKeys.length - 1) {
        throw new Error(`All API keys failed. Last error: ${e.message}`);
      }
      // Otherwise continue to next key (auto-switch)
    }
  }

  if (!metadata) throw new Error("Unknown error during generation.");

  // --- POST PROCESSING (Keyword Rules) ---
  
  // 1. Process Exclusions
  const exclusions = customization.excludeKeywords
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 0);
    
  if (exclusions.length > 0) {
    metadata.keywords = metadata.keywords.filter(
      k => !exclusions.includes(k.toLowerCase())
    );
  }

  // 2. Process Inclusions (Prepend to ensure they are present)
  const inclusions = customization.includeKeywords
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  if (inclusions.length > 0) {
    // Add only if not already present (case-insensitive check)
    const newKeywords = [...metadata.keywords];
    inclusions.forEach(inc => {
        if (!newKeywords.some(k => k.toLowerCase() === inc.toLowerCase())) {
            newKeywords.unshift(inc); // Add to beginning
        }
    });
    metadata.keywords = newKeywords;
  }

  return metadata;
}

function parseJson(content: string): Metadata {
  try {
    // Basic cleanup for code blocks if the model includes them despite instructions
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanContent);
    return {
      title: parsed.title || "",
      description: parsed.description || "",
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : []
    };
  } catch (e) {
    console.error("JSON Parse Error", e, content);
    throw new Error("Failed to parse API response as JSON.");
  }
}