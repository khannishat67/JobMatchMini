import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useAuth } from './auth-context';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CreateJobPage() {
  const { user, getValidAccessToken } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState(''); // comma-separated string
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !company || !location || !employmentType || !description) {
      Alert.alert('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const token = await getValidAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/jobs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          company,
          location,
          employment_type: employmentType,
          description,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        Alert.alert('Job created successfully');
        router.replace('/');
      } else {
        const data = await res.json();
        Alert.alert('Error', data.detail || 'Failed to create job');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Job</Text>
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Company" value={company} onChangeText={setCompany} />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={employmentType}
          onValueChange={setEmploymentType}
          style={styles.picker}
        >
          <Picker.Item label="Full-time" value="Full-time" />
          <Picker.Item label="Contract" value="Contract" />
        </Picker>
      </View>
  
      <TextInput style={[styles.input, { height: 80 }]} placeholder="Description" value={description} onChangeText={setDescription} multiline />
      <TextInput style={styles.input} placeholder="Tags (comma separated)" value={tags} onChangeText={setTags} />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Job'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f9f9f9'
  },
  picker: {
    height: 50,
    width: '100%'
  }
});
