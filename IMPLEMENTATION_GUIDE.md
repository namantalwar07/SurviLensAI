# 🚀 SurviLens AI - Complete Implementation Guide

**Offline Multimodal Reality Assistant**
**Timeline: 10-14 Days (MVP)**

---

## 📦 Phase 1: Setup & Dependencies (Day 1)

### 1.1 Install New Dependencies

```bash
# Camera & Vision
npm install react-native-vision-camera
npm install @react-native-camera-roll/camera-roll
npm install react-native-image-resizer

# Maps & Location
npm install react-native-maps
npm install @react-native-community/geolocation
npm install react-native-permissions

# Storage
npm install @react-native-async-storage/async-storage

# Internationalization
npm install i18next react-i18next

# UI Enhancements
npm install react-native-linear-gradient  # Already installed
npm install react-native-svg
```

### 1.2 iOS Setup

Add to `ios/Podfile`:

```ruby
permissions_path = '../node_modules/react-native-permissions/ios'
pod 'Permission-Camera', :path => "#{permissions_path}/Camera"
pod 'Permission-LocationWhenInUse', :path => "#{permissions_path}/LocationWhenInUse"
pod 'Permission-PhotoLibrary', :path => "#{permissions_path}/PhotoLibrary"
```

Add to `ios/RunAnywhereStarter/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>SurviLens needs camera access to analyze your environment</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>SurviLens needs photo access to analyze images</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>SurviLens needs location for offline maps and navigation</string>
```

Run:

```bash
cd ios && pod install && cd ..
```

### 1.3 Android Setup

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

---

## 🎯 Phase 2: Core Services (Days 2-3)

### 2.1 Services Already Created

✅ **VisionService.tsx** - Image analysis & classification
✅ **ConversationService.tsx** - Multi-turn dialogue with context

### 2.2 Update ModelService

Enhance `src/services/ModelService.tsx` to support larger models for vision tasks:

```typescript
// Add a larger LLM for better reasoning
await LlamaCPP.addModel({
  id: 'qwen2-1.5b-q4',
  name: 'Qwen2 1.5B Q4 (Better Reasoning)',
  url: 'https://huggingface.co/Qwen/Qwen2-1.5B-Instruct-GGUF/resolve/main/qwen2-1_5b-instruct-q4_k_m.gguf',
  memoryRequirement: 1_500_000_000,
});
```

### 2.3 Create Emergency Templates

Create `src/utils/emergencyTemplates.ts`:

```typescript
export const EMERGENCY_SCENARIOS = {
  firstAid: {
    en: {
      cuts: 'For cuts: 1) Clean wound with water, 2) Apply pressure to stop bleeding, 3) Cover with clean cloth...',
      burns:
        'For burns: 1) Cool under running water for 10-20 mins, 2) Remove jewelry/tight items, 3) Do NOT apply ice...',
      choking:
        'For choking: 1) Encourage coughing, 2) Give 5 back blows between shoulder blades, 3) Perform Heimlich if needed...',
    },
    hi: {
      cuts: 'कटने के लिए: 1) घाव को पानी से साफ करें, 2) खून रोकने के लिए दबाव लगाएं, 3) साफ कपड़े से ढकें...',
      // Add more Hindi translations
    },
  },
  survival: {
    en: {
      water:
        'Finding water: 1) Look for flowing streams, 2) Collect morning dew, 3) Boil before drinking...',
      shelter:
        'Building shelter: 1) Find dry elevated ground, 2) Use large branches for frame, 3) Cover with leaves...',
      fire: 'Making fire: 1) Gather dry tinder, 2) Use friction method if no matches, 3) Keep small and contained...',
    },
  },
};

export function getEmergencyGuidance(scenario: string, language: 'en' | 'hi' = 'en'): string {
  // Return appropriate emergency guidance
  return (
    EMERGENCY_SCENARIOS.firstAid[language][scenario] || 'Stay calm and seek professional help.'
  );
}
```

---

## 📱 Phase 3: Camera Assistant Screen (Days 4-5)

### 3.1 Create CameraAssistantScreen.tsx

