import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('system', {
  i18n: {
    name: 'system:folderCompare.title',
    description: 'system:folderCompare.description',
    shortDescription: 'system:folderCompare.shortDescription',
    longDescription: 'system:folderCompare.longDescription',
    userTypes: ['developers', 'generalUsers']
  },
  path: 'folder-compare',
  icon: 'material-symbols:compare-arrows-outline',
  keywords: [
    'folder',
    'compare',
    'diff',
    'directory',
    'file',
    'difference',
    'md5'
  ],
  component: lazy(() => import('./index'))
});
