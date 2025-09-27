import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from './auth-context';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function EditJobPage() {
  const { id } = useLocalSearchParams();
  const { user, getValidAccessToken } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/jobs/${id}/`);
        const data = await res.json();
        if (res.ok) {
          setJob(data);
          setTitle(data.title);
          setCompany(data.company);
          setLocation(data.location);
          setEmploymentType(data.employment_type);
          setDescription(data.description);
          setTags(data.tags ? data.tags.join(', ') : '');
        } else {
          Alert.alert('Error', data.detail || 'Failed to load job');
        }
      } catch {
        Alert.alert('Error', 'Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleSave = async () => {
    if (!title || !company || !location || !employmentType || !description) {
      Alert.alert('All fields are required');
      return;
    }
    setSaving(true);
    try {
      const token = await getValidAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/jobs/${id}/`, {
        method: 'PUT',
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
        Alert.alert('Job updated successfully');
        router.replace({ pathname: '/job-detail', params: { id } });
      } else {
        const data = await res.json();
        Alert.alert('Error', data.detail || 'Failed to update job');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1, marginTop: 40 }} />;
  if (!job) return <Text style={{ margin: 24 }}>Job not found.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Job</Text>
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Company" value={company} onChangeText={setCompany} />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder="Employment Type" value={employmentType} onChangeText={setEmploymentType} />
      <TextInput style={[styles.input, { height: 80 }]} placeholder="Description" value={description} onChangeText={setDescription} multiline />
      <TextInput style={styles.input} placeholder="Tags (comma separated)" value={tags} onChangeText={setTags} />
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
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
    backgroundColor: '#FFA500',
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
});
