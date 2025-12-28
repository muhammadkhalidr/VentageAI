
export interface User {
  email: string;
  name: string;
  picture: string;
}

export enum Gender {
  AUTO = 'auto',
  FEMALE = 'female',
  MALE = 'male'
}

export enum AgeGroup {
  CHILD = 'Anak',
  TEEN = 'Remaja',
  ADULT = 'Dewasa',
  ELDER = 'Orangtua'
}

export enum ModelMode {
  AI = 'ai',
  UPLOAD = 'upload'
}

export interface ModelStrategy {
  type: ModelMode;
  gender: Gender;
  age: AgeGroup;
  hijab: boolean;
  customModelPhoto?: string;
}

export interface VideoSpecs {
  video_prompt: string;
  voiceover: string;
}

export interface ProductInput {
  productImage: string;
  additionalPhotos: string[];
  productInfo: string;
  adType: string;
  ratio: string;
  lang: string;
  accent: string;
  pose: string;
  modelStrategy: ModelStrategy;
  useLogo: boolean;
  logo?: string;
}

export interface GenerationResult {
  id: string;
  category: string;
  prompt: string;
  imageUrl?: string;
  script?: string;
  audioUrl?: string;
  videoSpecs?: VideoSpecs;
  status: 'loading' | 'success' | 'error';
  errorMsg?: string;
}
