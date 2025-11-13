# Project Workflow Configuration

This document configures Claude Code's intelligent assistants and automated workflows for this project. These workflows enhance development velocity while maintaining rigorous quality standards through AI-assisted reviews.

## Overview

This project uses three specialized review workflows:

1. **Code Review Workflow** - Pragmatic code quality reviews
2. **Security Review Workflow** - Vulnerability and security analysis
3. **Design Review Workflow** - UI/UX validation and accessibility testing

Each workflow is implemented as Claude Code subagents and slash commands for both on-demand and automated usage.

---

## ⚠️ MANDATORY COMPLIANCE INSTRUCTIONS

**READ THESE RULES BEFORE PROCEEDING WITH ANY TASK**

### STEP 1: READ REQUIREMENTS

When beginning any task:
1. **Read the full requirements** in this `claude.md` and project context
2. **Use sequential thinking** to process information step-by-step
3. **Do NOT proceed** until you understand the architecture and constraints

### CONFIRMATION REQUIREMENT

Before proposing ANY changes, you MUST respond with:
> **COMPLIANCE CONFIRMADO**: Vou priorizar a reutilização em vez da criação

This confirms you understand:
- ✅ This is a code reuse and consolidation project
- ✅ Creating new files requires exhaustive justification
- ✅ Every suggestion must reference existing code
- ✅ Violations of these rules invalidate your response

---

### MANDATORY PROCESS (Non-Negotiable)

Follow this process for ANY implementation request:

1. **COMPLIANCE CONFIRMATION**
   - Start with "COMPLIANCE CONFIRMADO: Vou priorizar a reutilização em vez da criação"
   - Acknowledge you understand the architectural constraints

2. **ANALYZE EXISTING CODE FIRST**
   - Search for related files and patterns BEFORE suggesting new ones
   - Document what exists: services, components, utilities, types
   - Identify reusable patterns and abstractions

3. **REFERENCE SPECIFIC FILES**
   - Include exact file paths and line numbers in your analysis
   - Example: "See `.claude/subagents/pragmatic-code-review.md:42` for pattern reference"
   - Never generalize - always reference concrete code

4. **VALIDATION CHECKPOINTS**
   - Include validation checkpoints throughout your response
   - Ask clarifying questions if architectural decisions are ambiguous
   - Document trade-offs and why existing patterns can't be reused

5. **FINAL COMPLIANCE VERIFICATION**
   - End with compliance confirmation
   - Document that every suggestion extends existing architecture
   - Prove you worked within existing patterns

---

### ABSOLUTE RULES (Violating ANY of these invalidates your response)

❌ **DO NOT** create new files without exhaustive analysis of existing files
- Every file creation must justify why existing files cannot be extended

❌ **DO NOT** rewrite code when refactoring is possible
- Document why the existing code structure fundamentally cannot be improved

❌ **DO NOT** provide generic advice without specific implementation details
- Every suggestion must reference concrete file paths and patterns

❌ **DO NOT** ignore the existing codebase architecture
- Understand system boundaries, module patterns, and design patterns first

---

### WHAT YOU MUST DO

✅ **Extend existing services and components**
- Add new functionality to existing modules rather than duplicating them
- Reference: `.claude/subagents/` for extension patterns

✅ **Consolidate duplicated code**
- Identify and refactor repeated patterns into reusable abstractions
- Use existing utility patterns

✅ **Reference specific file paths**
- Examples: `".claude/commands/review.md:15"`, `".claude/context/design-principles.md:45"`
- Never say "somewhere in the codebase" - be precise

✅ **Provide migration strategies**
- If consolidating code, explain how to refactor existing instances
- Include before/after examples with file references

---

### HISTORICAL CONTEXT

**Important**: The previous developer was terminated for ignoring existing code and creating duplicates. You must prove you can work within the existing architecture by:

1. Demonstrating thorough analysis of existing code
2. Extending patterns rather than creating new ones
3. Consolidating duplicates
4. Providing specific, referenceable guidance

---

## MANDATORY ANALYSIS STEPS

### 📋 STEP 1: READ REQUIREMENTS
- Read this entire `claude.md` document
- Understand the three workflows and their purposes
- Review the existing architecture in `.claude/`
- **THEN** confirm: **COMPLIANCE CONFIRMADO: Vou priorizar a reutilização em vez da criação**

