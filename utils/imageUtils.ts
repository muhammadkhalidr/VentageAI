
export const compressImage = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target?.result as string;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxWidth = 1024;
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Could not get canvas context');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
  };
  reader.onerror = reject;
});

export const composeLogo = (baseImg64: string, logoImg64: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(baseImg64);

    const img = new Image();
    img.src = baseImg64;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const logo = new Image();
      logo.src = logoImg64;
      logo.onload = () => {
        const w = canvas.width * 0.2;
        const h = logo.height * (w / logo.width);
        ctx.drawImage(logo, (canvas.width - w) / 2, 50, w, h);
        resolve(canvas.toDataURL('image/png'));
      };
      logo.onerror = () => resolve(baseImg64);
    };
    img.onerror = () => resolve(baseImg64);
  });
};

export const createWavHeader = (pcmData: Uint8Array, sampleRate: number): ArrayBuffer => {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); 
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  
  const pcmView = new Uint8Array(buffer, 44);
  pcmView.set(pcmData);
  
  return buffer;
};
