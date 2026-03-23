// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   StatusBar,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import { AppColors } from '../theme';

// const SURVIVAL_CATEGORIES = [
//   {
//     id: 'water',
//     title: 'Water',
//     icon: '💧',
//     color: '#3B82F6',
//     tips: [
//       'Priority #1: You can survive 3 days without water',
//       'Look for flowing water sources (streams, rivers)',
//       'Collect morning dew with cloth or leaves',
//       'Boil water for 1 minute to purify (3 minutes at altitude)',
//       'Use clear plastic bottle + sunlight (SODIS method)',
//       'Avoid stagnant water (mosquito breeding)',
//     ],
//   },
//   {
//     id: 'shelter',
//     title: 'Shelter',
//     icon: '🏕️',
//     color: '#F59E0B',
//     tips: [
//       'Find natural shelter: caves, overhangs, thick trees',
//       'Build lean-to: angle branches against tree',
//       'Insulate floor with leaves/pine needles',
//       'Stay dry: waterproof roof with large leaves',
//       'Wind protection: back of shelter faces wind',
//       'Signal location: bright markers near shelter',
//     ],
//   },
//   {
//     id: 'fire',
//     title: 'Fire',
//     icon: '🔥',
//     color: '#DC2626',
//     tips: [
//       'Gather: Tinder (dry grass), Kindling (small sticks), Fuel (logs)',
//       'Fire triangle: Heat + Fuel + Oxygen',
//       'Friction method: bow drill or hand drill',
//       'Flint and steel: strike at 30-degree angle',
//       'Magnifying glass: focus sun on tinder',
//       'Keep fire small and contained',
//     ],
//   },
//   {
//     id: 'food',
//     title: 'Food',
//     icon: '🍎',
//     color: '#10B981',
//     tips: [
//       'Rule: Can survive 3 weeks without food',
//       'Edible plants: Know before you eat (poison test)',
//       'Berries: Red = caution, Blue/Black = usually safe',
//       'Insects: High protein (avoid bright colors)',
//       'Fish: easiest to catch and prepare',
//       'Never eat if unsure - better safe than sorry',
//     ],
//   },
//   {
//     id: 'signals',
//     title: 'Signaling',
//     icon: '🆘',
//     color: '#8B5CF6',
//     tips: [
//       'SOS: 3 short, 3 long, 3 short (... --- ...)',
//       'Fire: 3 fires in triangle (universal distress)',
//       'Mirror: Flash towards aircraft/rescuers',
//       'Ground signals: Large X means "need help"',
//       'Bright colors: Orange, red visible from air',
//       'Whistle: 3 blasts = distress signal',
//     ],
//   },
//   {
//     id: 'navigation',
//     title: 'Navigation',
//     icon: '🧭',
//     color: '#EC4899',
//     tips: [
//       'Sun rises East, sets West',
//       'North Star (Polaris): Follow Big Dipper',
//       'Watch method: Point hour hand at sun, halfway to 12 is South',
//       'Follow water downstream (leads to civilization)',
//       'Tree moss: Usually grows on North side',
//       'Stay put if lost - easier to be found',
//     ],
//   },
// ];

// export const SurvivalGuideScreen: React.FC = () => {
//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   const toggleCategory = (id: string) => {
//     setExpandedId(expandedId === id ? null : id);
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#F59E0B" />
      
//       {/* Header */}
//       <LinearGradient
//       colors={['#F59E0B', '#D97706']}
//       style={styles.header}
//     >
//       <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//         <Text style={styles.backIcon}>←</Text>
//       </TouchableOpacity>
//       <View style={styles.headerContent}>
//         <Text style={styles.headerIcon}>📚</Text>
//         <View>
//           <Text style={styles.headerTitle}>SURVIVAL GUIDE</Text>
//           <Text style={styles.headerSubtitle}>Essential Tips & Tricks</Text>
//         </View>
//       </View>
//     </LinearGradient>


//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         {/* Rule of 3s */}
//         <View style={styles.ruleCard}>
//           <Text style={styles.ruleTitle}>⚡ The Rule of 3s</Text>
//           <Text style={styles.ruleText}>
//             🕐 3 minutes without air{'\n'}
//             🕒 3 hours without shelter (harsh weather){'\n'}
//             📅 3 days without water{'\n'}
//             📆 3 weeks without food
//           </Text>
//         </View>

