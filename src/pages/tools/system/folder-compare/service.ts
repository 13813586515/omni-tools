import {
  FileInfo,
  FolderInfo,
  CompareMethod,
  ComparisonResult,
  FileComparisonResult
} from './types';

declare global {
  interface Window {
    showDirectoryPicker(options?: {
      mode?: 'read' | 'readwrite';
    }): Promise<any>;
  }
}

export async function computeMD5(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('MD5', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

export async function traverseDirectory(
  handle: any,
  basePath: string = '',
  files: FileInfo[] = []
): Promise<FileInfo[]> {
  for await (const entry of handle.entries()) {
    const [name, entryHandle] = entry as [string, any];
    const fullPath = basePath ? `${basePath}/${name}` : name;

    if (entryHandle.kind === 'directory') {
      await traverseDirectory(entryHandle, fullPath, files);
    } else if (entryHandle.kind === 'file') {
      const file = await entryHandle.getFile();
      files.push({
        name,
        path: fullPath,
        size: file.size,
        lastModified: file.lastModified,
        handle: entryHandle
      });
    }
  }
  return files;
}

export async function selectFolder(): Promise<FolderInfo | null> {
  try {
    const handle = await window.showDirectoryPicker({ mode: 'read' });
    const files = await traverseDirectory(handle);
    return {
      name: handle.name,
      files,
      handle
    };
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return null;
    }
    throw error;
  }
}

export async function computeFileHashes(
  files: FileInfo[]
): Promise<FileInfo[]> {
  const result: FileInfo[] = [];
  for (const fileInfo of files) {
    const file = await fileInfo.handle.getFile();
    const md5 = await computeMD5(file);
    result.push({
      ...fileInfo,
      md5
    });
  }
  return result;
}

export function compareFolders(
  folder1Files: FileInfo[],
  folder2Files: FileInfo[],
  method: CompareMethod
): ComparisonResult {
  const folder1Map = new Map<string, FileInfo>(
    folder1Files.map((f) => [f.path, f])
  );
  const folder2Map = new Map<string, FileInfo>(
    folder2Files.map((f) => [f.path, f])
  );

  const allPaths = new Set([...folder1Map.keys(), ...folder2Map.keys()]);
  const results: FileComparisonResult[] = [];

  for (const path of allPaths) {
    const file1 = folder1Map.get(path);
    const file2 = folder2Map.get(path);

    if (!file1 && file2) {
      results.push({
        path,
        status: 'added',
        folder2Info: file2
      });
    } else if (file1 && !file2) {
      results.push({
        path,
        status: 'removed',
        folder1Info: file1
      });
    } else if (file1 && file2) {
      let isModified = false;

      if (method === 'size') {
        isModified = file1.size !== file2.size;
      } else if (method === 'md5') {
        isModified = file1.md5 !== file2.md5;
      }

      results.push({
        path,
        status: isModified ? 'modified' : 'unchanged',
        folder1Info: file1,
        folder2Info: file2
      });
    }
  }

  results.sort((a, b) => a.path.localeCompare(b.path));

  return {
    folder1: '',
    folder2: '',
    totalFiles1: folder1Files.length,
    totalFiles2: folder2Files.length,
    added: results.filter((r) => r.status === 'added'),
    removed: results.filter((r) => r.status === 'removed'),
    modified: results.filter((r) => r.status === 'modified'),
    unchanged: results.filter((r) => r.status === 'unchanged')
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
