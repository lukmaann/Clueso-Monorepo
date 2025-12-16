# Backend Documentation (Layer: Orchestrator)

## Overview
The Backend is a **Node.js (Express)** server that acts as the "Brain" of the operation. It is the **only** layer that holds API keys (Deepgram, Gemini). It orchestrates the flow of data between the temporal world (video files) and the semantic world (JSON guides).

## Key Responsibilities
1.  **Ingestion**: Receives massive `FormData` uploads (Video + Audio + JSON Events) from the Extension.
2.  **Transcoding**: Calls Deepgram to convert Audio -> Text.
3.  **Intelligence**: Calls Gemini to convert Text + Clicks -> Structured Steps.
4.  **Storage**: Saves files to local disk (`apps/backend/uploads/`).

## AI Service Integration (`src/services/ai.service.js`)

### 1. Deepgram (Speech-to-Text)
We stream the audio buffer to Deepgram's **Nova-2** model.

*   **API Used**: `https://api.deepgram.com/v1/listen`
*   **Why**: It provides timestamps for every word, which allows us (in the future) to align text perfectly with video.
*   **Data Received**:
    ```json
    {
      "results": {
        "channels": [{
          "alternatives": [{
            "transcript": "Okay, so first I'm going to click on the setting button..."
          }]
        }]
      }
    }
    ```

### 2. Deepgram (Text-to-Speech)
When editing a step, we may need to generate new audio.

*   **API Used**: `https://api.deepgram.com/v1/speak`
*   **Model**: `aura-asteria-en` (Fast, conversational).

### 3. Google Gemini (The Director)
We send the **Transcript** AND the **Click Event Log** to Gemini. It fuses them to deduce "Intent".

*   **Prompt Strategy**: "Here is what the user *did* (click log) and here is what they *said* (transcript). Create a clean tutorial."
*   **Output**: Pure JSON.

---

## API Endpoints

### `POST /api/recordings/upload`
*   **Body**: `multipart/form-data`
*   **Files**: `video`, `audio`
*   **Fields**: `events` (JSON string), `metadata` (JSON string)
*   **Returns**: `{ "id": "uuid", "status": "processing" }`

### `GET /api/recordings/:id`
*   **Returns**: The full Guide JSON.
