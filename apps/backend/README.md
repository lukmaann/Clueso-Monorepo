# ⚙️ Clueso Backend

The **Backend** is the brain of the Clueso application. It is a lightweight Node.js/Express server responsible for handling heavy files (video uploads) and orchestrating the AI Agents to generate documentation.

---

## 📂 Project Structure

```text
apps/backend/
├── src/
│   ├── controllers/
│   │   └── recording.controller.js  # Implementation of API logic
│   ├── routes/
│   │   └── recording.routes.js      # API Endpoint definitions
│   ├── services/
│   │   └── ai.service.js            # The Core AI Logic (Deepgram + Gemini)
│   └── server.js                    # Entry point & Config
├── uploads/                         # Local storage for recorded videos (gitignored)
├── .env                             # API Keys
└── package.json
```

---

## 🛠️ Tech Stack & Services

- **Runtime**: Node.js
- **Server**: Express.js
- **Speech-to-Text (STT)**: [Deepgram Nova-2](https://deepgram.com/) - Used for extremely fast and accurate audio transcription.
- **LLM / Intelligence**: [Google Gemini 2.0 Flash](https://ai.google.dev/) - Used to correlate DOM events with the transcript to generate "Steps".
- **Storage**: Local filesystem (simulated S3).

---

## 🔌 API Endpoints

### `POST /api/recordings/upload`
Handling the multipart form data sent by the Chrome Extension.

**Body:**
- `video`: The `.webm` video file.
- `voiceAudio`: The `.webm` microphone audio track.
- `events`: A JSON string of DOM events captured during recording.
- `metadata`: width, height, duration.

**Process:**
1.  Saves raw files to `uploads/`.
2.  Calls `ProductAI.transcribeAudio` to get text.
3.  Calls `ProductAI.processVideoToGuide` to generate the step-by-step JSON.
4.  Returns the `guideId` to the extension for redirection.

### `GET /api/recordings/:id`
Retrieves the processed `guide.json` and paths to the video files for the Frontend player.

---

## 🧠 The AI Pipeline (`ai.service.js`)

This is the most critical component. It performs the following logic:

1.  **Ingestion**: Receives raw DOM clicks (e.g., "Click on #submit-btn at 1002ms") and Audio.
2.  **Transcription**: Converts audio to text to understand user intent.
3.  **Synthesis (Gemini Prompt)**:
    -   *Input*: "User clicked 'Submit' at 1s", "Transcript: 'Now I submit the form'".
    -   *Logic*: "Okay, Step 1 is 'Submit Form'. The video segment is 0s-2s."
    -   *Zoom Calculation*: "The button is at (x:500, y:200). Create a zoom effect targeting this area."
4.  **Output**: Returns a strictly formatted JSON object compatible with the frontend player.

---

## 🏃‍♂️ How to Run

```bash
# Install deps
npm install

# Start Dev Server
npm run dev
```
The server listens on **port 3001**.
