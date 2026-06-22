---
name: spec-kit
description: GitHub Spec Kit for Spec-Driven Development (SDD). Use when the user wants to plan, specify, architect, or structure a project before implementation. Guides development through Constitution (principles), Specify (requirements), Plan (technical strategy), and Implement (execution) phases. Provides templates for specs, plans, tasks, checklists, and constitutions. Prevents ad-hoc "vibe coding" by enforcing structured specifications.
---

# Spec Kit — Spec-Driven Development

## Overview

GitHub Spec Kit implements **Spec-Driven Development (SDD)** — a methodology that emphasizes creating clear specifications ("the what and why") before writing code ("the how"). This skill guides the agent through structured development phases to produce higher-quality, more maintainable software.

## Core Phases

### 1. Constitution (Principles)
Define the project's guiding principles, constraints, and non-negotiables before any code is written.

**Template:** See `templates/constitution-template.md`

Key sections:
- Project identity and purpose
- Technical constraints and preferences
- Quality standards and non-negotiables
- Communication and collaboration norms

### 2. Specify (Requirements)
Create detailed, unambiguous specifications that describe WHAT the system should do and WHY.

**Template:** See `templates/spec-template.md`

Key sections:
- Problem statement
- User stories and acceptance criteria
- Functional requirements
- Non-functional requirements (performance, security, accessibility)
- Edge cases and error handling

### 3. Plan (Technical Strategy)
Translate specifications into a concrete technical plan describing HOW to implement.

**Template:** See `templates/plan-template.md`

Key sections:
- Architecture decisions
- Technology choices with rationale
- Component breakdown
- Data models
- API contracts
- Migration strategy (if applicable)

### 4. Implement (Execution)
Execute the plan with task tracking and quality checklists.

**Templates:**
- `templates/tasks-template.md` — Task breakdown and tracking
- `templates/checklist-template.md` — Quality verification

## Workflow Rules

1. **Never skip phases.** Always start with a constitution or spec before jumping to code.
2. **Specs are living documents.** Update them as requirements evolve.
3. **Plans reference specs.** Every technical decision should trace back to a requirement.
4. **Tasks reference plans.** Every implementation task should trace back to a plan item.
5. **Checklists verify completeness.** Use checklists before marking work as done.

## When to Use This Skill

- Starting a new project or major feature
- Refactoring or redesigning existing systems
- When the user says "plan this", "spec this out", "architect this", or "let's think through this first"
- When requirements are unclear or ambiguous (use the Specify phase to clarify)
- When multiple implementation approaches exist (use the Plan phase to evaluate)

## Anti-Patterns to Avoid

- **Vibe coding**: Jumping straight to implementation without understanding requirements
- **Over-specification**: Writing specs so detailed they become code themselves
- **Spec drift**: Letting implementation diverge from specs without updating them
- **Premature optimization**: Planning for scale before validating the approach

## Output Format

When creating specs, plans, or other SDD artifacts:
1. Use the templates in the `templates/` directory as starting points
2. Adapt the template to the project's specific needs
3. Store artifacts in a `.specs/` directory at the project root
4. Name files descriptively: `feature-name.spec.md`, `feature-name.plan.md`
