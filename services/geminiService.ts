
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ProductInput } from "../types";
import { createWavHeader } from "../utils/imageUtils";

export const getGeminiInstance = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function generateContentStrategy(inputs: ProductInput): Promise<any> {
  const ai = getGeminiInstance();
  const systemPrompt = `
    Role: Creative Marketing Director.
    Product Info: ${inputs.productInfo}.
    Ads Type: ${inputs.adType}.
    Language: ${inputs.lang}.
    
    Task: Create visual content ideas that highlight the product's unique features.
    Output: Return a JSON with:
    - "broll": 2 cinematic macro ideas focusing strictly on textures and details.
    - "ugc": 4 authentic lifestyle ideas showing the product in real-world use.
    - "commercial": 2 professional studio product shot ideas.
    
    Each item must have a "text" field describing the visual scene clearly without suggesting text or graphic overlays.
    CRITICAL: JSON ONLY. No other text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: systemPrompt },
            { inlineData: { mimeType: 'image/png', data: inputs.productImage.split(',')[1] } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            broll: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING } } } },
            ugc: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING } } } },
            commercial: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING } } } }
          },
          required: ["broll", "ugc", "commercial"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Kosong");
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error("Strategy Error:", error);
    throw new Error(`AI sedang sibuk atau gambar produk kurang jelas. Silakan coba lagi.`);
  }
}

export async function generateProductImage(prompt: string, images: string[], ratio: string): Promise<string> {
  const ai = getGeminiInstance();
  
  // Menyusun input dengan instruksi analisis gambar yang mendalam
  const parts = images.filter(img => img && img.includes(',')).map(img => ({
    inlineData: { mimeType: 'image/png', data: img.split(',')[1] }
  }));
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { 
            text: `
              INSTRUCTION: Carefully analyze the provided product images. 
              Replicate the product's EXACT shape, color, branding, and details in the new scene described below. 
              DO NOT include any text, logos, or UI elements that are not part of the physical product. 
              The output must be a clean, professional photograph.
              
              SCENE DESCRIPTION: ${prompt}
            ` 
          },
          ...parts
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: (ratio as any) || "1:1"
        }
      }
    });

    const candidates = response.candidates;
    if (!candidates?.[0]?.content?.parts) throw new Error("Safety filter aktif.");

    for (const part of candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("Gagal merender data gambar.");
  } catch (error: any) {
    console.error("Image Error:", error);
    throw error;
  }
}

export async function generateScript(prompt: string, productInfo: string, lang: string): Promise<string> {
  const ai = getGeminiInstance();
  const instruction = `Buat naskah VO pendek (maks 30 kata) untuk iklan produk ${productInfo} berdasarkan visual: ${prompt}. Gunakan bahasa ${lang} yang persuasif tapi natural. Tuliskan naskahnya saja tanpa embel-embel lain.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: instruction
  });
  return response.text || "Naskah tidak tersedia.";
}

export async function generateAudio(text: string, voiceName: string): Promise<string> {
  const ai = getGeminiInstance();
  const cleanedText = text.replace(/\[.*?\]/g, '').trim();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: cleanedText }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Audio data error");

  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

  const wavBytes = createWavHeader(bytes, 24000); 
  return URL.createObjectURL(new Blob([wavBytes], { type: 'audio/wav' }));
}
