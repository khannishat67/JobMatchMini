
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from './auth-context';
import { saveToken } from '../util/secure-storage';
import { useRouter } from 'expo-router';
const API_URL = process.env.EXPO_PUBLIC_API_URL;
console.log("API URL", API_URL);
export default function LoginScreen() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user]);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await saveToken('accessToken', data.access);
        await saveToken('refreshToken', data.refresh);
        login({ email, user_type: data.user_type }, data.access, data.refresh);
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (e) {
      setError('Network error');
      console.error("Error" ,e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
      <TouchableOpacity onPress={() => router.replace('/register')} style={styles.registerLink}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('/')} style={styles.skipLink}>
        <Text style={styles.skipText}>Skip login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 12 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  registerLink: { marginTop: 16, alignItems: 'center' },
  registerText: { color: '#007AFF', fontSize: 16, textDecorationLine: 'underline' },
  skipLink: { marginTop: 8, alignItems: 'center' },
  skipText: { color: '#007AFF', fontSize: 16, textDecorationLine: 'underline' },
});
