import type { HooksConfig, ValidationResult } from './types.js';

/**
 * Validates a parsed config object has correct structure
 * Checks hooks is object, before/after are arrays, commands are objects
 * vars is object with string values
 */
export function validateConfig(config: any): ValidationResult {
  // Empty config is valid
  if (!config || typeof config !== 'object') {
    return {
      valid: false,
      error: 'Config must be an object'
    };
  }

  // Check hooks if present
  if ('hooks' in config && config.hooks !== undefined) {
    if (typeof config.hooks !== 'object' || config.hooks === null) {
      return {
        valid: false,
        error: 'hooks must be an object'
      };
    }

    // Check before hooks
    if ('before' in config.hooks && config.hooks.before !== undefined) {
      if (!Array.isArray(config.hooks.before)) {
        return {
          valid: false,
          error: 'hooks.before must be an array'
        };
      }

      // Check each before command
      for (const cmd of config.hooks.before) {
        if (typeof cmd !== 'object' || cmd === null) {
          return {
            valid: false,
            error: 'hook commands must be objects'
          };
        }
      }
    }

    // Check after hooks
    if ('after' in config.hooks && config.hooks.after !== undefined) {
      if (!Array.isArray(config.hooks.after)) {
        return {
          valid: false,
          error: 'hooks.after must be an array'
        };
      }

      // Check each after command
      for (const cmd of config.hooks.after) {
        if (typeof cmd !== 'object' || cmd === null) {
          return {
            valid: false,
            error: 'hook commands must be objects'
          };
        }
      }
    }
  }

  // Check vars if present
  if ('vars' in config && config.vars !== undefined) {
    if (typeof config.vars !== 'object' || config.vars === null || Array.isArray(config.vars)) {
      return {
        valid: false,
        error: 'vars must be an object'
      };
    }

    // Check all var values are strings
    for (const value of Object.values(config.vars)) {
      if (typeof value !== 'string') {
        return {
          valid: false,
          error: 'var values must be strings'
        };
      }
    }
  }

  return { valid: true };
}