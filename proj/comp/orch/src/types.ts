import type { HooksConfig } from '../../hooks/src/index.js';

export interface LoafConfig {
  version: number;
  hooks?: HooksConfig;
  'fs-guard'?: FsGuardConfig;
  'exec-guard'?: ExecGuardConfig; // future
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