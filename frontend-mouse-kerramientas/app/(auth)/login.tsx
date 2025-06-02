import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Alert } from '../../components/ui/Alert';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

// Obtenemos el ancho de la pantalla para asegurarnos que el diseño ocupe todo el espacio
const { width, height } = Dimensions.get('window');
// Calculamos una unidad base relativa basada en la pantalla
const baseUnit = Math.min(width, height) * 0.05;

// Componente mejorado con distribución en cuadrícula compatible con móviles
const ToolsBackground = ({ opacity = 0.5, density = 8 }) => {
    // Array de iconos de herramientas para usar
    const toolIcons = [
      'hammer', 'screwdriver', 'wrench', 'tools', 
      'pencil-ruler', 'tape', 'toolbox', 'ruler'
    ];
    
    // Generamos las herramientas usando useMemo para mejorar el rendimiento
    const tools = useMemo(() => {
      const result = [];
      // Determinamos el número de filas y columnas según la densidad
      const rows = density; 
      const cols = density;
      
      // Calculamos el ancho y alto del contenedor
      const containerWidth = width; // Ancho de la pantalla
      const containerHeight = height; // Altura del header
      
      // Calculamos el espaciado entre herramientas en valores absolutos (píxeles)
      const xStep = containerWidth / (cols + 1);
      const yStep = containerHeight / (rows + 1);
      
      // Creamos la cuadrícula
      for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= cols; col++) {
          // Calculamos la posición exacta usando el espaciado (en píxeles, no porcentajes)
          const x = col * xStep;
          const y = row * yStep;
          
          // Elegimos un ícono aleatorio del array
          const randomIcon = toolIcons[Math.floor(Math.random() * toolIcons.length)];
          
          // Tamaño aleatorio pero dentro de un rango razonable
          const size = Math.floor(Math.random() * 8) + 16; // Entre 16 y 24
          
          // Rotación aleatoria para variedad visual (valor en grados, sin "deg")
          const rotate = Math.floor(Math.random() * 8) * 45; // Múltiplos de 45 grados
          
          // Añadimos pequeñas variaciones aleatorias en píxeles, no en porcentajes
          const xOffset = (Math.random() * 14 - 7 - 1/density*100); // Variación de ±10px
          const yOffset = (Math.random() * 14 - 7 - 1/density*100 + (col % 2 === 0 ? 20 : 0)); // Variación de ±10px
          
          // Agregamos la herramienta a nuestro array
          result.push({
            icon: randomIcon,
            x: x + xOffset,
            y: y + yOffset,
            size: size,
            rotate: rotate,
          });
        }
      }
      
      return result;
    }, [density]); // Solo se recalcula si cambia la densidad
  
    return (
      <View style={styles.patternContainer}>
        {tools.map((tool, index) => (
          <FontAwesome5 
            key={index}
            name={tool.icon}
            size={tool.size}
            color="white"
            style={{
              position: 'absolute',
              left: tool.x,
              top: tool.y,
              opacity: opacity,
              transform: [{ rotate: `${tool.rotate}deg` }]
            }}
          />
        ))}
      </View>
    );
  };

export default function LoginScreen() {
  const theme = Colors.light;
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Limpiar errores cuando cambie el formulario
  useEffect(() => {
    if (error || localError) {
      clearError();
      setLocalError(null);
    }
  }, [formData]);

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const validateForm = () => {
    if (!formData.username.trim()) {
      setLocalError('El nombre de usuario es requerido');
      return false;
    }
    if (!formData.password.trim()) {
      setLocalError('La contraseña es requerida');
      return false;
    }
    if (formData.password.length < 3) {
      setLocalError('La contraseña debe tener al menos 3 caracteres');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setLocalError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.username, formData.password);
      setSuccessMessage('¡Inicio de sesión exitoso!');
      // La redirección se maneja automáticamente por el useEffect
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      {/* Header con fondo rojo */}
      <View style={styles.header}>
        {/* Patrón de herramientas */}
        <ToolsBackground opacity={0.12} density={13} />
        
        <SafeAreaView style={styles.logoContainer}>
            <View style={styles.logoBg}>
            <Image 
              source={require('../../assets/images/mouske_icon_white_border.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            </View>
        </SafeAreaView>
        {/* Curva inferior del header */}
        <View style={styles.curve} />
      </View>
      
      {/* Formulario */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Bienvenido</Text>
        
        {/* Alertas de error y éxito */}
        <Alert 
          type="error" 
          message={error || localError || ''} 
          visible={!!(error || localError)}
          onClose={() => {
            clearError();
            setLocalError(null);
          }}
        />
        
        <Alert 
          type="success" 
          message={successMessage || ''} 
          visible={!!successMessage}
          onClose={() => setSuccessMessage(null)}
        />
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Usuario</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input}
              placeholder="Nombre de usuario"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={theme.placeholderText}
              editable={!isLoading}
            />
            <FontAwesome5 name="user" size={baseUnit * 0.9} color={Colors.light.textSecondary} style={styles.inputIcon} />
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input}
              placeholder="••••••••"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry={!showPassword}
              placeholderTextColor={theme.placeholderText}
              editable={!isLoading}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.inputIcon}
            >
              <FontAwesome5 
                name={showPassword ? "eye-slash" : "eye"} 
                size={baseUnit * 0.9} 
                color={Colors.light.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.buttonLoading}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.buttonText}>Iniciando sesión...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.linkText}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    width: '100%',
  },
  header: {
    zIndex: 1,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: width,
    height: height * 0.47,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    left: 0,
    right: 0,
    overflow: 'hidden', // Para que los iconos no salgan del área
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Cambiamos de -1 a 1 para asegurar que se muestre
    width: '100%',
    height: '100%',
  },
  curve: {
    zIndex: 2,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: width,
    height: 60,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: '200%',
    borderTopRightRadius: '200%',
  },
  logoContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: -10,
    zIndex: 2,
  },
  logoBg: {
    width: width * 0.37,
    height: width * 0.37,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 15,
  },
  logo: {
    width: width * 0.30,
    height: width * 0.30,
    opacity: 0.9,
    left: -5,
    zIndex: 2,
  },
  logoText: {
    fontSize: baseUnit * 2,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  logoSubText: {
    fontSize: baseUnit * 1.6,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: {
    backgroundColor: 'white',
    zIndex: 5,
    flex: 1,
    padding: width * 0.06,
    paddingTop: height * 0.02,
  },
  title: {
    zIndex: 10,
    fontSize: baseUnit * 1.8,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: height * 0.06,
    marginTop: height * -0.04,
  },
  inputContainer: {
    zIndex: 10,
    marginBottom: height * 0.02,
  },
  label: {
    fontSize: baseUnit * 0.8,
    fontWeight: '600',
    marginBottom: height * 0.01,
    color: Colors.light.text,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    backgroundColor: Colors.light.inputBg,
    padding: width * 0.04,
    fontSize: baseUnit * 0.8,
    flex: 1,
    color: Colors.light.text,
  },
  inputIcon: {
    position: 'absolute',
    right: 15,
  },
  forgotPassword: {
    textAlign: 'right',
    color: Colors.light.forgotPasswordText,
    marginTop: height * 0.01,
    marginBottom: height * 0.03,
    fontSize: baseUnit * 0.7,
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: baseUnit * 0.8,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: height * 0.03,
  },
  footerText: {
    color: Colors.light.textSecondary,
    fontSize: baseUnit * 0.75,
  },
  linkText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: baseUnit * 0.75,
  },
});