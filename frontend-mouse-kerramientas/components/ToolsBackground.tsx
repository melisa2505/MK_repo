import { FontAwesome5 } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Dimensions, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface ToolsBackgroundProps {
  opacity?: number;
  density?: number;
  containerWidth?: number;
  containerHeight?: number;
  iconColor?: string;
}

export const ToolsBackground = ({ 
  opacity = 0.5, 
  density = 8, 
  containerWidth = width, 
  containerHeight = height,
  iconColor = "white"
}: ToolsBackgroundProps) => {
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
  }, [density, containerWidth, containerHeight]); // Recalcula si cambian estos valores

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
    }}>
      {tools.map((tool, index) => (
        <FontAwesome5 
          key={index}
          name={tool.icon}
          size={tool.size}
          color={iconColor}
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
