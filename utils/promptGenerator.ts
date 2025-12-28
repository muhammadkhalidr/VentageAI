
import { AgeGroup, Gender, ModelStrategy } from '../types';

export function getModelPrompt(strategy: ModelStrategy): string {
  if (strategy.type === 'upload') {
    return "EXACT IDENTITY REPLICATION: Use the specific person from the TALENT_REFERENCE image. Maintain their unique facial features, ethnicity, and hair. The person should be interacting with the product naturally.";
  }

  let basePrompt = "";
  if (strategy.age === AgeGroup.CHILD) {
    const childGender = strategy.gender === Gender.MALE ? "a young boy" : (strategy.gender === Gender.FEMALE ? "a young girl" : "a child");
    basePrompt = `Model is ${childGender} aged 5-8, cheerful expression, natural skin texture.`;
  } else if (strategy.age === AgeGroup.TEEN) {
    const teenGender = strategy.gender === Gender.MALE ? "a teenage boy" : (strategy.gender === Gender.FEMALE ? "a teenage girl" : "a teenager");
    basePrompt = `Model is ${teenGender} aged 16-19, modern casual style, authentic appearance.`;
  } else {
    const adultGender = strategy.gender === Gender.MALE ? "a sophisticated man" : (strategy.gender === Gender.FEMALE ? "a sophisticated woman" : "a professional adult");
    basePrompt = `Model is ${adultGender} aged 25-35, professional commercial look.`;
  }

  if (strategy.hijab && strategy.gender !== Gender.MALE) {
    basePrompt += " Wearing a stylish premium hijab.";
  }

  return basePrompt;
}

export function buildFinalImagePrompt(prompt: string, category: string, inputs: any): string {
  const qualityKeywords = "hyper-realistic, high-end product photography, shot on 85mm lens, f/2.8, cinematic lighting, commercial studio quality, 8k, sharp focus.";
  
  // Instruksi "Fixed Anchor" agar produk tidak diubah
  const productPreservation = "The product in the center is the fixed anchor of the scene. Keep its shape, branding, and color exactly as the primary reference image.";

  let finalPrompt = `${qualityKeywords} ${productPreservation} `;
  
  if (category === 'ugc') {
    const modelPrompt = getModelPrompt(inputs.modelStrategy);
    finalPrompt += `[SCENE]: ${modelPrompt} holding/using the product in a real-world lifestyle environment. The lighting on the talent matches the lighting on the product perfectly. ${prompt}.`;
  } else if (category === 'broll') {
    finalPrompt += `[SCENE]: Macro focus on the product's details and textures. Minimalist background. ${prompt}.`;
  } else if (category === 'commercial') {
    finalPrompt += `[SCENE]: Professional advertising shot. Product placed on a clean studio surface with soft, directional lighting. ${prompt}.`;
  }

  finalPrompt += `
    [STRICT PROHIBITION]:
    - Do not invent new labels or text on the product.
    - Do not change the product's material or finish.
    - No text overlays or graphic logos except what is on the original product.
  `;

  return finalPrompt;
}
