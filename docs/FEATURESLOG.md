# Features Log

> This document tracks the detailed implementation of features, including technical explanations, code locations, and behavior.

## [2025-12-17] Enhanced Video Player (v0.1.2)

### 1. Overview
We have upgraded the video player in the dashboard to a "Professional" grade UI. It now includes independently controllable volume, a visual timeline track with step markers ("clips"), and a sleek gradient-based overlay for controls.

### 2. Functional Changes
-   **Fine-Grained Volume Control**: Users can now adjust the volume using a slider. This controls both the original video audio and the AI-generated voiceover simultaneously.
-   **Step-Track Timeline**: Instead of a simple progress bar, the timeline now visually represents "steps" as distinct clips. 
-   **Hover Previews**: Hovering over a specific "clip" on the timeline reveals the Step Number and its Instruction.
-   **Interactive UI**: Controls now appear on hover with smooth fade-in animations.

### 3. Technical Implementation Details

#### **Code Location**
-   **File**: `apps/frontend/src/features/recordings/RecordingDetail.tsx`
-   **Component**: `RecordingDetail` function.

#### **Key Logic Breakdown**

**A. Volume Synchronization**
We introduced a `volume` state (0.0 to 1.0) and a side-effect to sync it across two media sources:
1.  **Video Element** (`videoRef.current`): The recorded `.webm` screen capture.
2.  **Audio Element** (`currentAiAudioRef.current`): The AI Text-to-Speech audio track.

```typescript
// State definition
const [volume, setVolume] = useState(1.0);

// Synchronization Effect
useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
    if (currentAiAudioRef.current) currentAiAudioRef.current.volume = volume;
}, [volume]);
```

**B. Timeline "Clips" Calculation**
We strictly use `rec.duration` (server-provided metadata) for stability instead of relying solely on DOM `duration` events which can be flaky during load.

-   **Start Position**: `(step.startMs / totalDuration) * 100` (%)
-   **Clip Width**: `((step.endMs - step.startMs) / totalDuration) * 100` (%)

```typescript
{guide?.steps.map((step) => {
    const duration = rec.duration * 1000; // Convert to ms
    const startP = (step.timestamp.startMs / duration) * 100;
    const widthP = ((step.timestamp.endMs - step.timestamp.startMs) / duration) * 100;
    
    // Renders a div positioned absolutely on the timeline track
    return <div style={{ left: `${startP}%`, width: `${widthP}%` }} ... />
})}
```

**C. UI Styling (Tailwind)**
-   Used `group/timeline` and `group/volume` patterns to handle nested hover states (e.g., expanding the volume slider only when hovering the speaker icon).
-   Implemented `backdrop-blur` and `bg-gradient-to-t` for the control overlay to ensure text legibility against any video background.

---

## [2025-12-16] Core Features (MVP)

### Chrome Extension Recorder
-   **Function**: Captures screen video (`.webm`) and DOM events simultaneously.
-   **Code**: `apps/extension/src/background.ts` (MediaRecorder) and `content.js` (Event Listeners).

### Intelligent Processing Pipeline
-   **Stitching**: Backend receives chunks of video and JSON events.
-   **Gemini Flash**: Fuses click logs + transcripts to deduce "User Intent".
-   **Deepgram**: Handles fast STT (Speech-to-Text) and TTS (Text-to-Speech).

### Web Dashboard
-   **Sync Engine**: The sidebar automatically scrolls to the active step based on `video.currentTime`.
-   **Code**: `apps/frontend/src/features/recordings/RecordingDetail.tsx` (Logic for `useScroll` and `timeupdate` listeners).
