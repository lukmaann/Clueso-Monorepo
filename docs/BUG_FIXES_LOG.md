# Bug Fixes & Error Log

This document tracks critical bugs encountered during development, their root causes, and the specific fixes implemented. It serves as a knowledge base for future troubleshooting.

## [2025-12-17] Video Zoom Glitch & Audio Clipping

### 3. Video Zoom Flicker & Audio Cut-off
**Severity**: High (User Experience degraded)
**Issue**: 
1. **Zoom Flicker**: The "zoom" effect was applying/un-applying rapidly because the video playback time `t` would drift in and out of the calculated `zoomInMs` - `zoomOutMs` window within a single step.
2. **Audio Clipping**: The video would advance to the next step based on the recorded timestamp events. If the AI-generated voiceover was longer than the recorded user action, the audio was abruptly cut off when the step changed.

**Resolution / Fix**:
- **Action**: 
    - **Removed Zoom**: Completely removed the unstable zoom effect logic from the player.
    - **Implemented Sync Lock**: Added a `isWaitingForAudioRef` lock. The player checks if the video is within `200ms` of the step end; if `audio.ended` is false, it pauses the video. An `audio.onended` listener resumes the video.
- **File Modified**: [`apps/frontend/src/features/recordings/RecordingDetail.tsx`](../apps/frontend/src/features/recordings/RecordingDetail.tsx)
- **Code Change**:
  ```typescript
  // Synchronized Audio-Video Playback
  if (timeRemainingInStep < 200 && !currentAiAudioRef.current.ended) {
      isWaitingForAudioRef.current = true;
      videoRef.current.pause(); // Wait for audio
  }
  
  audio.onended = () => {
      if (isWaitingForAudioRef.current) {
          isWaitingForAudioRef.current = false;
          videoRef.current.play(); // Resume
      }
  };
  ```

## [2025-12-17] Gemini API 404 & Port Instability

### 1. Gemini Model Access Error (404 Not Found)
**Severity**: Critical (AI Service Down)  
**Error Log**:
```
Error: [GoogleGenerativeAI Error]: Error fetching from .../models/gemini-1.5-flash:generateContent: 
[404 Not Found] models/gemini-1.5-flash is not found for API version v1beta...
```
**Root Cause**: 
The previously used model `gemini-1.5-flash` was either deprecated, temporarily unavailable, or the provided API key lacked specific permissions for that model version, triggering a generic 404.

**Resolution / Fix**:
- **Action**: Upgraded the model version to the newer `gemini-2.5-flash`.
- **File Modified**: [`apps/backend/src/services/gemini.service.js`](../apps/backend/src/services/gemini.service.js)
- **Code Change**:
  ```javascript
  // apps/backend/src/services/gemini.service.js
  // BEFORE
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", ... });
  
  // AFTER
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", ... });
  ```

### 2. Application Port Conflicts
**Severity**: Moderate (DX / Startup Stability)
**Issue**: 
The frontend and backend would occasionally fail to bind to ports `3000` and `3001` if they were zombie processes or occupied, defaulting to random ports (e.g., 5173), which broke the CORS and Proxy configurations.

**Resolution / Fix**:
- **Action**: Enforced `strictPort: true` on Frontend and explicit port handling on Backend.
- **Files Modified**: 
  - [`apps/frontend/vite.config.ts`](../apps/frontend/vite.config.ts)
  - [`apps/backend/src/server.js`](../apps/backend/src/server.js)
- **Code Change**:
  ```typescript
  // apps/frontend/vite.config.ts
  server: {
    port: 3000,
    strictPort: true, // Forces failure instead of random port
    host: '0.0.0.0',
  }
  ```
