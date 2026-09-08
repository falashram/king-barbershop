<!-- Superpowers Bootstrap for Antigravity & Gemini -->
# Superpowers Rules

When starting any conversation or working on tasks:

## The Rule
Invoke relevant or requested skills BEFORE any response or action — including clarifying questions, exploring the codebase, or checking files.

- **Creative work / features / new components**: Use `.agents/skills/brainstorming/SKILL.md` first to explore requirements and design before implementation.
- **Bugs / issues / unexpected behavior**: Use `.agents/skills/systematic-debugging/SKILL.md` before attempting any fix.
- **Writing tests & code**: Follow `.agents/skills/test-driven-development/SKILL.md`.
- **Planning & Execution**: Follow `.agents/skills/writing-plans/SKILL.md` and `.agents/skills/executing-plans/SKILL.md`.
- **Subagents**: Use `.agents/skills/subagent-driven-development/SKILL.md` with `invoke_subagent`.
- **Verification**: Follow `.agents/skills/verification-before-completion/SKILL.md` before finishing.

## Antigravity Tool Mapping
- Subagents: Use `invoke_subagent` (`self` or `research`).
- Task tracking: Maintain task artifacts with `write_to_file` and update with `replace_file_content`.
