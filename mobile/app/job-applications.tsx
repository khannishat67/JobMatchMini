import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert, Linking, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from './auth-context';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function JobApplicationsPage() {
  const { id } = useLocalSearchParams();
  const { getValidAccessToken } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = await getValidAccessToken();
        const res = await fetch(`${API_BASE_URL}/api/jobs/${id}/applicants/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setApplications(data);
        else Alert.alert('Error', data.detail || 'Failed to load applications');
      } catch {
        Alert.alert('Error', 'Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <ActivityIndicator style={{ flex: 1, marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Applications</Text>
      {applications.length === 0 ? (
        <Text style={styles.empty}>No applications found.</Text>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                if (item.cv_presigned_url) {
                  Linking.openURL(item.cv_presigned_url);
                } else {
                  Alert.alert('No CV', 'No CV was attached to this application.');
                }
              }}
            >
              <Text style={styles.name}>{item.user_first_name} {item.user_last_name}</Text>
              <Text style={styles.email}>{item.user_email}</Text>
              <Text style={styles.contact}>Contact: {item.user_contact_number}</Text>
              <Text style={styles.status}>Applied At: {new Date(item.applied_at).toLocaleString()}</Text>
              {item.note ? (
                <Text style={styles.note}>Note: {item.note}</Text>
              ) : null}
              {item.cv_presigned_url && (
                <Text style={styles.cvLink}>Tap to view CV{item.cv_file_name ? `: ${item.cv_file_name}` : ''}</Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  empty: { fontSize: 16, color: '#888', marginTop: 24 },
  card: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 16, marginBottom: 16 },
  name: { fontSize: 16, fontWeight: 'bold' },
  email: { fontSize: 15, color: '#555' },
  contact: { fontSize: 15, color: '#555' },
  status: { fontSize: 14, color: '#007AFF', marginTop: 4 },
  note: { fontSize: 15, color: '#333', marginTop: 8, fontStyle: 'italic' },
  cvLink: { color: '#007AFF', marginTop: 8, textDecorationLine: 'underline', fontSize: 15 },
});
