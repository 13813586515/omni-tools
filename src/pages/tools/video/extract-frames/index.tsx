import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import ToolVideoInput from '@components/input/ToolVideoInput';
import ToolMultiFileResult from '@components/result/ToolMultiFileResult';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { updateNumberField } from '@utils/string';
import { extractFrames, createZipFile } from './service';
import SimpleRadio from '@components/options/SimpleRadio';

const initialValues: InitialValuesType = {
  extractMode: 'single',
  frameTime: 0,
  interval: 1,
  frameCount: 10,
  outputFormat: 'png',
  quality: 85,
  start: 0,
  end: 100
};

const formatOptions = [
  { label: 'PNG', value: 'png' },
  { label: 'JPG', value: 'jpg' },
  { label: 'WebP', value: 'webp' }
];

export default function ExtractFrames({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('video');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (values: InitialValuesType, input: File | null) => {
    if (!input) return;
    setLoading(true);
    try {
      const frames = await extractFrames(input, values);
      setResult(frames);
      if (frames.length > 0) {
        const zip = await createZipFile(
          frames,
          `${input.name.replace(/\.[^/.]+$/, '')}_frames.zip`
        );
        setZipFile(zip);
      } else {
        setZipFile(null);
      }
    } catch (err) {
      console.error(`Failed to extract frames: ${err}`);
      setResult([]);
      setZipFile(null);
    } finally {
      setLoading(false);
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('extractFrames.extractMode'),
      component: (
        <Box>
          <SimpleRadio
            title={t('extractFrames.singleFrame')}
            onClick={() => updateField('extractMode', 'single')}
            checked={values.extractMode === 'single'}
          />
          <SimpleRadio
            title={t('extractFrames.byInterval')}
            onClick={() => updateField('extractMode', 'interval')}
            checked={values.extractMode === 'interval'}
          />
          <SimpleRadio
            title={t('extractFrames.keyframes')}
            onClick={() => updateField('extractMode', 'keyframes')}
            checked={values.extractMode === 'keyframes'}
          />
        </Box>
      )
    },
    ...(values.extractMode === 'single'
      ? [
          {
            title: t('extractFrames.frameSettings'),
            component: (
              <Box>
                <TextFieldWithDesc
                  value={values.frameTime}
                  onOwnChange={(val) =>
                    updateNumberField(val, 'frameTime', updateField)
                  }
                  label={t('extractFrames.frameTime')}
                  description={t('extractFrames.frameTimeDescription')}
                />
              </Box>
            )
          }
        ]
      : []),
    ...(values.extractMode === 'interval'
      ? [
          {
            title: t('extractFrames.intervalSettings'),
            component: (
              <Box>
                <TextFieldWithDesc
                  value={values.interval}
                  onOwnChange={(val) =>
                    updateNumberField(val, 'interval', updateField)
                  }
                  label={t('extractFrames.interval')}
                  description={t('extractFrames.intervalDescription')}
                  sx={{ mb: 2 }}
                />
                <TextFieldWithDesc
                  value={values.frameCount}
                  onOwnChange={(val) =>
                    updateNumberField(val, 'frameCount', updateField)
                  }
                  label={t('extractFrames.maxFrames')}
                  description={t('extractFrames.maxFramesDescription')}
                />
              </Box>
            )
          }
        ]
      : []),
    {
      title: t('extractFrames.timeRange'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.start}
            onOwnChange={(val) => updateNumberField(val, 'start', updateField)}
            label={t('extractFrames.startTime')}
            sx={{ mb: 2, backgroundColor: 'background.paper' }}
          />
          <TextFieldWithDesc
            value={values.end}
            onOwnChange={(val) => updateNumberField(val, 'end', updateField)}
            label={t('extractFrames.endTime')}
          />
        </Box>
      )
    },
    {
      title: t('extractFrames.outputSettings'),
      component: (
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {t('extractFrames.outputFormat')}
          </Typography>
          <RadioGroup
            row
            value={values.outputFormat}
            onChange={(e) =>
              updateField(
                'outputFormat',
                e.target.value as 'png' | 'jpg' | 'webp'
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
          <Box mt={2}>
            <TextFieldWithDesc
              value={values.quality}
              onOwnChange={(val) =>
                updateNumberField(val, 'quality', updateField)
              }
              label={t('extractFrames.quality')}
              description={t('extractFrames.qualityDescription')}
            />
          </Box>
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      renderCustomInput={({ start, end }, setFieldValue) => {
        return (
          <ToolVideoInput
            value={input}
            onChange={setInput}
            title={t('extractFrames.inputTitle')}
            showTrimControls={true}
            onTrimChange={(startVal, endVal) => {
              setFieldValue('start', startVal);
              setFieldValue('end', endVal);
            }}
            trimStart={start}
            trimEnd={end}
          />
        );
      }}
      resultComponent={
        <ToolMultiFileResult
          title={t('extractFrames.resultTitle')}
          value={result}
          zipFile={zipFile}
          loading={loading}
          loadingText={t('extractFrames.extracting')}
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('extractFrames.toolInfo.title', { title }),
        description: longDescription
      }}
    />
  );
}
