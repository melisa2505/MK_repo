import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppLayout from '../../../components/AppLayout';
import { Colors } from '../../../constants/Colors';
import { useAuth } from '../../../context/AuthContext';
import { Tool, toolsService } from '../../../services/api';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 3; // 3 cards per row with spacing

// Tool Card Component
const ToolCard = ({ tool }: { tool: Tool }) => {
  return (
    <TouchableOpacity 
      style={styles.toolCard}
      onPress={() => router.push(`/(tabs)/tool/${tool.id}` as any)}
    >
      <View style={styles.toolImageContainer}>
        {tool.image_url ? (
          <Image 
            source={{ uri: tool.image_url }} 
            style={styles.toolImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.toolImagePlaceholder}>
            <Ionicons name="construct" size={24} color={Colors.light.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.toolInfo}>
        <Text style={styles.toolName} numberOfLines={2}>{tool.name}</Text>
        <Text style={styles.toolPrice}>S/. {tool.daily_price}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isOwnProfile = user?.id === Number(id);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        
        // Cargar datos del usuario del perfil
        // Por ahora usamos el usuario actual como ejemplo
        if (user) {
          setProfileUser(user);
        }
        
        // Cargar herramientas del usuario
        if (id) {
          const userTools = await toolsService.getUserTools(Number(id));
          setTools(userTools);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfileData();
  }, [id, user]);

  // Mostrar loading mientras carga
  if (isLoading || !profileUser) {
    return (
      <AppLayout>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </AppLayout>
    );
  }

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <AppLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>
                {getInitials(profileUser.username)}
              </Text>
            </View>
            {isOwnProfile && (
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => router.push('/(tabs)/profile/settings' as any)}
              >
                <Ionicons name="settings-outline" size={24} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.username}>{profileUser.username}</Text>
          <Text style={styles.email}>{profileUser.email}</Text>
        </View>

        <View style={styles.toolsSection}>
          <Text style={styles.sectionTitle}>Herramientas</Text>
          <FlatList
            data={tools}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ToolCard tool={item} />}
            numColumns={3}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.toolsList}
          />
        </View>

        {isOwnProfile && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/create-post' as any)}
          >
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  initials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingsButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.light.text,
  },
  email: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  toolsSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.light.text,
  },
  toolsList: {
    paddingBottom: 80, // Space for FAB
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toolCard: {
    width: cardWidth,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolImageContainer: {
    width: '100%',
    height: cardWidth * 0.7,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  toolImage: {
    width: '100%',
    height: '100%',
  },
  toolImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolInfo: {
    alignItems: 'center',
  },
  toolName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.light.text,
    textAlign: 'center',
    minHeight: 32, // Consistent height for 2 lines
  },
  toolPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  fab: {
    position: 'absolute',
    right: '50%',
    bottom: 20,
    marginRight: -28, // Half of the button width to center it
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
