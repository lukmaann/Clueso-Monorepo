# 🧩 Clueso Chrome Extension

The **Extension** is the data ingestion entry point. It captures the user's screen, microphone, and—crucially—the underlying DOM interactions that make the video "smart".

---

## 📂 Project Structure

```text
apps/extension/
├── src/
│   ├── background.js    # Service Worker: Manages state & upload
│   ├── content.js       # Injected Script: Listens for 'click' events on page
│   ├── offscreen.js     # Helper: Handles audio recording logic
│   └── popup/           # UI: The "Start/Stop" small window
├── manifest.json        # Chrome configuration (MV3)
└── icons/
```

---

## ⚙️ How It Works

### 1. Event Listeners (`content.js`)
When recording starts, the extension injects a listener into the active tab.
-   It listens for `click`, `input`, and `scroll`.
-   It calculates the **CSS Selector** path for the interacted element.
-   It records the (`x`, `y`) coordinates relative to the viewport.
-   It pushes these to the `background.js` via runtime messages.

### 2. Media Capture (`offscreen` + `background`)
-   Uses `chrome.tabCapture` or `getDisplayMedia` to get the video stream.
-   Uses `MediaRecorder` API to capture chunks of data (`video/webm`).

### 3. The "Upload Packet"
When the user clicks **Stop**, the `background.js` assembles:
1.  The Video Blob.
2.  The Audio Blob.
3.  The `events` array (The DOM logs).
4.  The `metadata` (Screen dimensions).

It then performs a `multipart/form-data` POST request to `localhost:3001/api/recordings/upload`.

---

## 🔧 Installation (Developer Mode)

1.  Build is not required (Plain JS).
2.  Go to `chrome://extensions/`.
3.  Click **Load Unpacked**.
4.  Select this `apps/extension` folder.

**Note**: You must reload the extension if you change `background.js`. Content script changes require reloading the *target web page*.
