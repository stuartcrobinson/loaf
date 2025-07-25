import type { LoafAction } from '../../../nesl-action-parser/src/index.js';
import type { FsGuard } from '../../../fs-guard/src/index.js';
import type { FileOpResult } from '../index.js';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { formatNodeError, fileExists } from '../utils.js';

export async function handle__file_write(guard: FsGuard, action: LoafAction): Promise<FileOpResult> {
  const { path, content } = action.parameters;

  try {
    // Create parent directories if needed
    const parentDir = dirname(path);
    await mkdir(parentDir, { recursive: true });

    // Write file
    await writeFile(path, content, 'utf8');
    const bytesWritten = Buffer.byteLength(content, 'utf8');

    // Temporary debug for test 004
    if (path.includes('move-to-existing-file')) {
      // console.log(`DEBUG: Wrote file ${path}`);
      const exists = await fileExists(path);
      // console.log(`DEBUG: File exists after write: ${exists}`);
    }

    return {
      success: true,
      data: {
        path,
        bytesWritten
      }
    };

  } catch (error: any) {
    return {
      success: false,
      error: formatNodeError(error, path, 'open')
    };
  }
}