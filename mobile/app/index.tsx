import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from './auth-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ROLE_ADMIN } from '@/constants/app-constants';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingRef = useRef(false);
  const hasNextRef = useRef(true);
  const pageRef = useRef(1);

  const handleProfilePress = () => {
    if (user) {
      router.push('/profile');
    } else {
      router.replace('/login');
    }
  };

  const fetchJobs = async (pageNum = 1, reset = false) => {
    console.log('fetchJobs called', { pageNum, reset, loading: loadingRef.current, hasNext: hasNextRef.current, page: pageRef.current });
    if (loadingRef.current) return;
    if (!hasNextRef.current && pageNum > 1) return;
    setLoading(true);
    loadingRef.current = true;
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs/?page=${pageNum}`);
      const data = await res.json();
      if (res.ok) {
        setHasNext(!!data.next);
        hasNextRef.current = !!data.next;
        if (reset) {
          setJobs(data.results);
          setPage(1);
          pageRef.current = 1;
        } else if (pageNum > pageRef.current && data.results && data.results.length > 0) {
          setJobs(prev => [...prev, ...data.results]);
          setPage(pageNum);
          pageRef.current = pageNum;
        }
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (search.trim() === '') {
      setSearchActive(false);
      fetchJobs(1, true);
      return;
    }
    setSearchActive(true);
    setSearching(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/jobs/search/?q=${encodeURIComponent(search.trim())}&page=1&page_size=50`);
        const data = await res.json();
        if (res.ok) {
          setJobs(data.results);
        } else {
          setJobs([]);
        }
      } finally {
        setSearching(false);
      }
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleEndReached = () => {
    console.log('handleEndReached', { loading: loadingRef.current, hasNext: hasNextRef.current, jobsLength: jobs.length, page: pageRef.current });
    if (!loadingRef.current && hasNextRef.current && jobs.length > 0) {
      fetchJobs(pageRef.current + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchJobs(1, true);
  };

  const renderJob = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => router.push({ pathname: '/job-detail', params: { id: item.id } })}>
      <View style={styles.jobCard}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobCompany}>{item.company}</Text>
        <Text style={styles.jobLocation}>{item.location}</Text>
        <Text style={styles.jobType}>{item.employment_type}</Text>
        <Text numberOfLines={2} style={styles.jobDesc}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search jobs..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
          <Ionicons name="person-circle-outline" size={32} color="#007AFF" />
        </TouchableOpacity>
      </View>
      {/* Add New Job button for Admins only */}
      {user?.user_type === ROLE_ADMIN && (
        <TouchableOpacity
          style={styles.addJobButton}
          onPress={() => router.push('/create-job')}
        >
          <Text style={styles.addJobButtonText}>+ Add New Job</Text>
        </TouchableOpacity>
      )}
      {searchActive && searching && (
        <ActivityIndicator style={{ margin: 16 }} />
      )}
      <FlatList
        data={jobs}
        keyExtractor={item => item.id.toString()}
        renderItem={renderJob}
        contentContainerStyle={styles.listContent}
        onEndReached={searchActive ? undefined : handleEndReached}
        onEndReachedThreshold={0.9}
        ListFooterComponent={(!searchActive && loading) ? <ActivityIndicator style={{ margin: 16 }} /> : null}
        refreshing={refreshing}
        onRefresh={searchActive ? undefined : handleRefresh}
        ListEmptyComponent={(!searching && jobs.length === 0) ? <Text style={{ textAlign: 'center', marginTop: 32, color: '#888' }}>No jobs found.</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 12,
  },
  profileButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 16,
    color: '#555',
    marginBottom: 2,
  },
  jobLocation: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  jobType: {
    fontSize: 13,
    color: '#007AFF',
    marginBottom: 4,
  },
  jobDesc: {
    fontSize: 14,
    color: '#333',
  },
  addJobButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 12,
  },
  addJobButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