### 🔍 STEP 2: ANALYZE CURRENT SYSTEM
- Examine relevant existing files
- Identify reusable patterns and components
- Document file paths and line numbers
- Note architecture constraints

### 🎯 STEP 3: CREATE IMPLEMENTATION PLAN
- Based on Step 2 analysis, create a detailed plan
- Reference specific files that will be extended
- Identify where new files are genuinely needed (with justification)
- Include validation checkpoints

### 🔧 STEP 4: PROVIDE TECHNICAL DETAILS
- Create specific code changes with file references
- Document integration points with existing code
- Include migration strategy if refactoring existing code
- Provide concrete examples

### ✅ STEP 5: FINALIZE IMPLEMENTATION
- Complete testing strategy
- Document deployment considerations
- Provide final compliance confirmation
- Ensure every suggestion references the existing architecture

---

### LEMBRETE FINAL (Final Reminder)

**If you suggest creating new files**: Explain why the files in `.claude/` or existing codebase cannot be extended.

**If you recommend rewrites**: Justify why refactoring the existing code won't work.

**If you provide generic advice**: You have violated these rules - every suggestion must be specific with file paths.

Working within existing architecture is not a preference - it's a requirement. Prove it with every response.

---

## Code Review Workflow

### Purpose
Automated code review that balances engineering excellence with development velocity. Provides comprehensive feedback on architecture, functionality, security, maintainability, testing, performance, and dependencies.

### When to Use
- After implementing a feature
- Before merging pull requests
- When you want a second opinion on design decisions
- To catch potential issues before human review

### Quick Start

Use the slash command:
```
/review
```

Or invoke the subagent directly in your message:
```
I've implemented the user authentication system. Please review the changes using @agent-pragmatic-code-review.
```

### Review Framework: Pragmatic Quality

The code review agent uses a "Pragmatic Quality" framework that prioritizes:

1. **Net Positive over Perfection** - If a change improves overall code health, it's good
2. **Substance over Style** - Architecture, design, and business logic take precedence
3. **Grounded Principles** - Feedback is based on SOLID, DRY, KISS, YAGNI principles
4. **Clear Communication** - Minor suggestions are prefixed with "Nit:"

### Review Categories (Prioritized)

1. **Architectural Design & Integrity** (Critical)
   - System boundaries and modularity
   - Single Responsibility Principle adherence
   - Unnecessary complexity detection
   - Atomic, cohesive changes

2. **Functionality & Correctness** (Critical)
   - Business logic implementation
   - Edge case and error handling
   - Race conditions and concurrency
   - State management correctness

3. **Security** (Non-Negotiable)
   - Input validation and sanitization
   - Authentication and authorization
   - Secrets management
   - Data exposure prevention

4. **Maintainability & Readability** (High Priority)
   - Code clarity for future developers
   - Naming conventions
   - Control flow complexity
   - Comment quality ("why" not "what")

5. **Testing Strategy & Robustness** (High Priority)
   - Test coverage appropriateness
   - Failure mode coverage
   - Test maintainability

6. **Performance & Scalability** (Important)
   - N+1 query detection
   - Algorithm efficiency
   - Bundle size impact
   - Memory leak prevention

7. **Dependencies & Documentation** (Important)
   - New dependency necessity
   - Dependency security and maintenance
   - API documentation updates

### Example Output

```markdown
### Code Review Summary
The authentication implementation improves codebase health through clear separation of concerns. Structure is solid.

### Findings

#### Critical Issues
- `auth.service.ts:45`: User input from password field is not validated before hashing. Add validation before line 50.

#### Suggested Improvements
- `auth.controller.ts:12`: Token expiration could be configurable. Consider moving hardcoded TTL to environment config.

#### Nitpicks
- Nit: `auth.types.ts:8`: Interface name `IAuth` uses deprecated I prefix. Align with project convention.
```

---

## Security Review Workflow

### Purpose
Focused security review that identifies HIGH-CONFIDENCE vulnerabilities and potential attack vectors. Uses a strict false-positive minimization approach.

### When to Use
- Before merging sensitive code (auth, payments, data handling)
- When handling user input or external data
- Before deploying to production
- When working with cryptography or secrets

### Quick Start

Use the slash command:
```
/security-review
```

