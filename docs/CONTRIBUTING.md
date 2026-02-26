# 🤝 Contributing to ELLAURA

Thank you for your interest in contributing to ELLAURA! This guide will help you get started.

---

## Getting Started

### 1. Fork & Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/your-username/ELLAURA.git
cd ELLAURA
```

### 2. Set Up Development Environment

Follow the [Quick Start Guide](QUICKSTART.md) to get the app running locally.

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

---

## Development Workflow

### Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/short-description` | `feature/recipe-sharing` |
| Bug Fix | `fix/short-description` | `fix/login-redirect` |
| Docs | `docs/short-description` | `docs/api-examples` |
| Refactor | `refactor/short-description` | `refactor/auth-middleware` |

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add recipe sharing feature
fix: resolve login redirect loop
docs: update API documentation
refactor: simplify auth middleware
style: format dashboard component
test: add unit tests for AI service
chore: update dependencies
```

---

## Project Structure

| Directory | Description | Language |
|-----------|-------------|----------|
| `client/` | React frontend | TypeScript |
| `server/` | Express API backend | TypeScript |
| `ml_model/` | ML model server | Python |
| `docs/` | Documentation | Markdown |

---

## Code Style

### TypeScript (Client & Server)
- Use **TypeScript** for all new code
- Follow existing patterns in the codebase
- Use `async/await` instead of callbacks
- Add proper type annotations

### Python (ML Model)
- Follow PEP 8 style guide
- Use type hints where possible
- Document functions with docstrings

---

## Pull Request Process

1. **Update documentation** if you changed any user-facing behavior
2. **Test your changes** locally
3. **Write a clear PR description** explaining what and why
4. **Link related issues** in the PR description
5. **Request review** from maintainers

### PR Description Template

```markdown
## What
Brief description of the change.

## Why
Why is this change needed?

## How
How does this change work?

## Testing
How was this tested?

## Screenshots (if UI change)
Before/after screenshots
```

---

## Reporting Bugs

Use [GitHub Issues](https://github.com/Md-javid/ELLAURA/issues) with the following format:

```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Screenshots**
If applicable.

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., 18.19]
```

---

## Feature Requests

Open a GitHub Issue with the `enhancement` label describing:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

---

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on the work, not the person
- Help others learn and grow

---

## Questions?

Open a [Discussion](https://github.com/Md-javid/ELLAURA/discussions) on GitHub or reach out to the maintainers.