```typescript
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import VisionService from '../services/VisionService';
import ConversationService from '../services/ConversationService';
import { useModelService } from '../services/ModelService';

export const CameraAssistantScreen: React.FC = () => {
  const modelService = useModelService();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const cameraRef = useRef<Camera>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [conversation, setConversation] = useState<string[]>([]);
  const conversationId = useRef<string | null>(null);

  // Request camera permission
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  // Initialize conversation
  useEffect(() => {
    if (modelService.isLLMLoaded && !conversationId.current) {
      conversationId.current = ConversationService.startConversation('general');
    }
  }, [modelService.isLLMLoaded]);

  const captureAndAnalyze = useCallback(async () => {
    if (!cameraRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      // Capture photo
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'balanced',
      });

      // Analyze with VisionService
      const result = await VisionService.analyzeImage(
        `file://${photo.path}`,
        undefined,
        'general'
      );

      setAnalysis(result);

      // Add to conversation
      if (conversationId.current) {
        setConversation(prev => [...prev, result.aiExplanation]);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  const askQuestion = async (question: string) => {
    if (!conversationId.current) return;

    try {
      const response = await ConversationService.generateResponse(
        conversationId.current,
        question,
        { imageAnalysis: analysis }
      );

      setConversation(prev => [...prev, `You: ${question}`, `AI: ${response}`]);
    } catch (error) {
      console.error('Question failed:', error);
    }
  };

  if (!device || !hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Camera permission required</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Capture Button */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={captureAndAnalyze}
          disabled={isAnalyzing || !modelService.isLLMLoaded}
          style={styles.captureButton}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.captureIcon}>📷</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Analysis Results */}
      {analysis && (
        <View style={styles.resultsPanel}>
          <ScrollView>
            <Text style={styles.resultTitle}>Detected:</Text>
            {analysis.detectedObjects.map((obj, idx) => (
              <Text key={idx} style={styles.objectText}>
                • {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
              </Text>
            ))}

            <Text style={styles.explanationTitle}>AI Explanation:</Text>
            <Text style={styles.explanation}>{analysis.aiExplanation}</Text>

            {/* Quick Questions */}
            <View style={styles.quickActions}>
              <TouchableOpacity onPress={() => askQuestion('Is this safe?')}>
                <Text style={styles.actionButton}>Is this safe?</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => askQuestion('How do I use this?')}>
                <Text style={styles.actionButton}>How to use?</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00D9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureIcon: { fontSize: 32 },
  resultsPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    maxHeight: '50%',
    backgroundColor: 'rgba(10, 14, 26, 0.95)',
    padding: 16,
  },
  // Add more styles...
});
```

---

## 🚨 Phase 4: Emergency Screen (Days 6-7)

Create `src/screens/EmergencyScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { EMERGENCY_SCENARIOS } from '../utils/emergencyTemplates';

const QUICK_ACTIONS = [
  { id: 'cuts', icon: '🩹', label: 'Cuts & Wounds', color: '#FF4444' },
  { id: 'burns', icon: '🔥', label: 'Burns', color: '#FF8800' },
  { id: 'choking', icon: '🫁', label: 'Choking', color: '#FF0000' },
  { id: 'fracture', icon: '🦴', label: 'Fracture', color: '#8B4513' },
  { id: 'cpr', icon: '❤️', label: 'CPR', color: '#DC143C' },
  { id: 'poisoning', icon: '☠️', label: 'Poisoning', color: '#9400D3' },
];

