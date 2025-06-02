import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppLayout from "../../../components/AppLayout";
//import { useAuth } from "../../hooks/useAuth"; // tu hook de autenticación

// Simulamos tipos de datos
interface ToolCardProps {
  id: string;
  name: string;
  imageUri: string;
}

interface Review {
  id: string;
  comment: string;
  author: string;
}

// Componente Card
const ToolCard: React.FC<ToolCardProps> = ({ id, name, imageUri }) => (
  <View style={styles.card}>
    <Image source={{ uri: imageUri }} style={styles.cardImage} />
    <Text style={styles.cardTitle}>{name}</Text>
  </View>
);

interface Props {
  reviews: Review[];
  tools: ToolCardProps[];
  rentedTools: ToolCardProps[];
  averageRating?: number;
}



export default function ProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Mock del usuario autenticado (simula tu hook de autenticación)
  const myId = "123"; // Este valor debe coincidir con el del BottomTabBar
  const user = { id: myId, name: "Juan Pérez" };
  
  // Verificar si es mi perfil comparando el ID de la URL con mi ID
  const isMyProfile = user?.id === id;

  // Estado para la mini navbar
  const [selectedTab, setSelectedTab] = useState<"posts" | "rented" | "reviews">("posts");

  // Datos simulados 
  const myTools: ToolCardProps[] = [
    { id: "1", name: "Taladro eléctrico", imageUri: "https://picsum.photos/200/300" },
    { id: "2", name: "Sierra circular", imageUri: "https://picsum.photos/201/301" },
  ];
  const rentedTools: ToolCardProps[] = [
    { id: "10", name: "Lijadora", imageUri: "https://picsum.photos/202/302" },
  ];
  const reviews: Review[] = [
    { id: "r1", comment: "Muy buen servicio!", author: "Juan" },
    { id: "r2", comment: "Herramientas en excelente estado.", author: "Ana" },
  ];
  const averageRating = 4.5;
  const userName = user?.name || "Usuario Anónimo";
  return (
    <AppLayout>
      <ScrollView style={styles.container}>
        {/* Header - solo si es tu perfil */}
        {isMyProfile && (
          <View style={styles.header}>
            <TouchableOpacity>
              <Text style={styles.headerButton}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.headerButton}>⚙️</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Foto perfil */}
        <View style={styles.profilePicContainer}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
            style={styles.profilePic}
          />
        </View>

          {/* Nombre de usuario */}
          <Text style={styles.userName}>{userName}</Text>

        {/* Calificación promedio */}
        {averageRating && (
          <Text style={styles.averageRating}>{averageRating.toFixed(1)} / 5</Text>
        )}

        {/* Mini navbar */}
        <View style={styles.miniNavbar}>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === "posts" && styles.activeTab]}
            onPress={() => setSelectedTab("posts")}
          >
            <Text style={[styles.tabText, selectedTab === "posts" && styles.activeTabText]}>
              Herramientas
            </Text>
          </TouchableOpacity>

          {isMyProfile && (
            <TouchableOpacity
              style={[styles.tabButton, selectedTab === "rented" && styles.activeTab]}
              onPress={() => setSelectedTab("rented")}
            >
              <Text style={[styles.tabText, selectedTab === "rented" && styles.activeTabText]}>
                Alquiladas
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.tabButton, selectedTab === "reviews" && styles.activeTab]}
            onPress={() => setSelectedTab("reviews")}
          >
            <Text style={[styles.tabText, selectedTab === "reviews" && styles.activeTabText]}>
              Reseñas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido según tab */}
        <View style={styles.contentContainer}>
          {selectedTab === "posts" && (
            <FlatList
              data={myTools}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ToolCard {...item} />}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          )}

          {selectedTab === "rented" && isMyProfile && (
            <FlatList
              data={rentedTools}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ToolCard {...item} />}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          )}

          {selectedTab === "reviews" && (
            <View>
              {reviews.map((r) => (
                <View key={r.id} style={styles.review}>
                  <Text style={styles.reviewAuthor}>{r.author}:</Text>
                  <Text style={styles.reviewComment}>{r.comment}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </AppLayout>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff", // blanco base
    paddingTop: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    alignItems: "center",
    margin: 0 ,
  },
  userName: {
    color: "rgba(50, 50, 50, 0.5)", // gris oscuro
    fontSize: 16,
    textAlign: "center",
  }, 
  headerButton: {
    fontSize: 24,
    color: "#d32f2f", // rojo vibrante
  },
  profilePicContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  profilePic: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  averageRating: {
    textAlign: "center",
    marginBottom: 15,
    fontSize: 14,
    color: "#000",
  },
  miniNavbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  activeTab: {
    borderBottomColor: "#d32f2f",
    borderBottomWidth: 3,
  },
  tabText: {
    color: "#000",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#d32f2f",
    fontWeight: "bold",
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  card: {
    width: 140,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    paddingBottom: 10,
  },
  cardImage: {
    width: "100%",
    height: 90,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardTitle: {
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
    color: "#000",
  },
  review: {
    marginBottom: 12,
    borderBottomColor: "#d32f2f",
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  reviewAuthor: {
    fontWeight: "bold",
    color: "#d32f2f",
  },
  reviewComment: {
    fontStyle: "italic",
    color: "#000",
  },
});
