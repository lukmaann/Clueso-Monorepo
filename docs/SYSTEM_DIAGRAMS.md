
# System Diagrams (UML)
This document contains the visual blueprints for the system.  

<<<<<<< HEAD

---
=======
This document contains the visual blueprints for the system.  
All diagrams below are written in **Mermaid JS** and are compatible with GitHub Markdown.

---

## 1. High-Level System Architecture (Component Diagram)

Shows how the major components of the modular system interact.
>>>>>>> 5e329c3 (fix: upgrade to gemini-2.5-flash and enforce strict ports)

## 1. High-Level System Architecture
```mermaid
graph TD
    User[User]
<<<<<<< HEAD
    ChromeExtension[Chrome Extension]
    FrontendApp[React Frontend Dashboard]
    BackendServer[Node Express Backend]
    RecordingController[Recording Controller]
    AIOrchestrator[AI Orchestrator Service]
    FileStorage[Video and Guide Storage]
    DeepgramSTT[Deepgram Speech To Text]
    DeepgramTTS[Deepgram Text To Speech]
    GeminiLLM[Google Gemini LLM]
    
    User --> ChromeExtension
    User --> FrontendApp
    ChromeExtension --> BackendServer
    FrontendApp --> BackendServer
    BackendServer --> RecordingController
    RecordingController --> FileStorage
    RecordingController --> AIOrchestrator
    AIOrchestrator --> DeepgramSTT
    AIOrchestrator --> GeminiLLM
    AIOrchestrator --> DeepgramTTS
    AIOrchestrator --> BackendServer
```
=======

    subgraph Browser
        Ext[Chrome Extension]
        FE[React Dashboard]
    end

    subgraph Backend
        API[API Routes]
        Controller[Recording Controller]
        AIService[AI Orchestrator]
        Storage[File Storage]
    end

    subgraph External_AI
        Deepgram[Deepgram API]
        Gemini[Gemini API]
    end

    User -->|Start Recording| Ext
    User -->|View Guide| FE

    Ext -->|Upload Video and Events| API
    FE -->|Fetch Guide Data| API

    API --> Controller
    Controller --> Storage
    Controller --> AIService

    AIService -->|Audio for Transcription| Deepgram
    AIService -->|Transcript and Events| Gemini
    Gemini -->|Structured Guide JSON| AIService

>>>>>>> 5e329c3 (fix: upgrade to gemini-2.5-flash and enforce strict ports)

---

## 2. Low-Level Interactions (Sequence Diagram)
The complete lifecycle of a single recording request.
```mermaid
sequenceDiagram
    participant U as User
    participant C as ContentScript (Ext)
    participant B as Background (Ext)
    participant S as Server (Backend)
    participant AI as AI Service
    
    Note over U,B: Recording Phase
    U->>B: Click "Start Recording"
    B->>C: Initialize Event Listeners
    
    loop User Actions
        U->>U: Clicks / Scrolls / Talks
        C->>C: Log Event {type, x, y, timestamp}
        B->>B: Record Video Chunks (WebM)
    end
    
    U->>B: Click "Stop Recording"
    C->>B: Send Event Log
    B->>B: Compile Blob (Video + Audio)
    
    Note over B,S: Upload Phase
    B->>S: POST /upload (formData)
    S->>S: Save video.webm to disk
    S-->>B: 200 OK { id: "123", status: "processing" }
    
    B->>U: Open localhost:3000/recording/123
    
    Note over S,AI: Processing Phase (Async)
    S->>AI: Transcribe(audioBuffer)
    AI-->>S: "User clicked the button..."
    
    S->>AI: GenerateGuide(events, transcript)
    AI-->>S: { steps: [{ title: "Click Btn", time: 1000 }] }
    
    Note over U,S: Consumption Phase
    U->>S: GET /recording/123
    S-->>U: Return Final JSON Guide
```

---

