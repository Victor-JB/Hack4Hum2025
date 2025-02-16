import React, { useState, useEffect } from "react";
import { View, Text, ImageBackground, Image, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useTheme, Card, Chip } from "react-native-paper";
import { fetchRecommendation, getUserProfile } from "../mainService";
import useAuth from "../useAuth";
import { useUserProfile } from "./mainContext";
import MealCard from "./MealCard";

const backgroundImage = require("../assets/images/santaClaraBackground.png");

const meals = [
  {
    name: "Grilled Chicken Bowl",
    image: require("../assets/images/error404.png"), // Replace with actual image
    ingredients: "Grilled chicken, quinoa, spinach, avocado, cherry tomatoes, lemon dressing",
    tags: ["Protein", "Bulk"]
  },
  {
    name: "Vegan Tofu Stir-Fry",
    image: require("../assets/images/error404.png"), // Replace with actual image
    ingredients: "Tofu, bell peppers, broccoli, carrots, soy sauce, sesame seeds",
    tags: ["Protein", "Carbs"]
  },
  {
    name: "Salmon & Brown Rice",
    image: require("../assets/images/error404.png"), // Replace with actual image
    ingredients: "Grilled salmon, brown rice, asparagus, olive oil, garlic",
    tags: ["Bulk", "Reduce"]
  }
];

const HomeScreen = () => {
  const theme = useTheme();
  const [expandedMeal, setExpandedMeal] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState(meals);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState("never set");
  const { userProfile } = useUserProfile();
  const firstName = userProfile?.firstName || "User";

  useEffect(() => {
    const hour = new Date().getHours();
    let greeting;
    if (typeof hour !== 'number') {
      greeting = "Hello";
    }

    if (hour < 12) {
      greeting = "Good morning";
    } else if (hour < 18) {
      greeting = "Good afternoon";
    } else {
      greeting = "Good evening";
    }
    setGreeting(greeting);
  }, []);

  useEffect(() => {
    if (user && !authLoading) {
      loadRecommendations();
    }
  }, [user, authLoading]);

  const loadRecommendations = async () => {
    try {
      console.log("QUERYING RECOMMENDATIONS");
      setLoading(true);
      setError("");
      const data = await fetchRecommendation();
      setRecommendations(data);
    } catch (err) {
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRecommendations();
  };

  if (authLoading) return <ActivityIndicator size="large" color={theme.colors.primary} />;
  if (!user) return <Text style={{ color: theme.colors.error, textAlign: "center" }}>Please log in to see meal recommendations.</Text>

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: false ? theme.colors.background : "#750000" }}
      refreshControl={(
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      )}>
      <View style={{ backgroundColor: "#750000", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 }}>
        <Text style={{ color: "white", fontSize: 22, fontWeight: "bold", textAlignVertical: "center", textAlign: "center" }}>Santa Clara University</Text>
      </View>
      <Image source={backgroundImage} style={{ width: "100%", height: 150 }}/>

      <View style={{ backgroundColor: "white", padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", textAlignVertical: "center", textAlign: "center" }}>
          {greeting}, {firstName}!
        </Text>
      </View>

      <View style={{ padding: 15 }}>
        {recommendations
          ? recommendations.map((meal, index) => (
            <MealCard
              key={index}
              meal={meal}
              expanded={expandedMeal === index}
              onPress={() => setExpandedMeal(expandedMeal === index ? null : index)}
            />
          ))
          : <Text style={{ textAlign: "center", color: theme.colors.error }}>No meal recommendations available.</Text>}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
