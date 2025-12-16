# Frontend Documentation (Layer: Consumer)

## Overview
The Frontend is a **React (Vite)** application responsible for two main things:
1.  **Dashboard**: Allowing users to view their list of recordings.
2.  **Player Experience**: An interactive "Guide Mode" that syncs video playback with generated step-by-step instructions.

## Key Technologies
-   **React 18**: core UI library.
-   **Vite**: Build tool for fast HMR.
-   **Lucide React**: Iconography.
-   **Fetch API**: For communicating with the Backend.

## State Management & Logic
The frontend is deliberately kept "dumb". It does not process video or calculate steps. It only expects a **Ready-to-Render** JSON object from the Backend.

### The "Step Sync" Logic
The most complex part of the frontend is the `VideoPlayer` component. It must synchronize the video's `currentTime` with the active step in the sidebar.

```javascript
// Logic pattern in VideoPlayer.js
const onTimeUpdate = (time) => {
  // Find the step where current time falls between start and end
  const activeStep = steps.find(step => 
    time >= step.timestamp.startMs && 
    time <= step.timestamp.endMs
  );
  
  if (activeStep) {
    highlightSidebar(activeStep.id);
    // Optional: Trigger auto-zoom if implemented
  }
}
```

## API Consumption

### 1. Fetching a Recording
**GET** `http://localhost:3001/api/recordings/:id`

**Response Expected:**
```json
{
  "id": "123",
  "videoUrl": "/uploads/video_123.webm",
  "steps": [ ... ] // See DATA_FLOW.md for exact shape
}
```

---

## File Structure
-   `src/App.jsx`: Main router and layout.
-   `src/components/`: Reusable UI atoms (Buttons, Cards).
-   `src/pages/Player.jsx`: The main view for consuming a guide.
