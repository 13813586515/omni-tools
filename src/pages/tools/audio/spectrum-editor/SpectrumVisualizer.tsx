import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { SpectrumAnalyzer, drawSpectrum } from './service';

interface SpectrumVisualizerProps {
  audioUrl: string | null;
  isPlaying: boolean;
}

export default function SpectrumVisualizer({
  audioUrl,
  isPlaying
}: SpectrumVisualizerProps) {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const analyzerRef = useRef<SpectrumAnalyzer | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (analyzerRef.current) {
        analyzerRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!audioUrl || !canvasRef.current) return;

    const initAnalyzer = async () => {
      if (!audioRef.current) return;

      try {
        if (analyzerRef.current) {
          await analyzerRef.current.close();
        }

        const analyzer = new SpectrumAnalyzer();
        await analyzer.init(audioRef.current);
        analyzerRef.current = analyzer;
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize spectrum analyzer:', err);
      }
    };

    initAnalyzer();
  }, [audioUrl]);

  useEffect(() => {
    if (!isPlaying || !analyzerRef.current || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const analyzer = analyzerRef.current;
    const canvas = canvasRef.current;
    const isDark = theme.palette.mode === 'dark';

    const animate = () => {
      const data = analyzer.getSpectrumData();
      if (data) {
        drawSpectrum(
          canvas,
          data.frequencies,
          data.timeData,
          isDark ? 'dark' : 'light'
        );
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isInitialized, theme.palette.mode]);

  if (!audioUrl) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant="body2" color="textSecondary">
          Upload an audio file to see the spectrum visualization
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <audio
        ref={audioRef}
        src={audioUrl}
        style={{ display: 'none' }}
        crossOrigin="anonymous"
      />
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        style={{
          width: '100%',
          height: 200,
          borderRadius: 8,
          backgroundColor: theme.palette.background.paper
        }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 1,
          px: 1
        }}
      >
        <Typography variant="caption" color="textSecondary">
          Frequency Spectrum
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Waveform
        </Typography>
      </Box>
    </Box>
  );
}
