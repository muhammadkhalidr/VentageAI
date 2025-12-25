
import { AgeGroup, Gender, ModelStrategy } from '../types';

export function getModelPrompt(strategy: ModelStrategy): string {
  let basePrompt = "";
  
  if (strategy.age === AgeGroup.CHILD) {
    const childGender = strategy.gender === Gender.MALE ? "seorang anak laki-laki kecil" : (strategy.gender === Gender.FEMALE ? "seorang anak perempuan kecil" : "seorang anak kecil");
    basePrompt = `Modelnya adalah ${childGender} berusia sekitar 5-8 tahun. PENTING: Pastikan wajahnya imut, polos, dan proporsi tubuhnya kecil seperti anak-anak sungguhan. Bukan orang dewasa yang dikecilkan.`;
  } else if (strategy.age === AgeGroup.TEEN) {
    const teenGender = strategy.gender === Gender.MALE ? "seorang remaja laki-laki" : (strategy.gender === Gender.FEMALE ? "seorang remaja perempuan" : "seorang remaja");
    basePrompt = `Modelnya adalah ${teenGender} berusia sekitar 16-19 tahun. Tampilan wajah muda, kulit segar, gaya kekinian khas anak sekolah atau kuliah.`;
  } else if (strategy.age === AgeGroup.ADULT) {
    const adultGender = strategy.gender === Gender.MALE ? "seorang pria dewasa" : (strategy.gender === Gender.FEMALE ? "seorang wanita dewasa" : "seseorang dewasa");
    basePrompt = `Modelnya adalah ${adultGender} berusia sekitar 25-35 tahun. Tampilan wajah matang, profesional, dan elegan.`;
  } else if (strategy.age === AgeGroup.ELDER) {
    const elderGender = strategy.gender === Gender.MALE ? "seorang kakek lansia" : (strategy.gender === Gender.FEMALE ? "seorang nenek lansia" : "seorang lansia");
    basePrompt = `Modelnya adalah ${elderGender} berusia 60 tahun ke atas. Tampilan wajah berkerut alami, rambut memutih, terlihat bijaksana dan ramah.`;
  }

  if (strategy.hijab && strategy.gender !== Gender.MALE) {
    basePrompt += " Dia mengenakan hijab yang sopan dan sesuai dengan usianya.";
  }

  return basePrompt;
}

export function buildFinalImagePrompt(prompt: string, category: string, inputs: any): string {
  let finalPrompt = `${prompt}. Rasio ${inputs.ratio}. Kualitas tinggi, fotorealistik.`;
  
  // Mandatory instructions to preserve product shape
  finalPrompt += ` PENTING: Pertahankan bentuk, warna, tekstur, dan detail asli produk dari gambar input secara akurat. Jangan mengubah logo atau desain pada produk.`;

  if (category === 'ugc') {
    if (inputs.modelStrategy.type === 'ai') {
      const modelPrompt = getModelPrompt(inputs.modelStrategy);
      finalPrompt += ` Subjek: ${modelPrompt}.`;
    } else {
      finalPrompt += ` PENTING: Gunakan fisik dan fitur model dari gambar referensi yang diupload. Tampilkan model tersebut sedang berinteraksi secara alami dengan produk.`;
    }
  }

  if (inputs.pose) {
    finalPrompt += ` Aksi/Pose: ${inputs.pose}.`;
  }

  return finalPrompt;
}
