import type { LoafConfig } from './types.js';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateConfig(config: any): ValidationResult {
  if (!config || typeof config !== 'object') {
    return {
      valid: false,
      error: 'Config must be an object'
    };
  }

  if (!config.version) {
    return {
      valid: false,
      error: 'Config missing version'
    };
  }

  if (typeof config.version !== 'number') {
    return {
      valid: false,
      error: 'Config version must be a number'
    };
  }

  // Validate hooks if present
  if (config.hooks) {
    if (typeof config.hooks !== 'object') {
      return {
        valid: false,
        error: 'hooks must be an object'
      };
    }

    if (config.hooks.before && !Array.isArray(config.hooks.before)) {
      return {
        valid: false,
        error: 'hooks.before must be an array'
      };
    }

    if (config.hooks.after && !Array.isArray(config.hooks.after)) {
      return {
        valid: false,
        error: 'hooks.after must be an array'
      };
    }
  }

  // Validate vars if present
  if (config.vars) {
    if (typeof config.vars !== 'object' || Array.isArray(config.vars)) {
      return {
        valid: false,
        error: 'vars must be an object'
      };
    }

    for (const [key, value] of Object.entries(config.vars)) {
      if (typeof value !== 'string') {
        return {
          valid: false,
          error: `var '${key}' must be a string`
        };
      }
    }
  }

  // Validate fs-guard if present
  if (config['fs-guard']) {
    const fsGuard = config['fs-guard'];
    if (typeof fsGuard !== 'object') {
      return {
        valid: false,
        error: 'fs-guard must be an object'
      };
    }

    if (fsGuard.allowed && !Array.isArray(fsGuard.allowed)) {
      return {
        valid: false,
        error: 'fs-guard.allowed must be an array'
      };
    }

    if (fsGuard.denied && !Array.isArray(fsGuard.denied)) {
      return {
        valid: false,
        error: 'fs-guard.denied must be an array'
      };
    }

    if (fsGuard.followSymlinks !== undefined && typeof fsGuard.followSymlinks !== 'boolean') {
      return {
        valid: false,
        error: 'fs-guard.followSymlinks must be a boolean'
      };
    }
  }

  return { valid: true };
}