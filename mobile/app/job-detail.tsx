import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Modal, FlatList, TextInput } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
  
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from './auth-context';
import { ROLE_ADMIN, ROLE_USER } from '@/constants/app-constants';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function JobDetailPage() {
  const { id } = useLocalSearchParams();
  const { user, getValidAccessToken } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCVModal, setShowCVModal] = useState(false);
  const [cvs, setCVs] = useState<any[]>([]);
  const [selectedCV, setSelectedCV] = useState<any>(null);
  const [cvLoading, setCVLoading] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/jobs/${id}/`);
        const data = await res.json();
        if (res.ok) setJob(data);
        else Alert.alert('Error', data.detail || 'Failed to load job');
      } catch {
        Alert.alert('Error', 'Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);
const handleUploadCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] });
      if (result.canceled) return;
      const file = result.assets ? result.assets[0] : result;
      const token = await getValidAccessToken();
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      } as any);
      const res = await fetch(`${API_BASE_URL}/api/me/cvs/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });
      if (res.ok) {
        Alert.alert('CV uploaded successfully');
        fetchCVs();
      } else {
        const data = await res.json();
        Alert.alert('Error', data.detail || 'Failed to upload CV');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to upload CV');
    }
  };
  const fetchCVs = async () => {
    setCVLoading(true);
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
      setCVLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) return router.replace('/login');
    setSelectedCV(null);
    setNote('');
    setShowCVModal(true);
    fetchCVs();
  };

  const submitApplication = async () => {
    if (!selectedCV) {
      Alert.alert('Please select a CV');
      return;
    }
    try {
      const token = await getValidAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/jobs/${id}/apply/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_id: selectedCV.id, note }),
      });
      if (res.ok) {
        setShowCVModal(false);
        Alert.alert('Applied successfully');
      } else {
        const data = await res.json();
        Alert.alert('Error', data.detail || 'Failed to apply');
      }
    } catch {
      Alert.alert('Error', 'Network error');
    }
  };

  const handleEdit = () => {
    router.push({ pathname: '/edit-job', params: { id: job.id } });
  };

  if (loading) return <ActivityIndicator style={{ flex: 1, marginTop: 40 }} />;
  if (!job) return <Text style={{ margin: 24 }}>Job not found.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.company}>{job.company}</Text>
      <Text style={styles.location}>{job.location}</Text>
      <Text style={styles.type}>{job.employment_type}</Text>
      <Text style={styles.desc}>{job.description}</Text>
      {job.tags && job.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {job.tags.map((tag: string) => (
            <Text key={tag} style={styles.tag}>{tag}</Text>
          ))}
        </View>
      )}
      {(!user || !user.user_type) && (
        <TouchableOpacity style={styles.applyButton} onPress={() => router.replace('/login')}>
          <Text style={styles.applyButtonText}>Login to Apply</Text>
        </TouchableOpacity>
      )}
      {user?.user_type === ROLE_USER && (
        <>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
          <Modal
            visible={showCVModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowCVModal(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%' }}>
                <TextInput
                  style={{
                    borderColor: '#ccc',
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    marginBottom: 8,
                    minHeight: 40,
                  }}
                  placeholder="Add a note (optional)"
                  value={note}
                  onChangeText={setNote}
                  multiline
                  
                  maxLength={500}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Select a CV</Text>
                  <TouchableOpacity onPress={handleUploadCV} style={{ backgroundColor: '#007AFF', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Upload CV</Text>
                  </TouchableOpacity>
                </View>
                {cvLoading ? (
                  <ActivityIndicator style={{ marginVertical: 24 }} />
                ) : (
                  <FlatList
                    data={cvs}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={{
                          padding: 12,
                          backgroundColor: selectedCV?.id === item.id ? '#007AFF' : '#f2f2f2',
                          borderRadius: 8,
                          marginBottom: 8,
                        }}
                        onPress={() => setSelectedCV(item)}
                      >
                        <Text style={{ color: selectedCV?.id === item.id ? '#fff' : '#333', fontWeight: 'bold' }}>{item.file_name}</Text>
                        <Text style={{ color: selectedCV?.id === item.id ? '#fff' : '#888', fontSize: 12 }}>Uploaded: {new Date(item.uploaded_at).toLocaleString()}</Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginVertical: 16 }}>No CVs found. Please upload a CV first.</Text>}
                  />
                )}
                
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                  <TouchableOpacity onPress={() => setShowCVModal(false)} style={{ marginRight: 16 }}>
                    <Text style={{ color: '#888', fontSize: 16 }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={submitApplication} style={{ backgroundColor: '#007AFF', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
      {user?.user_type === ROLE_ADMIN && (
        <>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applicationsButton} onPress={() => router.push({ pathname: '/job-applications', params: { id: job.id } })}>
            <Text style={styles.applicationsButtonText}>View Job Applications</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  company: { fontSize: 18, color: '#555', marginBottom: 2 },
  location: { fontSize: 16, color: '#888', marginBottom: 2 },
  type: { fontSize: 15, color: '#007AFF', marginBottom: 8 },
  desc: { fontSize: 16, color: '#333', marginBottom: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  tag: { backgroundColor: '#eee', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, marginBottom: 6, fontSize: 13 },
  applyButton: { backgroundColor: '#007AFF', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  applyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  editButton: { backgroundColor: '#FFA500', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  editButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  applicationsButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  applicationsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
