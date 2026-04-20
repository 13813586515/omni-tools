import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  path: 'extract-frames',
  icon: 'material-symbols:frame-person-outline',
  keywords: [
    'video',
    'frame',
    'extract',
    'thumbnail',
    'screenshot',
    'keyframes'
  ],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:extractFrames.title',
    description: 'video:extractFrames.description',
    shortDescription: 'video:extractFrames.shortDescription',
    longDescription: 'video:extractFrames.longDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
