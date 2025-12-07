import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  BackHandler,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
// NOTE: Firebase JS SDK v10 has compatibility issues with React Native
// The backend handles Firebase authentication via Admin SDK
// Mobile app communicates with backend API for auth

// ==================== CONFIGURATION ====================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive font scaling
const scale = SCREEN_WIDTH / 375; // Base on iPhone X width
const normalize = (size) => {
  const newSize = size * scale;
  return Math.round(newSize);
};

// Light Mode Colors
const COLORS_LIGHT = {
  primary: '#FF7C08',
  primaryDark: '#ff9533',
  secondary: '#1f2937',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  inputBackground: '#ffffff',
  cardBackground: '#ffffff',
};

// Dark Mode Colors
const COLORS_DARK = {
  primary: '#FF9533',
  primaryDark: '#ff7c08',
  secondary: '#f9fafb',
  background: '#0f1419',
  surface: '#1a1f2e',
  text: '#e5e7eb',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  border: '#374151',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  inputBackground: '#1f2937',
  cardBackground: '#1f2937',
};

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEtWQZaTf8czc8tLdMatYSnAUhIOyCOis",
  authDomain: "flacronai-c8dab.firebaseapp.com",
  projectId: "flacronai-c8dab",
  storageBucket: "flacronai-c8dab.firebasestorage.app",
  messagingSenderId: "773892679617",
  appId: "1:773892679617:web:daa3f6b5e3774501957140",
  measurementId: "G-NB7SZYH1KS"
};

// Backend API handles Firebase authentication

const API_URL = 'https://flacronai.onrender.com/api';

