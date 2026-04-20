import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('audio', {
  path: 'spectrum-editor',
  icon: 'material-symbols:equalizer',
  keywords: [
    'audio',
    'spectrum',
    'visualizer',
    'fade',
    'normalize',
    'equalizer',
    'waveform'
  ],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'audio:spectrumEditor.title',
    description: 'audio:spectrumEditor.description',
    shortDescription: 'audio:spectrumEditor.shortDescription',
    longDescription: 'audio:spectrumEditor.longDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
