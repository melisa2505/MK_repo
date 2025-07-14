import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppLayout from '../../components/AppLayout';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { Chat, chatService } from '../../services/chat_services';
import { Tool, toolService } from '../../services/tool_services_home';

// Interfaz para los chats con información adicional de la herramienta
interface ChatListItem extends Chat {
  toolInfo?: Tool;
}

export default function ChatsScreen() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detección de pantalla pequeña
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenHeight < 700 || screenWidth < 350;

  // Cargar chats cada vez que se enfoca la pantalla
  useFocusEffect(
    useCallback(() => {
      const fetchChats = async () => {
        if (!user) {
          setError('Necesitas iniciar sesión para ver tus chats');
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError(null);
          console.log("Cargando chats del usuario...");
          
          // Obtener chats del usuario
          const userChats = await chatService.getUserChats(user.id);
          
          // Para cada chat, obtenemos información de la herramienta
          const chatsWithInfo = await Promise.all(
            userChats.map(async (chat) => {
              try {
                const toolInfo = await toolService.getToolById(chat.tool_id);
                return { ...chat, toolInfo };
              } catch (err) {
                return chat; // Si falla, devolvemos el chat sin info adicional
              }
            })
          );
          
          setChats(chatsWithInfo);
          setLoading(false);
        } catch (err) {
          console.error('Error al cargar chats:', err);
          setError('No se pudieron cargar los chats. Intente nuevamente.');
          setLoading(false);
        }
      };

      fetchChats();
    }, [user])
  );

  const renderChatItem = ({ item }: { item: ChatListItem }) => {
    // Determinar si el usuario actual es el propietario o el consumidor
    const isOwner = user?.id === item.owner_id;
    const counterpartId = isOwner ? item.consumer_id : item.owner_id;

    return (
      <TouchableOpacity 
        style={[
          styles.chatCard,
          isSmallScreen && styles.chatCardSmall
        ]}
        onPress={() => router.push({
          pathname: '/chats/[id]',
          params: { id: item.id }
        })}
      >
        {/* Imagen de la herramienta o placeholder */}
        <View style={[
          styles.imageContainer,
          isSmallScreen && styles.imageContainerSmall
        ]}>
          {item.toolInfo?.image_url ? (
            <Image 
              source={{ uri: item.toolInfo.image_url }} 
              style={styles.toolImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons 
                name="tools" 
                size={isSmallScreen ? 20 : 24} 
                color={Colors.light.textSecondary} 
              />
            </View>
          )}
        </View>
        
        <View style={styles.chatInfo}>
          {/* Nombre de la herramienta si está disponible */}
          <Text style={[
            styles.chatTitle,
            isSmallScreen && styles.chatTitleSmall
          ]} numberOfLines={isSmallScreen ? 1 : 2}>
            {item.toolInfo?.name || `Chat #${item.id}`}
          </Text>
          
          {/* Mostrar con quién es el chat */}
          <Text style={[
            styles.chatSubtitle,
            isSmallScreen && styles.chatSubtitleSmall
          ]} numberOfLines={1}>
            {isOwner ? 'Chat con cliente' : 'Chat con proveedor'} #{counterpartId}
          </Text>
          
          {/* Fecha de creación del chat - Ocultar en pantallas muy pequeñas */}
          {!isSmallScreen && (
            <Text style={styles.chatDate}>
              Iniciado el {new Date(item.created_at).toLocaleDateString('es-ES')}
            </Text>
          )}
        </View>
        
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={isSmallScreen ? 20 : 24} 
          color={Colors.light.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <View style={[
        styles.container,
        isSmallScreen && styles.containerSmall
      ]}>
        <Text style={[
          styles.title,
          isSmallScreen && styles.titleSmall
        ]}>Mis Chats</Text>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {!user && (
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : chats.length > 0 ? (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderChatItem}
            contentContainerStyle={styles.chatsList}
          />
        ) : (
          <View style={[
            styles.emptyContainer,
            isSmallScreen && styles.emptyContainerSmall
          ]}>
            <MaterialCommunityIcons 
              name="chat-remove-outline" 
              size={isSmallScreen ? 60 : 80} 
              color={Colors.light.textSecondary} 
            />
            <Text style={[
              styles.emptyText,
              isSmallScreen && styles.emptyTextSmall
            ]}>No tienes chats activos</Text>
            <TouchableOpacity
              style={[
                styles.browseButton,
                isSmallScreen && styles.browseButtonSmall
              ]}
              onPress={() => router.push('/')}
            >
              <Text style={[
                styles.browseButtonText,
                isSmallScreen && styles.browseButtonTextSmall
              ]}>Explorar herramientas</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  containerSmall: {
    padding: 12, // Reducir padding en pantallas pequeñas
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.light.text,
  },
  titleSmall: {
    fontSize: 20,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatsList: {
    paddingBottom: 20,
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  chatCardSmall: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 12,
  },
  imageContainerSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  toolImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  chatTitleSmall: {
    fontSize: 15,
    marginBottom: 2,
  },
  chatSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  chatSubtitleSmall: {
    fontSize: 13,
    marginBottom: 1,
  },
  chatDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  emptyContainerSmall: {
    paddingBottom: 30,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginVertical: 20,
  },
  emptyTextSmall: {
    fontSize: 14,
    marginVertical: 15,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  browseButtonSmall: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  browseButtonTextSmall: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});