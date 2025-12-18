import { Metadata } from '../../types/index';

export async function generateOpenAI(
  apiKey: string,
  base64Image: string | null,
  userPrompt: string,
  modelId: string,
  systemPrompt: string
): Promise<Metadata> {
  
  const content: any[] = [{ type: "text", text: userPrompt }];

  if (base64Image) {
      content.push({ type: "image_url", image_url: { url: base64Image } });
  }

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
        { role: "user", content: content }
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
  return JSON.parse(data.choices[0].message.content);
}

export async function verifyOpenAI(key: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: { "Authorization": `Bearer ${key}` }
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}