import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { ChatWithMessages, Message, chatService } from '../../services/chat_services';
import { Tool, ToolOwner, toolService } from '../../services/tool_services_home';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [chat, setChat] = useState<ChatWithMessages | null>(null);
  const [tool, setTool] = useState<Tool | null>(null);
  const [owner, setOwner] = useState<ToolOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Determinar si el usuario es el propietario o el consumidor
  const isOwner = chat ? user?.id === chat.owner_id : false;
  const isConsumer = chat ? user?.id === chat.consumer_id : false;

  const fetchChatDetails = async () => {
    if (!id || !user) {
      setError('No se pudo identificar el chat o el usuario no ha iniciado sesión');
      setLoading(false);
      return;
    }

    try {
      // Obtener detalles del chat con mensajes
      const chatData = await chatService.getChatDetail(Number(id));
      setChat(chatData);
      
      // Obtener información de la herramienta
      const toolData = await toolService.getToolById(chatData.tool_id);
      setTool(toolData);

      // Obtener información del propietario
      const ownerData = await toolService.getToolOwner(toolData.owner_id);
      setOwner(ownerData);

      setLoading(false);
    } catch (error) {
      console.error('Error al cargar detalles del chat:', error);
      setError('No se pudo cargar la información del chat. Intente nuevamente.');
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchChatDetails();
  }, [id, user]);

  // Actualizar mensajes cada 5 segundos
  useEffect(() => {
    if (loading) return; // No actualizar si está cargando inicialmente

    const intervalId = setInterval(async () => {
      if (!id || !user) return;

      try {
        const updatedChat = await chatService.getChatDetail(Number(id));
        if (updatedChat.messages.length !== chat?.messages.length) {
          setChat(updatedChat);
        }
      } catch (error) {
        console.error('Error al actualizar mensajes:', error);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [id, user, chat, loading]);

  // Manejar el envío de un mensaje
  const handleSendMessage = async () => {
    if (!messageText.trim() || !chat || !user) return;

    try {
      setSending(true);
      await chatService.sendMessage(chat.id, user.id, messageText.trim());
      
      // Actualizar el chat con el nuevo mensaje
      const updatedChat = await chatService.getChatDetail(chat.id);
      setChat(updatedChat);
      
      // Limpiar el campo de texto
      setMessageText('');
      
      // Desplazar al final de la lista
      if (flatListRef.current && chat.messages.length > 0) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje. Intente nuevamente.');
    } finally {
      setSending(false);
    }
  };

  // Abrir la pantalla para solicitar alquiler
  const handleRequestRental = () => {
    if (!tool || !user) return;

    router.push({
      pathname: '/chats/request-rental',
      params: { 
        chatId: chat?.id,
        toolId: tool.id,
        ownerId: tool.owner_id,
        consumerId: user.id,
        dailyPrice: tool.daily_price
      }
    });
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUserMessage = item.sender_id === user?.id;
    const formattedTime = new Date(item.timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <View style={[
        styles.messageBubble,
        isUserMessage ? styles.userMessage : styles.otherMessage
      ]}>
        <Text style={[
          styles.messageText,
          isUserMessage ? styles.userMessageText : styles.otherMessageText
        ]}>
          {item.content}
        </Text>
        <Text style={[
          styles.messageTime,
          isUserMessage ? styles.userMessageTime : styles.otherMessageTime
        ]}>
          {formattedTime}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Cargando...' }} />
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (error || !chat) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Error' }} />
        <Text style={styles.errorText}>{error || 'No se encontró el chat'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <Stack.Screen 
        options={{ 
          title: tool?.name || 'Chat',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ),
          // Ya no necesitamos este botón en el header, lo moveremos a la parte inferior
          headerRight: () => null
        }} 
      />

      {/* Información de la herramienta */}
      {tool && (
        <TouchableOpacity 
          style={styles.toolInfoBanner}
          onPress={() => router.push({
            pathname: '/product-detail',
            params: { id: tool.id }
          })}
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
                <MaterialCommunityIcons name="tools" size={22} color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.toolInfo}>
            <Text style={styles.toolName} numberOfLines={1}>{tool.name}</Text>
            <Text style={styles.toolPrice}>S/. {tool.daily_price.toFixed(2)} / día</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#888" />
        </TouchableOpacity>
      )}

      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={chat.messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => 
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        onLayout={() => 
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        ListEmptyComponent={
          <View style={styles.emptyMessagesContainer}>
            <MaterialCommunityIcons 
              name="chat-outline" 
              size={60} 
              color={Colors.light.textSecondary} 
            />
            <Text style={styles.emptyMessagesText}>
              No hay mensajes aún. ¡Sé el primero en enviar un mensaje!
            </Text>
          </View>
        }
      />
      
      {/* Botón de solicitar alquiler (solo para consumidores) */}
      {isConsumer && tool?.is_available && (
        <TouchableOpacity 
          style={styles.requestRentalButton}
          onPress={handleRequestRental}
        >
          <Text style={styles.requestRentalButtonText}>Solicitar Alquiler</Text>
        </TouchableOpacity>
      )}
      
      {/* Input para enviar mensajes */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={Colors.light.textSecondary}
          multiline
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!messageText.trim() || sending) && styles.sendButtonDisabled
          ]} 
          onPress={handleSendMessage}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons name="send" size={22} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  backButtonHeader: {
    padding: 8,
  },
  rentalButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  rentalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  toolInfoBanner: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    alignItems: 'center',
  },
  toolImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  toolImage: {
    width: '100%',
    height: '100%',
  },
  toolImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  toolPrice: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: Colors.light.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: 'white', // Para mensajes del usuario
  },
  otherMessageText: {
    color: '#333333', // Para mensajes de otros usuarios - color oscuro para que se vea bien
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherMessageTime: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 80,
  },
  emptyMessagesText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  requestRentalButton: {
    backgroundColor: '#ff3b30', // Color rojo para llamar la atención
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  requestRentalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    backgroundColor: '#F5F5F5',
    color: Colors.light.text,
  },
  sendButton: {
    backgroundColor: Colors.light.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.textTernary,
  },
});