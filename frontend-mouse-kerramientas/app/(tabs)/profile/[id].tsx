import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppLayout from '../../../components/AppLayout';
import { useAuth } from '../../../context/AuthContext';
import { Tool, toolsService } from '../../../services/api';

// Tool Card Component
const ToolCard = ({ tool }: { tool: Tool }) => {
  return (
    <TouchableOpacity 
      style={styles.toolCard}
      onPress={() => router.push(`/(tabs)/tool/${tool.id}` as any)}
    >
      <View style={styles.toolImagePlaceholder}>
        {tool.image_url ? (
          <Ionicons name="image" size={40} color="#666" />
        ) : (
          <Ionicons name="construct" size={40} color="#666" />
        )}
      </View>
      <View style={styles.toolInfo}>
        <Text style={styles.toolName}>{tool.name}</Text>
        <Text style={styles.toolPrice}>${tool.price}</Text>
        <Text style={styles.toolDescription} numberOfLines={2}>
          {tool.description}
        </Text>
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
          <Text>Cargando perfil...</Text>
        </View>
      </AppLayout>
    );
  }

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };
  console.log(profileUser.username);

  return (
    <AppLayout>
      <ScrollView style={styles.container}>
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
                <Ionicons name="settings-outline" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.username}>{profileUser.username}</Text>
          <Text style={styles.email}>{profileUser.email}</Text>
        </View>

        <View style={styles.toolsContainer}>
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </View>
      </ScrollView>

      {isOwnProfile && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/create-post' as any)}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#666',
  },
  settingsButton: {
    position: 'absolute',
    right: -40,
    padding: 8,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  toolsContainer: {
    padding: 16,
  },
  toolCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  toolPrice: {
    fontSize: 16,
    color: '#2ecc71',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
