import {
  NavigatorScreenParams,
  CompositeNavigationProp,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';

export type MainTabParamList = {
  HubTab: undefined;
  CameraTab: undefined;
  MapTab: undefined;
  GuideTab: undefined;
  EmergencyTab: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  /** Original RunAnywhere starter demos (optional entry from Home) */
  Home: undefined;
  AIChat: undefined;
  VoicePipeline: { mode?: 'emergency' };
  NearbyMesh: undefined;
  Chat: undefined;
  ToolCalling: undefined;
  SpeechToText: undefined;
  TextToSpeech: undefined;
};

/** Home tab: jump to other tabs + open stack screens (AI Chat, Voice, SDK demos) */
export type HubTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HubTab'>,
  StackNavigationProp<RootStackParamList>
>;

