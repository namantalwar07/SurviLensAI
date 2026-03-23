// import React, { useState, useRef, useCallback, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   ScrollView,
//   Alert,
//   Image,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
// import { launchImageLibrary } from 'react-native-image-picker';
// import LinearGradient from 'react-native-linear-gradient';
// import { RunAnywhere } from '@runanywhere/core';
// import { AppColors } from '../theme';
// import { useModelService } from '../services/ModelService';
// import { ModelLoaderWidget } from '../components';

// export const CameraAssistantScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const showBack = navigation.canGoBack?.() ?? false;
//   const modelService = useModelService();
//   const device = useCameraDevice('back');
//   const { hasPermission, requestPermission } = useCameraPermission();
  
//   const cameraRef = useRef<Camera>(null);
//   const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [userQuestion, setUserQuestion] = useState('');
//   const [conversation, setConversation] = useState<Array<{role: string, text: string}>>([]);
//   const [analysisMode, setAnalysisMode] = useState<'general' | 'food' | 'medical' | 'equipment'>('general');
//   const [autoModeEnabled, setAutoModeEnabled] = useState(true);
//   const [dangerPulseEnabled, setDangerPulseEnabled] = useState(false);
//   const [safetyHint, setSafetyHint] = useState('');

//   React.useEffect(() => {
//     if (!hasPermission) {
//       requestPermission();
//     }
//   }, [hasPermission, requestPermission]);

//   const capturePhoto = useCallback(async () => {
//     if (!cameraRef.current) return;
//     try {
//       const photo = await cameraRef.current.takePhoto({});
//       setCapturedPhoto(`file://${photo.path}`);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to capture photo');
//     }
//   }, []);

//   const inferAnalysisMode = async (
//     text: string
//   ): Promise<'general' | 'food' | 'medical' | 'equipment'> => {
//     const t = text.toLowerCase();
//     if (/\b(eat|food|mushroom|berry|berries|poison|drink|cook|meal|edible)\b/.test(t)) {
//       return 'food';
//     }
//     if (
//       /\b(burn|blood|hurt|pain|bite|sting|broken|bone|cpr|help|emergency|snake|wound)\b/.test(t)
//     ) {
//       return 'medical';
//     }
//     if (/\b(tool|knife|rope|tent|compass|battery|gear|lamp|stove)\b/.test(t)) {
//       return 'equipment';
//     }
//     try {
//       const r = await RunAnywhere.generate(
//         `One word only: food, medical, equipment, or general. User: "${text.slice(0, 200)}"`,
//         { maxTokens: 8, temperature: 0.05 }
//       );
//       const w = r.text.trim().toLowerCase();
//       if (w.includes('food')) return 'food';
//       if (w.includes('medical')) return 'medical';
//       if (w.includes('equipment')) return 'equipment';
//     } catch {
//       /* ignore */
//     }
//     return 'general';
//   };

//   useEffect(() => {
//     if (!dangerPulseEnabled || !modelService.isLLMLoaded || capturedPhoto) {
//       if (!dangerPulseEnabled) setSafetyHint('');
//       return;
//     }
//     let cancelled = false;
//     const tick = async () => {
//       try {
//         const r = await RunAnywhere.generate(
//           `SurviLens hazard watch (no image). One imperative line starting with "Check:" — fire/smoke, unstable ground, wildlife, weather. Max 18 words.`,
//           { maxTokens: 55, temperature: 0.55 }
//         );
//         if (cancelled) return;
//         const line = r.text.trim();
//         setSafetyHint(line);
//         if (/fire|smoke|snake|flood|cliff|collapse|electr|dog pack/i.test(line)) {
//           Alert.alert('⚠️ Hazard pulse', line);
//         }
//       } catch {
//         /* ignore */
//       }
//     };
//     void tick();
//     const id = setInterval(tick, 26000);
//     return () => {
//       cancelled = true;
//       clearInterval(id);
//     };
//   }, [dangerPulseEnabled, capturedPhoto, modelService.isLLMLoaded]);

//   const pickFromGallery = async () => {
//     const result = await launchImageLibrary({
//       mediaType: 'photo',
//       quality: 0.8,
//     });
    
//     if (result.assets && result.assets[0].uri) {
//       setCapturedPhoto(result.assets[0].uri);
//     }
//   };

//   const analyzeWithAI = async () => {
//     if (!capturedPhoto && !userQuestion.trim()) {
//       Alert.alert('Error', 'Please take a photo or ask a question');
//       return;
//     }

