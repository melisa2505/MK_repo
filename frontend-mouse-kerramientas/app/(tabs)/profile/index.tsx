import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      console.log("Entras a /profile");
      if (user) {
        router.push(`/(tabs)/profile/${user.id}`);
      }
    }, [user])
  );

  return null;
}
