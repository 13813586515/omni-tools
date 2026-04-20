import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
  Paper,
  Divider,
  Collapse,
  IconButton
} from '@mui/material';
import React, { useState, useCallback } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { useTranslation } from 'react-i18next';
import SimpleRadio from '@components/options/SimpleRadio';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CompareIcon from '@mui/icons-material/Compare';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import {
  selectFolder,
  compareFolders,
  computeFileHashes,
  formatFileSize
} from './service';
import {
  FolderInfo,
  InitialValuesType,
  ComparisonResult,
  CompareMethod,
  FileComparisonResult
} from './types';

const initialValues: InitialValuesType = {
  compareMethod: 'md5'
};

const exampleCards: CardExampleType<InitialValuesType>[] = [];

function FileItem({ result }: { result: FileComparisonResult }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation('system');

  const getStatusColor = (status: FileComparisonResult['status']) => {
    switch (status) {
      case 'added':
        return 'success.main';
      case 'removed':
        return 'error.main';
      case 'modified':
        return 'warning.main';
      default:
        return 'text.secondary';
    }
  };

  const getStatusIcon = (status: FileComparisonResult['status']) => {
    switch (status) {
      case 'added':
        return <AddCircleIcon sx={{ color: 'success.main' }} />;
      case 'removed':
        return <RemoveCircleIcon sx={{ color: 'error.main' }} />;
      case 'modified':
        return <ChangeCircleIcon sx={{ color: 'warning.main' }} />;
      default:
        return <CheckCircleIcon sx={{ color: 'text.secondary' }} />;
    }
  };

  const getStatusLabel = (status: FileComparisonResult['status']) => {
    switch (status) {
      case 'added':
        return t('folderCompare.added');
      case 'removed':
        return t('folderCompare.removed');
      case 'modified':
        return t('folderCompare.modified');
      default:
        return t('folderCompare.unchanged');
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 1,
          px: 2,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ mr: 1 }}>{getStatusIcon(result.status)}</Box>
        <Typography variant="body2" sx={{ flex: 1, fontFamily: 'monospace' }}>
          {result.path}
        </Typography>
        <Chip
          label={getStatusLabel(result.status)}
          size="small"
          sx={{
            backgroundColor: getStatusColor(result.status),
            color: 'white',
            mr: 1
          }}
        />
        {(result.folder1Info || result.folder2Info) && (
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ pl: 6, pr: 2, pb: 1, bgcolor: 'background.default' }}>
          {result.folder1Info && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <FileCopyIcon
                fontSize="small"
                sx={{ mr: 1, color: 'text.secondary' }}
              />
              <Typography variant="caption" color="text.secondary">
                {t('folderCompare.folder1')}:{' '}
                {formatFileSize(result.folder1Info.size)}
                {result.folder1Info.md5 && ` (MD5: ${result.folder1Info.md5})`}
              </Typography>
            </Box>
          )}
          {result.folder2Info && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FileCopyIcon
                fontSize="small"
                sx={{ mr: 1, color: 'text.secondary' }}
              />
              <Typography variant="caption" color="text.secondary">
                {t('folderCompare.folder2')}:{' '}
                {formatFileSize(result.folder2Info.size)}
                {result.folder2Info.md5 && ` (MD5: ${result.folder2Info.md5})`}
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

function ResultSection({
  title,
  results,
  color
}: {
  title: string;
  results: FileComparisonResult[];
  color: string;
}) {
  const [expanded, setExpanded] = useState(true);

  if (results.length === 0) return null;

  return (
    <Paper elevation={0} sx={{ mb: 2, border: 1, borderColor: 'divider' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1.5,
          cursor: 'pointer',
          bgcolor: `${color}.05`
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography variant="subtitle2" sx={{ flex: 1, color }}>
          {title} ({results.length})
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {results.map((result, index) => (
            <React.Fragment key={result.path}>
              {index > 0 && <Divider />}
              <FileItem result={result} />
            </React.Fragment>
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
}

export default function FolderCompare({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('system');
  const [folder1, setFolder1] = useState<FolderInfo | null>(null);
  const [folder2, setFolder2] = useState<FolderInfo | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compareMethod, setCompareMethod] = useState<CompareMethod>('md5');

  const selectFolder1 = useCallback(async () => {
    setError(null);
    try {
      const folder = await selectFolder();
      if (folder) {
        setFolder1(folder);
        setResult(null);
      }
    } catch (err) {
      setError(t('folderCompare.errorSelectingFolder'));
    }
  }, [t]);

  const selectFolder2 = useCallback(async () => {
    setError(null);
    try {
      const folder = await selectFolder();
      if (folder) {
        setFolder2(folder);
        setResult(null);
      }
    } catch (err) {
      setError(t('folderCompare.errorSelectingFolder'));
    }
  }, [t]);

  const performCompare = useCallback(async () => {
    if (!folder1 || !folder2) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      let files1 = folder1.files;
      let files2 = folder2.files;

      if (compareMethod === 'md5') {
        files1 = await computeFileHashes(files1);
        files2 = await computeFileHashes(files2);
      }

      const comparisonResult = compareFolders(files1, files2, compareMethod);
      comparisonResult.folder1 = folder1.name;
      comparisonResult.folder2 = folder2.name;
      setResult(comparisonResult);
    } catch (err) {
      setError(t('folderCompare.errorComparing'));
    } finally {
      setIsProcessing(false);
    }
  }, [folder1, folder2, compareMethod, t]);

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('folderCompare.comparisonSettings'),
      component: (
        <Box>
          <SimpleRadio
            onClick={() => {
              updateField('compareMethod', 'md5');
              setCompareMethod('md5');
              setResult(null);
            }}
            checked={values.compareMethod === 'md5'}
            description={t('folderCompare.compareByMd5Description')}
            title={t('folderCompare.compareByMd5')}
          />
          <SimpleRadio
            onClick={() => {
              updateField('compareMethod', 'size');
              setCompareMethod('size');
              setResult(null);
            }}
            checked={values.compareMethod === 'size'}
            description={t('folderCompare.compareBySizeDescription')}
            title={t('folderCompare.compareBySize')}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={null}
      inputComponent={
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 2,
              border: 1,
              borderColor: 'divider'
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              {t('folderCompare.selectFolders')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<FolderOpenIcon />}
                  onClick={selectFolder1}
                  disabled={isProcessing}
                  sx={{ mb: 1, height: 80 }}
                >
                  {folder1 ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" fontWeight="bold">
                        {folder1.name}
                      </Typography>
                      <Typography variant="caption">
                        {t('folderCompare.filesCount', {
                          count: folder1.files.length
                        })}
                      </Typography>
                    </Box>
                  ) : (
                    t('folderCompare.selectFolder1')
                  )}
                </Button>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CompareIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<FolderOpenIcon />}
                  onClick={selectFolder2}
                  disabled={isProcessing}
                  sx={{ mb: 1, height: 80 }}
                >
                  {folder2 ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" fontWeight="bold">
                        {folder2.name}
                      </Typography>
                      <Typography variant="caption">
                        {t('folderCompare.filesCount', {
                          count: folder2.files.length
                        })}
                      </Typography>
                    </Box>
                  ) : (
                    t('folderCompare.selectFolder2')
                  )}
                </Button>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <CompareIcon />
                  )
                }
                onClick={performCompare}
                disabled={!folder1 || !folder2 || isProcessing}
              >
                {isProcessing
                  ? t('folderCompare.comparingShort')
                  : t('folderCompare.compare')}
              </Button>
            </Box>
          </Paper>

          {error && (
            <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          {isProcessing && (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>
                {compareMethod === 'md5'
                  ? t('folderCompare.computingHashes')
                  : t('folderCompare.comparing')}
              </Typography>
            </Box>
          )}

          {result && !isProcessing && (
            <Box>
              <Paper
                elevation={0}
                sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider' }}
              >
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {t('folderCompare.summary')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${t('folderCompare.added')}: ${
                      result.added.length
                    }`}
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label={`${t('folderCompare.removed')}: ${
                      result.removed.length
                    }`}
                    color="error"
                    variant="outlined"
                  />
                  <Chip
                    label={`${t('folderCompare.modified')}: ${
                      result.modified.length
                    }`}
                    color="warning"
                    variant="outlined"
                  />
                  <Chip
                    label={`${t('folderCompare.unchanged')}: ${
                      result.unchanged.length
                    }`}
                    color="default"
                    variant="outlined"
                  />
                </Box>
              </Paper>

              <ResultSection
                title={t('folderCompare.addedFiles')}
                results={result.added}
                color="success"
              />
              <ResultSection
                title={t('folderCompare.removedFiles')}
                results={result.removed}
                color="error"
              />
              <ResultSection
                title={t('folderCompare.modifiedFiles')}
                results={result.modified}
                color="warning"
              />
              <ResultSection
                title={t('folderCompare.unchangedFiles')}
                results={result.unchanged}
                color="default"
              />
            </Box>
          )}
        </Box>
      }
      resultComponent={null}
      initialValues={initialValues}
      exampleCards={exampleCards.length > 0 ? exampleCards : undefined}
      getGroups={getGroups}
      setInput={() => {}}
      compute={() => {}}
      toolInfo={{
        title: t('folderCompare.toolInfo.title'),
        description: longDescription || t('folderCompare.toolInfo.description')
      }}
    />
  );
}
