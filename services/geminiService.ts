
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ProductInput, VideoSpecs, ModelStrategy, Gender } from "../types";
import { createWavHeader } from "../utils/imageUtils";

export const getGeminiInstance = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function generateContentStrategy(inputs: ProductInput): Promise<string[]> {
  const ai = getGeminiInstance();
  const systemPrompt = `
    Role: Professional Affiliate UGC Video Strategist.
    Product: ${inputs.productInfo}.
    
    Task: Generate exactly 6 high-converting UGC visual concepts focused ONLY on Home Interior (Living Room or Bedroom).
    
    The 6 concepts must vary within these settings:
    1. Bedroom: Morning sunlight, model sitting on a white bed sheet holding the product.
    2. Living Room: Cozy vibes, model on a modern sofa showcasing the product.
    3. Vanity Mirror: Close-up of model applying/showing product in front of a bedroom mirror.
    4. Mirror Selfie: Aesthetic full-body mirror selfie in a stylish bedroom or living room, showing the product and the outfit.
    5. Window Side: Natural soft lighting near curtains, model looking at the product.
    6. Aesthetic Corner: Living room corner with plants and minimal decor, model standing naturally.
    
    Output: JSON array of 6 strings.
    Format: ["concept 1", "concept 2", ...]
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
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
  } catch (error: any) {
    console.error("Strategy Error:", error);
    throw new Error(`Gagal menganalisis produk.`);
  }
}

export async function generateProductImage(prompt: string, images: string[], ratio: string): Promise<string> {
  const ai = getGeminiInstance();
  const imageParts = images.filter(img => img && img.includes(',')).map((img) => ({
    inlineData: { mimeType: 'image/png', data: img.split(',')[1] }
  }));
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { 
            text: `
              STRICT UGC STYLE: 
              SCENE: ${prompt}
              INSTRUCTIONS: 
              - Realistic, aesthetic Indonesian-style modern home.
              - Product must be HELD or PLACED naturally. 
              - KEEP PRODUCT IDENTICAL. 
              - Natural home lighting. 
              - Sharp focus on product.
            ` 
          },
          ...imageParts
        ]
      },
      config: {
        imageConfig: { aspectRatio: (ratio as any) || "1:1" }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Render failed");
  } catch (error: any) {
    throw error;
  }
}

export async function generateVideoSpecs(prompt: string, productInfo: string, strategy: ModelStrategy): Promise<VideoSpecs> {
  const ai = getGeminiInstance();
  
  const genderText = strategy.gender === Gender.MALE ? "Pria" : "Wanita";
  const ageText = strategy.age;
  const persona = `${genderText} dengan kategori usia ${ageText}`;

  const instruction = `
    Berdasarkan konsep visual: "${prompt}" untuk produk "${productInfo}".
    Buatlah spesifikasi untuk pembuatan video pendek (TikTok/Reels).
    
    PENTING: Talent yang berbicara adalah seorang ${persona}.
    Naskah voiceover harus menggunakan gaya bicara, kosakata, dan nada yang sesuai dengan persona tersebut (contoh: jika anak-anak gunakan gaya ceria, jika dewasa gunakan gaya profesional/persuasif).
    
    Output harus dalam JSON dengan field:
    1. video_prompt: Instruksi visual gerakan kamera dan model (Bahasa Indonesia).
    2. voiceover: Teks naskah bicara yang persuasif, serta mengikuti gerakan mulut, natural, dan sesuai karakter ${persona} (Bahasa Indonesia).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: instruction,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          video_prompt: { type: Type.STRING },
          voiceover: { type: Type.STRING }
        },
        required: ["video_prompt", "voiceover"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateScript(prompt: string, productInfo: string): Promise<string> {
  const ai = getGeminiInstance();
  const instruction = `Buat caption promosi singkat (Bahasa Indonesia) untuk produk ${productInfo} dengan konsep ${prompt}. Sertakan hook menarik dan hashtag relevan. Maks 20 kata.`;
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
  if (!base64Audio) throw new Error("Audio error");
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return URL.createObjectURL(new Blob([createWavHeader(bytes, 24000)], { type: 'audio/wav' }));
}
