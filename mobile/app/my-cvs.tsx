import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from './auth-context';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function MyCVsPage() {
  const { getValidAccessToken } = useAuth();
  const [cvs, setCVs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCVs = async () => {
    setLoading(true);
    try {
      const token = await getValidAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/me/cvs/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCVs(data);
      else Alert.alert('Error', data.detail || 'Failed to load CVs');
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCVs(); }, []);

  const handleUploadCV = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: false,
    });
    if (result.canceled) return;
    const file = result.assets ? result.assets[0] : result;
    if (file.size && file.size > 2 * 1024 * 1024) {
      Alert.alert('File too large', 'Maximum file size is 2MB.');
      return;
    }
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    } as any);
    try {
      setLoading(true);
      const token = await getValidAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/me/cvs/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      if (res.ok) {
        Alert.alert('Success', 'CV uploaded successfully');
        fetchCVs();
      } else {
        const data = await res.json();
        Alert.alert('Error', data.detail || 'Failed to upload CV');
      }
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My CVs</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={handleUploadCV} disabled={loading}>
        <Text style={styles.uploadButtonText}>{loading ? 'Uploading...' : 'Upload CV'}</Text>
      </TouchableOpacity>
      <FlatList
        data={cvs}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cvCard}>
            <Text style={styles.cvName}>{item.file_name || item.name}</Text>
            <Text style={styles.cvDate}>Uploaded: {new Date(item.uploaded_at).toLocaleString()}</Text>
            {/* Add download/view/delete buttons as needed */}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No CVs found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  uploadButton: { backgroundColor: '#007AFF', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 16 },
  uploadButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cvCard: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 16, marginBottom: 16 },
  cvName: { fontSize: 16, fontWeight: 'bold' },
  cvDate: { fontSize: 14, color: '#555' },
  empty: { fontSize: 16, color: '#888', marginTop: 24 },
});
