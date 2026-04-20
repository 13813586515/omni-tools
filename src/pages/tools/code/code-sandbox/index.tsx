import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  Tabs,
  Tab
} from '@mui/material';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { useTranslation } from 'react-i18next';
import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TemplateIcon from '@mui/icons-material/Article';
import HorizontalSplitIcon from '@mui/icons-material/HorizontalSplit';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import {
  InitialValuesType,
  CodeSandboxContent,
  defaultTemplates
} from './types';

const initialValues: InitialValuesType = {
  layout: 'horizontal',
  autoRefresh: true
};

const exampleCards: CardExampleType<InitialValuesType>[] = [];

function generatePreviewHtml(content: CodeSandboxContent): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${content.css}
  </style>
</head>
<body>
  ${content.html.replace(
    /<!DOCTYPE html>|<html[^>]*>|<\/html>|<head[^>]*>|<\/head>|<body[^>]*>|<\/body>/gi,
    ''
  )}
  <script>
    try {
      ${content.js}
    } catch (error) {
      console.error('JavaScript Error:', error);
      document.body.innerHTML += '<div style="color: red; padding: 20px; background: #ffebee; margin: 20px; border-radius: 4px;"><strong>Error:</strong> ' + error.message + '</div>';
    }
  </script>
</body>
</html>`;
}

export default function CodeSandbox({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('code');
  const theme = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [content, setContent] = useState<CodeSandboxContent>(
    defaultTemplates[0].content
  );
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [templateMenuAnchor, setTemplateMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [previewKey, setPreviewKey] = useState(0);

  const updateContent = useCallback(
    (field: keyof CodeSandboxContent, value: string) => {
      setContent((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const runPreview = useCallback(() => {
    if (iframeRef.current) {
      const html = generatePreviewHtml(content);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      if (iframeRef.current.src) {
        URL.revokeObjectURL(iframeRef.current.src);
      }

      iframeRef.current.src = url;
      setPreviewKey((prev) => prev + 1);
    }
  }, [content]);

  useEffect(() => {
    if (autoRefresh) {
      const timer = setTimeout(() => {
        runPreview();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [content, autoRefresh, runPreview]);

  useEffect(() => {
    runPreview();
  }, []);

  const handleTemplateClick = (event: React.MouseEvent<HTMLElement>) => {
    setTemplateMenuAnchor(event.currentTarget);
  };

  const handleTemplateClose = () => {
    setTemplateMenuAnchor(null);
  };

  const selectTemplate = (template: (typeof defaultTemplates)[0]) => {
    setContent(template.content);
    handleTemplateClose();
  };

  const downloadAsFile = () => {
    const html = generatePreviewHtml(content);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sandbox.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('codeSandbox.settings'),
      component: (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('codeSandbox.layout')}
            </Typography>
            <ButtonGroup size="small">
              <Button
                variant={layout === 'horizontal' ? 'contained' : 'outlined'}
                startIcon={<HorizontalSplitIcon />}
                onClick={() => {
                  setLayout('horizontal');
                  updateField('layout', 'horizontal');
                }}
              >
                {t('codeSandbox.horizontal')}
              </Button>
              <Button
                variant={layout === 'vertical' ? 'contained' : 'outlined'}
                startIcon={<VerticalSplitIcon />}
                onClick={() => {
                  setLayout('vertical');
                  updateField('layout', 'vertical');
                }}
              >
                {t('codeSandbox.vertical')}
              </Button>
            </ButtonGroup>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => {
                  setAutoRefresh(e.target.checked);
                  updateField('autoRefresh', e.target.checked);
                }}
              />
            }
            label={t('codeSandbox.autoRefresh')}
          />
        </Box>
      )
    }
  ];

  const editorOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 13,
    wordWrap: 'on' as const,
    lineNumbers: 'on' as const,
    automaticLayout: true
  };

  const editorsContainer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="HTML" sx={{ minWidth: 80 }} />
          <Tab label="CSS" sx={{ minWidth: 80 }} />
          <Tab label="JavaScript" sx={{ minWidth: 80 }} />
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {activeTab === 0 && (
          <Editor
            height="100%"
            language="html"
            theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
            value={content.html}
            onChange={(value) => updateContent('html', value ?? '')}
            options={editorOptions}
          />
        )}
        {activeTab === 1 && (
          <Editor
            height="100%"
            language="css"
            theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
            value={content.css}
            onChange={(value) => updateContent('css', value ?? '')}
            options={editorOptions}
          />
        )}
        {activeTab === 2 && (
          <Editor
            height="100%"
            language="javascript"
            theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
            value={content.js}
            onChange={(value) => updateContent('js', value ?? '')}
            options={editorOptions}
          />
        )}
      </Box>
    </Box>
  );

  const previewContainer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.default'
        }}
      >
        <Typography variant="subtitle2">{t('codeSandbox.preview')}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            startIcon={<PlayArrowIcon />}
            onClick={runPreview}
            variant="contained"
          >
            {t('codeSandbox.run')}
          </Button>
          <IconButton
            size="small"
            onClick={downloadAsFile}
            title={t('codeSandbox.download')}
          >
            <FileDownloadIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleTemplateClick}
            title={t('codeSandbox.templates')}
          >
            <TemplateIcon />
          </IconButton>
          <Menu
            anchorEl={templateMenuAnchor}
            open={Boolean(templateMenuAnchor)}
            onClose={handleTemplateClose}
          >
            {defaultTemplates.map((template) => (
              <MenuItem
                key={template.name}
                onClick={() => selectTemplate(template)}
              >
                {template.name}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          bgcolor: 'white',
          position: 'relative'
        }}
      >
        <iframe
          ref={iframeRef}
          key={previewKey}
          title="preview"
          sandbox="allow-scripts allow-modals allow-popups"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: 'white'
          }}
        />
      </Box>
    </Box>
  );

  return (
    <ToolContent
      title={title}
      input={null}
      inputComponent={
        <Paper
          elevation={0}
          sx={{
            border: 1,
            borderColor: 'divider',
            height: layout === 'horizontal' ? '600px' : '800px',
            display: 'flex',
            flexDirection: layout === 'horizontal' ? 'row' : 'column'
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              borderRight: layout === 'horizontal' ? 1 : 0,
              borderBottom: layout === 'vertical' ? 1 : 0,
              borderColor: 'divider'
            }}
          >
            {editorsContainer}
          </Box>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {previewContainer}
          </Box>
        </Paper>
      }
      resultComponent={null}
      initialValues={initialValues}
      exampleCards={exampleCards.length > 0 ? exampleCards : undefined}
      getGroups={getGroups}
      setInput={() => {}}
      compute={() => {}}
      toolInfo={{
        title: t('codeSandbox.toolInfo.title'),
        description: longDescription || t('codeSandbox.toolInfo.description')
      }}
    />
  );
}
