# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-12-17
### Fixed
- **Critical AI Failure**: Resolved `404 Not Found` from Gemini API by upgrading model to `gemini-2.5-flash`. See [BUG_FIXES_LOG.md#1-gemini-model-access-error-404-not-found](docs/BUG_FIXES_LOG.md).
- **Port Stability**: Fixed random port binding issues by enforcing strict ports (`3000` for FE, `3001` for BE). See [BUG_FIXES_LOG.md#2-application-port-conflicts](docs/BUG_FIXES_LOG.md).

### Infrastructure
- **Documentation**: Added `docs/BUG_FIXES_LOG.md` to track error details and solutions.
- **Cleanup**: Removed sensitive/temporary debug files (`debug_gemini.js`, `alllogs.log`).

## [0.1.0] - 2025-12-16
### Added
- **Security**:
    - Hardened `.gitignore` to recursively exclude **all** environment files (`.env`, `.env.local`, `.env.production`) from every subdirectory (`apps/*/`).
    - Removed sensitive artifact files (`metadata.json`, `found_models.json`) and temporary debug scripts (`debug_keys.js`, `test_tts.js`) to prevent key leakage.

### Architecture & Codebase Cleanup
- **Organization**:
    - Removed empty directory clutter (`src/utils`, `src/components/ui`) to maintain a clean workspace.
    - Deleted redundant reference files (`ARCHITECTURE_REFERENCE.md`) in favor of the new canonical documentation.
- **Backend Service**:
    - Implemented `ProductAI` singleton in `src/services/ai.service.js`.
    - Integrated **Deepgram Nova-2** for high-speed Speech-to-Text.
    - Integrated **Deepgram Aura** for conversational Text-to-Speech generation.
    - Integrated **Google Gemini Flash 1.5** for intelligent "Event + Transcript" fusion to generate structured JSON guides.
- **Extension**:
    - Implemented a Chrome MVP extension capable of recording screen `.webm` blobs.
    - Implemented `content.js` to capture DOM `click` events with coordinates (x,y) and timestamps.
    - Built the `Multipart/Form-Data` upload strategy to send massive video files to the backend.

---
## [0.1.0] - 2025-12-16

### Initialized
- Project generated with TurboRepo structure.
- **Frontend**: Vite + React + Lucide Icons.
- **Backend**: Express + Multer (Uploads) + CORS.
- **Extension**: Manifest V3 + Scripting API.
