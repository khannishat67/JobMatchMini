
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useAuth } from './auth-context';
import { saveToken } from '../util/secure-storage';
import { useRouter } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
export default function RegisterScreen() {
  const { login, user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user]);

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    if (!firstName || !lastName || !email || !contactNumber || !password || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          contact_number: contactNumber,
          password
        }),
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        setError('Registration: Invalid server response');
        setLoading(false);
        return;
      }
      if (res.ok) {
        // Registration successful, now log in
        try {
          console.log("Logging in after registration");
          const loginRes = await fetch(`${API_URL}/api/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password
            }),
          });
          let loginData;
          try {
            loginData = await loginRes.json();
            console.log(loginData);
          } catch (jsonErr) {
            setError('Login: Invalid server response');
            setLoading(false);
            return;
          }
          if (loginRes.ok) {
            await saveToken('accessToken', loginData.access);
            await saveToken('refreshToken', loginData.refresh);
            login({ email, user_type: loginData.user_type }, loginData.access, loginData.refresh);
          } else {
            setError(loginData.detail || JSON.stringify(loginData) || 'Login after registration failed');
          }
        } catch (loginErr: any) {
          setError('Network error during login: ' + loginErr.message);
        }
      } else {
        setError(data.detail || JSON.stringify(data) || 'Registration failed');
      }
    } catch (e: any) {
      console.log(e)
      setError('Network error during registration: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
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
        placeholder="Contact Number"
        value={contactNumber}
        onChangeText={setContactNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={loading ? 'Registering...' : 'Register'} onPress={handleRegister} disabled={loading} />
      <Button title="Back to Login" onPress={() => router.replace('/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 12 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
});
