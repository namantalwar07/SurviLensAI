import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '../theme';
import {
  SurviLensHubScreen,
  CameraAssistantScreen,
  OfflineMapScreen,
  SurvivalGuideScreen,
  EmergencyScreen,
} from '../screens';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const icon = (emoji: string, color: string) => (
  <Text style={{ fontSize: 16, color }}>{emoji}</Text>
);

const MainTabs: React.FC = () => {
  const insets = useSafeAreaInsets();
  const tabBarBottom = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          minHeight: 56 + tabBarBottom,
          paddingBottom: tabBarBottom,
          paddingTop: 8,
          backgroundColor: '#111827',
          borderTopColor: '#1F2937',
        },
        tabBarActiveTintColor: AppColors.accentCyan,
        tabBarInactiveTintColor: AppColors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="HubTab"
        component={SurviLensHubScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => icon('🏠', color),
        }}
      />

      <Tab.Screen
        name="CameraTab"
        component={CameraAssistantScreen}
        options={{
          title: 'Camera',
          tabBarIcon: ({ color }) => icon('📸', color),
        }}
      />

      <Tab.Screen
        name="MapTab"
        component={OfflineMapScreen}
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => icon('🗺️', color),
        }}
      />

      <Tab.Screen
        name="GuideTab"
        component={SurvivalGuideScreen}
        options={{
          title: 'Guide',
          tabBarIcon: ({ color }) => icon('📚', color),
        }}
      />

      <Tab.Screen
        name="EmergencyTab"
        component={EmergencyScreen}
        options={{
          title: 'SOS',
          tabBarIcon: ({ color }) => icon('🚨', color),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;