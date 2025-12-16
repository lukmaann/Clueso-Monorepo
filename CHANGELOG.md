# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Documentation & Compliance
- **Architecture**:
    - Created `ARCHITECTURE.md` establishing the **Modular Monolith** pattern.
    - Defined "Separation of Concerns" (SoC) strategy: `apps/frontend` (Consumer), `apps/backend` (Orchestrator), `apps/extension` (Source).
    - detailed the technology reasoning: Why **Deepgram** (Speed/Cost) vs ElevenLabs, and Why **Gemini Flash** (Context window) vs GPT-4.
    - Outlined scaling roadmap: Local Disk -> S3, In-Memory -> Postgres, Sync -> Redis Queues.
- **Deep-Dive Layer Docs**:
    - `docs/FRONTEND_LAYER.md`: Documented the "Step Sync" logic (synchronizing video timestamps with sidebar steps).
    - `docs/BACKEND_LAYER.md`: Documented the `ai.service.js` integration, Deepgram API payloads, and Gemini prompting strategy.
    - `docs/EXTENSION_LAYER.md`: Documented the `content.js` listener logic and `background.js` upload lifecycle.
    - `docs/DATA_FLOW.md`: Created detailed Sequence Diagrams and JSON Schema inputs/outputs for every API call.
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