//     const qRaw =
//       userQuestion.trim() ||
//       'What is this? Explain in detail and help me understand how to use it or what I should know about it.';

//     if (/\b(help|save me|sos|emergency)\b/i.test(qRaw)) {
//       Alert.alert('Emergency?', 'Open SOS tab for one-tap help, share & voice.', [
//         { text: 'Not now', style: 'cancel' },
//         { text: 'Open SOS', onPress: () => navigation.navigate('EmergencyTab') },
//       ]);
//     }

//     setIsAnalyzing(true);

//     try {
//       let mode = analysisMode;
//       if (autoModeEnabled) {
//         mode = await inferAnalysisMode(qRaw);
//         setAnalysisMode(mode);
//       }

//       const modeInstruction = {
//         general: 'Explain what this is and practical usage.',
//         food: 'Focus on food safety, spoilage signs, allergens, and edible caution.',
//         medical: 'Focus on first-aid relevance and risk flags. No unsafe medical claims.',
//         equipment: 'Explain operation, setup, safety checks, and troubleshooting.',
//       }[mode];

//       const prompt = capturedPhoto
//         ? `Mode: ${mode}. ${modeInstruction}\nUser asks: "${qRaw}".\nGive practical steps and cautions, concise and actionable.`
//         : `${modeInstruction}\nQuestion: ${qRaw}`;

//       setConversation((prev) => [...prev, { role: 'user', text: qRaw }]);

//       const result = await RunAnywhere.generate(prompt, {
//         maxTokens: 300,
//         temperature: 0.65,
//       });

//       setConversation((prev) => [...prev, { role: 'assistant', text: result.text }]);
//       setUserQuestion('');
//     } catch (error) {
//       Alert.alert('Error', 'AI analysis failed. Please try again.');
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const resetCamera = () => {
//     setCapturedPhoto(null);
//     setConversation([]);
//     setUserQuestion('');
//   };

//   if (!modelService.isLLMLoaded) {
//     return (
//       <ModelLoaderWidget
//         title="AI Model Required"
//         subtitle="Download the AI brain to analyze anything"
//         icon="camera"
//         accentColor={AppColors.accentCyan}
//         isDownloading={modelService.isLLMDownloading}
//         isLoading={modelService.isLLMLoading}
//         progress={modelService.llmDownloadProgress}
//         onLoad={modelService.downloadAndLoadLLM}
//       />
//     );
//   }

//   if (!device || !hasPermission) {
//     return (
//       <LinearGradient colors={[AppColors.primaryDark, '#1a1f3a']} style={styles.permissionContainer}>
//         {showBack ? (
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//             <Text style={styles.backIcon}>←</Text>
//           </TouchableOpacity>
//         ) : null}

//         <View style={styles.permissionCard}>
//           <Text style={styles.permissionIcon}>📷</Text>
//           <Text style={styles.permissionTitle}>Camera Access Needed</Text>
//           <Text style={styles.permissionText}>
//             SurviLens needs camera to help you analyze anything
//           </Text>
//           <TouchableOpacity onPress={requestPermission}>
//             <LinearGradient colors={[AppColors.accentCyan, '#0EA5E9']} style={styles.permissionButton}>
//               <Text style={styles.permissionButtonText}>Grant Permission</Text>
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>
//     );
//   }

//   return (
//     <KeyboardAvoidingView 
//       style={styles.container} 
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//     >
//       {showBack ? (
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.floatingBackButton}>
//           <LinearGradient colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']} style={styles.backButtonCircle}>
//             <Text style={styles.backIcon}>←</Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       ) : null}

//       {/* Camera or Photo */}
//       {!capturedPhoto ? (
//         <Camera
//           ref={cameraRef}
//           style={styles.camera}
//           device={device}
//           isActive={true}
//           photo={true}
//         />
//       ) : (
//         <Image source={{ uri: capturedPhoto }} style={styles.camera} />
//       )}

//       {/* Top Banner */}
//       <View style={styles.topBanner}>
//         <LinearGradient colors={['rgba(0, 217, 255, 0.9)', 'rgba(14, 165, 233, 0.9)']} style={styles.bannerGradient}>
//           <Text style={styles.bannerText}>📸 AI Vision Assistant</Text>
//           <Text style={styles.bannerSub}>Auto mode · hazard pulse · say HELP → SOS</Text>
//         </LinearGradient>
//       </View>

