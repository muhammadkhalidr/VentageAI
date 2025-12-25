
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { ProductInput } from "../types";
import { createWavHeader } from "../utils/imageUtils";

// API key is obtained directly from process.env.API_KEY
export const getGeminiInstance = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function generateContentStrategy(inputs: ProductInput): Promise<any> {
  const ai = getGeminiInstance();
  const systemPrompt = `
    Peran: Creative Marketing Director.
    Info Produk: ${inputs.productInfo}.
    Tipe Iklan: ${inputs.adType}.
    Bahasa: ${inputs.lang}.
    Tugas: Buat 12 ide visual (4 B-Roll, 4 UGC, 4 Commercial).
    Aturan:
    - B-Roll: Close up, tekstur, detail, sinematik.
    - UGC: Otentik, manusia menggunakan produk, candid.
    - Commercial: Pencahayaan studio, bersih, staging profesional.
  `;

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
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateProductImage(prompt: string, images: string[], ratio: string): Promise<string> {
  const ai = getGeminiInstance();
  
  const parts = images.map(img => ({
    inlineData: { mimeType: 'image/png', data: img.split(',')[1] }
  }));
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        { text: prompt },
        ...parts
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: ratio as any || "1:1"
      }
    }
  });

  let imageUrl = "";
  // Search for the image part in the response as per guidelines
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }
  
  if (!imageUrl) throw new Error("Gagal generate gambar");
  return imageUrl;
}

export async function generateScript(prompt: string, productInfo: string, lang: string): Promise<string> {
  const ai = getGeminiInstance();
  const instruction = `
    Buatlah naskah Voice Over (VO) berdurasi 15-30 detik dalam bahasa ${lang}.
    Gunakan format tabel Markdown: | WAKTU | NARATOR | MUSIK |.
    Awali narasi dengan tag emosi seperti [Ceria] atau [Tegas].
    Konteks Produk: ${productInfo}.
    Visual: ${prompt}.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: instruction
  });

  return response.text || "Gagal membuat naskah.";
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
  if (!base64Audio) throw new Error("No audio data returned");

  // Helper logic to convert base64 PCM to browser-playable WAV
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const wavBytes = createWavHeader(bytes, 24000); 
  return URL.createObjectURL(new Blob([wavBytes], { type: 'audio/wav' }));
}

export async function rewritePrompt(original: string, style: string): Promise<string> {
  const ai = getGeminiInstance();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Tulis ulang prompt gambar ini agar sesuai dengan gaya visual "${style}". Pertahankan subjek inti. Asli: "${original}". Output: Hanya teks prompt baru.`
  });
  return response.text || original;
}