//         {/* Categories */}
//         {SURVIVAL_CATEGORIES.map(category => (
//           <View key={category.id} style={styles.categoryCard}>
//             <TouchableOpacity
//               onPress={() => toggleCategory(category.id)}
//               activeOpacity={0.8}
//             >
//               <LinearGradient
//                 colors={[category.color, category.color + 'DD']}
//                 style={styles.categoryHeader}
//               >
//                 <View style={styles.categoryHeaderLeft}>
//                   <Text style={styles.categoryIcon}>{category.icon}</Text>
//                   <Text style={styles.categoryTitle}>{category.title}</Text>
//                 </View>
//                 <Text style={styles.expandIcon}>
//                   {expandedId === category.id ? '▲' : '▼'}
//                 </Text>
//               </LinearGradient>
//             </TouchableOpacity>

//             {expandedId === category.id && (
//               <View style={styles.tipsContainer}>
//                 {category.tips.map((tip, index) => (
//                   <View key={index} style={styles.tipItem}>
//                     <View style={styles.tipBullet}>
//                       <Text style={styles.tipBulletText}>•</Text>
//                     </View>
//                     <Text style={styles.tipText}>{tip}</Text>
//                   </View>
//                 ))}
//               </View>
//             )}
//           </View>
//         ))}

//         {/* Warning */}
//         <View style={styles.warningCard}>
//           <Text style={styles.warningIcon}>⚠️</Text>
//           <Text style={styles.warningTitle}>Important Disclaimer</Text>
//           <Text style={styles.warningText}>
//             This guide provides general survival information. Always prioritize professional training, 
//             proper equipment, and emergency services. Stay safe and prepared!
//           </Text>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: AppColors.primaryDark,
//   },
//   header: {
//     paddingTop: 50,
//     paddingBottom: 24,
//     paddingHorizontal: 24,
//     alignItems: 'center',
//   },
//   headerIcon: {
//     fontSize: 48,
//     marginBottom: 8,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: '#fff',
//     letterSpacing: 1,
//   },
//   headerSubtitle: {
//     fontSize: 12,
//     color: '#fff',
//     opacity: 0.9,
//     marginTop: 4,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   ruleCard: {
//     margin: 20,
//     backgroundColor: AppColors.surfaceCard,
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 2,
//     borderColor: '#F59E0B',
//   },
//   ruleTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#F59E0B',
//     marginBottom: 12,
//   },
//   ruleText: {
//     fontSize: 14,
//     color: AppColors.textPrimary,
//     lineHeight: 24,
//   },
//   categoryCard: {
//     marginHorizontal: 20,
//     marginBottom: 16,
//     borderRadius: 16,
//     overflow: 'hidden',
//     backgroundColor: AppColors.surfaceCard,
//   },
//   categoryHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//   },
//   categoryHeaderLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   categoryIcon: {
//     fontSize: 28,
//   },
//   categoryTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   expandIcon: {
//     fontSize: 16,
//     color: '#fff',
//     fontWeight: '700',
//   },
//   tipsContainer: {
//     padding: 20,
//     paddingTop: 12,
//   },
//   tipItem: {
//     flexDirection: 'row',
//     marginBottom: 12,
//     gap: 8,
//   },
//   tipBullet: {
//     width: 20,
//     alignItems: 'center',
//   },
//   tipBulletText: {
//     fontSize: 18,
//     color: AppColors.textPrimary,
//   },
//   tipText: {
//     flex: 1,
//     fontSize: 14,
//     color: AppColors.textPrimary,
//     lineHeight: 20,
//   },
//   warningCard: {
//     margin: 20,
//     backgroundColor: 'rgba(220, 38, 38, 0.1)',
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#DC2626',
//   },
//   warningIcon: {
//     fontSize: 32,
//     marginBottom: 8,
//   },
//   warningTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#DC2626',
//     marginBottom: 8,
//   },
//   warningText: {
//     fontSize: 13,
//     color: AppColors.textSecondary,
//     lineHeight: 20,
//   },
// });

import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RunAnywhere, VoiceSessionEvent, VoiceSessionHandle } from '@runanywhere/core';
import { AppColors } from '../theme';
import { useLocation } from '../hooks';
import { useModelService } from '../services/ModelService';
import { ModelLoaderWidget } from '../components';

const MODEL_IDS = {
  llm: 'lfm2-350m-q8_0',
  stt: 'sherpa-onnx-whisper-tiny.en',
  tts: 'vits-piper-en_US-lessac-medium',
};

const SCENARIO_PRESETS = [
  'Lost in forest at sunset',
  'Stuck during heavy rain with low battery',
  'Mild injury while trekking',
  'Need safe water source quickly',
  'Night travel in unknown rural area',
  'Possible snake zone while walking',
];

const CONSTRAINTS = [
  'No internet',
  'Low phone battery',
  'Alone',
  'Limited water',
  'Injured',
  'Cold weather',
  'Hot weather',
  'No flashlight',
];

