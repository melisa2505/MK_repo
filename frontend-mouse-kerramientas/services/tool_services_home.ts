import api from './api';

// Interfaces para las herramientas
export interface Tool {
  id: number;
  name: string;
  description: string;
  brand: string;
  model: string;
  daily_price: number;
  warranty: number;
  condition: string;
  category_id: number;
  image_url: string | null;
  is_available: boolean;
  owner_id: number;
}

export interface ToolDetail extends Tool {
  // Podemos agregar campos adicionales específicos del detalle si es necesario
}

export interface ToolOwner {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
}

export interface Chat {
  owner_id: number;
  consumer_id: number;
  tool_id: number;
  id: number;
  created_at: string;
}

// Modo de simulación - Cambiar a false para usar API real
const USE_MOCK_DATA = true;

// Datos de prueba para herramientas
const MOCK_TOOLS: Tool[] = [
  {
    id: 1,
    name: "Taladro Profesional",
    description: "Taladro eléctrico de alto rendimiento, ideal para trabajos de construcción y bricolaje. Incluye juego de brocas y maletín de transporte.",
    brand: "DeWalt",
    model: "DCD778S2T-QW",
    daily_price: 35.0,
    warranty: 30,
    condition: "Nuevo",
    category_id: 1,
    image_url: "https://promart.vteximg.com.br/arquivos/ids/7775595-1000-1000/image-99546dc5a3d1422884093d4bd42ee41b.jpg?v=638410354443400000",
    is_available: true,
    owner_id: 2
  },
  {
    id: 2,
    name: "Sierra Circular",
    description: "Sierra circular con guía láser para cortes precisos. Potencia de 1500W y disco de 7-1/4 pulgadas. Perfecta para carpintería.",
    brand: "Bosch",
    model: "GKS 190",
    daily_price: 40.0,
    warranty: 20,
    condition: "Buen estado",
    category_id: 1,
    image_url: "https://promart.vteximg.com.br/arquivos/ids/7619953-1000-1000/154012.jpg?v=638356664513330000",
    is_available: true,
    owner_id: 3
  },
  {
    id: 3,
    name: "Lijadora Orbital",
    description: "Lijadora orbital con sistema de recolección de polvo. Ideal para trabajos de acabado en madera, metal y plástico.",
    brand: "Makita",
    model: "BO5041",
    daily_price: 25.0,
    warranty: 15,
    condition: "Usado",
    category_id: 2,
    image_url: "https://promart.vteximg.com.br/arquivos/ids/6520110-1000-1000/image-7901314168df448c90485d5d5bdda4a4.jpg?v=637983715962100000",
    is_available: true,
    owner_id: 2
  },
  {
    id: 4,
    name: "Martillo Demoledor",
    description: "Martillo demoledor de alto impacto para trabajos pesados. Incluye cincel plano y puntero.",
    brand: "Hilti",
    model: "TE 500-AVR",
    daily_price: 60.0,
    warranty: 30,
    condition: "Buen estado",
    category_id: 3,
    image_url: "https://promart.vteximg.com.br/arquivos/ids/7593436-1000-1000/image-81c8fcdb1eca4da397348f90749bc5ab.jpg?v=638345630284230000",
    is_available: false,
    owner_id: 4
  },
  {
    id: 5,
    name: "Compresor de Aire",
    description: "Compresor de aire portátil de 6 galones. Ideal para inflar neumáticos y operar herramientas neumáticas.",
    brand: "Stanley",
    model: "DN200/8/6",
    daily_price: 45.0,
    warranty: 20,
    condition: "Nuevo",
    category_id: 4,
    image_url: "https://media.falabella.com/falabellaPE/123980458_01/w=1500,h=1500,fit=pad",
    is_available: true,
    owner_id: 3
  },
  {
    id: 15,
    name: "Soldadora Inverter",
    description: "Soldadora inverter para electrodos de hasta 3.25mm. Incluye careta y electrodos básicos.",
    brand: "Lincoln Electric",
    model: "Invertec 135S",
    daily_price: 55.0,
    warranty: 25,
    condition: "Buen estado",
    category_id: 5,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRV4ArO1TpQSOtfLTkw45qYvar4Zp4rhd37cQ&s",
    is_available: true,
    owner_id: 5
  }
];