export const EmergencyScreen: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const renderGuidance = () => {
    if (!selectedScenario) return null;

    const guidance = EMERGENCY_SCENARIOS.firstAid[language][selectedScenario];

    return (
      <View style={styles.guidancePanel}>
        <Text style={styles.guidanceTitle}>
          {QUICK_ACTIONS.find(a => a.id === selectedScenario)?.label}
        </Text>
        <Text style={styles.guidanceText}>{guidance}</Text>

        {/* AI Assistant */}
        <TouchableOpacity style={styles.aiButton}>
          <Text style={styles.aiButtonText}>Ask AI for More Help</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Emergency Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerIcon}>🚨</Text>
        <Text style={styles.bannerText}>
          Emergency First Aid Guide (Offline)
        </Text>
      </View>

      {/* Language Toggle */}
      <View style={styles.langToggle}>
        <TouchableOpacity
          onPress={() => setLanguage('en')}
          style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
        >
          <Text>English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLanguage('hi')}
          style={[styles.langBtn, language === 'hi' && styles.langBtnActive]}
        >
          <Text>हिंदी</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions Grid */}
      <View style={styles.grid}>
        {QUICK_ACTIONS.map(action => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionCard, { borderColor: action.color }]}
            onPress={() => setSelectedScenario(action.id)}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Guidance Panel */}
      {renderGuidance()}

      {/* Emergency Contacts */}
      <View style={styles.contacts}>
        <Text style={styles.contactsTitle}>Emergency Numbers (India)</Text>
        <Text style={styles.contactItem}>🚑 Ambulance: 102</Text>
        <Text style={styles.contactItem}>🔥 Fire: 101</Text>
        <Text style={styles.contactItem}>👮 Police: 100</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  banner: {
    backgroundColor: '#DC2626',
    padding: 20,
    alignItems: 'center',
  },
  // Add complete styles...
});
```

---

## 🗺️ Phase 5: Offline Maps (Days 8-9)

Create `src/screens/OfflineMapScreen.tsx`:

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedLocation {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  type: 'safe' | 'danger' | 'resource' | 'shelter';
}

export const OfflineMapScreen: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    loadSavedLocations();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => console.error(error),
      { enableHighAccuracy: true }
    );
  };

  const loadSavedLocations = async () => {
    try {
      const stored = await AsyncStorage.getItem('savedLocations');
      if (stored) {
        setSavedLocations(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  };

  const saveLocation = async (type: SavedLocation['type']) => {
    if (!currentLocation) return;

    const newLocation: SavedLocation = {
      id: Date.now().toString(),
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Point`,
      description: 'Added manually',
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      timestamp: new Date(),
      type,
    };

    const updated = [...savedLocations, newLocation];
    setSavedLocations(updated);

    try {
      await AsyncStorage.setItem('savedLocations', JSON.stringify(updated));
      Alert.alert('Success', 'Location saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save location');
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'safe': return '#10B981';
      case 'danger': return '#DC2626';
      case 'resource': return '#3B82F6';
      case 'shelter': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.latitude || 28.6139,
          longitude: currentLocation?.longitude || 77.2090,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={(e) => setSelectedPoint(e.nativeEvent.coordinate)}
      >
        {/* Current Location */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="You are here"
            pinColor="blue"
          />
        )}

        {/* Saved Locations */}
        {savedLocations.map(loc => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.title}
            description={loc.description}
            pinColor={getMarkerColor(loc.type)}
          />
        ))}
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#10B981' }]}
          onPress={() => saveLocation('safe')}
        >
          <Text style={styles.btnText}>✓ Safe Spot</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#DC2626' }]}
          onPress={() => saveLocation('danger')}
        >
          <Text style={styles.btnText}>⚠ Danger</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#3B82F6' }]}
          onPress={() => saveLocation('resource')}
        >
          <Text style={styles.btnText}>💧 Resource</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#F59E0B' }]}
          onPress={() => saveLocation('shelter')}
        >
          <Text style={styles.btnText}>🏠 Shelter</Text>
        </TouchableOpacity>
      </View>

      {/* AI Navigation Assistant */}
      <TouchableOpacity style={styles.aiNav}>
        <Text style={styles.aiNavText}>Ask AI for Directions</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  aiNav: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#00D9FF',
    padding: 16,
    borderRadius: 12,
  },
  aiNavText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
});
```

---

## 🏠 Phase 6: Update Home Screen (Day 10)

Update `src/screens/HomeScreen.tsx` to add new features:

```typescript
// Add new feature cards
<View style={styles.row}>
  <FeatureCard
    title="Camera"
    subtitle="AI Vision Assistant"
    icon="camera"
    gradientColors={['#00D9FF', '#0EA5E9']}
    onPress={() => navigation.navigate('CameraAssistant')}
  />
  <FeatureCard
    title="Emergency"
    subtitle="First Aid Guide"
    icon="emergency"
    gradientColors={['#DC2626', '#B91C1C']}
    onPress={() => navigation.navigate('Emergency')}
  />
