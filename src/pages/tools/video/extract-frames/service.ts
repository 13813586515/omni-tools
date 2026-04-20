import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import JSZip from 'jszip';
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

export async function extractFrames(
  inputFile: File,
  options: InitialValuesType
): Promise<File[]> {
  const ffmpeg = await getFFmpeg();
  const inputName = 'input.' + inputFile.name.split('.').pop() || 'mp4';
  const {
    extractMode,
    frameTime,
    interval,
    frameCount,
    outputFormat,
    start,
    end,
    quality
  } = options;

  await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

  const frames: File[] = [];
  const baseName = inputFile.name.replace(/\.[^/.]+$/, '');

  try {
    if (extractMode === 'single') {
      const outputName = `frame.${outputFormat}`;
      const args = buildFFmpegArgs(inputName, outputName, {
        mode: 'single',
        time: frameTime,
        format: outputFormat,
        quality
      });
      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile(outputName);
      const frameFile = createFrameFile(
        data,
        `${baseName}_frame_${frameTime.toFixed(2)}s`,
        outputFormat
      );
      frames.push(frameFile);
      await ffmpeg.deleteFile(outputName);
    } else if (extractMode === 'interval') {
      const duration = end - start;
      const actualFrameCount = Math.min(
        frameCount,
        Math.ceil(duration / interval) + 1
      );

      for (let i = 0; i < actualFrameCount; i++) {
        const time = start + i * interval;
        if (time > end) break;

        const outputName = `frame_${i}.${outputFormat}`;
        const args = buildFFmpegArgs(inputName, outputName, {
          mode: 'single',
          time,
          format: outputFormat,
          quality
        });
        await ffmpeg.exec(args);
        const data = await ffmpeg.readFile(outputName);
        const frameFile = createFrameFile(
          data,
          `${baseName}_frame_${i + 1}`,
          outputFormat
        );
        frames.push(frameFile);
        await ffmpeg.deleteFile(outputName);
      }
    } else if (extractMode === 'keyframes') {
      const tempPattern = `frame_%04d.${outputFormat}`;
      const args = buildFFmpegArgs(inputName, tempPattern, {
        mode: 'keyframes',
        start,
        end,
        format: outputFormat,
        quality
      });
      await ffmpeg.exec(args);

      for (let i = 0; i < 100; i++) {
        const frameName = `frame_${String(i).padStart(4, '0')}.${outputFormat}`;
        try {
          const data = await ffmpeg.readFile(frameName);
          const frameFile = createFrameFile(
            data,
            `${baseName}_keyframe_${i + 1}`,
            outputFormat
          );
          frames.push(frameFile);
          await ffmpeg.deleteFile(frameName);
        } catch {
          break;
        }
      }
    }
  } finally {
    await ffmpeg.deleteFile(inputName);
  }

  return frames;
}

function buildFFmpegArgs(
  inputName: string,
  outputName: string,
  options: {
    mode: 'single' | 'keyframes';
    time?: number;
    start?: number;
    end?: number;
    format: string;
    quality: number;
  }
): string[] {
  const args: string[] = ['-i', inputName];

  if (options.mode === 'single' && options.time !== undefined) {
    args.push('-ss', options.time.toString());
    args.push('-vframes', '1');
  } else if (options.mode === 'keyframes') {
    if (options.start !== undefined && options.start > 0) {
      args.push('-ss', options.start.toString());
    }
    if (options.end !== undefined) {
      args.push('-to', options.end.toString());
    }
    args.push('-vf', 'select=eq(pict_type,I)');
    args.push('-vsync', 'vfr');
  }

  if (options.format === 'jpg') {
    const qscale = Math.round((100 - options.quality) / 10);
    args.push('-q:v', Math.max(1, qscale).toString());
  } else if (options.format === 'png') {
    args.push(
      '-compression_level',
      Math.round((100 - options.quality) / 10).toString()
    );
  } else if (options.format === 'webp') {
    args.push('-qscale:v', Math.round(options.quality / 10).toString());
  }

  args.push('-y', outputName);
  return args;
}

function createFrameFile(data: unknown, name: string, format: string): File {
  const mimeType =
    format === 'jpg'
      ? 'image/jpeg'
      : format === 'webp'
        ? 'image/webp'
        : 'image/png';
  return new File(
    [new Blob([data as ArrayBuffer], { type: mimeType })],
    `${name}.${format}`,
    { type: mimeType }
  );
}

export async function createZipFile(
  files: File[],
  zipName: string
): Promise<File> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file);
  }
  const content = await zip.generateAsync({ type: 'blob' });
  return new File([content], zipName, { type: 'application/zip' });
}
