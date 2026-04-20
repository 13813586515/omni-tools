import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Typography
} from '@mui/material';
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import ToolAudioInput from '@components/input/ToolAudioInput';
import ToolFileResult from '@components/result/ToolFileResult';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { updateNumberField } from '@utils/string';
import { processAudioWithEffects } from './service';
import SpectrumVisualizer from './SpectrumVisualizer';

const initialValues: InitialValuesType = {
  fadeInDuration: 0,
  fadeOutDuration: 0,
  normalizeVolume: false,
  targetVolume: 85,
  startTime: '00:00:00',
  endTime: '00:01:00',
  outputFormat: 'mp3'
};

const formatOptions = [
  { label: 'MP3', value: 'mp3' },
  { label: 'WAV', value: 'wav' },
  { label: 'AAC', value: 'aac' }
];

export default function SpectrumEditor({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('audio');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleInputChange = (file: File | null) => {
    setInput(file);
    setResult(null);
    if (file) {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    } else {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(null);
    }
  };

  const compute = async (values: InitialValuesType, input: File | null) => {
    if (!input) return;
    setLoading(true);
    try {
      const processedFile = await processAudioWithEffects(input, values);
      setResult(processedFile);
    } catch (err) {
      console.error(`Failed to process audio: ${err}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('spectrumEditor.fadeSettings'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.fadeInDuration}
            onOwnChange={(val) =>
              updateNumberField(val, 'fadeInDuration', updateField)
            }
            label={t('spectrumEditor.fadeInDuration')}
            description={t('spectrumEditor.fadeInDurationDescription')}
            sx={{ mb: 2 }}
          />
          <TextFieldWithDesc
            value={values.fadeOutDuration}
            onOwnChange={(val) =>
              updateNumberField(val, 'fadeOutDuration', updateField)
            }
            label={t('spectrumEditor.fadeOutDuration')}
            description={t('spectrumEditor.fadeOutDurationDescription')}
          />
        </Box>
      )
    },
    {
      title: t('spectrumEditor.volumeSettings'),
      component: (
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={values.normalizeVolume}
                onChange={(e) =>
                  updateField('normalizeVolume', e.target.checked)
                }
              />
            }
            label={t('spectrumEditor.normalizeVolume')}
          />
          {values.normalizeVolume && (
            <Box mt={2}>
              <TextFieldWithDesc
                value={values.targetVolume}
                onOwnChange={(val) =>
                  updateNumberField(val, 'targetVolume', updateField)
                }
                label={t('spectrumEditor.targetVolume')}
                description={t('spectrumEditor.targetVolumeDescription')}
              />
            </Box>
          )}
        </Box>
      )
    },
    {
      title: t('spectrumEditor.trimSettings'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.startTime}
            onOwnChange={(val) => updateField('startTime', val)}
            label={t('spectrumEditor.startTime')}
            description={t('spectrumEditor.startTimeDescription')}
            sx={{ mb: 2 }}
          />
          <TextFieldWithDesc
            value={values.endTime}
            onOwnChange={(val) => updateField('endTime', val)}
            label={t('spectrumEditor.endTime')}
            description={t('spectrumEditor.endTimeDescription')}
          />
        </Box>
      )
    },
    {
      title: t('spectrumEditor.outputSettings'),
      component: (
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {t('spectrumEditor.outputFormat')}
          </Typography>
          <RadioGroup
            row
            value={values.outputFormat}
            onChange={(e) =>
              updateField(
                'outputFormat',
                e.target.value as 'mp3' | 'wav' | 'aac'
              )
            }
          >
            {formatOptions.map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Radio size="small" />}
                label={opt.label}
              />
            ))}
          </RadioGroup>
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <Box>
          <ToolAudioInput
            value={input}
            onChange={handleInputChange}
            title={t('spectrumEditor.inputTitle')}
          />
          {audioUrl && (
            <Box mt={2}>
              <SpectrumVisualizer audioUrl={audioUrl} isPlaying={isPlaying} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 2
                }}
              >
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  style={{ width: '100%', maxWidth: 400 }}
                />
              </Box>
            </Box>
          )}
        </Box>
      }
      resultComponent={
        loading ? (
          <ToolFileResult
            title={t('spectrumEditor.processing')}
            value={null}
            loading={true}
          />
        ) : (
          <ToolFileResult
            title={t('spectrumEditor.resultTitle')}
            value={result}
            extension={result ? result.name.split('.').pop() : undefined}
          />
        )
      }
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('spectrumEditor.toolInfo.title', { title }),
        description: longDescription
      }}
    />
  );
}
