import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('converters', {
  path: 'svg-cleaner',
  icon: 'material-symbols:cleaning-services',
  keywords: ['svg', 'clean', 'optimize', 'compress', 'svgo', 'minify', 'figma'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'converters:svgCleaner.title',
    description: 'converters:svgCleaner.description',
    shortDescription: 'converters:svgCleaner.shortDescription',
    longDescription: 'converters:svgCleaner.longDescription',
    userTypes: ['developers', 'generalUsers']
  }
});