</View>
<View style={styles.row}>
  <FeatureCard
    title="Maps"
    subtitle="Offline Navigation"
    icon="map"
    gradientColors={['#10B981', '#059669']}
    onPress={() => navigation.navigate('OfflineMap')}
  />
  <View style={{ flex: 1, margin: 8 }} />
</View>
```

---

## 🧪 Phase 7: Testing & Polish (Days 11-12)

### 7.1 Test Scenarios

1. **Airplane Mode Test** (Critical!)
   - Enable airplane mode
   - Test all features
   - Verify no network requests

2. **Camera Analysis**
   - Test with various objects
   - Test in low light
   - Test with multiple objects

3. **Emergency Guide**
   - Test all scenarios
   - Test language switching
   - Test AI follow-up questions

4. **Offline Maps**
   - Save locations
   - Verify persistence
   - Test navigation assistance

### 7.2 Performance Optimization

```typescript
// In ModelService, add model preloading
export const warmupModels = async () => {
  // Pre-load models on app start
  await downloadAndLoadLLM();
  await downloadAndLoadSTT();
  await downloadAndLoadTTS();
};

// Add to App.tsx
useEffect(() => {
  if (modelService.isVoiceAgentReady) {
    // Warm up with a test inference
    RunAnywhere.generate('Hello', { maxTokens: 10 });
  }
}, [modelService.isVoiceAgentReady]);
```

---

## 📱 Phase 8: Demo Preparation (Days 13-14)

### 8.1 Create Demo Script

**Demo Flow (5-7 minutes):**

1. **Intro (30s)**
   - Show app in airplane mode
   - Highlight "100% Offline" badge

2. **Camera Assistant (2min)**
   - Point camera at plant/object
   - Show real-time analysis
   - Ask follow-up questions
   - Show multi-turn conversation

3. **Emergency Mode (1.5min)**
   - Navigate to Emergency screen
   - Select "First Aid for Burns"
   - Show step-by-step guidance
   - Switch to Hindi language

4. **Offline Maps (1.5min)**
   - Show current location
   - Mark safe spots
   - Ask AI for navigation help

5. **Voice Pipeline (1min)**
   - Demonstrate voice interaction
   - Show VAD → STT → LLM → TTS

6. **Closing (30s)**
   - Emphasize privacy (no data leaves device)
   - Show model sizes and memory usage
   - Highlight use cases

### 8.2 Create Demo Content

Prepare test scenarios:

- Sample images for camera (food, plant, medicine label)
- Emergency scenarios to demonstrate
- Map locations to save
- Voice questions to ask

---

## 🎯 Key Differentiators

1. **100% Offline** - Everything runs on-device
2. **Privacy-First** - Zero data transmission
3. **Multi modal** - Camera + Voice + Text
4. **Emergency-Ready** - First aid & survival guides
5. **Multilingual** - English + Hindi support
6. **Practical** - Real-world use cases
7. **Low Connectivity** - Works anywhere

---

## 📊 Technical Specs

### Models Used

- **LLM**: Qwen2 1.5B Q4 (~1.5GB) for reasoning
- **STT**: Whisper Tiny EN (~80MB)
- **TTS**: Piper EN US (~100MB)
- **Image Classifier**: MobileNetV3 (~10MB) [TFLite/CoreML]

### Total Storage: ~1.7GB

### Device Requirements

- iOS 15.1+ / Android 7.0+
- 3GB+ RAM recommended
- 2GB+ free storage

---

## 🚀 Next Steps

1. Run `npm install` for all dependencies
2. Implement native image classifier module
3. Create remaining screens
4. Add i18n translations
5. Test in airplane mode thoroughly
6. Record demo video
7. Prepare presentation

---

## 📞 Support

If you encounter issues:

- Check RunAnywhere docs: https://docs.runanywhere.ai
- Review error logs carefully
- Test on physical devices (not simulators)
- Ensure models are downloaded before testing

**Good luck with your hackathon! 🎉**
