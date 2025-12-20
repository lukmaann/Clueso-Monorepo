# System Architecture and Design Decisions

This document serves as a comprehensive guide to the architectural choices, code organization, and technology stack of the Clueso.io Clone project. It explains the rationale behind the design, how the components interact, and the future roadmap for the application.

---

## 1. Architectural Pattern: The Modular Monolith

I have adopted a **Modular Monolith** architecture housed within a **Monorepo**.

### What is it?
Instead of managing multiple git repositories or building a single coupled application, I use a single repository ("Monorepo") with distinct, isolated applications residing within an `apps/` directory.

### Why this choice?
1.  **Unified Development Experience**: A single `npm install` and `npm run dev` sets up the entire stack.
2.  **Simplified Dependency Management**: I use `turbo` to manage scripts and caching across the workspace efficiently.
3.  **Avoids Complexity**: Microservices introduce complexity (service discovery, network latency, distributed deployments) that is unnecessary for this stage of the product.
4.  **Maintainability**: I achieve strict separation of code—ensure the frontend cannot import backend code directly—without the operational overhead of microservices.

### Why not Microservices?
While microservices are powerful for large enterprise teams, they present significant drawbacks for a lean, high-velocity project:
*   **Complexity**: Requires orchestration (Kubernetes), detailed logging, and complex CI/CD pipelines.
*   **Latency**: Internal HTTP calls between multiple services increase overall latency.
*   **Overhead**: Managing multiple database connections and server instances increases operational costs.

**This approach allows me to extract services later.** Since the code is already modular, moving `apps/backend` to its own repository in the future is a straightforward process if scaling requirements dictate it.

---

## 2. Code Organization and Separation of Concerns

I strictly adhere to the **Separation of Concerns (SoC)** principle. Each component has a single responsibility and operates independently.

### Directory Structure

```text
/
├── apps/
│   ├── frontend/       # Consumer Layer
│   │   ├── src/components  # Reusable UI blocks
│   │   ├── src/pages       # Route views
│   │   └── package.json    # React/Vite dependencies
│   │
│   ├── backend/        # Logic and Orchestration Layer
│   │   ├── src/controllers # Request handling
│   │   ├── src/services    # Business Logic (AI, DB)
│   │   └── uploads/        # Local storage (temp)
│   │
│   └── extension/      # Data Capture Layer
│       ├── manifest.json   # Browser config
│       └── background.js   # MediaRecorder logic
│
└── package.json        # Root config (Turbo)
```

### Enforcement of Separation
*   **The Frontend** operates independently of the Database or AI keys, simply fetching JSON from the API.
*   **The Extension** captures and uploads processed chunks without knowledge of video processing logic.
*   **The Backend** serves as the sole secure gatekeeper, managing API keys (Deepgram, Gemini) and business logic.

This structure ensures that changes to the Frontend framework or AI providers do not impact other parts of the system.

---

## 3. Technology Stack and Key Decisions

I prioritized **Performance**, **Cost**, and **Developer Experience (DX)** in my technology selection.

### AI Stack: Deepgram vs. Alternatives

I utilize **Deepgram** for both Speech-to-Text (STT) and Text-to-Speech (TTS).

#### Why Deepgram?
1.  **Speed (Nova-2 Model)**: Deepgram's Nova-2 is among the fastest STT models available, which is critical for a video processing tool.
2.  **Aura (TTS)**: The "Aura" text-to-speech model is highly optimized for conversational, low-latency audio.
3.  **Unified Vendor**: Using a single vendor for both input and output simplifies billing and API integration.
4.  **Cost Efficiency**: Deepgram offers a scalable cost structure compared to premium consumer-focused tools.

#### Why not ElevenLabs?
*   **ElevenLabs** produces cinematic-quality voice generation but comes with higher costs and often higher latency.
*   For a tutorial and SaaS product, clarity and speed are prioritized over emotional depth. Deepgram provides the optimal balance of quality and performance for this use case.

### Intelligence: Google Gemini Flash
*   I utilize **Gemini 2.5 Flash** due to its extensive context window—capable of processing long transcripts—and its cost-effectiveness and speed advantage over GPT-4.
*   It functions as the central logic engine, structuring raw click logs and transcripts into a formatted JSON guide.

### Knowledge Engine: RAG (Retrieval-Augmented Generation)
I have evolved the system from a static guide generator into a dynamic **Knowledge Base**.

#### What is it?
A subsystem that "reads" every generated guide, understands its semantic meaning, and allows users to ask natural language questions against the entire library of content.

#### How it works?
1.  **Vector Database (MVP)**: A local-first JSON store (`knowledge_base.json`) holding 768-dimensional vector embeddings of guides.
2.  **Semantic Search**: Uses **Cosine Similarity** to match user queries (e.g., "How do I reset password?") with relevant guides, even without exact keyword matches.
3.  **Models**:
    *   **Embeddings**: `text-embedding-004` deals with the math (Text-to-Vector).
    *   **Generation**: `gemini-2.5-flash` deals with the answer synthesis (Context + Query -> Answer).

### Frontend: React + Vite
*   **Vite**: Selected for its superior Hot Module Replacement (HMR) performance and modern ES module support.
*   **React**: The industry standard for interactive interfaces, providing access to a vast ecosystem of libraries.

### Backend: Node.js + Express
*   **Express**: Chosen for its reliability, simplicity, and flexibility.
*   **Node.js**: Enables the use of JavaScript across the entire stack (Frontend, Backend, Extension), reducing context switching.

---

## 4. Scaling and Future Roadmap

The application currently operates on a single node (monolith). The following outlines the path to scale:

### Phase 1: Current ("MVP")
*   **Storage**: Local Disk (`/uploads`).
*   **Processing**: Synchronous (User waits for upload).
*   **Database**: In-memory / Filesystem.

### Phase 2: Professional ("Production Ready")
*   **Storage to AWS S3**: Offload video files to cloud storage to manage disk space.
*   **Database to PostgreSQL**: Transition from in-memory mock data to a relational database for interactions.
*   **Processing to Async Queues**: Implement **Redis** and **BullMQ**. Upon video upload, the system will immediately return a processing status while a background worker handles AI transcoding, preventing server blocking.

### Phase 3: Hyper-Scale ("Enterprise")
*   **Containerization**: Dockerize the Frontend and Backend services separately.
*   **Orchestration**: Deploy using Kubernetes (K8s) or AWS ECS.
*   **CDN**: Distribute frontend and video assets via Cloudflare or AWS CloudFront for global performance.

---

## 5. Open Source Philosophy

This codebase is designed to be **Community Friendly**:
1.  **Transparency**: All AI logic is contained within `ai.service.js` for clarity.
2.  **Standard Tools**: I utilize standard `npm`, `express`, and `react` patterns familiar to web developers.
3.  **Configuration**: Secrets are managed via `.env`, allowing for easy configuration of API keys.

I believe in **Democratizing Documentation**. By maintaining a clean architecture and accessible tools, I aim to empower developers to build their own automation platforms.