//       {!capturedPhoto && (
//         <View style={styles.smartBar}>
//           <TouchableOpacity
//             style={[styles.smartChip, autoModeEnabled && styles.smartChipOn]}
//             onPress={() => setAutoModeEnabled((v) => !v)}
//           >
//             <Text style={styles.smartChipText}>🧠 Auto {autoModeEnabled ? 'ON' : 'OFF'}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.smartChip, dangerPulseEnabled && styles.smartChipWarn]}
//             onPress={() => setDangerPulseEnabled((v) => !v)}
//           >
//             <Text style={styles.smartChipText}>⚠️ Watch</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {!!safetyHint && !capturedPhoto && (
//         <View style={styles.hintBanner}>
//           <Text style={styles.hintText} numberOfLines={3}>
//             {safetyHint}
//           </Text>
//         </View>
//       )}

//       {/* Camera Controls */}
//       {!capturedPhoto && (
//         <View style={styles.cameraControls}>
//           <TouchableOpacity onPress={pickFromGallery} style={styles.galleryButton}>
//             <Text style={styles.galleryIcon}>🖼️</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity onPress={capturePhoto} style={styles.captureButtonWrapper}>
//             <LinearGradient colors={[AppColors.accentCyan, '#0EA5E9']} style={styles.captureButton}>
//               <Text style={styles.captureIcon}>📸</Text>
//             </LinearGradient>
//           </TouchableOpacity>
          
//           <View style={styles.placeholder} />
//         </View>
//       )}

//       {/* Conversation Panel */}
//       {(capturedPhoto || conversation.length > 0) && (
//         <View style={styles.conversationPanel}>
//           <ScrollView style={styles.conversationScroll} showsVerticalScrollIndicator={false}>
//             {conversation.map((msg, idx) => (
//               <View key={idx} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
//                 <Text style={styles.messageRole}>{msg.role === 'user' ? '👤 You' : '🤖 AI'}</Text>
//                 <Text style={styles.messageText}>{msg.text}</Text>
//               </View>
//             ))}
            
//             {isAnalyzing && (
//               <View style={styles.loadingBubble}>
//                 <ActivityIndicator color={AppColors.accentCyan} />
//                 <Text style={styles.loadingText}>Analyzing...</Text>
//               </View>
//             )}
//           </ScrollView>
//           <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
//   {(['general', 'food', 'medical', 'equipment'] as const).map(mode => (
//     <TouchableOpacity
//       key={mode}
//       onPress={() => setAnalysisMode(mode)}
//       style={{
//         paddingHorizontal: 10,
//         paddingVertical: 6,
//         borderRadius: 999,
//         backgroundColor: analysisMode === mode ? '#00D9FF33' : AppColors.primaryMid,
//         borderWidth: 1,
//         borderColor: analysisMode === mode ? '#00D9FF' : '#ffffff20',
//       }}
//     >
//       <Text style={{ color: analysisMode === mode ? '#00D9FF' : AppColors.textSecondary, fontSize: 12, fontWeight: '700' }}>
//         {mode.toUpperCase()}
//       </Text>
//     </TouchableOpacity>
//   ))}
// </View>
//           {/* Input Area */}
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.input}
//               placeholder="Ask anything about this..."
//               placeholderTextColor={AppColors.textMuted}
//               value={userQuestion}
//               onChangeText={setUserQuestion}
//               multiline
//             />
//             <TouchableOpacity 
//               onPress={analyzeWithAI} 
//               disabled={isAnalyzing}
//               style={styles.sendButton}
//             >
//               <LinearGradient colors={[AppColors.accentCyan, '#0EA5E9']} style={styles.sendGradient}>
//                 <Text style={styles.sendIcon}>▶</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity onPress={resetCamera} style={styles.newPhotoButton}>
//             <Text style={styles.newPhotoText}>📸 New Photo</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: AppColors.primaryDark },
//   camera: { flex: 1 },
  
//   // Back Button
//   backButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     zIndex: 10,
//     width: 44,
//     height: 44,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   floatingBackButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     zIndex: 100,
//   },
//   backButtonCircle: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backIcon: { fontSize: 24, color: '#fff', fontWeight: '700' },
  