const SYSTEM_PROMPT = `
You are SurviLens Survival AI, an on-device emergency and survival guide.
You must be practical, safe, and concise.
Never give reckless advice. Prioritize life, shelter, water, and signaling.

Output format exactly:

1) Immediate Actions (0-10 min)
- bullet points

2) Next 1 Hour Plan
- bullet points

3) Next 24 Hours Plan
- bullet points

4) Risks To Avoid
- bullet points

5) Compact Checklist
- checkbox style list with [ ] items

If location/weather is unknown, say assumptions clearly.
`;

export const SurvivalGuideScreen: React.FC = () => {
  const modelService = useModelService();
  const { location } = useLocation();

  const [scenario, setScenario] = useState('');
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>([]);
  const [extraContext, setExtraContext] = useState('');
  const [plan, setPlan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Ready');
  const [liveTranscript, setLiveTranscript] = useState('');

  const sessionRef = useRef<VoiceSessionHandle | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup voice session on unmount
      if (sessionRef.current) {
        sessionRef.current.stop().catch(() => null);
        sessionRef.current = null;
      }
    };
  }, []);

  const locationContext = useMemo(() => {
    if (!location) return 'Unknown location';
    return `Lat ${location.latitude.toFixed(5)}, Lon ${location.longitude.toFixed(5)}, accuracy ${location.accuracy?.toFixed(0) ?? 'unknown'}m`;
  }, [location]);

  const toggleConstraint = (item: string) => {
    setSelectedConstraints(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const buildPrompt = () => {
    const constraintsText =
      selectedConstraints.length > 0 ? selectedConstraints.join(', ') : 'None specified';

    return `
${SYSTEM_PROMPT}

Scenario:
${scenario || 'General survival planning requested.'}

Constraints:
${constraintsText}

Extra context:
${extraContext || 'None'}

Location:
${locationContext}
`;
  };

  const generatePlan = async () => {
    const trimmedScenario = scenario.trim();
    if (!trimmedScenario) {
      Alert.alert('Add Scenario', 'Please describe your situation first.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await RunAnywhere.generate(buildPrompt(), {
        maxTokens: 520,
        temperature: 0.35,
      });
      setPlan(result.text);
    } catch (error) {
      console.error('Survival generation error:', error);
      Alert.alert('Generation Failed', 'Could not generate survival plan. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startVoiceCoach = async () => {
    if (!modelService.isVoiceAgentReady) {
      Alert.alert(
        'Voice Models Required',
        'Voice Coach needs LLM + STT + TTS. Download all models now?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: () => modelService.downloadAndLoadAllModels(),
          },
        ]
      );
      return;
    }

    if (isVoiceMode) return;

    setVoiceStatus('Starting...');
    setIsVoiceMode(true);

    try {
      sessionRef.current = await RunAnywhere.startVoiceSession(
        {
          agentConfig: {
            llmModelId: MODEL_IDS.llm,
            sttModelId: MODEL_IDS.stt,
            ttsModelId: MODEL_IDS.tts,
            systemPrompt: SYSTEM_PROMPT,
            generationOptions: {
              maxTokens: 260,
              temperature: 0.4,
            },
          },
          enableVAD: true,
          vadSensitivity: 0.55,
          speechTimeout: 2500,
        },
        (event: VoiceSessionEvent) => {
          if (event.type === 'sessionStarted') setVoiceStatus('Session started');
          if (event.type === 'listeningStarted') setVoiceStatus('Listening...');
          if (event.type === 'speechDetected') setVoiceStatus('Speech detected...');
          if (event.type === 'transcribing') setVoiceStatus('Transcribing...');
          if (event.type === 'generating') setVoiceStatus('Generating plan...');
          if (event.type === 'synthesizing') setVoiceStatus('Synthesizing...');
          if (event.type === 'speaking') setVoiceStatus('Speaking...');
          if (event.type === 'turnComplete') setVoiceStatus('Listening...');

          if (event.type === 'transcriptionComplete' && event.data?.transcript) {
            const transcript = event.data.transcript.trim();
            setLiveTranscript(transcript);
            setScenario(transcript);
          }

          if (event.type === 'generationComplete' && event.data?.response) {
            setPlan(event.data.response);
          }

          if (event.type === 'error') {
            setVoiceStatus(`Error: ${event.data?.error || 'Unknown'}`);
          }
        }
      );
    } catch (error) {
      console.error('Voice coach start error:', error);
      setIsVoiceMode(false);
      setVoiceStatus('Failed to start');
      Alert.alert('Voice Coach Error', 'Could not start voice coach.');
    }
  };

  const stopVoiceCoach = async () => {
    try {
      if (sessionRef.current) {
        await sessionRef.current.stop();
        sessionRef.current = null;
      }
    } catch (error) {
      console.error('Voice coach stop error:', error);
    } finally {
      setIsVoiceMode(false);
      setVoiceStatus('Ready');
    }
  };

  const clearAll = () => {
    setScenario('');
    setSelectedConstraints([]);
    setExtraContext('');
    setPlan('');
    setLiveTranscript('');
  };

  if (!modelService.isLLMLoaded) {
    return (
      <ModelLoaderWidget
        title="Survival AI Model Required"
        subtitle="Load the on-device LLM to generate emergency survival plans"
        icon="chat"
        accentColor={AppColors.accentOrange}
        isDownloading={modelService.isLLMDownloading}
        isLoading={modelService.isLLMLoading}
        progress={modelService.llmDownloadProgress}
        onLoad={modelService.downloadAndLoadLLM}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primaryDark} />

      <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.header}>
        <Text style={styles.headerTitle}>Survival AI Guide</Text>
        <Text style={styles.headerSubtitle}>LLM + Voice (STT/TTS/VAD) • On-device</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>Scenario</Text>
          <TextInput
            value={scenario}
            onChangeText={setScenario}
            placeholder="Describe your exact situation..."
            placeholderTextColor={AppColors.textMuted}
            multiline
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Quick Presets</Text>
          <View style={styles.wrapRow}>
            {SCENARIO_PRESETS.map(item => (
              <TouchableOpacity key={item} onPress={() => setScenario(item)} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Constraints</Text>
          <View style={styles.wrapRow}>
            {CONSTRAINTS.map(item => {
              const active = selectedConstraints.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => toggleConstraint(item)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>Extra Context (optional)</Text>
          <TextInput
            value={extraContext}
            onChangeText={setExtraContext}
            placeholder="Weather, terrain, supplies, injuries..."
            placeholderTextColor={AppColors.textMuted}
            multiline
            style={styles.input}
          />

          <Text style={styles.locationText}>Location context: {locationContext}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={generatePlan}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Generate Survival Plan</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={clearAll}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.voiceRow}>
            <Text style={styles.label}>Hands-free Voice Coach</Text>
            <TouchableOpacity
              style={[styles.voiceBtn, isVoiceMode ? styles.voiceBtnStop : styles.voiceBtnStart]}
              onPress={isVoiceMode ? stopVoiceCoach : startVoiceCoach}
            >
              <Text style={styles.voiceBtnText}>{isVoiceMode ? 'Stop' : 'Start'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.voiceStatus}>Status: {voiceStatus}</Text>
          {liveTranscript ? <Text style={styles.transcript}>Heard: "{liveTranscript}"</Text> : null}
          <Text style={styles.voiceHint}>
            Voice coach uses VAD to detect speech, STT to transcribe, LLM to reason, and TTS to speak response.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>AI Plan Output</Text>
          {plan ? (
            <Text style={styles.planText}>{plan}</Text>
          ) : (
            <Text style={styles.placeholder}>
              Your generated action plan will appear here.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.primaryDark },
  header: { paddingTop: 52, paddingBottom: 18, paddingHorizontal: 20 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  headerSubtitle: { color: 'rgba(255,255,255,0.9)', marginTop: 4, fontSize: 12 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },

  card: {
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.textMuted + '26',
  },

  label: { color: AppColors.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: {
    backgroundColor: AppColors.primaryMid,
    borderRadius: 12,
    color: AppColors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 72,
    textAlignVertical: 'top',
    fontSize: 14,
  },

  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: AppColors.primaryMid,
    borderWidth: 1,
    borderColor: AppColors.textMuted + '44',
  },
  chipActive: {
    backgroundColor: AppColors.accentOrange + '22',
    borderColor: AppColors.accentOrange,
  },
  chipText: { color: AppColors.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: AppColors.accentOrange },

  locationText: { marginTop: 10, color: AppColors.textMuted, fontSize: 12 },

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 46,
  },
  primaryButton: { flex: 1, backgroundColor: AppColors.accentOrange },
  secondaryButton: { width: 96, backgroundColor: AppColors.surfaceElevated },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  voiceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  voiceBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  voiceBtnStart: { backgroundColor: AppColors.accentGreen },
  voiceBtnStop: { backgroundColor: AppColors.error },
  voiceBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  voiceStatus: { marginTop: 10, color: AppColors.textSecondary, fontSize: 13 },
  transcript: { marginTop: 6, color: AppColors.textPrimary, fontSize: 13 },
  voiceHint: { marginTop: 8, color: AppColors.textMuted, fontSize: 12, lineHeight: 18 },

  planText: { color: AppColors.textPrimary, lineHeight: 22, fontSize: 14 },
  placeholder: { color: AppColors.textMuted, fontSize: 13 },
});