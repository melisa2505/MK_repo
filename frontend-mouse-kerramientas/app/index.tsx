import { Redirect } from 'expo-router';

export default function Index() {
  // Redirigimos al usuario a la pantalla de login al iniciar la aplicación
  return <Redirect href="/login" />;
}