export type InitialValuesType = {
  extractMode: 'single' | 'interval' | 'keyframes';
  frameTime: number;
  interval: number;
  frameCount: number;
  outputFormat: 'png' | 'jpg' | 'webp';
  quality: number;
  start: number;
  end: number;
};