//   // Permission Screen
//   permissionContainer: { flex: 1, justifyContent: 'center', padding: 24 },
//   permissionCard: {
//     backgroundColor: AppColors.surfaceCard,
//     borderRadius: 24,
//     padding: 32,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: AppColors.accentCyan + '33',
//   },
//   permissionIcon: { fontSize: 80, marginBottom: 24 },
//   permissionTitle: { fontSize: 24, fontWeight: '700', color: AppColors.textPrimary, marginBottom: 12 },
//   permissionText: { fontSize: 14, color: AppColors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
//   permissionButton: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
//   permissionButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },

//   // Top Banner
//   topBanner: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
//   bannerGradient: { paddingVertical: 12, paddingTop: 50, alignItems: 'center', paddingBottom: 10 },
//   bannerText: { fontSize: 18, fontWeight: '700', color: '#fff' },
//   bannerSub: { fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 4 },

//   smartBar: {
//     position: 'absolute',
//     top: 100,
//     left: 12,
//     right: 12,
//     flexDirection: 'row',
//     gap: 8,
//     zIndex: 12,
//   },
//   smartChip: {
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: 'rgba(0,0,0,0.55)',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//   },
//   smartChipOn: { borderColor: AppColors.accentCyan, backgroundColor: 'rgba(0,217,255,0.2)' },
//   smartChipWarn: { borderColor: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.2)' },
//   smartChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },

//   hintBanner: {
//     position: 'absolute',
//     top: 152,
//     left: 12,
//     right: 12,
//     zIndex: 11,
//     backgroundColor: 'rgba(127,29,29,0.88)',
//     padding: 10,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: 'rgba(252,165,165,0.5)',
//   },
//   hintText: { color: '#fff', fontSize: 12, lineHeight: 17 },

//   // Camera Controls
//   cameraControls: {
//     position: 'absolute',
//     bottom: 40,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   galleryButton: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   galleryIcon: { fontSize: 28 },
//   captureButtonWrapper: {},
//   captureButton: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: AppColors.accentCyan,
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.6,
//     shadowRadius: 20,
//     elevation: 12,
//   },
//   captureIcon: { fontSize: 36 },
//   placeholder: { width: 56 },

//   // Conversation Panel
//   conversationPanel: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     maxHeight: '65%',
//     backgroundColor: AppColors.surfaceCard,
//     borderTopLeftRadius: 32,
//     borderTopRightRadius: 32,
//     paddingTop: 20,
//   },
//   conversationScroll: {
//     maxHeight: 300,
//     paddingHorizontal: 20,
//   },
//   messageBubble: {
//     marginBottom: 12,
//     padding: 16,
//     borderRadius: 16,
//   },
//   userBubble: {
//     backgroundColor: AppColors.accentCyan + '20',
//     borderWidth: 1,
//     borderColor: AppColors.accentCyan + '40',
//     alignSelf: 'flex-end',
//     maxWidth: '80%',
//   },
//   aiBubble: {
//     backgroundColor: AppColors.primaryMid,
//     borderWidth: 1,
//     borderColor: AppColors.textMuted + '20',
//     alignSelf: 'flex-start',
//     maxWidth: '90%',
//   },
//   messageRole: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: AppColors.textMuted,
//     marginBottom: 6,
//   },
//   messageText: {
//     fontSize: 14,
//     color: AppColors.textPrimary,
//     lineHeight: 20,
//   },
//   loadingBubble: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     padding: 16,
//     backgroundColor: AppColors.primaryMid,
//     borderRadius: 16,
//     alignSelf: 'flex-start',
//   },
//   loadingText: { fontSize: 14, color: AppColors.textSecondary },

//   // Input Area
//   inputContainer: {
//     flexDirection: 'row',
//     padding: 20,
//     gap: 12,
//     alignItems: 'center',
//   },
//   input: {
//     flex: 1,
//     backgroundColor: AppColors.primaryMid,
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     fontSize: 14,
//     color: AppColors.textPrimary,
//     maxHeight: 100,
//   },
//   sendButton: {},
//   sendGradient: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sendIcon: { fontSize: 18, color: '#fff', fontWeight: '700' },
  
//   newPhotoButton: {
//     marginHorizontal: 20,
//     marginBottom: 20,
//     backgroundColor: AppColors.accentViolet + '33',
//     padding: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   newPhotoText: { fontSize: 14, fontWeight: '700', color: AppColors.accentViolet },
// });

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import { RunAnywhere } from '@runanywhere/core';
import { AppColors } from '../theme';
import { useModelService } from '../services/ModelService';
import { ModelLoaderWidget } from '../components';

