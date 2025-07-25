# Migration Guide: v0.1 to v0.2

## Breaking Changes

### Loaf Constructor → Factory Method

The `Loaf` class constructor is now private. Use the async factory method instead:

**Before:**
```typescript
const loaf = new Loaf(config);
```

**After:**
```typescript
const loaf = await Loaf.create({
  repoPath: '/path/to/repo',
  enableHooks: true
});
```

### Configuration Loading

Configuration is now loaded automatically from `loaf.yml` in the repo root:

```typescript
// Automatically loads ./loaf.yml
const loaf = await Loaf.create();

// Or specify a different repo path
const loaf = await Loaf.create({ repoPath: '/custom/path' });
```

### Hooks Configuration

Hooks can be configured three ways:

1. In `loaf.yml` file (recommended)
2. Passed to `create()` method
3. Disabled entirely with `enableHooks: false`

## New Features

- Automatic configuration loading
- Built-in config validation
- Default fs-guard rules when no config exists
- Centralized configuration types