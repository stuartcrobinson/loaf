need to update loaf.yaml config handling:

https://claude.ai/chat/50860d9f-c4eb-4b91-980c-522e89bdfc1c


> Your current design has fs-guard at the executor level, but executors are stateless.

> huh?



> and how are the configs currently getting passed around?  and what do you think is the correct way to do that  regardless of what we're doing now? it might be kind of a mess.  since that yaml file wasn't introduced until the most recent component we wrote, hooks.

---

Looking at the code:

## Current Config Flow

1. **hooks**: Config passed via constructor OR loaded from `loaf.yml`
2. **fs-ops/exec**: No config mechanism - they're pure executors
3. **orch**: Creates hooks with config, passes nothing to executors

## The "Stateless" Confusion

I was wrong - executors maintain no state between calls, but that's fine. They're functions, not services.

## Config Distribution Options

**Option 1: Executor Factory** (Current hooks pattern)
```typescript
const fsOps = new FsOpsExecutor({ guard: fsGuardConfig });
executors.set('file_read', (action) => fsOps.execute(action));
```

**Option 2: Context Parameter**
```typescript
executeFileOperation(action, { security: securityConfig })
```

**Option 3: Global Config Registry**
```typescript
// In orch
ConfigRegistry.set('fs-guard', config);
// In fs-ops
const config = ConfigRegistry.get('fs-guard');
```

## Recommendation

**Option 1** is cleanest - orch instantiates fs-guard, passes to fs-ops constructor. This matches the hooks pattern and keeps config flow explicit. The "mess" is that fs-ops/exec were designed before configuration needs existed.

The real question: Should fs-guard config live in `loaf.yml` alongside hooks? If yes, orch needs to parse and distribute all configs at startup.


> Should fs-guard config live in loaf.yml alongside hooks? If yes, orch needs to parse and distribute all configs at startup.

> yes, right?  seems like a mess to have multiple config files.  wdyt


Yes, single config file. Multiple files = configuration sprawl, discovery problems, sync issues.

## Config Structure in loaf.yml

```yaml
version: 1

hooks:
  before: []
  after: []

fs-guard:
  mode: allowlist  # or denylist
  allowed:
    - "./**"
    - "/tmp/loaf-**"
  denied: []
  followSymlinks: false

# Future sections:
# exec-guard:
#   languages: [python, javascript]
#   timeout: 30000
```

## Implementation Path

1. **Extend loaf.yml parsing** - orch already loads it for hooks
2. **Pass to executors at construction** - orch instantiates fs-ops with fs-guard config
3. **fs-guard as fs-ops dependency** - fs-ops constructor creates guard instance

## Critical Issue

Current orch dynamically imports executors on-demand. With config, needs upfront instantiation:

```typescript
// Current: lazy loading
if (!loadedExecutors[executor]) {
  const module = await executorModules[executor]();
}

// Needed: eager instantiation with config
const fsOps = new FsOpsExecutor({ 
  guard: config['fs-guard'] 
});
```

This breaks the lazy-loading pattern. Worth it for cleaner config flow.