// Datos de prueba para propietarios
const MOCK_OWNERS: ToolOwner[] = [
  {
    id: 2,
    username: "herramientas_pro",
    email: "contacto@herramientaspro.com",
    full_name: "Herramientas Profesionales S.A."
  },
  {
    id: 3,
    username: "constructora_lopez",
    email: "alquiler@constructoralopez.com",
    full_name: "Constructora López"
  },
  {
    id: 4,
    username: "tools_master",
    email: "info@toolsmaster.com",
    full_name: "Tools Master"
  },
  {
    id: 5,
    username: "ferreteria_central",
    email: "alquileres@ferreteriacentral.com",
    full_name: "Ferretería Central"
  }
];

// Servicios para herramientas
export const toolService = {
  // Obtener todas las herramientas
  async getAllTools(): Promise<Tool[]> {
    // Si estamos en modo de simulación, devolvemos los datos de prueba
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        // Simulamos una pequeña demora para imitar la llamada a API
        setTimeout(() => {
          resolve(MOCK_TOOLS);
        }, 800);
      });
    }
    
    // Si no, usamos la API real
    try {
      const response = await api.get<Tool[]>('/api/tools/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener herramientas');
    }
  },

  // Obtener una herramienta específica por ID
  async getToolById(toolId: number): Promise<ToolDetail> {
    // Si estamos en modo de simulación, devolvemos un dato de prueba
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const tool = MOCK_TOOLS.find(t => t.id === toolId);
          if (tool) {
            resolve(tool as ToolDetail);
          } else {
            reject(new Error('Herramienta no encontrada, id buscado: ' + toolId));
          }
        }, 600);
      });
    }
    
    // Si no, usamos la API real
    try {
      const response = await api.get<ToolDetail>(`/api/tools/${toolId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener la herramienta');
    }
  },

  // Obtener información del propietario de una herramienta
  async getToolOwner(ownerId: number): Promise<ToolOwner> {
    // Si estamos en modo de simulación, devolvemos un dato de prueba
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const owner = MOCK_OWNERS.find(o => o.id === ownerId);
          if (owner) {
            resolve(owner);
          } else {
            reject(new Error('Propietario no encontrado'));
          }
        }, 400);
      });
    }
    
    // Si no, usamos la API real
    try {
      const response = await api.get<ToolOwner>(`/api/users/${ownerId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener información del propietario');
    }
  },

  // Crear un chat con el propietario de una herramienta
  async createChat(ownerId: number, consumerId: number, toolId: number): Promise<Chat> {
    // Si estamos en modo de simulación, simulamos la creación de un chat
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            owner_id: ownerId,
            consumer_id: consumerId,
            tool_id: toolId,
            id: Math.floor(Math.random() * 1000) + 1, // ID aleatorio para simular
            created_at: new Date().toISOString()
          });
        }, 600);
      });
    }
    
    // Si no, usamos la API real
    try {
      const response = await api.post<Chat>('/api/chats/create', {
        owner_id: ownerId,
        consumer_id: consumerId,
        tool_id: toolId
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al crear chat con el propietario');
    }
  }
};

// Función auxiliar para filtrar herramientas por término de búsqueda
export const filterToolsBySearchTerm = (tools: Tool[], searchTerm: string): Tool[] => {
  if (!searchTerm.trim()) {
    return tools;
  }
  
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
  return tools.filter(tool => 
    tool.name.toLowerCase().includes(lowerCaseSearchTerm) ||
    tool.description.toLowerCase().includes(lowerCaseSearchTerm) ||
    tool.brand.toLowerCase().includes(lowerCaseSearchTerm) ||
    tool.model.toLowerCase().includes(lowerCaseSearchTerm)
  );
};

export default toolService;