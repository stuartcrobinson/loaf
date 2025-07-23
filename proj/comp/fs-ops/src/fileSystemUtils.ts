import { stat } from 'fs/promises';

/**
 * Check if a file or directory exists
 * @param path - File or directory path to check
 * @returns true if exists, false otherwise
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}