export const CameraAssistantScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const showBack = navigation.canGoBack?.() ?? false;
  const modelService = useModelService();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const cameraRef = useRef<Camera>(null);
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: string; text: string }>>([]);
  const [analysisMode, setAnalysisMode] = useState<'general' | 'food' | 'medical' | 'equipment'>('general');
  const [autoModeEnabled, setAutoModeEnabled] = useState(true);
  const [dangerPulseEnabled, setDangerPulseEnabled] = useState(false);
  const [safetyHint, setSafetyHint] = useState('');

  // ── New state ──────────────────────────────────────────────────────────────
  const [torchOn, setTorchOn] = useState(false);
  const [liveWatchOn, setLiveWatchOn] = useState(false);
  const [liveStatus, setLiveStatus] = useState('');

  React.useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  // ── Torch: turn off when leaving screen ───────────────────────────────────
  useEffect(() => {
    return () => {
      setTorchOn(false);
      stopLiveWatch();
    };
  }, []);

  // ── Live Watch logic ───────────────────────────────────────────────────────
  const stopLiveWatch = useCallback(() => {
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
    setLiveWatchOn(false);
    setLiveStatus('');
  }, []);

  const runLiveTick = useCallback(async () => {
    if (!cameraRef.current || !modelService.isLLMLoaded) return;
    try {
      setLiveStatus('📸 Capturing...');
      const photo = await cameraRef.current.takePhoto({});
      const uri = `file://${photo.path}`;
      setLiveStatus('🧠 Analyzing...');

      const result = await RunAnywhere.generate(
        `Live hazard watch. You see a real-world scene. Identify any immediate dangers, notable objects, or survival-relevant info. Be concise — max 2 sentences.`,
        { maxTokens: 120, temperature: 0.5 }
      );

      const text = result.text.trim();
      setLiveStatus('');

      setConversation(prev =>
        [{ role: 'assistant', text: `🔴 Live: ${text}` }, ...prev].slice(0, 30)
      );

      // Auto-alert on critical keywords
      if (/fire|smoke|flood|cliff|collapse|snake|threat|danger|emergency/i.test(text)) {
        Alert.alert('⚠️ Live Hazard Detected', text, [
          { text: 'Dismiss' },
          { text: 'Open SOS', onPress: () => navigation.navigate('EmergencyTab') },
        ]);
      }
    } catch {
      setLiveStatus('');
    }
  }, [modelService.isLLMLoaded, navigation]);

  const toggleLiveWatch = useCallback(() => {
    if (liveWatchOn) {
      stopLiveWatch();
    } else {
      if (capturedPhoto) {
        setCapturedPhoto(null);
        setConversation([]);
      }
      setLiveWatchOn(true);
      runLiveTick(); // immediate first tick
      liveIntervalRef.current = setInterval(runLiveTick, 10000);
    }
  }, [liveWatchOn, capturedPhoto, runLiveTick, stopLiveWatch]);

  // Stop live watch when photo is captured
  useEffect(() => {
    if (capturedPhoto && liveWatchOn) stopLiveWatch();
  }, [capturedPhoto, liveWatchOn, stopLiveWatch]);

  // ── Existing logic (unchanged) ─────────────────────────────────────────────
  const capturePhoto = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePhoto({});
      setCapturedPhoto(`file://${photo.path}`);
    } catch {
      Alert.alert('Error', 'Failed to capture photo');
    }
  }, []);

  const inferAnalysisMode = async (text: string): Promise<'general' | 'food' | 'medical' | 'equipment'> => {
    const t = text.toLowerCase();
    if (/\b(eat|food|mushroom|berry|berries|poison|drink|cook|meal|edible)\b/.test(t)) return 'food';
    if (/\b(burn|blood|hurt|pain|bite|sting|broken|bone|cpr|help|emergency|snake|wound)\b/.test(t)) return 'medical';
    if (/\b(tool|knife|rope|tent|compass|battery|gear|lamp|stove)\b/.test(t)) return 'equipment';
    try {
      const r = await RunAnywhere.generate(
        `One word only: food, medical, equipment, or general. User: "${text.slice(0, 200)}"`,
        { maxTokens: 8, temperature: 0.05 }
      );
      const w = r.text.trim().toLowerCase();
      if (w.includes('food')) return 'food';
      if (w.includes('medical')) return 'medical';
      if (w.includes('equipment')) return 'equipment';
    } catch { /* ignore */ }
    return 'general';
  };

  useEffect(() => {
    if (!dangerPulseEnabled || !modelService.isLLMLoaded || capturedPhoto) {
      if (!dangerPulseEnabled) setSafetyHint('');
      return;
    }
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await RunAnywhere.generate(
          `SurviLens hazard watch (no image). One imperative line starting with "Check:" — fire/smoke, unstable ground, wildlife, weather. Max 18 words.`,
          { maxTokens: 55, temperature: 0.55 }
        );
        if (cancelled) return;
        const line = r.text.trim();
        setSafetyHint(line);
        if (/fire|smoke|snake|flood|cliff|collapse|electr|dog pack/i.test(line)) {
          Alert.alert('⚠️ Hazard pulse', line);
        }
      } catch { /* ignore */ }
    };
    void tick();
    const id = setInterval(tick, 26000);
    return () => { cancelled = true; clearInterval(id); };
  }, [dangerPulseEnabled, capturedPhoto, modelService.isLLMLoaded]);

  const pickFromGallery = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.assets && result.assets[0].uri) setCapturedPhoto(result.assets[0].uri);
  };

  const analyzeWithAI = async () => {
    if (!capturedPhoto && !userQuestion.trim()) {
      Alert.alert('Error', 'Please take a photo or ask a question');
      return;
    }
    const qRaw = userQuestion.trim() || 'What is this? Explain in detail.';
    if (/\b(help|save me|sos|emergency)\b/i.test(qRaw)) {
      Alert.alert('Emergency?', 'Open SOS tab for one-tap help.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open SOS', onPress: () => navigation.navigate('EmergencyTab') },
      ]);
    }
    setIsAnalyzing(true);
    try {
      let mode = analysisMode;
      if (autoModeEnabled) { mode = await inferAnalysisMode(qRaw); setAnalysisMode(mode); }
      const modeInstruction = {
        general: 'Explain what this is and practical usage.',
        food: 'Focus on food safety, spoilage signs, allergens, and edible caution.',
        medical: 'Focus on first-aid relevance and risk flags. No unsafe medical claims.',
        equipment: 'Explain operation, setup, safety checks, and troubleshooting.',
      }[mode];
      const prompt = capturedPhoto
        ? `Mode: ${mode}. ${modeInstruction}\nUser asks: "${qRaw}".\nGive practical steps and cautions, concise and actionable.`
        : `${modeInstruction}\nQuestion: ${qRaw}`;
      setConversation(prev => [...prev, { role: 'user', text: qRaw }]);
      const result = await RunAnywhere.generate(prompt, { maxTokens: 300, temperature: 0.65 });
      setConversation(prev => [...prev, { role: 'assistant', text: result.text }]);
      setUserQuestion('');
    } catch {
      Alert.alert('Error', 'AI analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetCamera = () => {
    setCapturedPhoto(null);
    setConversation([]);
    setUserQuestion('');
    stopLiveWatch();
  };

  if (!modelService.isLLMLoaded) {
    return (
      <ModelLoaderWidget
        title="AI Model Required"
        subtitle="Download the AI brain to analyze anything"
        icon="camera"
        accentColor={AppColors.accentCyan}
        isDownloading={modelService.isLLMDownloading}
        isLoading={modelService.isLLMLoading}
        progress={modelService.llmDownloadProgress}
        onLoad={modelService.downloadAndLoadLLM}
      />
    );
  }

  if (!device || !hasPermission) {
    return (
      <LinearGradient colors={[AppColors.primaryDark, '#1a1f3a']} style={styles.permissionContainer}>
        {showBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>SurviLens needs camera to help you analyze anything</Text>
          <TouchableOpacity onPress={requestPermission}>
            <LinearGradient colors={[AppColors.accentCyan, '#0EA5E9']} style={styles.permissionButton}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {showBack && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.floatingBackButton}>
          <LinearGradient colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']} style={styles.backButtonCircle}>
            <Text style={styles.backIcon}>←</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Camera or Photo */}
      {!capturedPhoto ? (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={true}
          photo={true}
          torch={torchOn ? 'on' : 'off'}
        />
      ) : (
        <Image source={{ uri: capturedPhoto }} style={styles.camera} />
      )}

      {/* Top Banner */}
      <View style={styles.topBanner}>
        <LinearGradient colors={['rgba(0,217,255,0.9)', 'rgba(14,165,233,0.9)']} style={styles.bannerGradient}>
          <Text style={styles.bannerText}>
            📸 AI Vision Assistant
            {liveWatchOn ? '  🔴 LIVE' : ''}
          </Text>
          <Text style={styles.bannerSub}>
            {liveStatus || 'Auto mode · hazard pulse · say HELP → SOS'}
          </Text>
        </LinearGradient>
      </View>

      {/* Smart bar */}
      {!capturedPhoto && (
        <View style={styles.smartBar}>
          <TouchableOpacity
            style={[styles.smartChip, autoModeEnabled && styles.smartChipOn]}
            onPress={() => setAutoModeEnabled(v => !v)}
          >
            <Text style={styles.smartChipText}>🧠 Auto {autoModeEnabled ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smartChip, dangerPulseEnabled && styles.smartChipWarn]}
            onPress={() => setDangerPulseEnabled(v => !v)}
          >
            <Text style={styles.smartChipText}>⚠️ Watch</Text>
          </TouchableOpacity>

          {/* 🔦 Torch button */}
          <TouchableOpacity
            style={[styles.smartChip, torchOn && styles.smartChipTorch]}
            onPress={() => setTorchOn(v => !v)}
          >
            <Text style={styles.smartChipText}>🔦 {torchOn ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>

          {/* 🔴 Live Watch button */}
          <TouchableOpacity
            style={[styles.smartChip, liveWatchOn && styles.smartChipLive]}
            onPress={toggleLiveWatch}
          >
            <Text style={styles.smartChipText}>{liveWatchOn ? '⏹ Stop' : '🔴 Live'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!!safetyHint && !capturedPhoto && (
        <View style={styles.hintBanner}>
          <Text style={styles.hintText} numberOfLines={3}>{safetyHint}</Text>
        </View>
      )}

      {/* Camera Controls */}
      {!capturedPhoto && !liveWatchOn && (
        <View style={styles.cameraControls}>
          <TouchableOpacity onPress={pickFromGallery} style={styles.galleryButton}>
            <Text style={styles.galleryIcon}>🖼️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={capturePhoto} style={styles.captureButtonWrapper}>
            <LinearGradient colors={[AppColors.accentCyan, '#0EA5E9']} style={styles.captureButton}>
              <Text style={styles.captureIcon}>📸</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.placeholder} />
        </View>
      )}

      {/* Live watch bottom indicator */}
      {liveWatchOn && (
        <View style={styles.liveBar}>
          <ActivityIndicator color="#ef4444" size="small" />
          <Text style={styles.liveTxt}>  Analyzing every 10s · tap Stop to end</Text>
        </View>
      )}

      {/* Conversation Panel */}
      {(capturedPhoto || conversation.length > 0) && (
        <View style={styles.conversationPanel}>
          <ScrollView style={styles.conversationScroll} showsVerticalScrollIndicator={false}>
            {conversation.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                  msg.text.startsWith('🔴 Live:') && styles.liveBubble,
                ]}
              >
                <Text style={styles.messageRole}>
                  {msg.role === 'user' ? '👤 You' : msg.text.startsWith('🔴 Live:') ? '🔴 Live AI' : '🤖 AI'}
                </Text>
                <Text style={styles.messageText}>{msg.text.replace('🔴 Live: ', '')}</Text>
              </View>
            ))}
            {isAnalyzing && (
              <View style={styles.loadingBubble}>
                <ActivityIndicator color={AppColors.accentCyan} />
                <Text style={styles.loadingText}>Analyzing...</Text>
              </View>
            )}
          </ScrollView>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10, paddingHorizontal: 20 }}>
            {(['general', 'food', 'medical', 'equipment'] as const).map(mode => (
              <TouchableOpacity
                key={mode}
                onPress={() => setAnalysisMode(mode)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: analysisMode === mode ? '#00D9FF33' : AppColors.primaryMid,
                  borderWidth: 1,
                  borderColor: analysisMode === mode ? '#00D9FF' : '#ffffff20',
                }}
              >
                <Text style={{ color: analysisMode === mode ? '#00D9FF' : AppColors.textSecondary, fontSize: 12, fontWeight: '700' }}>
                  {mode.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask anything about this..."
              placeholderTextColor={AppColors.textMuted}
              value={userQuestion}
              onChangeText={setUserQuestion}
              multiline
            />
            <TouchableOpacity onPress={analyzeWithAI} disabled={isAnalyzing} style={styles.sendButton}>
              <LinearGradient colors={[AppColors.accentCyan, '#0EA5E9']} style={styles.sendGradient}>
                <Text style={styles.sendIcon}>▶</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={resetCamera} style={styles.newPhotoButton}>
            <Text style={styles.newPhotoText}>📸 New Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.primaryDark },
  camera: { flex: 1 },
  backButton: {
    position: 'absolute', top: 50, left: 20, zIndex: 10,
    width: 44, height: 44, backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
  },
  floatingBackButton: { position: 'absolute', top: 50, left: 20, zIndex: 100 },
  backButtonCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: '#fff', fontWeight: '700' },
  permissionContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  permissionCard: {
    backgroundColor: AppColors.surfaceCard, borderRadius: 24,
    padding: 32, alignItems: 'center', borderWidth: 1,
    borderColor: AppColors.accentCyan + '33',
  },
  permissionIcon: { fontSize: 80, marginBottom: 24 },
  permissionTitle: { fontSize: 24, fontWeight: '700', color: AppColors.textPrimary, marginBottom: 12 },
  permissionText: { fontSize: 14, color: AppColors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  permissionButton: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  permissionButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  topBanner: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  bannerGradient: { paddingVertical: 12, paddingTop: 50, alignItems: 'center', paddingBottom: 10 },
  bannerText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  bannerSub: { fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  smartBar: {
    position: 'absolute', top: 100, left: 12, right: 12,
    flexDirection: 'row', gap: 8, zIndex: 12, flexWrap: 'wrap',
  },
  smartChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  smartChipOn: { borderColor: AppColors.accentCyan, backgroundColor: 'rgba(0,217,255,0.2)' },
  smartChipWarn: { borderColor: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.2)' },
  smartChipTorch: { borderColor: '#facc15', backgroundColor: 'rgba(250,204,21,0.25)' },
  smartChipLive: { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.2)' },
  smartChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  hintBanner: {
    position: 'absolute', top: 152, left: 12, right: 12, zIndex: 11,
    backgroundColor: 'rgba(127,29,29,0.88)', padding: 10, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(252,165,165,0.5)',
  },
  hintText: { color: '#fff', fontSize: 12, lineHeight: 17 },
  cameraControls: {
    position: 'absolute', bottom: 40, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'center', paddingHorizontal: 20,
  },
  galleryButton: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center',
  },
  galleryIcon: { fontSize: 28 },
  captureButtonWrapper: {},
  captureButton: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: AppColors.accentCyan, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 12,
  },
  captureIcon: { fontSize: 36 },
  placeholder: { width: 56 },
  liveBar: {
    position: 'absolute', bottom: 40, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.15)', padding: 14, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)',
  },
  liveTxt: { color: '#fca5a5', fontSize: 13, fontWeight: '600' },
  conversationPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    maxHeight: '65%', backgroundColor: AppColors.surfaceCard,
    borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 20,
  },
  conversationScroll: { maxHeight: 300, paddingHorizontal: 20 },
  messageBubble: { marginBottom: 12, padding: 16, borderRadius: 16 },
  userBubble: {
    backgroundColor: AppColors.accentCyan + '20', borderWidth: 1,
    borderColor: AppColors.accentCyan + '40', alignSelf: 'flex-end', maxWidth: '80%',
  },
  aiBubble: {
    backgroundColor: AppColors.primaryMid, borderWidth: 1,
    borderColor: AppColors.textMuted + '20', alignSelf: 'flex-start', maxWidth: '90%',
  },
  liveBubble: {
    borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.08)',
  },
  messageRole: { fontSize: 11, fontWeight: '700', color: AppColors.textMuted, marginBottom: 6 },
  messageText: { fontSize: 14, color: AppColors.textPrimary, lineHeight: 20 },
  loadingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
    backgroundColor: AppColors.primaryMid, borderRadius: 16, alignSelf: 'flex-start',
  },
  loadingText: { fontSize: 14, color: AppColors.textSecondary },
  inputContainer: { flexDirection: 'row', padding: 20, gap: 12, alignItems: 'center' },
  input: {
    flex: 1, backgroundColor: AppColors.primaryMid, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 14,
    color: AppColors.textPrimary, maxHeight: 100,
  },
  sendButton: {},
  sendGradient: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendIcon: { fontSize: 18, color: '#fff', fontWeight: '700' },
  newPhotoButton: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: AppColors.accentViolet + '33',
    padding: 16, borderRadius: 12, alignItems: 'center',
  },
  newPhotoText: { fontSize: 14, fontWeight: '700', color: AppColors.accentViolet },
});