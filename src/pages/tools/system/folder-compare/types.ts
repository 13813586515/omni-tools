export type CompareMethod = 'md5' | 'size';

export type FileComparisonResult = {
  path: string;
  status: 'added' | 'removed' | 'modified' | 'unchanged';
  folder1Info?: FileInfo;
  folder2Info?: FileInfo;
};

export type FileInfo = {
  name: string;
  path: string;
  size: number;
  lastModified: number;
  md5?: string;
  handle: any;
};

export type FolderInfo = {
  name: string;
  files: FileInfo[];
  handle: any;
};

export type InitialValuesType = {
  compareMethod: CompareMethod;
};

export type ComparisonResult = {
  folder1: string;
  folder2: string;
  totalFiles1: number;
  totalFiles2: number;
  added: FileComparisonResult[];
  removed: FileComparisonResult[];
  modified: FileComparisonResult[];
  unchanged: FileComparisonResult[];
};
