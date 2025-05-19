import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

// Obtenemos el ancho de la pantalla para asegurarnos que el diseño ocupe todo el espacio
const { width, height } = Dimensions.get('window');
// Calculamos una unidad base relativa basada en la pantalla
const baseUnit = Math.min(width, height) * 0.04;

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
          const xOffset = (Math.random() * 50 - 25 - 1/density*100); // Variación de ±10px
          const yOffset = (Math.random() * 50 - 25- 1/density*100 + (col % 2 === 0 ? 20 : 0)); // Variación de ±10px
          
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


export default function RegisterScreen() {
  const theme = Colors.light;

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      
      {/* Header con fondo rojo */}
      <View style={styles.header}>
        {/* Patrón de herramientas */}
        <ToolsBackground opacity={0.2} density={9} />
        
        <SafeAreaView style={styles.headerContent}>
          <View style={styles.logoRow}>
            <View style={styles.logoBg}>
              <Image 
                source={require('../../assets/images/mouske_icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.logoText}>Mouse</Text>
              <Text style={styles.logoSubText}>Kerrementas</Text>
            </View>
          </View>
        </SafeAreaView>
        {/* Curva inferior del header */}
        <View style={styles.curve} />
      </View>
      
      {/* Formulario */}
      <ScrollView 
        style={styles.formScrollView}
        contentContainerStyle={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Crear Cuenta</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input}
              placeholder="Ingresa tu nombre"
              placeholderTextColor={theme.placeholderText}
            />
            <FontAwesome5 name="user" size={baseUnit * 0.9} color={Colors.light.textSecondary} style={styles.inputIcon} />
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input}
              placeholder="Ingresa tu email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={theme.placeholderText}
            />
            <FontAwesome5 name="envelope" size={baseUnit * 0.9} color={Colors.light.textSecondary} style={styles.inputIcon} />
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input}
              placeholder="Ingresa tu contraseña"
              secureTextEntry={true}
              placeholderTextColor={theme.placeholderText}
            />
            <FontAwesome5 name="lock" size={baseUnit * 0.9} color={Colors.light.textSecondary} style={styles.inputIcon} />
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmar Contraseña</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input}
              placeholder="Confirma tu contraseña"
              secureTextEntry={true}
              placeholderTextColor={theme.placeholderText}
            />
            <FontAwesome5 name="check-circle" size={baseUnit * 0.9} color={Colors.light.textSecondary} style={styles.inputIcon} />
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: width,
    height: height * 0.25, // Un poco más pequeño que el login
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    left: 0,
    right: 0,
    overflow: 'hidden', // Para que los iconos no salgan del área
  },
  headerContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: width * 0.1,
    zIndex: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Aseguramos que el patrón esté visible
    width: '100%',
    height: '100%',
  },
  curve: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    width: width,
    height: 80,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: '200%',
    borderTopRightRadius: '200%',
    zIndex: 5,
  },
  logoBg: {
    width: width * 0.18,
    height: width * 0.18,
    backgroundColor: 'white',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: width * 0.12,
    height: width * 0.12,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  logoText: {
    fontSize: baseUnit * 1.8,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  logoSubText: {
    fontSize: baseUnit * 1.2,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formScrollView: {
    flex: 1,
  },
  formContainer: {
    padding: width * 0.06,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.05,
  },
  title: {
    fontSize: baseUnit * 1.8,
    fontWeight: 'bold',
    marginTop: height * - 0.02,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: height * 0.03,
  },
  inputContainer: {
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
    marginTop: height * 0.02,
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