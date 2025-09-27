import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from './auth-context';
import { useRouter } from 'expo-router';
const API_URL = process.env.EXPO_PUBLIC_API_URL;
export default function ProfileScreen() {
  const { user, getValidAccessToken, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || '');
  const [editing, setEditing] = useState(false);
  const fetchUserDetails = async () => {
    const accessToken = await getValidAccessToken();
      fetch(`${API_URL}/api/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }).then(res => res.json())
        .then(data => {
          setEmail(data.email);
          setFirstName(data['first_name']);
          setLastName(data['last_name']);
          setContactNumber(data['contact_number']);
        })
        .catch(error => {
          console.error('Error fetching user details:', error);
          Alert.alert('Error', 'Failed to load user details');
        });
      }
  useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else {
      fetchUserDetails();
    }
  }, [user]);

  const handleSave = () => {
    // TODO: Implement API call to update user details
    Alert.alert('Profile updated', 'Your details have been saved.');
    setEditing(false);
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>First Name:</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        editable={editing}
        onChangeText={setFirstName}
        placeholder="First Name"
      />
      <Text>Last Name:</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        editable={editing}
        onChangeText={setLastName}
        placeholder="Last Name"
      />
      <Text>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        editable={false}
      />
      <Text>Contact Number:</Text>
      <TextInput
        style={styles.input}
        value={contactNumber}
        editable={editing}
        onChangeText={(text) => {
          const numericValue = text.replace(/[^0-9]/g, '');
          setContactNumber(numericValue);
        }}
        keyboardType="numeric"
        placeholder="Contact Number"
      />
      {editing ? (
        <Button title="Save" onPress={handleSave} />
      ) : (
        <Button title="Edit" onPress={() => setEditing(true)} />
      )}
      
      <Button title="Change Password" onPress={() => {
        router.push('/change-password');
      }} />
      <Button title="My CVs" onPress={() => router.push('/my-cvs')} />
      <Button title="Logout" onPress={logout} color="#d00" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 12, width: 250 },
});
