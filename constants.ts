
export const ASPECT_RATIOS: Record<string, { width: number; height: number; class: string }> = {
  '9:16': { width: 1080, height: 1920, class: 'aspect-[9/16]' },
  '4:5': { width: 1080, height: 1350, class: 'aspect-[4/5]' },
  '1:1': { width: 1080, height: 1080, class: 'aspect-square' },
  '16:9': { width: 1920, height: 1080, class: 'aspect-video' }
};

export const VOICES = [
  { id: 'Zephyr', name: 'Zephyr', tone: 'Ceria', gender: 'male', age: ['Anak', 'Remaja'] },
  { id: 'Puck', name: 'Puck', tone: 'Semangat', gender: 'male', age: ['Remaja', 'Dewasa'] },
  { id: 'Charon', name: 'Charon', tone: 'Informatif', gender: 'male', age: ['Dewasa', 'Orangtua'] },
  { id: 'Kore', name: 'Kore', tone: 'Tegas', gender: 'female', age: ['Dewasa'] },
  { id: 'Leda', name: 'Leda', tone: 'Muda', gender: 'female', age: ['Anak', 'Remaja'] },
  { id: 'Aoede', name: 'Aoede', tone: 'Santai', gender: 'female', age: ['Dewasa'] },
  { id: 'Callirrhoe', name: 'Callirrhoe', tone: 'Tenang', gender: 'female', age: ['Dewasa', 'Orangtua'] },
  { id: 'Autonoe', name: 'Autonoe', tone: 'Ceria', gender: 'female', age: ['Anak', 'Remaja'] },
];
