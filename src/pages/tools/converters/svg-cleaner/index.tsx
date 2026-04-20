import {
  Box,
  Checkbox,
  Chip,
  Collapse,
  FormControlLabel,
  FormGroup,
  IconButton,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { optimizeSVG, formatBytes } from './service';
import { grey } from '@mui/material/colors';

const initialValues: InitialValuesType = {
  removeComments: true,
  removeMetadata: true,
  removeEditorsNSData: true,
  cleanupAttrs: true,
  inlineStyles: true,
  minifyStyles: true,
  convertStyleToAttrs: true,
  cleanupIDs: true,
  removeRasterImages: false,
  removeUselessDefs: true,
  cleanupNumericValues: true,
  convertColors: true,
  removeUnknownsAndDefaults: true,
  removeNonInheritableGroupAttrs: true,
  removeUselessStrokeAndFill: false,
  removeViewBox: false,
  cleanupEnableBackground: true,
  removeHiddenElems: true,
  removeEmptyText: true,
  convertShapeToPath: true,
  moveElemsAttrsToGroup: true,
  moveGroupAttrsToElems: true,
  collapseGroups: true,
  convertPathData: true,
  convertTransform: true,
  removeEmptyAttrs: true,
  removeEmptyContainers: true,
  mergePaths: true,
  removeUnusedNS: true,
  sortAttrs: true,
  sortDefsChildren: true,
  removeTitle: false,
  removeDesc: true,
  removeDimensions: false,
  removeAttrs: false,
  removeAttrsList: '',
  addClassesToSVGElement: false,
  className: '',
  removeOffCanvasPaths: false,
  removeScripts: true,
  removeStyleElement: false,
  removeXMLNS: false
};

interface OptionSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

function OptionSection({
  title,
  defaultExpanded = false,
  children
}: OptionSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Box sx={{ mb: 1 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          py: 1
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 500 }}>
          {title}
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ pl: 2, pb: 1 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}

export default function SVGCleaner({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('converters');
  const theme = useTheme();
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [stats, setStats] = useState<{
    originalSize: number;
    optimizedSize: number;
    savedPercent: number;
  } | null>(null);

  const compute = async (values: InitialValuesType, input: string) => {
    if (!input.trim()) {
      setResult('');
      setStats(null);
      return;
    }
    try {
      const optimized = await optimizeSVG(input, values);
      setResult(optimized.data);
      setStats({
        originalSize: optimized.originalSize,
        optimizedSize: optimized.optimizedSize,
        savedPercent: optimized.savedPercent
      });
    } catch (err) {
      console.error(`Failed to optimize SVG: ${err}`);
      setResult('');
      setStats(null);
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('svgCleaner.basicSettings'),
      component: (
        <Box>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.removeComments}
                  onChange={(e) =>
                    updateField('removeComments', e.target.checked)
                  }
                  size="small"
                />
              }
              label={t('svgCleaner.removeComments')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.removeMetadata}
                  onChange={(e) =>
                    updateField('removeMetadata', e.target.checked)
                  }
                  size="small"
                />
              }
              label={t('svgCleaner.removeMetadata')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.removeEditorsNSData}
                  onChange={(e) =>
                    updateField('removeEditorsNSData', e.target.checked)
                  }
                  size="small"
                />
              }
              label={t('svgCleaner.removeEditorsNSData')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.cleanupIDs}
                  onChange={(e) => updateField('cleanupIDs', e.target.checked)}
                  size="small"
                />
              }
              label={t('svgCleaner.cleanupIDs')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.cleanupNumericValues}
                  onChange={(e) =>
                    updateField('cleanupNumericValues', e.target.checked)
                  }
                  size="small"
                />
              }
              label={t('svgCleaner.cleanupNumericValues')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.minifyStyles}
                  onChange={(e) =>
                    updateField('minifyStyles', e.target.checked)
                  }
                  size="small"
                />
              }
              label={t('svgCleaner.minifyStyles')}
            />
          </FormGroup>
        </Box>
      )
    },
    {
      title: t('svgCleaner.advancedSettings'),
      component: (
        <Box>
          <OptionSection title={t('svgCleaner.cleanupOptions')}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.cleanupAttrs}
                    onChange={(e) =>
                      updateField('cleanupAttrs', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.cleanupAttrs')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.inlineStyles}
                    onChange={(e) =>
                      updateField('inlineStyles', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.inlineStyles')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.convertStyleToAttrs}
                    onChange={(e) =>
                      updateField('convertStyleToAttrs', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.convertStyleToAttrs')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.convertColors}
                    onChange={(e) =>
                      updateField('convertColors', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.convertColors')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.convertPathData}
                    onChange={(e) =>
                      updateField('convertPathData', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.convertPathData')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.convertTransform}
                    onChange={(e) =>
                      updateField('convertTransform', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.convertTransform')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.convertShapeToPath}
                    onChange={(e) =>
                      updateField('convertShapeToPath', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.convertShapeToPath')}
              />
            </FormGroup>
          </OptionSection>

          <OptionSection title={t('svgCleaner.removeOptions')}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeTitle}
                    onChange={(e) =>
                      updateField('removeTitle', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeTitle')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeDesc}
                    onChange={(e) =>
                      updateField('removeDesc', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeDesc')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeUselessDefs}
                    onChange={(e) =>
                      updateField('removeUselessDefs', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeUselessDefs')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeUnknownsAndDefaults}
                    onChange={(e) =>
                      updateField('removeUnknownsAndDefaults', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeUnknownsAndDefaults')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeNonInheritableGroupAttrs}
                    onChange={(e) =>
                      updateField(
                        'removeNonInheritableGroupAttrs',
                        e.target.checked
                      )
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeNonInheritableGroupAttrs')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeUselessStrokeAndFill}
                    onChange={(e) =>
                      updateField(
                        'removeUselessStrokeAndFill',
                        e.target.checked
                      )
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeUselessStrokeAndFill')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeHiddenElems}
                    onChange={(e) =>
                      updateField('removeHiddenElems', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeHiddenElems')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeEmptyText}
                    onChange={(e) =>
                      updateField('removeEmptyText', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeEmptyText')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeEmptyAttrs}
                    onChange={(e) =>
                      updateField('removeEmptyAttrs', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeEmptyAttrs')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeEmptyContainers}
                    onChange={(e) =>
                      updateField('removeEmptyContainers', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeEmptyContainers')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeUnusedNS}
                    onChange={(e) =>
                      updateField('removeUnusedNS', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeUnusedNS')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeViewBox}
                    onChange={(e) =>
                      updateField('removeViewBox', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeViewBox')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeDimensions}
                    onChange={(e) =>
                      updateField('removeDimensions', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeDimensions')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeScripts}
                    onChange={(e) =>
                      updateField('removeScripts', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeScripts')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeStyleElement}
                    onChange={(e) =>
                      updateField('removeStyleElement', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeStyleElement')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeRasterImages}
                    onChange={(e) =>
                      updateField('removeRasterImages', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeRasterImages')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeOffCanvasPaths}
                    onChange={(e) =>
                      updateField('removeOffCanvasPaths', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeOffCanvasPaths')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeXMLNS}
                    onChange={(e) =>
                      updateField('removeXMLNS', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeXMLNS')}
              />
            </FormGroup>
          </OptionSection>

          <OptionSection title={t('svgCleaner.groupOptions')}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.collapseGroups}
                    onChange={(e) =>
                      updateField('collapseGroups', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.collapseGroups')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.moveElemsAttrsToGroup}
                    onChange={(e) =>
                      updateField('moveElemsAttrsToGroup', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.moveElemsAttrsToGroup')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.moveGroupAttrsToElems}
                    onChange={(e) =>
                      updateField('moveGroupAttrsToElems', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.moveGroupAttrsToElems')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.mergePaths}
                    onChange={(e) =>
                      updateField('mergePaths', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.mergePaths')}
              />
            </FormGroup>
          </OptionSection>

          <OptionSection title={t('svgCleaner.sortingOptions')}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.sortAttrs}
                    onChange={(e) => updateField('sortAttrs', e.target.checked)}
                    size="small"
                  />
                }
                label={t('svgCleaner.sortAttrs')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.sortDefsChildren}
                    onChange={(e) =>
                      updateField('sortDefsChildren', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.sortDefsChildren')}
              />
            </FormGroup>
          </OptionSection>

          <OptionSection title={t('svgCleaner.customOptions')}>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.removeAttrs}
                    onChange={(e) =>
                      updateField('removeAttrs', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.removeAttrs')}
              />
              {values.removeAttrs && (
                <TextField
                  fullWidth
                  size="small"
                  value={values.removeAttrsList}
                  onChange={(e) =>
                    updateField('removeAttrsList', e.target.value)
                  }
                  placeholder={t('svgCleaner.removeAttrsPlaceholder')}
                  helperText={t('svgCleaner.removeAttrsHelper')}
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
            <Box mt={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.addClassesToSVGElement}
                    onChange={(e) =>
                      updateField('addClassesToSVGElement', e.target.checked)
                    }
                    size="small"
                  />
                }
                label={t('svgCleaner.addClassesToSVGElement')}
              />
              {values.addClassesToSVGElement && (
                <TextField
                  fullWidth
                  size="small"
                  value={values.className}
                  onChange={(e) => updateField('className', e.target.value)}
                  placeholder={t('svgCleaner.classNamePlaceholder')}
                  helperText={t('svgCleaner.classNameHelper')}
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </OptionSection>
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolTextInput
          value={input}
          onChange={setInput}
          title={t('svgCleaner.inputTitle')}
          placeholder={t('svgCleaner.inputPlaceholder')}
        />
      }
      resultComponent={
        <Box>
          {stats && (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                mb: 1,
                flexWrap: 'wrap',
                p: 1,
                bgcolor: theme.palette.mode === 'dark' ? grey[800] : grey[100],
                borderRadius: 1
              }}
            >
              <Chip
                label={`${t('svgCleaner.originalSize')}: ${formatBytes(
                  stats.originalSize
                )}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`${t('svgCleaner.optimizedSize')}: ${formatBytes(
                  stats.optimizedSize
                )}`}
                size="small"
                color="primary"
              />
              <Chip
                label={`${t('svgCleaner.saved')}: ${stats.savedPercent.toFixed(
                  1
                )}%`}
                size="small"
                color={stats.savedPercent > 0 ? 'success' : 'default'}
              />
            </Box>
          )}
          <ToolTextResult value={result} title={t('svgCleaner.resultTitle')} />
        </Box>
      }
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('svgCleaner.toolInfo.title', { title }),
        description: longDescription
      }}
    />
  );
}
