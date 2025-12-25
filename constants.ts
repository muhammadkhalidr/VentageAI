
export const ASPECT_RATIOS: Record<string, { width: number; height: number; class: string }> = {
  '9:16': { width: 1080, height: 1920, class: 'aspect-[9/16]' },
  '4:5': { width: 1080, height: 1350, class: 'aspect-[4/5]' },
  '1:1': { width: 1080, height: 1080, class: 'aspect-square' },
  '16:9': { width: 1920, height: 1080, class: 'aspect-video' }
};

export const VOICES = [
  { id: 'Zephyr', name: 'Zephyr', tone: 'Ceria', gender: 'LK' },
  { id: 'Puck', name: 'Puck', tone: 'Semangat', gender: 'LK' },
  { id: 'Charon', name: 'Charon', tone: 'Informatif', gender: 'LK' },
  { id: 'Kore', name: 'Kore', tone: 'Tegas', gender: 'PR' },
  { id: 'Leda', name: 'Leda', tone: 'Muda', gender: 'PR' },
  { id: 'Aoede', name: 'Aoede', tone: 'Santai', gender: 'PR' },
  { id: 'Callirrhoe', name: 'Callirrhoe', tone: 'Tenang', gender: 'PR' },
  { id: 'Autonoe', name: 'Autonoe', tone: 'Ceria', gender: 'PR' },
];
