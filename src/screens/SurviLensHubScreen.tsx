import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppColors } from '../theme';
import { HubTabNavigationProp, MainTabParamList } from '../navigation/types';
import { useModelService } from '../services/ModelService';
import { useLocation, useStorage } from '../hooks';

type SurviLensHubScreenProps = {
  navigation: HubTabNavigationProp;
};

type SavedLocation = { id: string };

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export const SurviLensHubScreen: React.FC<SurviLensHubScreenProps> = ({
  navigation,
}) => {
  const modelService = useModelService();
  const {
    location,
    isLoading: locLoading,
    error: locError,
    getCurrentLocation,
  } = useLocation();
  const { value: savedLocations } = useStorage<SavedLocation[]>(
    'saved_locations',
    []
  );
  const [refreshing, setRefreshing] = useState(false);

  const readinessCount = [
    modelService.isLLMLoaded,
    modelService.isSTTLoaded,
    modelService.isTTSLoaded,
  ].filter(Boolean).length;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getCurrentLocation();
    setRefreshing(false);
  };

  const nextSteps = useMemo(() => {
    const steps: {
      id: string;
      title: string;
      detail: string;
      tab?: keyof MainTabParamList;
      route?: 'AIChat' | 'VoicePipeline';
      urgent?: boolean;
    }[] = [];

    if (locError && !location) {
      steps.push({
        id: 'loc',
        title: 'Fix location',
        detail: locError,
        tab: 'MapTab',
      });
    }

    if (!modelService.isLLMLoaded) {
      steps.push({
        id: 'llm',
        title: 'Load the AI model',
        detail: 'Required for Survival Guide, Camera analysis & Chat.',
        route: 'AIChat',
        urgent: true,
      });
    }

    if (modelService.isLLMLoaded && !modelService.isVoiceAgentReady) {
      steps.push({
        id: 'voice',
        title: 'Optional: voice packs',
        detail: 'Download STT + TTS for hands-free Voice Agent.',
        route: 'VoicePipeline',
      });
    }

    if ((savedLocations?.length ?? 0) === 0 && modelService.isLLMLoaded) {
      steps.push({
        id: 'pins',
        title: 'Mark places on the map',
        detail: 'Save water, shelter, danger — works offline after download.',
        tab: 'MapTab',
      });
    }

    steps.push({
      id: 'sos',
      title: 'Know where SOS is',
      detail: 'First aid steps & numbers — use the SOS tab anytime.',
      tab: 'EmergencyTab',
    });

    return steps.slice(0, 5);
  }, [
    locError,
    location,
    modelService.isLLMLoaded,
    modelService.isVoiceAgentReady,
    savedLocations?.length,
  ]);

  const coordsLine = location
    ? `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}° · ±${location.accuracy != null ? `${Math.round(location.accuracy)}m` : '?'}`
    : locLoading
      ? 'Getting fix…'
      : 'No fix yet — open Map or pull to refresh';

  const pinCount = savedLocations?.length ?? 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#070b14" />

      <LinearGradient
        colors={['#0c1222', '#070b14', '#0a0e1a']}
        style={styles.topBand}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.greet}>{greeting()}</Text>
          <Text style={styles.headline}>SurviLens</Text>
          <Text style={styles.subHead}>
            On-device AI · use the bar below for Camera, Map, Guide & SOS
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.accentCyan}
          />
        }
      >
        {/* Where you are */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Where you are</Text>
            <TouchableOpacity
              onPress={() => getCurrentLocation()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {locLoading ? (
                <ActivityIndicator size="small" color={AppColors.accentCyan} />
              ) : (
                <Text style={styles.cardAction}>Refresh</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.mono}>{coordsLine}</Text>
          <TouchableOpacity
            style={styles.inlineLink}
            onPress={() => navigation.navigate('MapTab')}
            activeOpacity={0.7}
          >
            <Text style={styles.inlineLinkText}>
              Open map · {pinCount} saved pin{pinCount === 1 ? '' : 's'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI ready */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI on this phone</Text>
          <View style={styles.pillRow}>
            <View
              style={[
                styles.pill,
                modelService.isLLMLoaded && styles.pillOn,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  modelService.isLLMLoaded && styles.pillTextOn,
                ]}
              >
                LLM {modelService.isLLMLoaded ? '●' : '○'}
              </Text>
            </View>
            <View
              style={[
                styles.pill,
                modelService.isSTTLoaded && styles.pillOn,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  modelService.isSTTLoaded && styles.pillTextOn,
                ]}
              >
                STT {modelService.isSTTLoaded ? '●' : '○'}
              </Text>
            </View>
            <View
              style={[
                styles.pill,
                modelService.isTTSLoaded && styles.pillOn,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  modelService.isTTSLoaded && styles.pillTextOn,
                ]}
              >
                TTS {modelService.isTTSLoaded ? '●' : '○'}
              </Text>
            </View>
          </View>
          <View style={styles.barTrack}>
            <LinearGradient
              colors={[AppColors.accentCyan, '#6366f1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.barFill,
                { width: `${Math.round((readinessCount / 3) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.cardFoot}>
            {readinessCount === 3
              ? 'Voice Agent ready.'
              : readinessCount === 0
                ? 'Open Chat below to download the brain first.'
                : `${3 - readinessCount} piece(s) left for full voice mode.`}
          </Text>
        </View>

        {/* Not on tabs: primary AI entry */}
        <Text style={styles.sectionLabel}>ASK AI (NOT IN TAB BAR)</Text>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => navigation.navigate('AIChat')}
          style={styles.ctaPrimary}
        >
          <LinearGradient
            colors={['#7c3aed', '#5b21b6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGrad}
          >
            <Text style={styles.ctaEmoji}>💬</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>AI Chat</Text>
              <Text style={styles.ctaSub}>Type anything · same model as Guide</Text>
            </View>
            <Text style={styles.ctaArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => navigation.navigate('VoicePipeline')}
          style={styles.ctaSecondary}
        >
          <LinearGradient
            colors={['#0f766e', '#115e59']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGrad}
          >
            <Text style={styles.ctaEmoji}>🎙️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Voice Agent</Text>
              <Text style={styles.ctaSub}>Speak · VAD · STT · answer · TTS</Text>
            </View>
            <Text style={styles.ctaArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* What to do */}
        <Text style={[styles.sectionLabel, { marginTop: 22 }]}>SUGGESTED NEXT</Text>
        {nextSteps.map((step, i) => (
          <TouchableOpacity
            key={step.id}
            activeOpacity={0.85}
            style={[styles.stepRow, step.urgent && styles.stepRowUrgent]}
            onPress={() => {
              if (step.tab) navigation.navigate(step.tab);
              if (step.route) navigation.navigate(step.route);
            }}
          >
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDetail}>{step.detail}</Text>
            </View>
            <Text style={styles.stepChev}>→</Text>
          </TouchableOpacity>
        ))}

        {/* Rule of 3 — real utility */}
        <View style={styles.ruleCard}>
          <Text style={styles.ruleTitle}>Rule of 3 (quick ref)</Text>
          <Text style={styles.ruleLine}>~3 min without air · ~3 h harsh shelter</Text>
          <Text style={styles.ruleLine}>~3 days water · ~3 weeks food</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('GuideTab')}
            activeOpacity={0.8}
          >
            <Text style={styles.ruleLink}>Open Survival Guide for plans →</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.meshLink}
          onPress={() => navigation.navigate('NearbyMesh')}
          activeOpacity={0.85}
        >
          <Text style={styles.meshLinkText}>
            📡 Offline mesh — “Is anyone nearby?” (BLE-ready demo)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.devRow}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.devRowText}>Developer · RunAnywhere SDK demos</Text>
        </TouchableOpacity>

        <View style={{ height: 96 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#070b14',
  },
  topBand: {
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  greet: {
    fontSize: 13,
    color: AppColors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  headline: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  subHead: {
    marginTop: 8,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 18,
    maxWidth: 340,
  },
  scroll: { flex: 1 },
  scrollInner: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  cardAction: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.accentCyan,
  },
  mono: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) as string,
    lineHeight: 20,
  },
  inlineLink: { marginTop: 12 },
  inlineLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.accentCyan,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pillOn: {
    borderColor: AppColors.accentCyan + '55',
    backgroundColor: 'rgba(0,217,255,0.1)',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textMuted,
  },
  pillTextOn: {
    color: AppColors.accentCyan,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardFoot: {
    marginTop: 10,
    fontSize: 12,
    color: AppColors.textMuted,
    lineHeight: 17,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: AppColors.textMuted,
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  ctaPrimary: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  ctaSecondary: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  ctaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  ctaEmoji: { fontSize: 28 },
  ctaTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  ctaSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  ctaArrow: { fontSize: 22, color: '#fff', fontWeight: '300', opacity: 0.9 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  stepRowUrgent: {
    borderColor: 'rgba(245,158,11,0.35)',
    backgroundColor: 'rgba(245,158,11,0.08)',
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  stepTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  stepDetail: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 3,
    lineHeight: 17,
  },
  stepChev: { color: AppColors.textMuted, fontSize: 18, fontWeight: '600' },
  ruleCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(245,158,11,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fdba74',
    marginBottom: 10,
  },
  ruleLine: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  ruleLink: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.accentCyan,
  },
  meshLink: {
    marginTop: 18,
    marginHorizontal: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.45)',
  },
  meshLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a5b4fc',
    textAlign: 'center',
    lineHeight: 19,
  },
  devRow: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  devRowText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '600',
  },
});
