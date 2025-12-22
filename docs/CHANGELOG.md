# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-12-02

### 🔐 Security (FASE 1 - CRITICAL)

#### Fixed
- **CRITICAL**: Disabled public network access for PostgreSQL database
- **CRITICAL**: Disabled public network access for Azure Key Vault
- **CRITICAL**: Removed all hardcoded credentials from repository
- **CRITICAL**: Migrated GitHub Actions workflows to Azure Key Vault
- Reduced Service Principal privileges to minimum necessary roles
- Created secure credential migration script
- Added `.gitattributes` for enforcing LF line endings

#### Removed
- `scripts/auto-deploy-background.sh` (contained hardcoded credentials)
- `scripts/wait-for-services.sh` (contained hardcoded credentials)
- `scripts/deploy-local.ps1` (contained hardcoded credentials)

#### Added
- **Infrastructure**: Consolidation to Google Cloud Native.
- **Security**: Secret management via Environment Variables (production-first).
- `.env.example` template for local development
- `.gitignore` entries for credential files

#### Changed
- `docker-compose.yml`: Environment variables instead of hardcoded passwords
- `scripts/configure-secrets.sh`: Minimal privilege roles
- `scripts/check_creds.ps1`: Secure credential handling

#### Security Commits
- `0fd7761`: Infrastructure and scripts (80%)
- `0378442`: Key Vault migration for workflows (15%)
- `ef2e4d0`: Final verification and deploy.yml (5%)

### 🚀 CI/CD (FASE 2 - CRITICAL)

#### Added
- `.github/workflows/deploy-complete.yml`: Unified deployment with health checks
- Mandatory backend tests in production workflow
- Linting and type-checking in CI workflows
- Optimized deployment artifacts (~50% size reduction)
- Health check with retry logic (5 attempts, 10s interval)
- Automatic rollback on deployment failure
- GitHub issue creation on failed deployments

#### Changed
- `.github/workflows/main_econeura-backend-production.yml`: Tests mandatory, artifacts optimized
- `.github/workflows/backend.yml`: Added lint and type-check steps
- `.github/workflows/frontend.yml`: Added lint and type-check steps
- Changed `npm install` to `npm ci` for reproducible builds
- Artifact path optimized: only `/dist`, `package.json`, `package-lock.json`, `node_modules`

#### Fixed
- YAML linting errors across all workflow files
- Line ending issues in Windows development environment

#### CI/CD Commits
- `7efd818`: Enable mandatory backend tests
- `8bd1dfe`: Add linting to CI workflows
- `cc5f0cc`: Enforce LF line endings
- `801817d`: Optimize deployment artifacts
- `c83aa0c`: Complete deployment workflow with health checks

### 📚 Documentation

#### Added
- `docs/KEYVAULT-MIGRATION.md`: Complete Key Vault migration guide
- `fase1_walkthrough.md`: FASE 1 implementation walkthrough
- `fase1_autocritica.md`: Self-critique of initial implementation
- `fase1_final_evidence.md`: Evidence of 100% completion
- `fase2_walkthrough.md`: FASE 2 implementation walkthrough
- `fase2_checklist_100.md`: Strict checklist for FASE 2

#### Changed
- `docs/DEPLOYMENT.md`: Deprecated GitHub Secrets, referenced Key Vault
- `implementation_plan.md`: Updated status for FASE 1 and 2

---

## [1.0.1] - 2025-12-01

### Fixed
- Resolved all TypeScript errors in frontend (100% green type-check)
- Fixed critical JSON syntax error in `tsconfig.json`
- Fixed `NeuraChat` component logic and rendering issues
- Fixed `ConnectAgentModal` prop usage
- Fixed `CRMExecutiveDashboard` and `CRMPremiumPanel` unused variables

### Changed
- Updated `EconeuraCockpit` to use `React.ReactElement`
- Improved repository documentation and templates
- Cleaned up unused files (`EconeuraCockpit.OFFICIAL.tsx`)

## [Unreleased]

### Added
- Custom domain support for `econeura.com`
- Comprehensive `.gitignore` rules
- Professional repository cleanup

### Changed
- Consolidated documentation to `docs/` directory

---

## Migration Guide

### From v1.x to v2.0.0 (BREAKING CHANGES)

**Security Changes:**
### 🚨 Action Required
1. **Google Cloud Auth**: Ensure `gcp-key.json` is configured in local development if needed.
s

**CI/CD Changes:**
1. **Tests Mandatory**: Deployments will fail if tests don't pass
   - Ensure all tests pass locally before pushing
2. **Linting Required**: Code must pass ESLint and TypeScript checks
   - Run `npm run lint` and `npm run type-check` before committing
3. **Artifact Structure**: Deployment artifacts significantly smaller
   - No impact on developers, only affects CI/CD

### Breaking Changes Summary

- ❌ **No longer supported**: Direct public database access
- ❌ **No longer supported**: Hardcoded credentials anywhere
- ❌ **No longer supported**: Deploying without passing tests
- ✅ **Required**: Google Secret Manager configuration
- ✅ **Required**: All tests passing
- ✅ **Required**: Clean lint and type-check

---

## Version History

- **v2.0.0** (2025-12-02): Security and CI/CD complete overhaul
- **v1.0.1** (2025-12-01): TypeScript fixes and documentation
- **v1.0.0** (2024-XX-XX): Initial release

