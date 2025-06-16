import AppLayout from '@/components/AppLayout';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert as RNAlert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    let logouta =  async () => {
        try {
          setIsLoggingOut(true);
          await logout();
          router.replace('/(auth)/login');
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
        } finally {
          setIsLoggingOut(false);
        }
      }

    logouta();
    RNAlert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <AppLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user.full_name || user.username}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Pedidos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Reseñas</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mi Cuenta</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome5 name="user-edit" size={20} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Editar Perfil</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome5 name="key" size={20} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Cambiar Contraseña</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome5 name="map-marker-alt" size={20} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Mis Direcciones</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pedidos</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome5 name="shopping-bag" size={20} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Mis Pedidos</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome5 name="clock" size={20} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Historial</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome5 name="question-circle" size={20} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Ayuda</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome5 name="phone" size={20} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Contactanos</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome5 name="info-circle" size={20} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Acerca de</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        {user.is_superuser && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Administración</Text>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.adminMenuItem]}
              onPress={() => router.push('/(admin)')}
            >
              <View style={styles.menuItemLeft}>
                <FontAwesome5 name="cogs" size={20} color="#dc2626" />
                <Text style={[styles.menuItemText, styles.adminMenuText]}>Panel de Administración</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={16} color="#dc2626" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <View style={styles.logoutLoading}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.logoutButtonText}>Cerrando sesión...</Text>
            </View>
          ) : (
            <>
              <FontAwesome5 name="sign-out-alt" size={20} color="#FFFFFF" style={styles.logoutIcon} />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>Usuario desde: {new Date(user.created_at).toLocaleDateString()}</Text>
          <Text style={styles.userInfoText}>ID: {user.id}</Text>
        </View>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.secondary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.light.text,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 20,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginHorizontal: 16,
    color: Colors.light.text,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 16,
  },
  adminMenuItem: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  adminMenuText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userInfo: {
    padding: 16,
    alignItems: 'center',
  },
  userInfoText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
});