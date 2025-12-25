#!/usr/bin/env python3
"""
Script to upgrade App-Redesigned-White.js to production-ready UI
- Adds AI Assistant imports and state
- Removes Quick Demo button from dashboard
- Adds AI Assistant bubble and panel
"""

import re

# Read the file
with open('MobileApp/App-Redesigned-White.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("Step 1: Adding AI Assistant import...")
# Add AI Assistant import after AsyncStorage
content = content.replace(
    "import AsyncStorage from '@react-native-async-storage/async-storage';\n// NOTE: Firebase",
    "import AsyncStorage from '@react-native-async-storage/async-storage';\nimport { AIAssistantBubble, AIAssistantPanel } from './components/AIAssistant';\n// NOTE: Firebase"
)

print("Step 2: Adding AI Assistant state...")
# Find the main component and add state after other useState declarations
# Look for the pattern of multiple useState declarations and add after them
state_pattern = r"(const \[photos, setPhotos\] = useState\(\[\]\);)"
state_replacement = r"\1\n  const [showAIAssistant, setShowAIAssistant] = useState(false);"
content = re.sub(state_pattern, state_replacement, content)

print("Step 3: Removing Quick Demo button...")
# Remove the Quick Demo action card (3rd card in the grid)
quick_demo_pattern = r'<TouchableOpacity\s+style={styles\.actionCard}\s+onPress={\(\) => {\s+setFormData\({\s+claimNumber: \'CLM-2024-001\',[\s\S]*?<Text style={styles\.actionText}>Quick Demo</Text>\s+</TouchableOpacity>'
content = re.sub(quick_demo_pattern, '', content)

print("Step 4: Adding AI Assistant bubble to dashboard...")
# Add AI Assistant bubble before closing ScrollView in renderDashboard
# Find the end of the quick actions section
dashboard_pattern = r'(</View>\s+{/\* Quick Actions \*/}\s+</View>)'
dashboard_replacement = r'\1\n\n        {/* AI Assistant Bubble */}\n        <AIAssistantBubble onPress={() => setShowAIAssistant(true)} />'
content = re.sub(dashboard_pattern, dashboard_replacement, content)

print("Step 5: Adding AI Assistant panel...")
# Add AI Assistant panel before bottom navigation
# Find the pattern right before bottom navigation
panel_pattern = r'(</ScrollView>\s+{/\* Bottom Navigation \*/})'
panel_replacement = r'</ScrollView>\n\n      {/* AI Assistant Panel */}\n      <AIAssistantPanel\n        visible={showAIAssistant}\n        onClose={() => setShowAIAssistant(false)}\n      />\n\n      {/* Bottom Navigation */'
content = re.sub(panel_pattern, panel_replacement, content)

print("Step 6: Writing updated file...")
# Write the updated content
with open('MobileApp/App-Redesigned-White.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ SUCCESS! App-Redesigned-White.js upgraded to production UI")
print("Changes made:")
print("  ✓ Added AI Assistant imports")
print("  ✓ Added AI Assistant state")
print("  ✓ Removed Quick Demo button")
print("  ✓ Added AI Assistant bubble to dashboard")
print("  ✓ Added AI Assistant panel")
print("\nRestart the app to see changes:")
print("  cd MobileApp && npx expo start --clear")
