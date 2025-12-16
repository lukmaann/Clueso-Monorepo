# 🖥️ Clueso Frontend

The **Frontend** is a modern React application responsible for rendering the interactive "Magic Player" and the generated documentation.

---

## 📂 Project Structure

```text
apps/frontend/
├── src/
│   ├── features/
│   │   └── player/           # The core "Magic Player" logic
│   │       ├── VideoPlayer.tsx      # Handles video sync & zoom
│   │       ├── StepsList.tsx        # The scrollable step-by-step guide
│   │       └── useVideoController.ts # Hook managing video state
│   ├── services/
│   │   └── api.ts            # Axios instances for backend comms
│   ├── App.tsx               # Main Router
│   └── main.tsx
└── vite.config.ts
```

---

## 🎨 Key Features

### 1. The "Magic Player"
Unlike a standard video player, this component listens to the `guide.json`:
-   **Auto-Zoom**: It applies CSS transforms (`scale` and `translate`) to the `<video>` element based on the `zoom` coordinates provided by the backend for the current active step.
-   **Step Sync**: As the video plays, it automatically highlights the relevant step in the article below. Clicking a step keeps the video in sync.

### 2. Dashboard
-   Lists all recordings fetched from the backend.
-   Allows navigation to the specific "Guide View".

---

## 🛠️ Tech Stack

-   **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
-   **Styling**: Pure CSS (Modules/Standard) for high performance.
-   **Icons**: `lucide-react`.
-   **HTTP**: `axios`.

---

## 🏃‍♂️ How to Run

```bash
# Install deps
npm install

# Start Dev Server
npm run dev
```
The app runs on **http://localhost:3000**.
