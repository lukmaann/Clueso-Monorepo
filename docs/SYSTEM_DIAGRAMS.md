# System Diagrams (UML)

This document contains the visual blueprints for the system. You can use these Mermaid JS diagrams to visualize the architecture.

## 1. High-Level System Architecture (Component Diagram)

Shows how the major pieces of the "Modular Monolith" fit together.

```mermaid
graph TD
    User((User))
    
    subgraph "Browser Environment"
        Ext[Chrome Extension]
        Tab[App Dashboard (React)]
    end
    
    subgraph "Backend Server (Node/Express)"
        API[API Gateway / Routes]
        Controller[Recording Controller]
        Service[ProductAI Orchestrator]
        Disk[(Local Storage /uploads)]
    end
    
    subgraph "External Cloud AI"
        Deepgram[Deepgram API (STT/TTS)]
        Gemini[Google Gemini API (LLM)]
    end

    User -- "Clicks Record" --> Ext
    User -- "Views Guide" --> Tab
    
    Ext -- "Uploads Video + Event JSON" --> API
    Tab -- "Fetches Guide JSON" --> API
    
    API --> Controller
    Controller --> Disk
    Controller --> Service
    
    Service -- "Audio Stream" --> Deepgram
    Service -- "Transcript + Events" --> Gemini
    Gemini -- "Structured JSON" --> Service
```

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

## 3. Data Structure (Class/Entity Diagram)

The shape of the core data objects passed between layers.

```mermaid
classDiagram
    class Recording {
        +String id
        +String videoPath
        +String title
        +Meta videoMeta
        +Step[] steps
    }

    class Step {
        +Number index
        +String title
        +String instruction
        +String actionType
        +TimeRange timestamp
        +Coordinates coords
    }

    class Coordinates {
        +Number x
        +Number y
        +Number width
        +Number height
    }

    class TimeRange {
        +Number startMs
        +Number endMs
    }

    Recording "1" *-- "many" Step
    Step "1" *-- "1" Coordinates
    Step "1" *-- "1" TimeRange
```
