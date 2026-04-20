import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
  Divider,
  Tooltip
} from '@mui/material';
import React, { useState, useCallback, useEffect } from 'react';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { useTranslation } from 'react-i18next';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  getPdfInfo,
  organizePdf,
  flattenPages,
  togglePageSelection,
  selectAllPages,
  movePage
} from './service';
import { PdfFileInfo, PdfPageInfo, InitialValuesType } from './types';

const initialValues: InitialValuesType = {
  includeAllPages: true
};

const exampleCards: CardExampleType<InitialValuesType>[] = [];

function PageItem({
  page,
  onToggle,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: {
  page: PdfPageInfo;
  onToggle: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { t } = useTranslation('pdf');

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1,
        mb: 1,
        display: 'flex',
        alignItems: 'center',
        opacity: page.selected ? 1 : 0.5,
        bgcolor: page.selected ? 'background.paper' : 'action.hover'
      }}
    >
      <Checkbox checked={page.selected} onChange={() => onToggle(page.id)} />
      <Box
        sx={{
          width: 60,
          height: 80,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
          mr: 2
        }}
      >
        <PictureAsPdfIcon sx={{ fontSize: 32, color: 'error.main' }} />
        <Typography variant="caption" fontWeight="bold">
          {page.pageNumber}
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight="medium">
          {t('pdfOrganizer.page')} {page.pageNumber}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {page.fileId}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Tooltip title={t('pdfOrganizer.moveUp')}>
          <span>
            <IconButton
              size="small"
              onClick={() => onMoveUp(page.id)}
              disabled={isFirst}
            >
              <ArrowUpwardIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t('pdfOrganizer.moveDown')}>
          <span>
            <IconButton
              size="small"
              onClick={() => onMoveDown(page.id)}
              disabled={isLast}
            >
              <ArrowDownwardIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
}

