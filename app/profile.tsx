import React from 'react';
import { StyleSheet, View, SafeAreaView, Image, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { BottomTabBar } from '@/components/BottomTabBar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  const menuItems = [
    [
      { 
        icon: 'document-text-outline', 
        title: 'Edit profile information',
        rightContent: null 
      },
      { 
        icon: 'notifications-outline', 
        title: 'Notifications', 
        rightContent: 'ON' 
      },
      { 
        icon: 'language-outline', 
        title: 'Language', 
        rightContent: 'English' 
      },
    ],
    [
      { 
        icon: 'shield-checkmark-outline', 
        title: 'Security', 
        rightContent: null 
      },
      { 
        icon: 'color-palette-outline', 
        title: 'Theme', 
        rightContent: 'Light mode' 
      },
    ],
    [
      { 
        icon: 'help-circle-outline', 
        title: 'Help & Support', 
        rightContent: null 
      },
      { 
        icon: 'chatbubbles-outline', 
        title: 'Contact us', 
        rightContent: null 
      },
      { 
        icon: 'lock-closed-outline', 
        title: 'Privacy policy', 
        rightContent: null 
      },
    ]
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={iconColor} />
          </TouchableOpacity>
          <View style={{flex: 1}} />
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="time-outline" size={24} color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>

              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="pencil" size={18} color="white" />
              </TouchableOpacity>
            </View>
            
            <ThemedText style={styles.profileName}>
              Lucho Arturo
            </ThemedText>
            <ThemedText style={styles.profileEmail}>
              youremail@domain.com | +01 234 567 89
            </ThemedText>
          </View>

          {menuItems.map((section, index) => (
            <ThemedView key={index} style={styles.menuSection}>
              {section.map((item, itemIndex) => (
                <TouchableOpacity key={itemIndex} style={styles.menuItem}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name={item.icon as any} size={22} color={iconColor} style={styles.menuIcon} />
                    <ThemedText>{item.title}</ThemedText>
                  </View>
                  {item.rightContent ? (
                    <ThemedText 
                      style={[
                        styles.rightContent, 
                        item.rightContent === 'ON' ? { color: tintColor } : {}
                      ]}
                    >
                      {item.rightContent}
                    </ThemedText>
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={iconColor} />
                  )}
                </TouchableOpacity>
              ))}
            </ThemedView>
          ))}
        </ScrollView>

        <BottomTabBar />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  iconButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  menuSection: {
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  rightContent: {
    color: '#666',
  },
});