import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { InitialValuesType } from './types';

let ffmpegInstance: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
  }
  if (!ffmpegInstance.loaded) {
    await ffmpegInstance.load({
      wasmURL:
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm'
    });
  }
  return ffmpegInstance;
}

function parseTime(timeStr: string): number {
  const parts = timeStr.split(':');
  let seconds = 0;
  if (parts.length === 3) {
    seconds =
      parseInt(parts[0], 10) * 3600 +
      parseInt(parts[1], 10) * 60 +
      parseFloat(parts[2]);
  } else if (parts.length === 2) {
    seconds = parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
  } else {
    seconds = parseFloat(timeStr);
  }
  return isNaN(seconds) ? 0 : seconds;
}

export async function processAudioWithEffects(
  inputFile: File,
  options: InitialValuesType
): Promise<File> {
  const ffmpeg = await getFFmpeg();
  const inputName = 'input.' + (inputFile.name.split('.').pop() || 'mp3');
  const {
    fadeInDuration,
    fadeOutDuration,
    normalizeVolume,
    targetVolume,
    startTime,
    endTime,
    outputFormat
  } = options;

  await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

  const filters: string[] = [];
  const outputName = `output.${outputFormat}`;

  if (startTime !== '00:00:00' || endTime !== '00:01:00') {
    const startSec = parseTime(startTime);
    const endSec = parseTime(endTime);
    if (startSec > 0 || endSec > 0) {
      filters.push(`atrim=start=${startSec}:end=${endSec}`);
      filters.push('asetpts=PTS-STARTPTS');
    }
  }

  if (fadeInDuration > 0) {
    filters.push(`afade=t=in:st=0:d=${fadeInDuration}`);
  }

  if (fadeOutDuration > 0) {
    filters.push(
      `afade=t=out:st=9999:d=${fadeOutDuration}:enable='gte(t,${
        9999 - fadeOutDuration
      })'`
    );
  }

  if (normalizeVolume) {
    const volumeDb = (targetVolume - 100) / 10;
    filters.push(`volume=${volumeDb}dB`);
  }

  const args: string[] = ['-i', inputName];

  if (filters.length > 0) {
    args.push('-filter:a', filters.join(','));
  }

  if (outputFormat === 'mp3') {
    args.push(
      '-ar',
      '44100',
      '-ac',
      '2',
      '-b:a',
      '192k',
      '-f',
      'mp3',
      outputName
    );
  } else if (outputFormat === 'aac') {
    args.push('-c:a', 'aac', '-b:a', '192k', '-f', 'adts', outputName);
  } else if (outputFormat === 'wav') {
    args.push(
      '-acodec',
      'pcm_s16le',
      '-ar',
      '44100',
      '-ac',
      '2',
      '-f',
      'wav',
      outputName
    );
  }

  await ffmpeg.exec(args);

  const processedAudio = await ffmpeg.readFile(outputName);

  let mimeType = 'audio/mp3';
  if (outputFormat === 'aac') mimeType = 'audio/aac';
  if (outputFormat === 'wav') mimeType = 'audio/wav';

  const resultFile = new File(
    [new Blob([processedAudio as any], { type: mimeType })],
    `${inputFile.name.replace(/\.[^/.]+$/, '')}_processed.${outputFormat}`,
    { type: mimeType }
  );

  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  return resultFile;
}

export class SpectrumAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private animationId: number | null = null;

  async init(audioElement: HTMLAudioElement): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    if (!this.source) {
      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }
  }

  getSpectrumData(): { frequencies: Uint8Array; timeData: Uint8Array } | null {
    if (!this.analyser) return null;

    const bufferLength = this.analyser.frequencyBinCount;
    const frequencies = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    this.analyser.getByteFrequencyData(frequencies);
    this.analyser.getByteTimeDomainData(timeData);

    return { frequencies, timeData };
  }

  startAnimation(
    callback: (data: { frequencies: Uint8Array; timeData: Uint8Array }) => void
  ): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      const data = this.getSpectrumData();
      if (data) {
        callback(data);
      }
    };
    animate();
  }

  stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  async close(): Promise<void> {
    this.stopAnimation();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
    }
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
  }
}

export function drawSpectrum(
  canvas: HTMLCanvasElement,
  frequencies: Uint8Array,
  timeData: Uint8Array,
  theme: 'light' | 'dark' = 'light'
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const barWidth = width / frequencies.length;

  ctx.clearRect(0, 0, width, height);

  const bgColor = theme === 'dark' ? '#1a1a2e' : '#f5f5f5';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, height, 0, 0);
  if (theme === 'dark') {
    gradient.addColorStop(0, '#0f3460');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#e94560');
  } else {
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#f093fb');
  }

  ctx.fillStyle = gradient;
  for (let i = 0; i < frequencies.length; i++) {
    const barHeight = (frequencies[i] / 255) * (height * 0.8);
    const x = i * barWidth;
    const y = height - barHeight;
    ctx.fillRect(x, y, barWidth - 1, barHeight);
  }

  ctx.strokeStyle =
    theme === 'dark' ? 'rgba(233, 69, 96, 0.8)' : 'rgba(102, 126, 234, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const sliceWidth = width / timeData.length;
  let x = 0;
  for (let i = 0; i < timeData.length; i++) {
    const v = timeData[i] / 128.0;
    const y = (v * height) / 2;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  ctx.lineTo(width, height / 2);
  ctx.stroke();
}
