import type { HooksConfig } from '../../hooks/src/index.js';

export interface LoafConfig {
  version: number;
  hooks?: HooksConfig;
  vars?: Record<string, string>;
  'fs-guard'?: FsGuardConfig;
  'exec-guard'?: ExecGuardConfig; // future
  'allowed-actions': string[];
}

export interface FsGuardConfig {
  allowed?: string[];
  denied?: string[];
  followSymlinks?: boolean;
}

export interface ExecGuardConfig {
  languages?: string[];
  timeout?: number;
}