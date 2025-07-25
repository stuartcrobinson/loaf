import type { LoafAction } from '../../../nesl-action-parser/src/index.js';
import type { FsGuard } from '../../../fs-guard/src/index.js';
import type { FileOpResult } from '../index.js';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { formatNodeError } from '../utils.js';

export async function handle__file_write(guard: FsGuard, action: LoafAction): Promise<FileOpResult> {
  const { path, content } = action.parameters;

  const guardResult = await guard.check(action);
  if (!guardResult.allowed) {
    return {
      success: false,
      error: guardResult.reason || 'Access denied'
    };
  }

  try {
    // Create parent directories if needed
    const parentDir = dirname(path);
    await mkdir(parentDir, { recursive: true });

    // Write file
    await writeFile(path, content, 'utf8');
    const bytesWritten = Buffer.byteLength(content, 'utf8');



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