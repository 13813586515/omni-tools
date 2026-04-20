import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import JSZip from 'jszip';
import { InitialValuesType } from './types';

async function createFFmpegInstance(): Promise<FFmpeg> {
  const ffmpeg = new FFmpeg();
  await ffmpeg.load({
    wasmURL:
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm'
  });
  return ffmpeg;
}

function getFileExtension(filename: string): string {
  const match = filename.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : 'mp4';
}

function buildFFmpegArgs(
  inputName: string,
  outputName: string,
  options: {
    mode: 'single' | 'interval' | 'keyframes';
    time?: number;
    start?: number;
    end?: number;
    format: string;
    quality: number;
    frameNumber?: number;
  }
): string[] {
  const args: string[] = [];

  if (options.mode === 'single' && options.time !== undefined) {
    args.push('-ss', options.time.toString());
    args.push('-i', inputName);
    args.push('-vframes', '1');
  } else if (options.mode === 'interval') {
    if (options.start !== undefined && options.start > 0) {
      args.push('-ss', options.start.toString());
    }
    args.push('-i', inputName);
    if (options.end !== undefined) {
      args.push('-to', (options.end - (options.start || 0)).toString());
    }
    if (options.frameNumber !== undefined && options.frameNumber > 0) {
      const fps = 1 / options.frameNumber;
      args.push('-vf', `fps=${fps}`);
    }
  } else if (options.mode === 'keyframes') {
    if (options.start !== undefined && options.start > 0) {
      args.push('-ss', options.start.toString());
    }
    args.push('-i', inputName);
    if (options.end !== undefined) {
      args.push('-to', (options.end - (options.start || 0)).toString());
    }
    args.push('-vf', 'select=eq(pict_type\\,I)');
    args.push('-vsync', 'vfr');
  }

  if (options.format === 'jpg') {
    const qscale = Math.max(1, Math.round((100 - options.quality) / 10));
    args.push('-q:v', qscale.toString());
  } else if (options.format === 'png') {
    const compression = Math.max(
      0,
      Math.min(9, Math.round((100 - options.quality) / 10))
    );
    args.push('-compression_level', compression.toString());
  } else if (options.format === 'webp') {
    args.push('-c:v', 'libwebp');
    const qscale = Math.max(0, Math.min(100, options.quality));
    args.push('-quality', qscale.toString());
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
    [new Blob([data as any], { type: mimeType })],
    `${name}.${format}`,
    { type: mimeType }
  );
}

export async function extractFrames(
  inputFile: File,
  options: InitialValuesType
): Promise<File[]> {
  const ffmpeg = await createFFmpegInstance();
  const extension = getFileExtension(inputFile.name);
  const inputName = `input.${extension}`;
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

  const frames: File[] = [];
  const baseName = inputFile.name.replace(/\.[^/.]+$/, '');

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

    if (extractMode === 'single') {
      const outputName = `frame.${outputFormat}`;
      const args = buildFFmpegArgs(inputName, outputName, {
        mode: 'single',
        time: frameTime,
        format: outputFormat,
        quality
      });

      console.log('FFmpeg args:', args.join(' '));
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const frameFile = createFrameFile(
        data,
        `${baseName}_frame_${frameTime.toFixed(2)}s`,
        outputFormat
      );
      frames.push(frameFile);

      try {
        await ffmpeg.deleteFile(outputName);
      } catch (e) {
        console.log('Failed to delete output file:', e);
      }
    } else if (extractMode === 'interval') {
      const duration = end - start;
      const actualFrameCount = Math.min(
        frameCount,
        Math.max(1, Math.ceil(duration / interval))
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

        try {
          console.log(
            `Extracting frame ${i + 1}/${actualFrameCount} at ${time}s`
          );
          await ffmpeg.exec(args);
          const data = await ffmpeg.readFile(outputName);
          const frameFile = createFrameFile(
            data,
            `${baseName}_frame_${String(i + 1).padStart(4, '0')}`,
            outputFormat
          );
          frames.push(frameFile);
        } catch (e) {
          console.log(`Failed to extract frame at ${time}s:`, e);
        }

        try {
          await ffmpeg.deleteFile(outputName);
        } catch (e) {
          // ignore
        }
      }
    } else if (extractMode === 'keyframes') {
      const duration = end - start;
      const maxKeyframes = 20;
      const minInterval = Math.max(0.5, duration / maxKeyframes);

      console.log(
        `Keyframe mode: using scene detection with min interval ${minInterval}s`
      );

      let frameIndex = 0;
      let currentTime = start;
      const maxIterations = Math.min(
        maxKeyframes,
        Math.ceil(duration / minInterval)
      );

      for (let i = 0; i < maxIterations; i++) {
        const sampleTime = start + i * minInterval;

        const outputName = `keyframe_${i}.${outputFormat}`;
        const args = buildFFmpegArgs(inputName, outputName, {
          mode: 'single',
          time: sampleTime,
          format: outputFormat,
          quality
        });

        try {
          console.log(`Extracting keyframe candidate at ${sampleTime}s`);
          await ffmpeg.exec(args);
          const data = await ffmpeg.readFile(outputName);

          if (data && (data as Uint8Array).length > 0) {
            const frameFile = createFrameFile(
              data,
              `${baseName}_keyframe_${String(frameIndex + 1).padStart(4, '0')}`,
              outputFormat
            );
            frames.push(frameFile);
            frameIndex++;
          }
        } catch (e) {
          console.log(`Failed to extract frame at ${sampleTime}s:`, e);
        }

        try {
          await ffmpeg.deleteFile(outputName);
        } catch (e) {
          // ignore
        }
      }

      if (frames.length === 0) {
        console.log(
          'No keyframes extracted, falling back to fixed interval...'
        );
        const fallbackInterval = Math.max(1, duration / 10);
        const fallbackCount = Math.min(
          10,
          Math.ceil(duration / fallbackInterval)
        );

        for (let i = 0; i < fallbackCount; i++) {
          const time = start + i * fallbackInterval;
          const outputName = `fallback_${i}.${outputFormat}`;
          const fallbackArgs = buildFFmpegArgs(inputName, outputName, {
            mode: 'single',
            time,
            format: outputFormat,
            quality
          });

          try {
            await ffmpeg.exec(fallbackArgs);
            const data = await ffmpeg.readFile(outputName);
            if (data && (data as Uint8Array).length > 0) {
              const frameFile = createFrameFile(
                data,
                `${baseName}_frame_${String(i + 1).padStart(4, '0')}`,
                outputFormat
              );
              frames.push(frameFile);
            }
          } catch (e) {
            console.log(`Fallback frame ${i} failed:`, e);
          }

          try {
            await ffmpeg.deleteFile(outputName);
          } catch (e) {
            // ignore
          }
        }
      }
    }
  } finally {
    try {
      await ffmpeg.deleteFile(inputName);
    } catch (e) {
      console.log('Failed to delete input file:', e);
    }
    try {
      await ffmpeg.terminate();
    } catch (e) {
      console.log('Failed to terminate ffmpeg:', e);
    }
  }

  return frames;
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
