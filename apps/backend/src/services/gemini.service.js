
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

const getEnv = (key) => process.env[key];

export const GeminiService = {
    /**
     * MAIN AI: Events + Transcript -> Structured JSON Guide
     * @param {Array} events - DOM events
     * @param {number} videoDuration - In seconds
     * @param {string} rawTranscript - Full transcript
     * @param {Object} viewport - { width, height }
     * @returns {Promise<Object>} - The structured JSON Guide
     */
    async generateGuide(events, videoDuration, rawTranscript, viewport) {
        const apiKey = getEnv('GEMINI_API_KEY');
        if (!apiKey) {
            console.warn('[GeminiService] API Key Missing');
            return null; // Return null to signal fallback needed
        }

        // Prepare context
        const eventLog = events.map(e => {
            const t = (typeof e.target === 'string') ? e.target : (e.target?.text || e.target?.selector || 'element');
            return `[${e.timestamp}ms] ${e.type} on "${t}"`;
        }).join('\n');

        const prompt = `
      You are an AI processing engine for a screen-recording product tutorial system.
      
      INPUTS:
      1. Video Metadata: Duration ${videoDuration}s, Resolution ${viewport.width}x${viewport.height}
      2. Raw Audio Transcript: "${rawTranscript}"
      3. DOM Events Log:
      ${eventLog}

      CORE OBJECTIVE:
      Convert this into an event-driven instructional JSON.
      
      RULES:
      - Group audio chunks by interaction.
      - Create a step for every meaningful DOM event (click, nav, input).
      - Generate "narrationText" that is Natural, Imperative, and Action-Oriented.
      - Calculate "zoom" focus regions centered on the element (scale 1.5).
      - **CRITICAL**: The "zoom" should NOT last the entire step. 
        Set "zoomOutMs" to be at least 1000ms BEFORE "endMs" (if step duration allows).
      - "startMs" and "endMs" must match the event times from the log.
      
      OUTPUT: Return ONLY valid JSON matching this schema:
      {
        "videoMeta": { "durationMs": number, "resolution": { "width": number, "height": number }, "frameRate": 30 },
        "steps": [
          {
            "stepIndex": number,
            "eventType": "click" | "navigation" | "input" | "other",
            "title": string,
            "instruction": string,
            "timestamp": { "startMs": number, "endMs": number },
            "audio": { "chunkId": string, "rawTranscript": string, "narrationText": string },
            "element": { "tag": string, "text": string, "selector": string },
            "coordinates": { "x": number, "y": number, "width": number, "height": number },
            "zoom": { "zoomInMs": number, "zoomOutMs": number, "focusCenter": { "x": number, "y": number }, "scale": number }
          }
        ],
        "timelineIndex": [{ "stepIndex": number, "jumpToMs": number, "label": string }]
      }
    `;

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", generationConfig: { responseMimeType: "application/json" } });
            const result = await model.generateContent(prompt);
            const response = result.response;

            if (response.text()) {
                const guide = JSON.parse(response.text());
                guide.processedAt = new Date().toISOString();
                return guide;
            }
            throw new Error('Gemini response was empty');
        } catch (e) {
            console.error('[GeminiService] Generation Failed:', e);
            // Log error to file
            try {
                fs.appendFileSync(path.resolve('gemini_error.log'), `[${new Date().toISOString()}] ${e.toString()} \nStack: ${e.stack}\n\n`);
            } catch (fsErr) {
                console.error('Could not write to error log:', fsErr);
            }
            return null; // Signals fallback needed
        }
    }
};
