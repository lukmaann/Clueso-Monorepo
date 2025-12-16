# 🕵️ Clueso.io Clone (Open Source)

> **Turn screen recordings into beautiful, step-by-step documentation automatically.**

This project is a high-performance, open-source clone of Clueso.io. It captures your screen, analyzes your clicks and voice using advanced AI, and generates a polished "How-to" guide in seconds.

---

## 🚀 Features

-   **🎥 Chrome Extension Recorder**: Capture video (`.webm`) and DOM events (clicks, scrolls) simultaneously.
-   **🧠 Intelligent Processing**:
    -   **Deepgram Nova-2**: Lightning-fast Speech-to-Text (STT) transcription.
    -   **Google Gemini Flash**: "Director Mode" AI that fuses click logs with transcripts to deduce user intent and generate instructions.
-   **⚡ Modular Monolith**: Built with TurboRepo for a unified, high-speed development experience.
-   **⚛️ React Dashboard**: Interactive player that syncs video playback with the documentation steps on the side.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js**: v18 or higher.
-   **npm**: v9 or higher.
-   **Google Chrome**: For installing the extension.

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/lukmaann/Clueso-Monorepo.git
cd Clueso-Monorepo
```

### 2. Install Dependencies
We use **TurboRepo** to manage the workspace. Install everything from the root:
```bash
npm install
```

### 3. Configure Environment Variables
**Security Warning**: Never commit your API keys.

You need to create a `.env` file for the Backend.

1.  Navigate to `apps/backend/`
2.  Create a file named `.env`
3.  Add the following keys:

```ini
# apps/backend/.env

# API Configuration
PORT=3001

# Deepgram (For Speech-to-Text & Text-to-Speech)
# Get key here: https://console.deepgram.com/signup
DEEPGRAM_API_KEY=your_deepgram_key_here

# Google Gemini (For Logic & Guide Generation)
# Get key here: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_google_gemini_key_here
```

*(Note: The Frontend does not require an `.env` file for local development as it connects to `localhost:3001` by default.)*

---

## 🏃‍♂️ How to Run

From the **root** directory, run a single command to start the Frontend and Backend simultaneously:

```bash
npm run dev
```

-   **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
-   **Backend API**: [http://localhost:3001](http://localhost:3001)

---

## 🧩 How to Use (The Workflow)

### Step 1: Load the Extension
1.  Open Chrome and go to `chrome://extensions`.
2.  Enable **Developer Mode** (top right toggle).
3.  Click **Load Unpacked**.
4.  Select the `apps/extension` folder from this repository.
5.  *Tip: Pin the extension icon to your toolbar.*

### Step 2: Record a Guide
1.  Go to any website you want to document.
2.  Click the **Clueso Clone** extension icon.
3.  Click **"Start Recording"**.
4.  Perform your actions (click buttons, narrate what you are doing).
5.  Click **"Stop Recording"**.

### Step 3: Watch the Magic
1.  The extension will automatically upload the video to the backend.
2.  You will be redirected to the **Dashboard**.
3.  Wait a few seconds for the AI to process (Transcribe -> Analyze -> Generate).
4.  **Done!** View your video with a perfectly synced step-by-step sidebar.

---

## 🏗️ Architecture Overview

The system followed a **Separation of Concerns** principle:

| Layer | Path | Responsibility |
| :--- | :--- | :--- |
| **Source** | `apps/extension` | Captures raw `.webm` video & DOM click coordinates. |
| **Orchestrator** | `apps/backend` | Node.js/Express server. Handles uploads, calls AI services (`ai.service.js`), and stores files. |
| **Consumer** | `apps/frontend` | React/Vite app. Fetches the JSON guide and renders the interactive video player. |

For a deep dive, check out [ARCHITECTURE.md](./ARCHITECTURE.md) and the `docs/` folder.
