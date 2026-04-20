export type InitialValuesType = {
  fadeInDuration: number;
  fadeOutDuration: number;
  normalizeVolume: boolean;
  targetVolume: number;
  startTime: string;
  endTime: string;
  outputFormat: 'mp3' | 'wav' | 'aac';
};

export interface SpectrumData {
  frequencies: Uint8Array;
  timeData: Uint8Array;
}
