
import { AgeGroup, Gender, ModelStrategy } from '../types';

export function getModelPrompt(strategy: ModelStrategy): string {
  if (strategy.type === 'upload') {
    return "Gunakan model manusia persis seperti yang terlihat di foto referensi model yang diupload. Pertahankan wajah, ekspresi, dan anatomi tubuhnya secara akurat.";
  }

  let basePrompt = "";
  if (strategy.age === AgeGroup.CHILD) {
    const childGender = strategy.gender === Gender.MALE ? "seorang anak laki-laki kecil" : (strategy.gender === Gender.FEMALE ? "seorang anak perempuan kecil" : "seorang anak kecil");
    basePrompt = `Modelnya adalah ${childGender} berusia sekitar 5-8 tahun, wajah ceria dan kulit bersih.`;
  } else if (strategy.age === AgeGroup.TEEN) {
    const teenGender = strategy.gender === Gender.MALE ? "seorang remaja laki-laki" : (strategy.gender === Gender.FEMALE ? "seorang remaja perempuan" : "seorang remaja");
    basePrompt = `Modelnya adalah ${teenGender} berusia sekitar 16-19 tahun, gaya kasual dan modern.`;
  } else {
    const adultGender = strategy.gender === Gender.MALE ? "seorang pria dewasa" : (strategy.gender === Gender.FEMALE ? "seorang wanita dewasa" : "seseorang dewasa");
    basePrompt = `Modelnya adalah ${adultGender} berusia sekitar 25-35 tahun, terlihat profesional dan elegan.`;
  }

  if (strategy.hijab && strategy.gender !== Gender.MALE) {
    basePrompt += " Menggunakan hijab gaya modern yang rapi dan serasi dengan pakaian.";
  }

  return basePrompt;
}

export function buildFinalImagePrompt(prompt: string, category: string, inputs: any): string {
  // Fokus pada kualitas teknis fotografi untuk menghindari "AI look" yang murah
  let finalPrompt = `PROFESSIONAL PRODUCT PHOTOGRAPHY: ${prompt}. `;
  
  // Instruksi Strict Fidelity - Fokus pada Detail Produk
  finalPrompt += `
    [STRICT PRODUCT FIDELITY RULES]:
    1. PRODUK HARUS 100% IDENTIK SECARA GEOMETRIS, WARNA, DAN BRANDING DENGAN FOTO REFERENSI.
    2. JANGAN MENGUBAH TEKSTUR MATERIAL PRODUK.
    3. JANGAN MENAMBAHKAN LOGO TAMBAHAN, IKON, ATAU GRAFIS APAPUN.
    4. JANGAN MENAMBAHKAN TEKS, WATERMARK, ATAU OVERLAY TULISAN DI DALAM GAMBAR.
    5. JANGAN MENAMBAHKAN AKSESORIS YANG TIDAK PERLU PADA PRODUK.
    6. HANYA GUNAKAN LOGO YANG SUDAH ADA PADA GAMBAR PRODUK ASLI.
  `;

  if (category === 'ugc') {
    const modelPrompt = getModelPrompt(inputs.modelStrategy);
    finalPrompt += ` [SCENE]: ${modelPrompt} sedang memegang atau berinteraksi dengan produk secara natural dalam pencahayaan alami (daylight). Fokus tajam pada produk, latar belakang sedikit blur (bokeh).`;
  } else if (category === 'broll') {
    finalPrompt += ` [SCENE]: Close-up makro yang sangat detail pada permukaan produk, menunjukkan kualitas jahitan atau material. Pencahayaan sinematik dengan rim lighting. Tanpa ada orang di dalam gambar.`;
  } else if (category === 'commercial') {
    finalPrompt += ` [SCENE]: Foto studio high-end, produk diletakkan di atas podium atau permukaan premium yang bersih. Pencahayaan studio 3-titik yang sempurna. Minimalis dan mewah. Tanpa teks marketing.`;
  }

  // Penekanan pada kualitas akhir
  finalPrompt += ` High resolution, 8k, sharp focus, masterwork, no artifacts, no text, clean composition.`;

  return finalPrompt;
}
