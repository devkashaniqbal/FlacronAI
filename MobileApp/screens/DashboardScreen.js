import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AIAssistantBubble } from '../components/AIAssistant';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  orange: '#FF7C08',
  orangeLight: '#ff9533',
  white: '#FFFFFF',
  backgroundGray: '#F5F5F5',
  textDark: '#2D2D2D',
  textGray: '#7A7A7A',
  textLight: '#A0A0A0',
  cardBorder: '#EEEEEE',
  iconBgPeach: '#FFE8D6',
  iconBgMint: '#D4F4E8',
  iconBgYellow: '#FFF4D6',
};

export default function DashboardScreen({ userEmail, userName, onShowAIAssistant, onTabChange }) {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    usedThisMonth: 0,
    monthlyLimit: 1,
    totalReports: 0,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>FlacronAI</Text>
          <TouchableOpacity style={styles.chatButton}>
            <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.orange}
            colors={[COLORS.orange]}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userName || 'Tesr'}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={28} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        {/* Usage Overview Card */}
        <View style={styles.usageCard}>
          <View style={styles.usageHeader}>
            <Text style={styles.usageTitle}>Usage Overview</Text>
            <View style={styles.starterBadge}>
              <Ionicons name="trophy" size={14} color={COLORS.white} />
              <Text style={styles.starterText}>Starter</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {/* Used this month */}
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.iconBgPeach }]}>
                <Ionicons name="document-text" size={28} color={COLORS.orange} />
              </View>
              <Text style={styles.statNumber}>{stats.usedThisMonth}</Text>
              <Text style={styles.statLabel}>Used this month</Text>
            </View>

            {/* Vertical Divider */}
            <View style={styles.statDivider} />

            {/* Monthly limit */}
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.iconBgMint }]}>
                <Ionicons name="checkmark-circle" size={28} color="#10B981" />
              </View>
              <Text style={styles.statNumber}>{stats.monthlyLimit}</Text>
              <Text style={styles.statLabel}>Monthly limit</Text>
            </View>

            {/* Vertical Divider */}
            <View style={styles.statDivider} />

            {/* Total reports */}
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.iconBgYellow }]}>
                <Ionicons name="calendar" size={28} color="#F59E0B" />
              </View>
              <Text style={styles.statNumber}>{stats.totalReports}</Text>
              <Text style={styles.statLabel}>Total reports</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {/* Generate Report Card */}
            <TouchableOpacity
              style={[styles.actionCard, { marginRight: 12 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onTabChange?.('generate');
              }}
              activeOpacity={0.9}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="add-circle" size={48} color={COLORS.white} />
              </View>
              <Text style={styles.actionTitle}>Generate Report</Text>
              <Text style={styles.actionSubtitle}>Create new inspection</Text>
            </TouchableOpacity>

            {/* My Reports Card */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onTabChange?.('reports');
              }}
              activeOpacity={0.9}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="folder-open" size={48} color={COLORS.white} />
              </View>
              <Text style={styles.actionTitle}>My Reports</Text>
              <Text style={styles.actionSubtitle}>View all reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* AI Assistant Floating Button */}
      <AIAssistantBubble onPress={onShowAIAssistant} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.orange,
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.textGray,
    fontWeight: '400',
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 4,
  },
  usageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  usageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  starterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.orange,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  starterText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textGray,
    textAlign: 'center',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: COLORS.cardBorder,
    marginHorizontal: 8,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.orange,
    borderRadius: 20,
    padding: 24,
    minHeight: 180,
    justifyContent: 'center',
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  actionIcon: {
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 6,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
});
