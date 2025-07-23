import { watchFile, unwatchFile, Stats } from 'fs';
import { readFile, writeFile, access, constants } from 'fs/promises';
import { dirname, join } from 'path';
import clipboard from 'clipboardy';

import type { ListenerConfig, ListenerHandle, ListenerState } from './types.js';
import { ListenerError } from './errors.js';
import { Loaf } from '../../orch/src/index.js';
import { formatSummary, formatFullOutput } from './formatters.js';
import { computeContentHash } from './utils.js';

// Module-level state for tracking active listeners
const activeListeners = new Map<string, ListenerHandle>();

// Strip prepended summary section if present
function stripSummarySection(content: string): string {
  const marker = '=== END ===';
  const i = content.lastIndexOf(marker);
  return i === -1 ? content : content.slice(i + marker.length).trimStart();
}


// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
  };

  return debounced as T & { cancel: () => void };
}

// Generate unique ID for listener instance
function generateId(): string {
  return `listener-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format clipboard status line
function formatClipboardStatus(success: boolean, timestamp: Date): string {
  const time = timestamp.toLocaleTimeString();
  return success ?
    `📋 Copied to clipboard` :
    `❌ Clipboard copy failed`;
}

// Process file changes
async function processFileChange(filePath: string, state: ListenerState): Promise<void> {
  // Check not already processing
  if (state.isProcessing) return;

  try {
    state.isProcessing = true;

    // Read file
    const fullContent = await readFile(filePath, 'utf-8');
    if (fullContent.trim() == "") {
      return;
    }

    // Strip summary section for hashing
    const contentForHash = stripSummarySection(fullContent).trim();

    // // DIAGNOSTIC: Log stripping results
    // console.log('\n=== STRIP SUMMARY ===');
    // console.log('Original length:', fullContent.length);
    // console.log('Stripped length:', contentForHash.length);
    // console.log('Stripped content preview:', contentForHash.substring(0, 150).replace(/\n/g, '\\n'));
    // console.log('=== END STRIP ===\n');

    // Compute hash of content (excluding summary)
    const currentHash = computeContentHash(contentForHash);

    // // DIAGNOSTIC: Log hash comparison
    // console.log('Current hash:', currentHash);
    // console.log('Last hash:', state.lastExecutedHash);

    // Skip if unchanged
    if (currentHash === state.lastExecutedHash) {
      // console.log('Content unchanged, skipping execution');
      return;
    }

    // Execute via orchestrator with full file content
    const loaf = new Loaf({ gitCommit: false });
    const orchResult = await loaf.execute(fullContent);

    // Debug logging
    if (state.debug) {
      console.log('\n=== DEBUG: Orchestrator Result ===');
      console.log('Executed actions:', orchResult.executedActions);
      console.log('Results:', orchResult.results?.length || 0);
      console.log('Parse errors:', orchResult.parseErrors?.length || 0);
      if (orchResult.parseErrors && orchResult.parseErrors.length > 0) {
        console.log('Raw parseErrors:', JSON.stringify(orchResult.parseErrors, null, 2));
      }

      // Add parse debug info if available
      if (orchResult.debug?.parseDebug) {
        const pd = orchResult.debug.parseDebug;
        console.log('\n--- Parse Debug ---');
        console.log('Input:', pd.rawInput);
        console.log('Parse result:', {
          blocks: pd.rawParseResult?.blocks?.length || 0,
          errors: pd.rawParseResult?.errors?.length || 0
        });
        if (pd.rawParseResult?.errors?.length > 0) {
          console.log('Nesl-js errors:', JSON.stringify(pd.rawParseResult.errors, null, 2));
        }
      }
      console.log('=== END DEBUG ===\n');
    }

    // Format outputs
    const timestamp = new Date();
    const summary = formatSummary(orchResult, timestamp);
    const fullOutput = await formatFullOutput(orchResult);

    // Copy to clipboard
    let clipboardSuccess = false;
    try {
      await clipboard.write(fullOutput);
      clipboardSuccess = true;
    } catch (error) {
      console.error('listener: Clipboard write failed:', error);
    }

    // Format clipboard status
    const clipboardStatus = formatClipboardStatus(clipboardSuccess, timestamp);

    // Write output file (without clipboard status)
    await writeFile(state.outputPath, fullOutput);

    // Prepend to input file with clipboard status
    const prepend = clipboardStatus + '\n' + summary;
    const updatedContent = prepend + '\n' + fullContent;
    await writeFile(filePath, updatedContent);

    // Update state
    state.lastExecutedHash = currentHash;

  } catch (error) {
    console.error('listener: Error processing file change:', error);
  } finally {
    state.isProcessing = false;
  }
}

export async function startListener(config: ListenerConfig): Promise<ListenerHandle> {
  // Validate config
  if (!config.filePath) {
    throw new Error('listener: filePath is required');
  }
  if (!config.filePath.startsWith('/')) {
    throw new Error('listener: filePath must be absolute');
  }
  if (config.debounceMs !== undefined && config.debounceMs < 100) {
    throw new Error('listener: debounceMs must be at least 100');
  }

  // Check file exists
  try {
    await access(config.filePath, constants.F_OK);
  } catch (error) {
    throw new ListenerError('FILE_NOT_FOUND', config.filePath);
  }

  // Check not already watching
  if (activeListeners.has(config.filePath)) {
    throw new ListenerError('ALREADY_WATCHING', config.filePath);
  }

  // Initialize state
  const state: ListenerState = {
    lastExecutedHash: '',
    isProcessing: false,
    outputPath: join(dirname(config.filePath), config.outputFilename || '.loaf-output-latest.txt'),
    debug: config.debug || false
  };

  // Set up debounced handler
  const debouncedProcess = debounce(
    () => {
      // console.log('Debounced process executing');
      processFileChange(config.filePath, state);
    },
    config.debounceMs || 500
  );

  // Start watching
  watchFile(config.filePath, { interval: 500 }, (curr: Stats, prev: Stats) => {
    if (curr.mtime !== prev.mtime) {
      // console.log('File change detected, triggering debounced process');
      debouncedProcess();
    }
  });

  // Process initial content
  debouncedProcess();

  // Create handle
  const handle: ListenerHandle = {
    id: generateId(),
    filePath: config.filePath,
    stop: async () => {
      unwatchFile(config.filePath);
      debouncedProcess.cancel();
      activeListeners.delete(config.filePath);
    }
  };

  // Track active listener
  activeListeners.set(config.filePath, handle);

  return handle;
}

export async function stopListener(handle: ListenerHandle): Promise<void> {
  await handle.stop();
}