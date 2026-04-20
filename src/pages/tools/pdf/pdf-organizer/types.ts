export type PdfFileInfo = {
  id: string;
  file: File;
  name: string;
  pageCount: number;
  pages: PdfPageInfo[];
};

export type PdfPageInfo = {
  id: string;
  fileId: string;
  pageIndex: number;
  pageNumber: number;
  selected: boolean;
  order: number;
};

export type InitialValuesType = {
  includeAllPages: boolean;
};
