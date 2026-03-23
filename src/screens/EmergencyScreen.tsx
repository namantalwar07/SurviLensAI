import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Linking,
  Share,
  Vibration,
  Platform,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useCameraPermission } from 'react-native-vision-camera';
import { AppColors } from '../theme';
import { EMERGENCY_SCENARIOS, EMERGENCY_CONTACTS } from '../utils/emergencyTemplates';
import { RunAnywhere } from '@runanywhere/core';
import { useLocation } from '../hooks';
import { useModelService } from '../services/ModelService';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { SosTorchBlink } from '../components';

const QUICK_ACTIONS = ['cuts', 'burns', 'choking', 'fracture', 'cpr', 'snakebite'] as const;

type EmergencyNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'EmergencyTab'>,
  StackNavigationProp<RootStackParamList>
>;

export const EmergencyScreen: React.FC = () => {
  const navigation = useNavigation<EmergencyNav>();
  const modelService = useModelService();
  const { location, getCurrentLocation } = useLocation();
  const { hasPermission, requestPermission } = useCameraPermission();

  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [coachInput, setCoachInput] = useState('');
  const [coachReply, setCoachReply] = useState('');
  const [isCoaching, setIsCoaching] = useState(false);
  const [torchBlink, setTorchBlink] = useState(false);
  const [sosBusy, setSosBusy] = useState(false);

  const askEmergencyCoach = async () => {
    if (!coachInput.trim()) return;
    setIsCoaching(true);
    try {
      const res = await RunAnywhere.generate(
        `You are an emergency first-aid assistant.
Give concise life-safe steps.
User situation: ${coachInput}
Format:
1) Immediate lifesaving actions
2) What NOT to do
3) When to call emergency
`,
        { maxTokens: 220, temperature: 0.25 }
      );
      setCoachReply(res.text);
    } finally {
      setIsCoaching(false);
    }
  };

  const stopSosEffects = () => {
    setTorchBlink(false);
    if (Platform.OS === 'android') {
      Vibration.cancel();
    }
  };

  const runSOS = () => {
    Alert.alert(
      '🚨 SOS',
      'Shares your location + on-device AI summary, starts SOS vibration, optional flashlight blink, then offers to dial emergency.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => void executeSOS(),
        },
      ]
    );
  };

  const executeSOS = async () => {
    setSosBusy(true);
    try {
      let loc = location;
      if (!loc) {
        loc = await getCurrentLocation();
      }
      const coordStr = loc
        ? `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`
        : 'Location unavailable — say where you are when calling.';

      let summary =
        'SurviLens SOS: user needs help. Stay calm. Call local emergency services.';
      try {
        if (modelService.isLLMLoaded) {
          const r = await RunAnywhere.generate(
            `SOS triggered. Coordinates: ${coordStr}.
Write max 4 short lines for SMS/share: what to tell dispatcher, stay-safe tip, and India helpline hint (112 unified / 108 disaster). No markdown.`,
            { maxTokens: 140, temperature: 0.25 }
          );
          summary = r.text;
        }
      } catch {
        /* model offline */
      }

      const message = `🚨 SOS — SurviLens\n📍 ${coordStr}\n\n🧠 AI summary (on-device):\n${summary}`;

      try {
        await Share.share({ message, title: 'SOS' });
      } catch {
        Alert.alert('SOS text', message);
      }

      const pattern =
        Platform.OS === 'ios'
          ? [0, 400, 200, 400, 200, 400, 200, 600]
          : [0, 600, 200, 600, 200, 600, 200, 800];
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 600, 250, 600, 250, 800], true);
      } else {
        Vibration.vibrate(pattern);
      }

      if (!hasPermission) {
        await requestPermission();
      }
      setTorchBlink(true);
      setTimeout(() => {
        stopSosEffects();
      }, 20000);

      Alert.alert(
        'Call emergency?',
        'India: 112 (all-in-one) · 108 disaster · 102 ambulance',
        [
          {
            text: 'Stop signal',
            style: 'cancel',
            onPress: stopSosEffects,
          },
          {
            text: 'Dial 112',
            onPress: () => Linking.openURL('tel:112'),
          },
          {
            text: 'Dial 108',
            onPress: () => Linking.openURL('tel:108'),
          },
        ]
      );
    } finally {
      setSosBusy(false);
    }
  };

  const currentScenario = selectedScenario
    ? EMERGENCY_SCENARIOS[language][selectedScenario as keyof typeof EMERGENCY_SCENARIOS.en]
    : null;

  return (
    <View style={styles.container}>
      <SosTorchBlink active={torchBlink} />
      <StatusBar barStyle="light-content" backgroundColor="#7F1D1D" />
      <LinearGradient colors={['#DC2626', '#991B1B']} style={styles.header}>
        <Text style={styles.headerTitle}>Emergency</Text>
        <Text style={styles.headerSubtitle}>SOS · First aid · Voice help</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.sosBig}
          onPress={runSOS}
          disabled={sosBusy}
          activeOpacity={0.92}
        >
          <LinearGradient
            colors={['#ef4444', '#b91c1c', '#7f1d1d']}
            style={styles.sosBigGrad}
          >
            <Text style={styles.sosBigIcon}>🆘</Text>
            <Text style={styles.sosBigTitle}>TAP FOR SOS</Text>
            <Text style={styles.sosBigSub}>
              Location + AI summary · Share · Vibrate · Flash · Call
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.voiceRow}>
          <TouchableOpacity
            style={styles.voiceBtn}
            onPress={() => navigation.navigate('VoicePipeline', { mode: 'emergency' })}
            activeOpacity={0.9}
          >
            <Text style={styles.voiceBtnText}>🎙️ Voice emergency mode</Text>
            <Text style={styles.voiceBtnHint}>
              Hands-free · speak “help” / describe injury · STT + TTS offline
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.meshBtn}
            onPress={() => navigation.navigate('NearbyMesh')}
          >
            <Text style={styles.meshBtnText}>📡 Mesh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.langSection}>
          <TouchableOpacity
            onPress={() => setLanguage('en')}
            style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
          >
            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
              English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLanguage('hi')}
            style={[styles.langBtn, language === 'hi' && styles.langBtnActive]}
          >
            <Text style={[styles.langText, language === 'hi' && styles.langTextActive]}>
              हिंदी
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {QUICK_ACTIONS.map((id) => {
            const scenario = EMERGENCY_SCENARIOS[language][id];
            return (
              <TouchableOpacity
                key={id}
                style={[styles.actionCard, selectedScenario === id && styles.actionCardActive]}
                onPress={() => setSelectedScenario(id)}
              >
                <LinearGradient colors={['#2A3145', '#1E2435']} style={styles.actionGradient}>
                  <Text style={styles.actionIcon}>{scenario.icon}</Text>
                  <Text style={styles.actionLabel}>{scenario.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {currentScenario && (
          <View style={styles.instructionsCard}>
            <LinearGradient colors={['#DC2626', '#991B1B']} style={styles.instructionsHeader}>
              <Text style={styles.instructionsIcon}>{currentScenario.icon}</Text>
              <Text style={styles.instructionsTitle}>{currentScenario.title}</Text>
            </LinearGradient>
            <View style={styles.stepsContainer}>
              {currentScenario.steps.map((step, index) => (
                <View key={index} style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.contactsCard}>
          <Text style={styles.contactsTitle}>AI Emergency Coach</Text>
          <TextInput
            value={coachInput}
            onChangeText={setCoachInput}
            placeholder="Describe emergency..."
            placeholderTextColor={AppColors.textMuted}
            multiline
            style={styles.coachInput}
          />
          <TouchableOpacity onPress={askEmergencyCoach} style={styles.coachBtn}>
            {isCoaching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.coachBtnText}>Get AI guidance</Text>
            )}
          </TouchableOpacity>
          {coachReply ? <Text style={styles.coachReply}>{coachReply}</Text> : null}
        </View>

        <View style={styles.contactsCard}>
          <Text style={styles.contactsTitle}>🚑 Emergency numbers (India)</Text>
          {(
            [
              ['Ambulance', EMERGENCY_CONTACTS.india.ambulance],
              ['Fire', EMERGENCY_CONTACTS.india.fire],
              ['Police', EMERGENCY_CONTACTS.india.police],
              ['Disaster', EMERGENCY_CONTACTS.india.disaster],
            ] as const
          ).map(([label, num]) => (
            <TouchableOpacity
              key={label}
              style={styles.contactItem}
              onPress={() => Linking.openURL(`tel:${num}`)}
            >
              <Text style={styles.contactLabel}>{label}</Text>
              <Text style={styles.contactCall}>Call {num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.primaryDark },
  header: { paddingTop: 52, paddingBottom: 18, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: '#fff', opacity: 0.9, marginTop: 4 },
  scrollView: { flex: 1 },
  sosBig: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
  },
  sosBigGrad: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  sosBigIcon: { fontSize: 44, marginBottom: 8 },
  sosBigTitle: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  sosBigSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 17,
  },
  voiceRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },
  voiceBtn: {
    flex: 1,
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
  voiceBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  voiceBtnHint: { color: AppColors.textMuted, fontSize: 11, marginTop: 6, lineHeight: 15 },
  meshBtn: {
    width: 76,
    backgroundColor: 'rgba(99,102,241,0.25)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.5)',
  },
  meshBtnText: { color: '#a5b4fc', fontWeight: '800', fontSize: 12 },
  langSection: { flexDirection: 'row', margin: 16, gap: 10 },
  langBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: AppColors.surfaceCard,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  langBtnActive: { borderColor: '#DC2626', backgroundColor: '#DC262633' },
  langText: { color: AppColors.textSecondary, fontWeight: '600' },
  langTextActive: { color: '#DC2626' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16 },
  actionCard: { width: '47%', borderRadius: 14, overflow: 'hidden' },
  actionCardActive: { transform: [{ scale: 0.98 }] },
  actionGradient: { padding: 16, alignItems: 'center' },
  actionIcon: { fontSize: 34, marginBottom: 8 },
  actionLabel: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  instructionsCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: AppColors.surfaceCard,
  },
  instructionsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
  instructionsIcon: { fontSize: 28 },
  instructionsTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  stepsContainer: { padding: 16 },
  step: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: { color: '#fff', fontWeight: '700' },
  stepText: { flex: 1, color: AppColors.textPrimary, lineHeight: 20 },
  contactsCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 16,
    padding: 16,
  },
  contactsTitle: { color: AppColors.textPrimary, fontWeight: '700', marginBottom: 12 },
  coachInput: {
    backgroundColor: AppColors.primaryMid,
    borderRadius: 12,
    color: AppColors.textPrimary,
    padding: 12,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  coachBtn: {
    marginTop: 10,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  coachBtnText: { color: '#fff', fontWeight: '700' },
  coachReply: { marginTop: 10, color: AppColors.textPrimary, lineHeight: 20 },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff14',
  },
  contactLabel: { color: AppColors.textSecondary },
  contactCall: { color: AppColors.accentCyan, fontWeight: '800' },
});
