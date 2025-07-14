import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppLayout from '../../../components/AppLayout';
import { ToolsBackground } from '../../../components/ToolsBackground';
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
    // Solo cargar datos del usuario del perfil una vez
    if (user) {
      setProfileUser(user);
    }
  }, [user]);

  // Usar useFocusEffect para recargar herramientas cada vez que se enfoca la pantalla
  useFocusEffect(
    useCallback(() => {
      const loadTools = async () => {
        try {
          setIsLoading(true);
          
          // Cargar herramientas del usuario cada vez que se enfoca la pantalla
          if (id) {
            console.log("Cargando herramientas para usuario:", id);
            const userTools = await toolsService.getUserTools(Number(id));
            setTools(userTools);
          }
        } catch (error) {
          console.error('Error loading tools:', error);
          setTools([]); // Si hay error, mostrar lista vacía
        } finally {
          setIsLoading(false);
        }
      };
      
      loadTools();
    }, [id])
  );

  // Mostrar loading mientras carga
  if (!profileUser) {
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
          {/* Patrón de herramientas */}
          <ToolsBackground opacity={0.08} density={10} iconColor="#6c757d" />
          
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
          
          {/* Curva inferior del header */}
          <View style={styles.curve} />
        </View>

        <View style={styles.toolsSection}>
          <Text style={styles.sectionTitle}>Herramientas</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando herramientas...</Text>
            </View>
          ) : (
            <FlatList
              data={tools}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <ToolCard tool={item} />}
              numColumns={3}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.toolsList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No tienes herramientas publicadas</Text>
                </View>
              }
            />
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  header: {
    position: 'relative',
    padding: 20,
    paddingBottom: 40, // Espacio extra para la curva
    alignItems: 'center',
    backgroundColor: '#f8f9fa', // Color gris claro suave
    overflow: 'hidden', // Para que los iconos no salgan del área
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
    zIndex: 2, // Asegurar que esté por encima del patrón
  },
  curve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: width,
    height: 30,
    backgroundColor: Colors.light.background, // Mantenemos el color de fondo de la app
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    zIndex: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary, // Mantenemos el rojo para el avatar
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2,
  },
  initials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF', // Blanco para las iniciales
  },
  settingsButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 117, 125, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2c3e50', // Gris oscuro para buen contraste
    zIndex: 2,
  },
  email: {
    fontSize: 16,
    color: '#6c757d', // Gris medio
    marginBottom: 16,
    zIndex: 2,
  },
  toolsSection: {
    flex: 1,
    padding: 16,
    paddingTop: 20, // Espacio extra para compensar la curva
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
