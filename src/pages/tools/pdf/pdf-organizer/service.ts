import { PDFDocument, PDFPage } from 'pdf-lib';
import { PdfFileInfo, PdfPageInfo } from './types';

export async function getPdfInfo(file: File): Promise<PdfFileInfo> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pageCount = pdfDoc.getPageCount();

  const pages: PdfPageInfo[] = Array.from(
    { length: pageCount },
    (_, index) => ({
      id: `${file.name}-${index}`,
      fileId: file.name,
      pageIndex: index,
      pageNumber: index + 1,
      selected: true,
      order: index
    })
  );

  return {
    id: file.name,
    file,
    name: file.name,
    pageCount,
    pages
  };
}

export async function organizePdf(
  pdfFiles: PdfFileInfo[],
  selectedPages: PdfPageInfo[]
): Promise<File> {
  const mergedPdf = await PDFDocument.create();

  const sortedPages = [...selectedPages].sort((a, b) => a.order - b.order);

  for (const pageInfo of sortedPages) {
    const pdfFile = pdfFiles.find((f) => f.id === pageInfo.fileId);
    if (!pdfFile) continue;

    const arrayBuffer = await pdfFile.file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);

    const [copiedPage] = await mergedPdf.copyPages(sourcePdf, [
      pageInfo.pageIndex
    ]);
    mergedPdf.addPage(copiedPage);
  }

  const mergedPdfBytes = await mergedPdf.save();
  const mergedFileName = 'organized.pdf';
  return new File([mergedPdfBytes.buffer as ArrayBuffer], mergedFileName, {
    type: 'application/pdf'
  });
}

export async function getPageThumbnail(
  file: File,
  pageIndex: number
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const page = pdfDoc.getPage(pageIndex);

  const newPdf = await PDFDocument.create();
  const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
  newPdf.addPage(copiedPage);

  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
    type: 'application/pdf'
  });
  return URL.createObjectURL(blob);
}

export function flattenPages(pdfFiles: PdfFileInfo[]): PdfPageInfo[] {
  const allPages: PdfPageInfo[] = [];
  let globalOrder = 0;

  for (const pdfFile of pdfFiles) {
    for (const page of pdfFile.pages) {
      allPages.push({
        ...page,
        order: globalOrder
      });
      globalOrder++;
    }
  }

  return allPages;
}

export function movePage(
  pages: PdfPageInfo[],
  pageId: string,
  direction: 'up' | 'down'
): PdfPageInfo[] {
  const pageIndex = pages.findIndex((p) => p.id === pageId);
  if (pageIndex === -1) return pages;

  const newPages = [...pages];
  const targetIndex = direction === 'up' ? pageIndex - 1 : pageIndex + 1;

  if (targetIndex < 0 || targetIndex >= pages.length) return pages;

  const tempOrder = newPages[pageIndex].order;
  newPages[pageIndex].order = newPages[targetIndex].order;
  newPages[targetIndex].order = tempOrder;

  return newPages.sort((a, b) => a.order - b.order);
}

export function togglePageSelection(
  pdfFiles: PdfFileInfo[],
  pageId: string
): PdfFileInfo[] {
  return pdfFiles.map((pdfFile) => ({
    ...pdfFile,
    pages: pdfFile.pages.map((page) =>
      page.id === pageId ? { ...page, selected: !page.selected } : page
    )
  }));
}

export function selectAllPages(
  pdfFiles: PdfFileInfo[],
  select: boolean
): PdfFileInfo[] {
  return pdfFiles.map((pdfFile) => ({
    ...pdfFile,
    pages: pdfFile.pages.map((page) => ({ ...page, selected: select }))
  }));
}
