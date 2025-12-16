# Extension Documentation (Layer: Source)

## Overview
The Chrome Extension is the "Eyes and Ears" of the system. It lives in the user's browser and captures raw data using native Web APIs.

## Core Components (Manifest V3)

### 1. `manifest.json`
*   **Permissions**: `activeTab`, `scripting`, `offscreen` (for audio recording).
*   **Host Permissions**: `http://localhost:3001/*` (to allow uploading).

### 2. `content.js` (The Spy)
Injected into the page being recorded. It listens for DOM events.
*   **Event Listeners**: `click`, `input`, `scroll`.
*   **Logic**: When a user clicks, it captures:
    *   Target Element (Tag, ID, Class).
    *   Coordinates (x, y).
    *   Timestamp (relative to recording start).

### 3. `background.js` (The Manager)
Handles the state of the recording (Start/Stop).
*   **MediaRecorder**: Captures the tab's video stream.
*   **Audio Handling**: Since Chrome extensions are tricky with audio, we often allow mic access via an `offscreen` document or standard user gesture.

---

## The Recording Lifecycle

1.  **User Clicks Record**: 
    -   `background.js` gets the active tab stream.
    -   `content.js` initializes event listeners.
2.  **During Recording**:
    -   Video chunks (`Blob`) accumulate in memory in `background.js`.
    -   Events array accumulates in `content.js`.
3.  **User Clicks Stop**:
    -   `content.js` sends the final array of events -> `background.js`.
    -   `background.js` creates a `FormData` object.
    -   **Upload**: The extension performs a `fetch()` to the Backend.
    -   **Redirect**: Opens a new tab to `http://localhost:3000/recording/{id}`.

## Security Note
The extension intentionally does **not** process video. This keeps it lightweight and prevents the browser from crashing due to memory usage. It just "dumps" raw data to the server.