Or invoke directly:
```
I've added an API endpoint for user data export. Please review for security vulnerabilities using @agent-security-review.
```

### Security Focus Areas

**Input Validation Vulnerabilities:**
- SQL injection, command injection, XXE injection
- Template injection, NoSQL injection, path traversal

**Authentication & Authorization:**
- Authentication bypass, privilege escalation
- Session flaws, JWT vulnerabilities

**Crypto & Secrets:**
- Hardcoded secrets, weak crypto algorithms
- Improper key management

**Code Execution:**
- Remote code execution, deserialization attacks
- XSS, eval injection

**Data Exposure:**
- Sensitive data logging, PII violations
- API endpoint leakage, debug information exposure

### Confidence Threshold

Only reports vulnerabilities with >80% confidence:
- **HIGH**: RCE, data breach, authentication bypass
- **MEDIUM**: Significant impact with specific conditions
- **LOW**: Defense-in-depth issues

### False Positive Minimization

Automatically excludes:
- DoS vulnerabilities
- Rate limiting concerns
- Secrets stored on disk (handled separately)
- Theoretical or low-impact findings
- Issues in test files

### Example Output

```markdown
# Vuln 1: SQL Injection: `api.ts:156`

* Severity: HIGH
* Description: User email parameter is directly concatenated into SQL query without parameterized queries
* Exploit Scenario: Attacker sends `' OR '1'='1` in email field to bypass authentication
* Recommendation: Use parameterized queries or prepared statements with bound parameters

# Vuln 2: Hardcoded API Key: `config.ts:42`

* Severity: HIGH
* Description: AWS secret key is hardcoded in source file
* Exploit Scenario: Attacker with repository access can use credentials to access AWS resources
* Recommendation: Move to environment variables with .env configuration
```

---

## Design Review Workflow

### Purpose
Comprehensive design review of UI/UX changes with automated testing using Playwright. Validates visual consistency, accessibility compliance, and responsiveness across devices.

### When to Use
- After implementing UI components
- Before finalizing design-heavy PRs
- To verify accessibility compliance
- To test responsive behavior across devices

### Quick Start

Use the slash command:
```
/design-review
```

Or invoke directly:
```
I've redesigned the user dashboard. Please review the design changes using @agent-design-review.
```

### Review Methodology: Live Environment First

The design review agent prioritizes actual user experience:

1. **Interactive Assessment** - Tests the live UI before analyzing code
2. **Responsiveness** - Tests mobile (375px), tablet (768px), desktop (1440px)
3. **Accessibility** - WCAG 2.1 AA compliance including keyboard navigation
4. **Visual Polish** - Alignment, spacing, typography, color consistency
5. **Robustness** - Form validation, edge cases, error states
6. **Content Quality** - Grammar, clarity, console errors

### Design Review Phases

**Phase 0: Preparation**
- Understand the changes and motivation
- Review code diff scope

**Phase 1: Interaction and User Flow**
- Test primary user flows
- Verify interactive states (hover, active, disabled)
- Check destructive action confirmations

**Phase 2: Responsiveness Testing**
- Desktop viewport (1440px) with screenshot
- Tablet viewport (768px) layout verification
- Mobile viewport (375px) with touch optimization

**Phase 3: Visual Polish**
- Layout alignment and spacing consistency
- Typography hierarchy and legibility
- Color palette and image quality

**Phase 4: Accessibility (WCAG 2.1 AA)**
- Keyboard navigation (Tab order)
- Visible focus states
- Color contrast ratios (4.5:1 minimum)
- Semantic HTML usage
- Form labels and associations
- Image alt text

**Phase 5: Robustness Testing**
- Form validation with invalid inputs
- Content overflow scenarios
- Loading, empty, and error states

**Phase 6: Code Health**
- Component reuse vs duplication
- Design token usage
- Pattern adherence

### Triage Categories

- **[Blocker]**: Critical failures requiring immediate fix
- **[High-Priority]**: Significant issues to fix before merge
- **[Medium-Priority]**: Improvements for follow-up
- **[Nitpick]**: Minor details (prefix with "Nit:")

### Design Principles Reference

The design review agent consults `.claude/context/design-principles.md` for:
- Brand guidelines and design system
- Typography and spacing standards
- Color palette and accessibility requirements
- Component standards and patterns
- Dark mode implementation
- Animation and motion guidelines

