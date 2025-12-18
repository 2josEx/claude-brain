---
description: Manage Claude's persistent memory stored in .claude/mind.mv2
argument-hint: [action] [query]
allowed-tools: Read, Bash
---

# Mind Command

Interact with Claude's persistent memory stored in `.claude/mind.mv2`.

**IMPORTANT: Use the SDK scripts (not CLI). The memory file is auto-created if it doesn't exist.**

## Actions

### stats (default)
```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/scripts/stats.js"
```

### search [query]
```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/scripts/find.js" "QUERY_HERE" 10
```

### ask [question]
```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/scripts/ask.js" "QUESTION_HERE"
```

### recent
```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/scripts/timeline.js" 20
```

## Usage Examples

```
/mind stats           → Shows memory statistics, auto-creates file if needed
/mind search auth     → Searches for "auth" in memories
/mind ask "Why React?" → Asks a question about memories
/mind recent          → Shows 20 most recent memories
```

## Response Format

When displaying results:
- Convert Unix timestamps to human-readable (Xm ago, Xh ago, Xd ago)
- Summarize key findings in a table when appropriate
- If file was just created, tell the user memories will appear as they work
