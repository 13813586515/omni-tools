import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('code', {
  i18n: {
    name: 'code:codeSandbox.title',
    description: 'code:codeSandbox.description',
    shortDescription: 'code:codeSandbox.shortDescription',
    longDescription: 'code:codeSandbox.longDescription',
    userTypes: ['developers']
  },
  path: 'code-sandbox',
  icon: 'material-symbols:play-circle-outline',
  keywords: [
    'code',
    'sandbox',
    'editor',
    'html',
    'css',
    'javascript',
    'preview',
    'jsfiddle',
    'offline'
  ],
  component: lazy(() => import('./index'))
});
