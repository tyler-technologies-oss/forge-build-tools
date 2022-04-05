import { isGlob } from '../utils';
import { globFilesAsync, readFileAsync, writeFileAsync } from './fs';

export interface IFileDescriptor {
  filepath: string;
  changed: boolean;
}

export interface IModifyFileInfo {
  contents: string;
  filepath: string;
}

export declare type Modifier = (fileInfo: IModifyFileInfo) => Promise<string> | string;

/**
 * Modifies the contents of each of the provided files by calling the `modifier` function on each file.
 * @param files The files to modify.
 * @param modifier The modifier function.
 */
export async function modifyFile(files: string[] | string, modifier: Modifier): Promise<IFileDescriptor[]> {
  if (typeof files === 'string') {
    files = isGlob(files) ? await globFilesAsync(files, {}) : [files];
  }

  const fileDescriptors: IFileDescriptor[] = [];

  for (const filepath of files) {
    const contents = await readFileAsync(filepath, 'utf8');
    const newContents = await Promise.resolve(modifier({ contents, filepath }));
    const isChanged = contents !== newContents;

    if (isChanged) {
      await writeFileAsync(filepath, newContents, 'utf8');
    }

    fileDescriptors.push({ filepath, changed: isChanged });
  }

  return fileDescriptors;
}
