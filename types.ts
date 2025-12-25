
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
  photos?: { id: string; b64: string }[];
}

export interface ProductInput {
  productInfo: string;
  adType: string;
  ratio: string;
  lang: string;
  accent: string;
  pose: string;
  modelStrategy: ModelStrategy;
  useLogo: boolean;
  logo?: string;
  productImage: string;
  additionalPhotos: { id: string; b64: string; desc: string }[];
}

export interface ContentIdea {
  text: string;
  category: 'broll' | 'ugc' | 'commercial';
}

export interface GenerationResult {
  id: string;
  category: string;
  prompt: string;
  imageUrl: string;
  script?: string;
  audioUrl?: string;
}
