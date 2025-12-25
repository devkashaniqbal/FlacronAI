import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIAssistantPanel } from './components/AIAssistant';

// Import screens
import DashboardScreen from './screens/DashboardScreen';
import GenerateReportScreen from './screens/GenerateReportScreen';
import ReportsScreen from './screens/ReportsScreen';
import ProfileScreen from './screens/ProfileScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#FF7C08',
  primaryDark: '#ff9533',
  background: '#FFFFFF',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
};

const normalize = (size) => {
  const scale = SCREEN_WIDTH / 375;
  return Math.round(size * scale);
};

export default function MainApp({ navigation }) {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const name = await AsyncStorage.getItem('userName');
      if (email) setUserEmail(email);
      if (name) setUserName(name);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userEmail', 'userName']);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleShowAIAssistant = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAIAssistant(true);
  };

  const renderContent = () => {
    const commonProps = {
      userEmail,
      userName,
      navigation,
      onShowAIAssistant: handleShowAIAssistant,
      onLogout: handleLogout,
      onTabChange: setCurrentTab,
    };

    switch (currentTab) {
      case 'dashboard':
        return <DashboardScreen {...commonProps} />;
      case 'generate':
        return <GenerateReportScreen {...commonProps} />;
      case 'reports':
        return <ReportsScreen {...commonProps} />;
      case 'profile':
        return <ProfileScreen {...commonProps} />;
      default:
        return <DashboardScreen {...commonProps} />;
    }
  };

  const TabButton = ({ tab, icon, label, activeIcon }) => {
    const isActive = currentTab === tab;

    return (
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setCurrentTab(tab);
        }}
        activeOpacity={0.7}
      >
        {isActive ? (
          <LinearGradient
            colors={['#FF7C08', '#ff9533']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.activeTabGradient}
          >
            <Ionicons name={activeIcon || icon} size={22} color="#FFFFFF" />
            <Text style={styles.activeTabLabel}>{label}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.inactiveTab}>
            <Ionicons name={icon} size={24} color={COLORS.textMuted} />
            <Text style={styles.inactiveTabLabel}>{label}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Modern Bottom Tab Bar */}
      <View style={styles.tabBarContainer}>
        <LinearGradient
          colors={['#FFFFFF', '#FFFFFF']}
          style={styles.tabBarGradient}
        >
          <View style={styles.tabBar}>
            <TabButton
              tab="dashboard"
              icon="home-outline"
              activeIcon="home"
              label="Home"
            />
            <TabButton
              tab="generate"
              icon="create-outline"
              activeIcon="create"
              label="Generate"
            />
            <TabButton
              tab="reports"
              icon="folder-outline"
              activeIcon="folder"
              label="Reports"
            />
            <TabButton
              tab="profile"
              icon="person-outline"
              activeIcon="person"
              label="Profile"
            />
          </View>
        </LinearGradient>
      </View>

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        visible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  tabBarGradient: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  activeTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#FF7C08',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  activeTabLabel: {
    color: '#FFFFFF',
    fontSize: normalize(13),
    fontWeight: '700',
  },
  inactiveTab: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  inactiveTabLabel: {
    color: COLORS.textMuted,
    fontSize: normalize(11),
    marginTop: 4,
    fontWeight: '500',
  },
});
