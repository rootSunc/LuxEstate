# Security Policy

## Supported versions

Security fixes are accepted for the current `main` branch.

## Reporting a vulnerability

Please do not open a public issue for suspected vulnerabilities. Instead, email
the maintainers or use GitHub private vulnerability reporting if it is enabled
for the repository.

Include:

- Affected endpoint, component, or workflow.
- Steps to reproduce.
- Expected impact.
- Any relevant logs, payloads, or screenshots.

## Security posture

LuxEstate uses HTTP-only JWT cookies, validates listing input on the API, checks
uploaded image MIME types and binary signatures, and runs dependency audits in
CI. Local uploads are suitable for demos and single-node deployments; production
deployments should use object storage with ownership tracking.
