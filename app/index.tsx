import React, { useState, useEffect } from "react";
import { View, SafeAreaView } from "react-native";
import { TextInput, Button, Text, Card, useTheme } from "react-native-paper";
import { router } from "expo-router";
import { signIn } from "../authService";
import useAuth from "../useAuth";

const SignInScreen: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user, loading } = useAuth(); // Get auth state

  // 🔥 FIX: Ensure navigation only happens *after* render
  useEffect(() => {
    if (user) {
      router.replace("/settings"); // Navigate only when user is set
    }
  }, [user]);

  if (loading) return null; // Avoid rendering during loading

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
      // No need to call router.replace here! It will be handled by useEffect
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        <Card style={{ padding: 20, backgroundColor: theme.colors.surface }}>
          <Text variant="titleLarge" style={{ marginBottom: 10 }}>Welcome Back</Text>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            mode="outlined"
            style={{ backgroundColor: theme.colors.surface, marginBottom: 10 }}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={{ backgroundColor: theme.colors.surface, marginBottom: 10 }}
          />
          {error && <Text style={{ color: theme.colors.error, marginBottom: 10 }}>{error}</Text>}
          <Button mode="contained" onPress={handleSignIn} style={{ marginBottom: 10 }}>
            Sign In
          </Button>
          <Button mode="text" onPress={() => router.push("/sign-up")}>
            Don't have an account? Sign Up
          </Button>
        </Card>
      </View>
    </SafeAreaView>
  );
};

export default SignInScreen;
