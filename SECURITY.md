# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within Flow TTS, please report it by:

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Send an email to the project maintainers with details of the vulnerability
3. Include steps to reproduce the issue if possible
4. Allow reasonable time for the issue to be addressed before public disclosure

### What to Include

- Type of vulnerability (e.g., injection, authentication bypass, etc.)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue and how an attacker might exploit it

### Response Timeline

- Initial response: Within 48 hours
- Status update: Within 7 days
- Resolution target: Within 30 days for critical issues

## Security Best Practices for Users

### Credential Management

- **Never** commit API credentials to version control
- Use environment variables or secure secret management systems
- Rotate credentials regularly
- Use the minimum necessary permissions for API credentials

### Example Secure Configuration

```python
# Python - Use environment variables
import os
from flow_tts import FlowTTS

client = FlowTTS(
    secret_id=os.environ["TX_SECRET_ID"],
    secret_key=os.environ["TX_SECRET_KEY"],
    sdk_app_id=os.environ["TRTC_SDK_APP_ID"]
)
```

```go
// Go - Use environment variables
client := flowtts.New(flowtts.Config{
    SecretID:  os.Getenv("TX_SECRET_ID"),
    SecretKey: os.Getenv("TX_SECRET_KEY"),
    SDKAppID:  os.Getenv("TRTC_SDK_APP_ID"),
})
```

## Security Scanning

This project uses:

- **Gitleaks**: Scans for secrets in commits
- **CodeQL**: Static analysis for security vulnerabilities
- **Dependabot**: Automated dependency updates

All PRs must pass security checks before merging.
