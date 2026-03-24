
# 🧠 SurviLens AI  
### Offline Survival Intelligence System

SurviLens AI is a **privacy-first, on-device AI survival system** that helps users **see, understand, and respond to real-world dangers — even without internet**.

It combines **camera intelligence, offline navigation, voice AI, and emergency systems** into one unified platform.

---

## 🌍 Problem

In emergencies or remote environments, internet connectivity is unreliable.  
Most AI-powered apps fail exactly when they are needed the most.

---

## 💡 Solution

SurviLens runs **AI fully on-device**, enabling:

- 📸 Real-time environmental awareness  
- 🗺️ Safe navigation without APIs  
- 🚨 Emergency response assistance  
- 🎤 Voice-first interaction  
- 📡 Offline peer communication  

---

# 🌟 Core USP — Camera-Based Survival Intelligence

## 📸 Live Hazard Detection + AI Vision Assistant

**File:** `CameraAssistantScreen.tsx`

The camera is the **core intelligence layer** of SurviLens.

### ⚠️ Live Hazard Awareness ("Watch Mode")
- Periodic AI-driven hazard alerts
- Detects contextual risks like:
  - 🔥 Fire / smoke  
  - 🌊 Flood / water hazards  
  - 🐍 Animals  
  - ⛰️ Cliffs / unsafe terrain  

Displays real-time alerts:

```

⚠️ Hazard detected — verify surroundings

```

👉 Designed honestly:
- No fake CV claims  
- Encourages user verification  
- Extendable to real VLM models  

---

### 🧠 Smart Context Detection (Auto Mode)

- Automatically detects intent:
  - 🍔 Food safety  
  - 🏥 Medical  
  - 🛠️ Equipment  
  - 📦 General  

Example:
```

"Can I eat this?" → FOOD mode
"Injury help" → MEDICAL mode

````

---

### 🔦 Torch Mode (Emergency Visibility)

**File:** `SosTorchBlink.tsx`

- Uses back camera flash as torch
- Emergency blinking pattern support
- Works with SOS system
- Helps in:
  - Night navigation  
  - Rescue signaling  

---

### 🎯 AI Camera Assistant

- Scene understanding
- Practical survival guidance
- Actionable insights (not generic AI)

---

# ✨ Core Features

---

## 🗺️ Safe Route Navigation (Offline AI Routing)

**Files:** `utils/geoRouting.ts`, `OfflineMapScreen.tsx`

- 🔴 Danger markers with avoid halos  
- 🟢 Safe path → detour around hazards  
- ⚪ Optional risky straight path  
- 📍 Map legend (safe vs danger zones)  
- 🧠 AI route safety brief  
- 📡 Nearby Mesh access from map  

---

## 🚨 One-Tap SOS System

**Files:** `EmergencyScreen.tsx`, `SosTorchBlink.tsx`

- 🔴 Large **TAP FOR SOS**
- 📍 Auto GPS + refresh
- 🧠 AI-generated emergency summary
- 📤 Share location instantly

### Android Enhancements:
- 📳 Repeating vibration pattern  
- 🔦 Torch blinking  
- ☎️ Quick dial (112 / 108)  

### Extras:
- 🎤 Voice emergency trigger  
- 📡 Mesh broadcast shortcut  

---

## 📡 Offline Mesh Communication

**Files:** `NearbyMeshService.ts`, `NearbyMeshScreen.tsx`

- “Is anyone nearby?”  
- Broadcast + receive messages  
- Inbox simulation  

🔧 Extendable to:
- BLE (react-native-ble-plx)  
- WiFi Direct  

---

## 🎤 Voice-First Emergency Mode

**File:** `VoicePipelineScreen.tsx`

- Supports:
  
  { mode: 'emergency' }

Pipeline:

```
Speak → Transcribe → AI → Speak
```

* Calm, short, actionable responses
* First-aid optimized

---

## 💬 Offline AI Assistant

* On-device LLM
* Context-aware responses
* No internet required

---

## 📊 System Readiness Dashboard

**File:** `SurviLensHubScreen.tsx`

* LLM / STT / TTS status
* Readiness score
* Model health tracking

---

# 🏗️ Architecture

```
src/
├── components/
│   ├── AppHeader.tsx
│   ├── AudioVisualizer.tsx
│   ├── ChatMessageBubble.tsx
│   ├── FeatureCard.tsx
│   ├── GlassCard.tsx
│   ├── ModelLoaderWidget.tsx
│   └── SosTorchBlink.tsx
│
├── hooks/
│   ├── useAIChat.ts
│   ├── useLocation.ts
│   └── useStorage.ts
│
├── navigation/
│   ├── MainTabs.tsx
│   └── types.ts
│
├── screens/
│   ├── CameraAssistantScreen.tsx   # 🔥 Core AI + hazard detection
│   ├── EmergencyScreen.tsx
│   ├── OfflineMapScreen.tsx
│   ├── NearbyMeshScreen.tsx
│   ├── VoicePipelineScreen.tsx
│   ├── AIChatScreen.tsx
│   ├── SurviLensHubScreen.tsx
│   └── SurvivalGuideScreen.tsx
│
├── services/
│   ├── ModelService.tsx
│   ├── NearbyMeshService.ts
│   ├── VisionService.tsx
│   └── ConversationService.tsx
│
├── utils/
│   ├── geoRouting.ts
│   └── emergencyTemplates.ts
│
├── theme/
│   ├── colors.ts
│   ├── spacing.ts
│   └── index.ts
│
└── App.tsx
```

---

# ⚙️ Tech Stack

* **React Native (CLI)**
* **RunAnywhere SDK**

  * LlamaCPP (LLM)
  * ONNX (STT + TTS)
* **Mapbox (Offline Maps)**
* **TypeScript**

---

# 🔒 Privacy

* ✅ Fully on-device AI
* ✅ No cloud APIs
* ✅ No data tracking
* ✅ Works offline

---

# 🚀 Setup

```bash
git clone https://github.com/namantalwar07/SurviLensAI.git
cd SurviLensAI
npm install
```

---

### Environment

```env
MAPBOX_TOKEN=your_public_token_here
```

---

### Run

```bash
npx react-native run-android
```

---

# ⚠️ Notes

* Use **Mapbox public token (pk) only**
* Never expose secret keys
* Use real device for best performance

---

# 🧠 Design Principles

* Offline-first
* Fail-safe UX
* Honest AI
* Real-world utility

---

# 🏆 Hackathon Edge

SurviLens stands out because:

* 📸 Camera is **core intelligence layer**
* 🧠 Fully offline AI system
* 🧭 Real-world survival focus
* 🔥 Multi-modal integration

---

# 🔮 Future Scope

* Vision-based detection (VLM)
* Real BLE mesh networking
* Autonomous AI guidance
* Rescue system integration

---

# 🙌 Acknowledgment

This project extends the **RunAnywhere React Native Starter App**.

Enhanced with:

* Camera-based survival intelligence
* Offline navigation system
* Emergency AI workflows
* Multi-modal AI interaction

---

# 👨‍💻 Author
BUG SLAYERS
**Naman Talwar**
GitHub: [https://github.com/namantalwar07](https://github.com/namantalwar07)

---

> “When the internet fails, intelligence should not.”

```

