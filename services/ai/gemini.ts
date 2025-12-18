import { Metadata } from '../../types/index';

export async function generateGemini(
  apiKey: string,
  base64Image: string | null,
  userPrompt: string,
  modelId: string,
  systemPrompt: string
): Promise<Metadata> {
  
  const parts: any[] = [{ text: systemPrompt + "\n\n" + userPrompt + "\n\nReturn strict JSON." }];

  if (base64Image) {
      const [mimeType, data] = base64Image.split(';base64,');
      const actualMime = mimeType.replace('data:', '');
      parts.push({ inline_data: { mime_type: actualMime, data: data } });
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: parts }],
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
  return JSON.parse(text);
}

export async function verifyGemini(key: string): Promise<boolean> {
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