Update this file with your specific design system.

### Example Output

```markdown
### Design Review Summary
The dashboard redesign significantly improves information hierarchy and user guidance. Layout is clean and responsive.

### Findings

#### Blockers
- The submit button is only 32x32px on mobile - below the 44x44px minimum for touch targets. Increase padding.

#### High-Priority
- Color contrast on the "Learn More" link (gray on light gray) is 3.2:1. Increase to 4.5:1 minimum.
- Tab navigation gets stuck after the search input - keyboard user would be unable to access the filter button.

#### Medium-Priority
- Loading state animation should respect `prefers-reduced-motion` preference.
- Empty state message could be more specific about why there are no results.

#### Nitpicks
- Nit: Primary button shadow doesn't align with other buttons in the interface - should use consistent elevation system.
```

---

## Integration with Development Workflow

### Automated Reviews (GitHub Actions)

These workflows can be integrated with GitHub Actions for automated PR reviews:
- Code reviews on every PR
- Security scans on sensitive changes
- Design reviews on front-end PRs

See repository GitHub Actions configuration for setup.

### Manual/On-Demand Reviews

Use slash commands during development:
```
/review              # Code review of current branch
/security-review     # Security analysis of current branch
/design-review       # Design review of current branch (UI changes only)
```

### Subagent Invocation

Invoke agents directly in messages:
```
Please review this authentication implementation with @agent-pragmatic-code-review

I'm concerned about security in this API endpoint - analyze with @agent-security-review

Can you review the new dashboard UI with @agent-design-review
```

---

## Configuration Reference

### Slash Commands
Located in `.claude/commands/`:
- `review.md` - Code review command
- `security-review.md` - Security review command
- `design-review.md` - Design review command

### Subagents
Located in `.claude/subagents/`:
- `pragmatic-code-review.md` - Code review agent (uses Opus model)
- `security-review.md` - Security review agent (uses Opus model)
- `design-review.md` - Design review agent (uses Sonnet model with Playwright)

### Context Files
Located in `.claude/context/`:
- `design-principles.md` - Design standards and guidelines (customize this)

---

## Best Practices

### For Code Reviews

1. **Run after completing features** - Get feedback while context is fresh
2. **Include context** - Explain what the change accomplishes
3. **Iterate on feedback** - Use suggestions to improve code quality
4. **Don't block on nits** - Minor suggestions can be addressed in follow-ups

### For Security Reviews

1. **Use before sensitive changes** - Auth, payments, data handling
2. **Keep code changes focused** - Narrow scope makes review more accurate
3. **Address high/medium findings** - These are real risks
4. **Document decisions** - If skipping a suggestion, document why

### For Design Reviews

1. **Run after UI implementation** - Not during planning
2. **Ensure preview is working** - Agent needs live environment to test
3. **Provide context** - Explain design goals and constraints
4. **Use with design system** - Update design-principles.md for consistency

---

## Customization Guide

### Updating Design Principles

Edit `.claude/context/design-principles.md` to include:
- Your brand guidelines
- Specific color palette
- Typography standards
- Component library patterns
- Accessibility requirements
- Dark mode specifications

### Modifying Review Criteria

Each subagent can be customized by editing files in `.claude/subagents/`:

1. **Update priorities** - Change review focus areas
2. **Adjust rigor** - Make reviews stricter or more lenient
3. **Add domain-specific checks** - Industry-specific security concerns
4. **Change model** - Use Haiku for faster reviews, Opus for deeper analysis

### Adding Custom Review Workflows

Create new subagent files following the same structure:

```markdown
---
name: my-custom-review
description: What this review checks
tools: [list of tools]
model: opus
color: blue
---

[Your custom review prompt here]
```

Then create a slash command in `.claude/commands/my-review.md` to invoke it.

---

## Resources & References

- **Code Review Repository**: https://github.com/anthropics/claude-code-action
- **Security Review Repository**: https://github.com/anthropics/claude-code-security-review
- **Claude Code Docs**: https://docs.claude.com/en/docs/claude-code
- **WCAG 2.1 Accessibility Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/

---

## Support & Feedback

For issues or suggestions:
- Report bugs at: https://github.com/anthropics/claude-code/issues
- Share feedback: Use the feedback command in Claude Code

---

**Last Updated**: 2024
**Maintained by**: Development Team