// ==================== STYLES GENERATOR ====================

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: normalize(15),
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 14 : 14,
    paddingBottom: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  logo: {
    fontSize: normalize(22),
    fontWeight: '700',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  authContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: COLORS.background,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  authTitle: {
    fontSize: normalize(28),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: normalize(14),
    color: COLORS.textSecondary,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    fontSize: normalize(15),
    backgroundColor: COLORS.inputBackground,
    color: COLORS.text,
    marginBottom: 12,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: normalize(15),
    fontWeight: '700',
  },
  toggleText: {
    textAlign: 'center',
    marginTop: 20,
    color: COLORS.textSecondary,
    fontSize: normalize(13),
  },
  toggleLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    padding: 20,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: normalize(13),
    fontWeight: '600',
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  usageRowLast: {
    borderBottomWidth: 0,
  },
  usageLabel: {
    fontSize: normalize(13),
    color: COLORS.textSecondary,
  },
  usageValue: {
    fontSize: normalize(13),
    fontWeight: '600',
    color: COLORS.text,
  },
  upgradeButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  upgradeButtonText: {
    color: COLORS.surface,
    fontSize: normalize(14),
    fontWeight: '700',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  textArea: {
    minHeight: SCREEN_HEIGHT * 0.12,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  picker: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.inputBackground,
    color: COLORS.text,
  },
  photoSection: {
    marginTop: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  photoContainer: {
    position: 'relative',
    width: (SCREEN_WIDTH - 48 - 16) / 3,
    height: (SCREEN_WIDTH - 48 - 16) / 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: normalize(13),
    fontWeight: '600',
  },
  generatedReport: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportTitle: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  reportText: {
    fontSize: normalize(13),
    lineHeight: normalize(20),
    color: COLORS.text,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  exportButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    color: COLORS.surface,
    fontSize: normalize(12),
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: normalize(14),
    color: COLORS.textSecondary,
  },
  reportCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportCardTitle: {
    fontSize: normalize(15),
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  reportCardDate: {
    fontSize: normalize(11),
    color: COLORS.textMuted,
    marginLeft: 8,
  },
  reportCardMeta: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: COLORS.surface,
    fontSize: normalize(12),
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: normalize(22),
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  modalBody: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: normalize(13),
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalValue: {
    fontSize: normalize(16),
    color: COLORS.text,
    fontWeight: '500',
    lineHeight: normalize(22),
  },
  modalPhotosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  modalPhoto: {
    width: (SCREEN_WIDTH * 0.9 - 40 - 16) / 3,
    height: (SCREEN_WIDTH * 0.9 - 40 - 16) / 3,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: COLORS.border,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.text,
    fontSize: normalize(14),
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: normalize(88),
    height: normalize(88),
    borderRadius: normalize(44),
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  profileName: {
    fontSize: normalize(20),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: normalize(13),
    color: COLORS.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  infoText: {
    fontSize: normalize(14),
    color: COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: COLORS.surface,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: normalize(14),
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: normalize(10),
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  themeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  themeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggleText: {
    fontSize: normalize(14),
    color: COLORS.text,
    fontWeight: '500',
  },
  toggleSwitch: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 24 }],
  },
  // Photo styles
  photoItem: {
    position: 'relative',
    width: (SCREEN_WIDTH - 64) / 3,
    height: (SCREEN_WIDTH - 64) / 3,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 2,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  photoButtonText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: COLORS.text,
  },
  // Dashboard styles
  authContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.06,
    paddingVertical: 24,
  },
  authForm: {
    width: '100%',
  },
  logoContainer: {
    width: SCREEN_WIDTH * 0.25,
    height: SCREEN_WIDTH * 0.25,
    borderRadius: SCREEN_WIDTH * 0.125,
    backgroundColor: '#fff5ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(15),
    fontWeight: '600',
  },
  switchText: {
    textAlign: 'center',
    color: COLORS.primary,
    fontSize: normalize(13),
    fontWeight: '500',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 20,
  },
  greeting: {
    fontSize: normalize(15),
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: normalize(25),
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: normalize(28),
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: normalize(13),
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  actionText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 8,
  },
  recentSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: normalize(14),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: normalize(12),
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  // Report list styles
  reportListItem: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportInfo: {
    flex: 1,
  },
  reportPreview: {
    marginBottom: 8,
  },
  reportPreviewTitle: {
    fontSize: normalize(15),
    fontWeight: '700',
    color: COLORS.text,
  },
  reportPreviewContent: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  reportSubtitle: {
    fontSize: normalize(12),
    color: COLORS.textMuted,
  },
  reportCardSubtitle: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
  },
  reportCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reportCardMetaText: {
    fontSize: normalize(12),
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  reportCountBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportCountText: {
    color: COLORS.surface,
    fontSize: normalize(12),
    fontWeight: '600',
  },
  // Generate page styles
  generateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonText: {
    color: COLORS.surface,
    fontSize: normalize(15),
    fontWeight: '700',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.inputBackground,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  pickerOptionText: {
    fontSize: normalize(14),
    color: COLORS.text,
  },
  pickerOptionTextSelected: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalSection: {
    marginBottom: 16,
    backgroundColor: COLORS.cardBackground,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  modalValueContent: {
    fontSize: normalize(15),
    color: COLORS.text,
    lineHeight: normalize(24),
    fontWeight: '400',
  },
  // Page layout
  pageTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: normalize(24),
    fontWeight: '700',
    color: COLORS.text,
  },
});

// ==================== MAIN APP ====================

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showPassword, setShowPassword] = useState(false);

  // Email verification state
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);

  // Report generation state
  const [formData, setFormData] = useState({
    claimNumber: '',
    insuredName: '',
    lossDate: '',
    lossType: 'Fire',
    reportType: 'Preliminary',
    propertyAddress: '',
    propertyDetails: '',
    lossDescription: '',
    damages: '',
    recommendations: '',
  });
  const [photos, setPhotos] = useState([]);
  const [generatedReport, setGeneratedReport] = useState('');
  const [generating, setGenerating] = useState(false);

  // My Reports state
  const [myReports, setMyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Usage stats
  const [usageStats, setUsageStats] = useState(null);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const COLORS = isDarkMode ? COLORS_DARK : COLORS_LIGHT;
  const styles = getStyles(COLORS);

  // Log API URL on app start
  useEffect(() => {
    console.log('\nâ•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
    console.log('â•‘           FLACRONAI MOBILE APP STARTED               â•‘');
    console.log('â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£');
    console.log('â•‘  API URL:', API_URL);
    console.log('â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');
  }, []);

  // Helper function to format tier name for display
  const formatTierName = (tier) => {
    if (!tier) return 'Free';
    const tierMap = {
      'starter': 'Starter',
      'professional': 'Pro',
      'agency': 'Agency',
      'enterprise': 'Enterprise'
    };
    return tierMap[tier.toLowerCase()] || tier;
  };

  // Request permissions
  useEffect(() => {
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus.status !== 'granted') {
        console.warn('Camera permission not granted');
      }
      if (mediaStatus.status !== 'granted') {
        console.warn('Media library permission not granted');
      }
    })();
  }, []);

  // Load theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Check for saved session on app load
  useEffect(() => {
    checkSavedSession();
  }, []);

  // Handle Android back button
  useEffect(() => {
    let backPressCount = 0;
    let backPressTimer = null;

    const backAction = () => {
      // If on auth screen, exit directly
      if (!user) {
        BackHandler.exitApp();
        return true;
      }

      // If on dashboard page
      if (currentPage === 'dashboard') {
        if (backPressCount === 0) {
          backPressCount = 1;
          Alert.alert('Exit App', 'Do you want to close this app?', [
            { text: 'Cancel', style: 'cancel', onPress: () => { backPressCount = 0; } },
            { text: 'Yes', onPress: () => BackHandler.exitApp() }
          ]);

          backPressTimer = setTimeout(() => {
            backPressCount = 0;
          }, 2000);
          return true;
        }
      } else {
        // Navigate back to dashboard on first press
        setCurrentPage('dashboard');
        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandler.remove();
      if (backPressTimer) clearTimeout(backPressTimer);
    };
  }, [user, currentPage]);

  // Clear form and photos when navigating to generate page
  useEffect(() => {
    if (currentPage === 'generate') {
      // Only clear if not coming from Quick Demo
      const isComingFromDemo = formData.claimNumber === 'CLM-2024-001';
      if (!isComingFromDemo && generatedReport) {
        resetGenerateForm();
      }
    }
  }, [currentPage]);

  const resetGenerateForm = () => {
    setFormData({
      claimNumber: '',
      insuredName: '',
      lossDate: '',
      lossType: 'Fire',
      reportType: 'Preliminary',
      propertyAddress: '',
      propertyDetails: '',
      lossDescription: '',
      damages: '',
      recommendations: '',
    });
    setPhotos([]);
    setGeneratedReport('');
  };

        const checkSavedSession = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('authToken');
      const savedUser = await AsyncStorage.getItem('userData');

      if (savedToken && savedUser) {
        console.log('✅ Restored saved session');
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        fetchUsageStats(savedToken);
        fetchReports(savedToken);
      } else {
        console.log('No saved session found');
      }
    } catch (error) {
      console.log('Session restore error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'true');
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('isDarkMode', newTheme.toString());
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const navigateWithHaptic = (page) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentPage(page);
  };

  const hapticTap = (callback) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (callback) callback();
  };

  const fetchUsageStats = async (authToken = token) => {
    if (!authToken) return;

    try {
      const response = await fetch(`${API_URL}/users/usage`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsageStats(data.usage);
      }
    } catch (error) {
      console.log('Error fetching usage:', error);
    }
  };

  const fetchReports = async (authToken = token) => {
    if (!authToken) return;

    console.log('ðŸ“‹ Fetching reports from API...');
    setLoadingReports(true);
    try {
      const response = await fetch(`${API_URL}/reports`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      console.log('   Response status:', response.status);
      const data = await response.json();
      console.log('   Data received:', data.success ? `${data.reports?.length || 0} reports` : 'Failed');
      if (data.success) {
        setMyReports(data.reports || []);
        console.log('   âœ… Reports loaded successfully');
      } else {
        console.log('   âŒ Failed to fetch reports:', data.error);
      }
    } catch (error) {
      console.log('   âŒ Error fetching reports:', error);
    } finally {
      setLoadingReports(false);
      setRefreshing(false);
    }
  };

        const handleRegister = async () => {
    if (!displayName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    console.log('REGISTRATION ATTEMPT:');
    console.log('   Name:', displayName);
    console.log('   Email:', email);
    console.log('   API URL:', `${API_URL}/auth/register`);

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password, displayName })
      });

      const data = await response.json();
      console.log('   Response:', data.success ? 'Success' : 'Failed');

      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Store email for verification screen
        setPendingVerificationEmail(email);

        // Clear form
        setPassword('');
        setDisplayName('');

        // Show verification screen
        setShowVerificationScreen(true);

        console.log('   Showing verification screen for:', email);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        // Handle specific error messages
        let errorMessage = data.error || 'Failed to create account';
        if (errorMessage.includes('already in use') || errorMessage.includes('already exists')) {
          errorMessage = 'This email is already registered. Please login instead.';
        } else if (errorMessage.includes('invalid email') || errorMessage.includes('Invalid email')) {
          errorMessage = 'Invalid email address format.';
        } else if (errorMessage.includes('weak password') || errorMessage.includes('at least 6')) {
          errorMessage = 'Password is too weak. Please use at least 6 characters.';
        }

        Alert.alert('Registration Error', errorMessage);
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('   Network Error:', error);
      Alert.alert('Registration Error', 'Network error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

        const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    console.log('LOGIN ATTEMPT:');
    console.log('   Email:', email);
    console.log('   API URL:', `${API_URL}/auth/login`);

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('   Response status:', response.status);
      console.log('   Success:', data.success);

      if (data.success && data.token) {
        console.log('   ✅ Login successful!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Save token and user data
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);

        // Fetch user data
        fetchUsageStats(data.token);
        fetchReports(data.token);

        setEmail('');
        setPassword('');
      } else {
        console.log('   ❌ Login failed:', data.error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        // Check if email verification is required
        if (data.emailVerified === false || (data.error && data.error.includes('verify your email'))) {
          console.log('   ⚠️ Email not verified - showing verification screen');
          setPendingVerificationEmail(email);
          setPassword('');
          setShowVerificationScreen(true);
          return;
        }

        // Handle specific error messages from backend
        let errorMessage = data.error || 'Invalid email or password';
        if (errorMessage.includes('not found') || errorMessage.includes('No user') || errorMessage.includes('No account')) {
          errorMessage = 'No account found with this email. Please sign up first.';
        } else if (errorMessage.includes('wrong password') || errorMessage.includes('incorrect') || errorMessage.includes('Invalid credentials') || errorMessage.includes('Incorrect password')) {
          errorMessage = 'Incorrect password. Please try again.';
        } else if (errorMessage.includes('invalid email') || errorMessage.includes('Invalid email')) {
          errorMessage = 'Invalid email address format.';
        } else if (errorMessage.includes('disabled')) {
          errorMessage = 'This account has been disabled.';
        } else if (errorMessage.includes('too many')) {
          errorMessage = 'Too many failed login attempts. Please try again later.';
        }

        Alert.alert('Login Error', errorMessage);
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('   Network Error:', error);
      Alert.alert('Login Error', 'Network error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

        const handleLogout = async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');

      // Clear state
      setUser(null);
      setToken(null);
      setMyReports([]);
      setUsageStats(null);
      setCurrentPage('dashboard');

      console.log('✅ Logged out successfully');
      Alert.alert('Success', 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Logout failed');
    }
  };

  // Email verification handlers
  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) {
      Alert.alert('Error', 'No email address to verify');
      return;
    }

    setResendingVerification(true);
    console.log('RESEND VERIFICATION:');
    console.log('   Email:', pendingVerificationEmail);

    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: pendingVerificationEmail })
      });

      const data = await response.json();
      console.log('   Response:', data.success ? 'Success' : 'Failed');

      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (data.alreadyVerified) {
          Alert.alert('Already Verified', 'Your email is already verified! You can now log in.');
          setShowVerificationScreen(false);
          setIsLogin(true);
        } else {
          Alert.alert('Email Sent', 'Verification email sent! Please check your inbox and spam folder.');
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', data.error || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('   Error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Network error. Please check your internet connection.');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!pendingVerificationEmail) {
      Alert.alert('Error', 'No email address to check');
      return;
    }

    setLoading(true);
    console.log('CHECK VERIFICATION:');
    console.log('   Email:', pendingVerificationEmail);

    try {
      const response = await fetch(`${API_URL}/auth/check-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: pendingVerificationEmail })
      });

      const data = await response.json();
      console.log('   Verified:', data.emailVerified);

      if (data.success && data.emailVerified) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Verified!', 'Your email has been verified. You can now log in with your password.');
        setShowVerificationScreen(false);
        setEmail(pendingVerificationEmail);
        setPendingVerificationEmail('');
        setIsLogin(true);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          'Not Yet Verified',
          'Your email is not verified yet. Please click the verification link in your email.\n\nDid you check your spam folder?'
        );
      }
    } catch (error) {
      console.error('   Error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Network error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowVerificationScreen(false);
    setPendingVerificationEmail('');
    setIsLogin(true);
  };

  const handleDownloadReport = async (report, format = 'pdf') => {
    if (!report) return;

    try {
      console.log('ðŸ“¥ DOWNLOAD REPORT:');
      console.log('   Claim Number:', report.claimNumber);
      console.log('   Format:', format.toUpperCase());

      Alert.alert('Downloading', `Generating ${format.toUpperCase()} report...`);

      const response = await fetch(`${API_URL}/reports/${report.reportId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ format })
      });

      console.log('   Response status:', response.status);

      const data = await response.json();

      if (data.success && data.downloadUrl) {
        console.log('   âœ… Export successful');

        const fileExtension = format === 'pdf' ? 'pdf' : 'docx';
        const filename = `FlacronAI_${report.claimNumber.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;
        const fileUri = FileSystem.documentDirectory + filename;

        let downloadUrl = data.downloadUrl;
        if (downloadUrl.startsWith('/')) {
          const baseUrl = API_URL.replace('/api', '');
          downloadUrl = baseUrl + downloadUrl;
        }

        console.log('   ðŸ“¥ Downloading file from:', downloadUrl);
        const downloadResult = await FileSystem.downloadAsync(downloadUrl, fileUri);

        console.log('   âœ… File downloaded:', downloadResult.uri);

        const isSharingAvailable = await Sharing.isAvailableAsync();

        if (isSharingAvailable) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            dialogTitle: `Download ${format.toUpperCase()} Report`,
          });
          console.log('   âœ… Download complete!');
          Alert.alert('Success', `${format.toUpperCase()} report downloaded successfully!`);
        } else {
          Alert.alert('Success', `Report saved to: ${downloadResult.uri}`);
        }

      } else {
        console.error('   âŒ Export failed:', data.error);
        Alert.alert('Export Error', data.error || 'Failed to export report');
      }

    } catch (error) {
      console.error('   âŒ Download Error:', error);
      Alert.alert('Download Error', `Failed to download report: ${error.message}`);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library access to select images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos([...photos, ...result.assets]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.getCameraPermissionsAsync();

    if (status !== 'granted') {
      const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (newStatus !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera access to take photos.');
        return;
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled) {
        setPhotos([...photos, result.assets[0]]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Camera Error', 'Failed to open camera. Please try again.');
    }
  };

  const removePhoto = (index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleGenerateReport = async () => {
    if (!formData.claimNumber || !formData.insuredName || !formData.lossType) {
      Alert.alert('Error', 'Please fill in required fields: Claim Number, Insured Name, and Loss Type');
      return;
    }

    setGenerating(true);
    setGeneratedReport('');

    try {
      const response = await fetch(`${API_URL}/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setGeneratedReport(data.report.content);
        Alert.alert('Success', 'Report generated successfully!');

        fetchUsageStats();
        fetchReports();

        // Keep form data but clear photos
        setPhotos([]);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', data.error || 'Failed to generate report');
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setGenerating(false);
    }
  };

  const updateFormField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsageStats();
    fetchReports();
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'YYYY-MM-DD';
    return dateString;
  };

  // Loading Screen
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading FlacronAI...</Text>
      </View>
    );
  }

  // Auth Screen (Login/Register)
  if (!user) {
    // Email Verification Screen
    if (showVerificationScreen) {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
          <ScrollView contentContainerStyle={styles.authContent}>
            <View style={styles.authHeader}>
              <View style={[styles.logoContainer, { backgroundColor: COLORS.warning + '20' }]}>
                <Ionicons name="mail-unread" size={normalize(50)} color={COLORS.warning} />
              </View>
              <Text style={styles.authTitle}>Verify Your Email</Text>
              <Text style={[styles.authSubtitle, { marginTop: 10 }]}>
                We've sent a verification link to:
              </Text>
              <Text style={[styles.authSubtitle, { fontWeight: 'bold', color: COLORS.primary, marginTop: 5 }]}>
                {pendingVerificationEmail}
              </Text>
            </View>

            <View style={styles.authForm}>
              <View style={{
                backgroundColor: COLORS.info + '15',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                borderLeftWidth: 4,
                borderLeftColor: COLORS.info
              }}>
                <Text style={{ color: COLORS.text, fontSize: normalize(14), lineHeight: 22 }}>
                  Please check your inbox and click the verification link to activate your account.{'\n\n'}
                  Don't see the email? Check your spam or junk folder.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: COLORS.success, flexDirection: 'row' }]}
                onPress={handleCheckVerification}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryButtonText}>I've Verified - Continue</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, {
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderColor: COLORS.primary,
                  marginTop: 12,
                  flexDirection: 'row'
                }]}
                onPress={handleResendVerification}
                disabled={resendingVerification}
              >
                {resendingVerification ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : (
                  <>
                    <Ionicons name="refresh" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <Text style={[styles.primaryButtonText, { color: COLORS.primary }]}>
                      Resend Verification Email
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBackToLogin}
                style={{ marginTop: 20 }}
              >
                <Text style={styles.switchText}>
                  <Ionicons name="arrow-back" size={14} color={COLORS.textMuted} /> Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    // Login/Register Form
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.authContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.authHeader}>
              <View style={styles.logoContainer}>
                <Ionicons name="shield-checkmark" size={normalize(50)} color={COLORS.primary} />
              </View>
              <Text style={styles.authTitle}>FlacronAI</Text>
              <Text style={styles.authSubtitle}>
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </Text>
            </View>

            <View style={styles.authForm}>
              {!isLogin && (
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  placeholderTextColor={COLORS.textMuted}
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.textMuted}
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={COLORS.textMuted}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={isLogin ? handleLogin : handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {isLogin ? 'Login' : 'Create Account'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.switchText}>
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Main App - Dashboard
  const renderDashboard = () => (
    <ScrollView
      style={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
    >
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.displayName}</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Usage Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="document-text" size={normalize(28)} color={COLORS.primary} />
            <Text style={styles.statValue}>{usageStats?.periodUsage || 0}</Text>
            <Text style={styles.statLabel}>Used</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={normalize(28)} color={COLORS.success} />
            <Text style={styles.statValue}>{usageStats?.limit || 50}</Text>
            <Text style={styles.statLabel}>Limit</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="ribbon" size={normalize(28)} color={COLORS.info} />
            <Text style={styles.statValue}>{formatTierName(usageStats?.tier)}</Text>
            <Text style={styles.statLabel}>Tier</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => {
            resetGenerateForm();
            setCurrentPage('generate');
          }}
        >
          <Ionicons name="add-circle" size={normalize(36)} color={COLORS.primary} />
          <Text style={styles.actionText}>Generate Report</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setCurrentPage('reports')}
        >
          <Ionicons name="folder-open" size={normalize(36)} color={COLORS.success} />
          <Text style={styles.actionText}>My Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => {
            setFormData({
              claimNumber: 'CLM-2024-001',
              insuredName: 'John Smith',
              lossDate: '2024-01-15',
              lossType: 'Fire',
              reportType: 'Preliminary',
              propertyAddress: '123 Main Street, City',
              propertyDetails: 'Single family residence, 2000 sq ft',
              lossDescription: 'Kitchen fire caused by electrical fault',
              damages: 'Smoke and fire damage to kitchen and adjacent rooms',
              recommendations: 'Replace damaged appliances and repair affected walls',
            });
            setPhotos([]);
            setGeneratedReport('');
            setCurrentPage('generate');
          }}
        >
          <Ionicons name="flash" size={normalize(36)} color={COLORS.warning} />
          <Text style={styles.actionText}>Quick Demo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setCurrentPage('profile')}
        >
          <Ionicons name="person-circle" size={normalize(36)} color={COLORS.info} />
          <Text style={styles.actionText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {myReports.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          {myReports.slice(0, 3).map((report, index) => (
            <TouchableOpacity
              key={report.reportId || index}
              style={styles.reportListItem}
              onPress={() => {
                setSelectedReport(report);
                setCurrentPage('reports');
              }}
            >
              <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{report.claimNumber}</Text>
                <Text style={styles.reportSubtitle}>{report.insuredName}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {myReports.length === 0 && !loadingReports && (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={normalize(56)} color={COLORS.textMuted} />
          <Text style={styles.emptyStateText}>No reports yet</Text>
          <Text style={styles.emptyStateSubtext}>Tap "Generate Report" to create your first report!</Text>
        </View>
      )}
    </ScrollView>
  );

  // Generate Report Page
  const renderGenerate = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Generate New Report</Text>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Claim Information</Text>

          <Text style={styles.inputLabel}>Claim Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter claim number"
            value={formData.claimNumber}
            onChangeText={(value) => updateFormField('claimNumber', value)}
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.inputLabel}>Insured Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter insured name"
            value={formData.insuredName}
            onChangeText={(value) => updateFormField('insuredName', value)}
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.inputLabel}>Loss Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.lossDate}
            onChangeText={(value) => {
              // Basic validation for date format
              const dateRegex = /^\d{0,4}(-\d{0,2})?(-\d{0,2})?$/;
              if (dateRegex.test(value) || value === '') {
                updateFormField('lossDate', value);
              }
            }}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.inputLabel}>Loss Type *</Text>
          <View style={styles.pickerContainer}>
            {['Fire', 'Water', 'Wind', 'Hail', 'Theft', 'Vandalism', 'Other'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.pickerOption,
                  formData.lossType === type && styles.pickerOptionSelected
                ]}
                onPress={() => updateFormField('lossType', type)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  formData.lossType === type && styles.pickerOptionTextSelected
                ]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Property Details</Text>

          <Text style={styles.inputLabel}>Property Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter property address"
            value={formData.propertyAddress}
            onChangeText={(value) => updateFormField('propertyAddress', value)}
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.inputLabel}>Property Details</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter property details"
            value={formData.propertyDetails}
            onChangeText={(value) => updateFormField('propertyDetails', value)}
            multiline
            numberOfLines={4}
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.sectionLabel}>Loss Information</Text>

          <Text style={styles.inputLabel}>Loss Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the loss"
            value={formData.lossDescription}
            onChangeText={(value) => updateFormField('lossDescription', value)}
            multiline
            numberOfLines={4}
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.inputLabel}>Damages</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe damages"
            value={formData.damages}
            onChangeText={(value) => updateFormField('damages', value)}
            multiline
            numberOfLines={4}
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.inputLabel}>Recommendations</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter recommendations"
            value={formData.recommendations}
            onChangeText={(value) => updateFormField('recommendations', value)}
            multiline
            numberOfLines={4}
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.sectionLabel}>Photos</Text>
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Ionicons name="images-outline" size={24} color={COLORS.primary} />
              <Text style={styles.photoButtonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
              <Text style={styles.photoButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>

          {photos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photoGrid}>
                {photos.map((photo, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.photoItem}
                    onLongPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                      Alert.alert(
                        'Delete Photo',
                        'Remove this photo?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', onPress: () => removePhoto(index), style: 'destructive' }
                        ]
                      );
                    }}
                    delayLongPress={500}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.photoRemove}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateReport}
            disabled={generating}
          >
            {generating ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator color="#ffffff" />
                <Text style={styles.generateButtonText}>Generating...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#ffffff" />
                <Text style={styles.generateButtonText}>Generate Report with AI</Text>
              </>
            )}
          </TouchableOpacity>

          {generatedReport && (
            <View style={styles.reportPreview}>
              <Text style={styles.reportPreviewTitle}>Generated Report</Text>
              <ScrollView style={styles.reportPreviewContent} nestedScrollEnabled>
                <Text style={styles.reportText}>{generatedReport}</Text>
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // My Reports Page
  const renderReports = () => (
    <ScrollView
      style={styles.content}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
    >
      <View style={styles.pageTitleContainer}>
        <Text style={styles.pageTitle}>My Reports</Text>
        {!loadingReports && myReports.length > 0 && (
          <View style={styles.reportCountBadge}>
            <Text style={styles.reportCountText}>{myReports.length}</Text>
          </View>
        )}
      </View>

      {loadingReports ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : myReports.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={normalize(56)} color={COLORS.textMuted} />
          <Text style={styles.emptyStateText}>No reports yet</Text>
          <Text style={styles.emptyStateSubtext}>Generate your first report to get started!</Text>
        </View>
      ) : (
        <View>
          {myReports.map((report, index) => (
            <TouchableOpacity
              key={report.reportId || index}
              style={styles.reportCard}
              onPress={() => setSelectedReport(report)}
            >
              <View style={styles.reportCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reportCardTitle}>{report.claimNumber}</Text>
                  <Text style={styles.reportCardSubtitle}>{report.insuredName}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} />
              </View>
              <View style={styles.reportCardMeta}>
                <View style={styles.reportCardMetaItem}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.reportCardMetaText}>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.reportCardMetaItem}>
                  <Ionicons name="flame-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.reportCardMetaText}>{report.lossType}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Report Detail Modal */}
      <Modal
        visible={selectedReport !== null}
        animationType="slide"
        onRequestClose={() => setSelectedReport(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Report Details</Text>
            <View style={styles.modalHeaderActions}>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    'Download Report',
                    'Choose format:',
                    [
                      { text: 'PDF', onPress: () => handleDownloadReport(selectedReport, 'pdf') },
                      { text: 'DOCX', onPress: () => handleDownloadReport(selectedReport, 'docx') },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }}
              >
                <Ionicons name="download-outline" size={22} color={COLORS.surface} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedReport(null);
                }}
                style={{ padding: 4 }}
              >
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {selectedReport && (
              <>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Claim Number</Text>
                  <Text style={styles.modalValue}>{selectedReport.claimNumber}</Text>
                </View>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Insured Name</Text>
                  <Text style={styles.modalValue}>{selectedReport.insuredName}</Text>
                </View>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Loss Type</Text>
                  <Text style={styles.modalValue}>{selectedReport.lossType}</Text>
                </View>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Report Type</Text>
                  <Text style={styles.modalValue}>{selectedReport.reportType}</Text>
                </View>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Loss Date</Text>
                  <Text style={styles.modalValue}>{selectedReport.lossDate || 'Not specified'}</Text>
                </View>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Property Address</Text>
                  <Text style={styles.modalValue}>{selectedReport.propertyAddress || 'Not specified'}</Text>
                </View>
                <View style={[styles.modalSection, { marginBottom: 40 }]}>
                  <Text style={styles.modalLabel}>Generated Report</Text>
                  <Text style={styles.modalValueContent}>{selectedReport.content}</Text>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );

  // Profile Page
  const renderProfile = () => (
    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={normalize(44)} color={COLORS.primary} />
        </View>
        <Text style={styles.profileName}>{user?.displayName}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Information</Text>
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={20} color={COLORS.text} />
          <Text style={styles.infoText}>{user?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="ribbon" size={20} color={COLORS.success} />
          <Text style={styles.infoText}>Tier: {formatTierName(usageStats?.tier)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>
            Joined: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preferences</Text>
        <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
          <View style={styles.themeToggleLeft}>
            <Ionicons
              name={isDarkMode ? 'moon' : 'sunny'}
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.themeToggleText}>
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>
          <View style={[
            styles.toggleSwitch,
            isDarkMode && styles.toggleSwitchActive
          ]}>
            <View style={[
              styles.toggleThumb,
              isDarkMode && styles.toggleThumbActive
            ]} />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={COLORS.surface} translucent={Platform.OS === 'android'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>FlacronAI</Text>
        <TouchableOpacity onPress={() => Alert.alert('Notifications', 'No new notifications')}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {currentPage === 'dashboard' && renderDashboard()}
      {currentPage === 'generate' && renderGenerate()}
      {currentPage === 'reports' && renderReports()}
      {currentPage === 'profile' && renderProfile()}

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => navigateWithHaptic('dashboard')}
        >
          <Ionicons
            name={currentPage === 'dashboard' ? 'home' : 'home-outline'}
            size={24}
            color={currentPage === 'dashboard' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[
            styles.tabLabel,
            currentPage === 'dashboard' && styles.tabLabelActive
          ]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => navigateWithHaptic('generate')}
        >
          <Ionicons
            name={currentPage === 'generate' ? 'add-circle' : 'add-circle-outline'}
            size={24}
            color={currentPage === 'generate' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[
            styles.tabLabel,
            currentPage === 'generate' && styles.tabLabelActive
          ]}>Generate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => navigateWithHaptic('reports')}
        >
          <Ionicons
            name={currentPage === 'reports' ? 'folder' : 'folder-outline'}
            size={24}
            color={currentPage === 'reports' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[
            styles.tabLabel,
            currentPage === 'reports' && styles.tabLabelActive
          ]}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => navigateWithHaptic('profile')}
        >
          <Ionicons
            name={currentPage === 'profile' ? 'person' : 'person-outline'}
            size={24}
            color={currentPage === 'profile' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[
            styles.tabLabel,
            currentPage === 'profile' && styles.tabLabelActive
          ]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
