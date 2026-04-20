import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const meta = defineTool('pdf', {
  icon: 'material-symbols:table-rows-narrow-rounded',
  component: lazy(() => import('./index')),
  keywords: [
    'organize',
    'arrange',
    'reorder',
    'pages',
    'extract',
    'combine',
    'merge'
  ],
  path: 'pdf-organizer',
  i18n: {
    name: 'pdf:pdfOrganizer.title',
    description: 'pdf:pdfOrganizer.description',
    shortDescription: 'pdf:pdfOrganizer.shortDescription',
    longDescription: 'pdf:pdfOrganizer.longDescription',
    userTypes: ['generalUsers']
  }
});
