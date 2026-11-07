# SpaceInvadersJS Documentation Manifesto

## Why this exists
Documentation should be easy to find, hard to duplicate, and safe to maintain over time.

## Principles
- Single source of truth: each concern has one canonical file.
- Predictable locations: planning, handoff, and agent context stay in fixed folders.
- Backward compatibility: root compatibility files may exist when tools expect legacy paths.
- Low-friction updates: docs changes should happen in the same PR as architecture/workflow changes.

## Canonical map
- Agent context: `.codex/context/AGENTS.md`
- Codex context: `.codex/context/CODEX.md`
- Session handoff: `docs/handoff/SESSION_HANDOFF.md`
- Roadmap: `docs/planning/ROADMAP.md`
- Docs index: `docs/README.md`

## Root policy
- Keep root focused on runtime and package entrypoints.
- Allow only lightweight compatibility docs in root when required by tools.

## Maintenance checklist
1. If a document is moved, update all references in the same commit.
2. If architecture changes, update session handoff.
3. If priorities change, update roadmap.
4. If folder structure changes, update this manifesto and `docs/README.md`.
