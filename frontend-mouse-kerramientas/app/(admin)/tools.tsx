import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Tool, ToolCreate, toolService, ToolUpdate } from '../../../services/api';

export default function ToolsManagementScreen() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [formData, setFormData] = useState<ToolCreate>({
    name: '',
    description: '',
    brand: '',
    model: '',
    category: '',
    daily_price: 0,
    condition: 'good',
    is_available: true,
    image_url: '',
  });

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      setLoading(true);
      const data = await toolService.getTools();
      setTools(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTool(null);
    setFormData({
      name: '',
      description: '',
      brand: '',
      model: '',
      category: '',
      daily_price: 0,
      condition: 'good',
      is_available: true,
      image_url: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (tool: Tool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      description: tool.description || '',
      brand: tool.brand || '',
      model: tool.model || '',
      category: tool.category,
      daily_price: tool.daily_price,
      condition: tool.condition,
      is_available: tool.is_available,
      image_url: tool.image_url || '',
    });
    setModalVisible(true);
  };

  const saveTool = async () => {
    try {
      if (editingTool) {
        const updateData: ToolUpdate = { ...formData };
        await toolService.updateTool(editingTool.id, updateData);
      } else {
        await toolService.createTool(formData);
      }
      setModalVisible(false);
      loadTools();
      Alert.alert('Éxito', editingTool ? 'Herramienta actualizada' : 'Herramienta creada');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const deleteTool = (tool: Tool) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Está seguro de eliminar "${tool.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await toolService.deleteTool(tool.id);
              loadTools();
              Alert.alert('Éxito', 'Herramienta eliminada');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const renderTool = ({ item }: { item: Tool }) => (
    <View style={styles.toolCard}>
      <View style={styles.toolHeader}>
        <Text style={styles.toolName}>{item.name}</Text>
        <View style={styles.toolActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteTool(item)}
          >
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.toolInfo}>
        {item.brand} {item.model} - ${item.daily_price}/día
      </Text>
      <Text style={styles.toolCategory}>Categoría: {item.category}</Text>
      <Text style={styles.toolCondition}>Estado: {item.condition}</Text>
      <Text style={[
        styles.toolAvailability,
        { color: item.is_available ? '#10b981' : '#ef4444' }
      ]}>
        {item.is_available ? 'Disponible' : 'No disponible'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Herramientas</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tools}
        renderItem={renderTool}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingTool ? 'Editar Herramienta' : 'Nueva Herramienta'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Nombre de la herramienta"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Descripción de la herramienta"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Marca</Text>
                <TextInput
                  style={styles.input}
                  value={formData.brand}
                  onChangeText={(text) => setFormData({ ...formData, brand: text })}
                  placeholder="Marca"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Modelo</Text>
                <TextInput
                  style={styles.input}
                  value={formData.model}
                  onChangeText={(text) => setFormData({ ...formData, model: text })}
                  placeholder="Modelo"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoría *</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="Categoría"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Precio diario *</Text>
              <TextInput
                style={styles.input}
                value={formData.daily_price.toString()}
                onChangeText={(text) => setFormData({ ...formData, daily_price: parseFloat(text) || 0 })}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>URL de imagen</Text>
              <TextInput
                style={styles.input}
                value={formData.image_url}
                onChangeText={(text) => setFormData({ ...formData, image_url: text })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveTool}>
                <Text style={styles.saveButtonText}>
                  {editingTool ? 'Actualizar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  toolCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  toolActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  toolInfo: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  toolCategory: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  toolCondition: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  toolAvailability: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    fontSize: 24,
    color: '#64748b',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  cancelButton: {
    backgroundColor: '#64748b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
