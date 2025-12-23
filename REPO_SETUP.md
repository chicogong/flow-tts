# Repository Setup Guide

This document contains commands to configure the repository for professional open-source standards.

## 1. Repository Settings (via gh CLI)

```bash
# Login to GitHub CLI (if not already)
gh auth login

# Set repository description, homepage, and topics
gh repo edit chicogong/flow-tts \
  --description "OpenAI-style TTS SDK for Tencent Cloud - simple, elegant, multi-language" \
  --add-topic tts \
  --add-topic text-to-speech \
  --add-topic sdk \
  --add-topic tencent-cloud \
  --add-topic openai \
  --add-topic python \
  --add-topic golang \
  --add-topic typescript \
  --add-topic java

# Configure repository features and merge settings
gh repo edit chicogong/flow-tts \
  --enable-issues=true \
  --enable-discussions=true \
  --enable-wiki=false \
  --enable-projects=false \
  --delete-branch-on-merge=true \
  --enable-squash-merge=true \
  --enable-rebase-merge=false \
  --enable-merge-commit=false
```

## 2. Enable GitHub Security Features (Manual in Settings)

Go to: **Settings > Code security and analysis**

1. **Dependency graph**: Enable
2. **Dependabot alerts**: Enable
3. **Dependabot security updates**: Enable
4. **Secret scanning**: Enable alerts
5. **Push protection**: Enable (if available)
6. **CodeQL analysis**: Will run automatically via workflow

## 3. Branch Protection Rules

Go to: **Settings > Branches > Add rule**

For branch `master` (or `main`):

- [x] Require a pull request before merging
- [x] Require status checks to pass before merging
  - Required checks:
    - `build` (from go-ci.yml)
    - `build` (from python-ci.yml)
    - `build` (from java-ci.yml)
    - `build` (from node-ci.yml)
    - `gitleaks` (from security-scan.yml)
- [x] Require branches to be up to date before merging
- [ ] Require signed commits (optional)
- [x] Do not allow bypassing the above settings

## 4. Files Added/Modified

### New Files
- `.editorconfig` - Consistent coding styles across editors
- `.github/workflows/security-scan.yml` - Gitleaks secret scanning
- `.github/workflows/codeql.yml` - CodeQL security analysis
- `SECURITY.md` - Security policy and vulnerability reporting
- `packages/go/.golangci.yml` - Go linting configuration

### Modified Files
- `.github/dependabot.yml` - Added Maven support and commit prefixes
- `.github/workflows/go-ci.yml` - Added golangci-lint step
- `packages/python/pyproject.toml` - Added ruff configuration
- `packages/node/.eslintrc.json` - Enhanced ESLint configuration

## 5. CI/CD Workflows Summary

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `python-ci.yml` | PR/Push to packages/python | Python lint, test, build |
| `go-ci.yml` | PR/Push to packages/go | Go lint, test, build |
| `java-ci.yml` | PR/Push to packages/java | Java lint, test, build |
| `node-ci.yml` | PR/Push to packages/node | Node lint, test, build |
| `security-scan.yml` | PR/Push + Weekly | Gitleaks secret scanning |
| `codeql.yml` | PR/Push + Weekly | CodeQL security analysis |
| `publish-pypi.yml` | Release tag | Publish to PyPI |
| `publish-npm.yml` | Release tag | Publish to npm |

## 6. Required Status Checks for PRs

All these checks must pass before merging:
- Go CI (multi-version: 1.20, 1.21, 1.22)
- Python CI (multi-version: 3.8-3.12)
- Java CI (multi-version: 11, 17, 21)
- Node CI (multi-version: 18, 20, 22)
- Gitleaks Secret Scan
- CodeQL Analysis (Python, JavaScript/TypeScript, Go, Java)
