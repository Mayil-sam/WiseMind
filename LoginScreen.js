// screens/LoginScreen.js
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  // Check for existing session
  useEffect(() => {
    const checkLoginStatus = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        navigation.replace('Home');
      }
    };
    checkLoginStatus();
  }, []);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !pass) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    // Dummy credentials check (replace with real API in production)
    if (email === 'test@gmail.com' && pass === 'pass123') {
      await AsyncStorage.setItem('user', JSON.stringify({ email }));
      navigation.replace('Home'); // Replace so user can't go back to login
    } else {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to My App</Text>
      <Text style={styles.description}>Login to Proceed</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        value={pass}
        onChangeText={setPass}
        placeholder="Enter your password"
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  description: { fontSize: 16, color: 'gray', marginBottom: 30 },
  input: {
    height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 10, marginBottom: 20, width: '100%', paddingHorizontal: 10, borderRadius: 8,
  },
  button: {
    backgroundColor: '#1E90FF', paddingVertical: 12, borderRadius: 8, width: '100%', alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
