# Hooks Component

## Purpose (60 words)
Execute user-defined shell commands before and after NESL block execution. Enables VCS integration through configurable lifecycle hooks with variable interpolation, timeout control, and error handling. Loads configuration from loaf.yml files.

## Overview (300 words)
The hooks component provides lifecycle management for loaf operations, allowing users to define shell commands that run before and after NESL execution. This enables seamless version control integration without hardcoding VCS-specific logic into loaf itself.

Key features:
- Before/after hook execution with configurable commands
- Variable interpolation performed before shell execution for security
- Per-command timeout and error handling options
- YAML configuration loading from project and user directories
- Shell command escaping for safety

The component executes commands sequentially, failing fast on errors unless explicitly configured to continue. Variables are interpolated before passing to the shell, preventing injection attacks. Commands execute in the repository root by default with optional cwd override.

## Requirements (EARS format)
- The system SHALL execute before hooks prior to NESL execution
- The system SHALL execute after hooks following NESL execution
- The system SHALL interpolate variables before shell execution
- The system SHALL fail fast on command errors unless continueOnError is set
- The system SHALL respect per-command timeout values
- The system SHALL load configuration from loaf.yml if present