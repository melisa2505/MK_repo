import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      console.log("Navegando al perfil del usuario");
      if (user?.id) {
        router.push(`/(tabs)/profile/${user.id}`);
      }
    }, [user?.id])
  );

  return null;
}