function FileSection({
  pdfFile,
  onTogglePage,
  onRemoveFile,
  allSelected,
  onSelectAll,
  onDeselectAll
}: {
  pdfFile: PdfFileInfo;
  onTogglePage: (pageId: string) => void;
  onRemoveFile: () => void;
  allSelected: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}) {
  const { t } = useTranslation('pdf');
  const selectedCount = pdfFile.pages.filter((p) => p.selected).length;

  return (
    <Paper elevation={0} sx={{ mb: 2, border: 1, borderColor: 'divider' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <PictureAsPdfIcon sx={{ color: 'error.main', mr: 1 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2">{pdfFile.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {t('pdfOrganizer.pageCount', { count: pdfFile.pageCount })} |{' '}
            {t('pdfOrganizer.selected')}: {selectedCount}
          </Typography>
        </Box>
        <ButtonGroup size="small" sx={{ mr: 1 }}>
          <Button
            onClick={onSelectAll}
            startIcon={<SelectAllIcon fontSize="small" />}
          >
            {t('pdfOrganizer.selectAll')}
          </Button>
          <Button
            onClick={onDeselectAll}
            startIcon={<DeselectIcon fontSize="small" />}
          >
            {t('pdfOrganizer.deselectAll')}
          </Button>
        </ButtonGroup>
        <IconButton size="small" color="error" onClick={onRemoveFile}>
          <DeleteIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {pdfFile.pages.map((page) => (
            <Tooltip
              key={page.id}
              title={t('pdfOrganizer.page') + ' ' + page.pageNumber}
            >
              <Box
                sx={{
                  width: 80,
                  height: 110,
                  border: 2,
                  borderColor: page.selected ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: page.selected ? 'primary.50' : 'background.default',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.light',
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => onTogglePage(page.id)}
              >
                <PictureAsPdfIcon
                  sx={{
                    fontSize: 32,
                    color: page.selected ? 'primary.main' : 'text.secondary'
                  }}
                />
                <Typography variant="caption" fontWeight="bold">
                  {page.pageNumber}
                </Typography>
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

export default function PdfOrganizer({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('pdf');
  const [pdfFiles, setPdfFiles] = useState<PdfFileInfo[]>([]);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'files' | 'pages'>('files');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      for (const file of Array.from(files)) {
        if (file.type !== 'application/pdf') continue;

        setLoadingFiles((prev) => new Set(prev).add(file.name));

        try {
          const pdfInfo = await getPdfInfo(file);
          setPdfFiles((prev) => {
            const exists = prev.some((p) => p.name === file.name);
            if (exists) return prev;
            return [...prev, pdfInfo];
          });
        } catch (error) {
          console.error('Error loading PDF:', error);
        } finally {
          setLoadingFiles((prev) => {
            const next = new Set(prev);
            next.delete(file.name);
            return next;
          });
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    []
  );

  const removeFile = useCallback((fileId: string) => {
    setPdfFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const handleTogglePage = useCallback((pageId: string) => {
    setPdfFiles((prev) => togglePageSelection(prev, pageId));
  }, []);

  const handleSelectAllPages = useCallback((fileId: string) => {
    setPdfFiles((prev) =>
      prev.map((f) => (f.id === fileId ? selectAllPages([f], true)[0] : f))
    );
  }, []);

  const handleDeselectAllPages = useCallback((fileId: string) => {
    setPdfFiles((prev) =>
      prev.map((f) => (f.id === fileId ? selectAllPages([f], false)[0] : f))
    );
  }, []);

  const allPages = flattenPages(pdfFiles);
  const selectedPages = allPages.filter((p) => p.selected);

  const handleMovePageUp = useCallback(
    (pageId: string) => {
      const newPages = movePage(allPages, pageId, 'up');
      const newFiles = pdfFiles.map((pdfFile) => ({
        ...pdfFile,
        pages: pdfFile.pages.map((page) => {
          const newPage = newPages.find((p) => p.id === page.id);
          return newPage ? { ...page, order: newPage.order } : page;
        })
      }));
      setPdfFiles(newFiles);
    },
    [pdfFiles, allPages]
  );

  const handleMovePageDown = useCallback(
    (pageId: string) => {
      const newPages = movePage(allPages, pageId, 'down');
      const newFiles = pdfFiles.map((pdfFile) => ({
        ...pdfFile,
        pages: pdfFile.pages.map((page) => {
          const newPage = newPages.find((p) => p.id === page.id);
          return newPage ? { ...page, order: newPage.order } : page;
        })
      }));
      setPdfFiles(newFiles);
    },
    [pdfFiles, allPages]
  );

  const organize = useCallback(async () => {
    if (selectedPages.length === 0) return;

    setIsProcessing(true);
    try {
      const resultFile = await organizePdf(pdfFiles, selectedPages);
      setResult(resultFile);
    } catch (error) {
      throw new Error('Error organizing PDF: ' + error);
    } finally {
      setIsProcessing(false);
    }
  }, [pdfFiles, selectedPages]);

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('pdfOrganizer.viewSettings'),
      component: (
        <Box>
          <ButtonGroup fullWidth size="small">
            <Button
              variant={viewMode === 'files' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('files')}
            >
              {t('pdfOrganizer.viewByFile')}
            </Button>
            <Button
              variant={viewMode === 'pages' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('pages')}
            >
              {t('pdfOrganizer.viewAllPages')}
            </Button>
          </ButtonGroup>
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
              p: 4,
              mb: 2,
              border: 2,
              borderStyle: 'dashed',
              borderColor: 'divider',
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50'
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadFileIcon
              sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
            />
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t('pdfOrganizer.uploadPdfs')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('pdfOrganizer.uploadDescription')}
            </Typography>
            {loadingFiles.size > 0 && (
              <Box sx={{ mt: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {t('pdfOrganizer.loading')}...
                </Typography>
              </Box>
            )}
          </Paper>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          {pdfFiles.length > 0 && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <Box>
                  <Chip
                    label={t('pdfOrganizer.totalFiles', {
                      count: pdfFiles.length
                    })}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={t('pdfOrganizer.totalPages', {
                      count: allPages.length
                    })}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={t('pdfOrganizer.selectedPages', {
                      count: selectedPages.length
                    })}
                    color="primary"
                  />
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={organize}
                    disabled={selectedPages.length === 0 || isProcessing}
                    startIcon={
                      isProcessing ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <RefreshIcon />
                      )
                    }
                  >
                    {isProcessing
                      ? t('pdfOrganizer.processing')
                      : t('pdfOrganizer.organize')}
                  </Button>
                </Box>
              </Box>

              {viewMode === 'files' ? (
                pdfFiles.map((pdfFile) => (
                  <FileSection
                    key={pdfFile.id}
                    pdfFile={pdfFile}
                    onTogglePage={handleTogglePage}
                    onRemoveFile={() => removeFile(pdfFile.id)}
                    allSelected={pdfFile.pages.every((p) => p.selected)}
                    onSelectAll={() => handleSelectAllPages(pdfFile.id)}
                    onDeselectAll={() => handleDeselectAllPages(pdfFile.id)}
                  />
                ))
              ) : (
                <Paper
                  elevation={0}
                  sx={{ p: 2, border: 1, borderColor: 'divider' }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    {t('pdfOrganizer.pageOrder')}
                  </Typography>
                  <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                    {selectedPages.map((page, index) => (
                      <PageItem
                        key={page.id}
                        page={page}
                        onToggle={handleTogglePage}
                        onMoveUp={handleMovePageUp}
                        onMoveDown={handleMovePageDown}
                        isFirst={index === 0}
                        isLast={index === selectedPages.length - 1}
                      />
                    ))}
                    {selectedPages.length === 0 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                        py={4}
                      >
                        {t('pdfOrganizer.noPagesSelected')}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              )}
            </Box>
          )}

          {result && (
            <Paper
              elevation={0}
              sx={{ mt: 2, p: 2, border: 1, borderColor: 'success.main' }}
            >
              <ToolFileResult
                title={t('pdfOrganizer.result')}
                value={result}
                extension="pdf"
                loading={false}
              />
            </Paper>
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
        title: t('pdfOrganizer.toolInfo.title'),
        description: longDescription || t('pdfOrganizer.toolInfo.description')
      }}
    />
  );
}
