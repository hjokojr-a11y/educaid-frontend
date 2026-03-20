import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { useState, useEffect } from 'react';

const API_URL = "http://192.168.100.158:3000";

export default function SuperAdminScreen() {
  const [token, setToken]             = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [loading, setLoading]         = useState(false);
  const [loggedIn, setLoggedIn]       = useState(false);
  const [tab, setTab]                 = useState('schools');
  const [schools, setSchools]         = useState([]);
  const [pendingStudents, setPending] = useState([]);
  const [showCreateSchool, setShowCreateSchool] = useState(false);

  // Create school form
  const [schoolName, setSchoolName]           = useState('');
  const [schoolCategory, setSchoolCategory]   = useState('secondary');
  const [schoolSubsystem, setSchoolSubsystem] = useState('en');
  const [schoolAddress, setSchoolAddress]     = useState('');
  const [schoolPhone, setSchoolPhone]         = useState('');
  const [schoolEmail, setSchoolEmail]         = useState('');
  const [schoolMotto, setSchoolMotto]         = useState('');
  const [principalName, setPrincipalName]     = useState('');
  const [principalPhone, setPrincipalPhone]   = useState('');
  const [principalEmail, setPrincipalEmail]   = useState('');
  const [location, setLocation]               = useState('');
  const [creating, setCreating]               = useState(false);

  const CATEGORIES = [
    'secondary','primary','nursery','creche',
    'highschool','university','technical','professional'
  ];

  async function login() {
    if (!email || !password) {
      Alert.alert("Error", "Enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/super/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Login Failed", data.error || "Invalid credentials");
        setLoading(false);
        return;
      }
      setToken(data.token);
      setLoggedIn(true);
      setLoading(false);
      loadSchools(data.token);
      loadPending(data.token);
    } catch {
      Alert.alert("Error", "Cannot connect to server. Make sure backend is running.");
      setLoading(false);
    }
  }

  async function loadSchools(t) {
    try {
      const res = await fetch(`${API_URL}/auth/super/schools`, {
        headers: { Authorization: `Bearer ${t || token}` }
      });
      const data = await res.json();
      if (res.ok) setSchools(data.schools || []);
    } catch {}
  }

  async function loadPending(t) {
    try {
      const res = await fetch(`${API_URL}/auth/super/pending-students`, {
        headers: { Authorization: `Bearer ${t || token}` }
      });
      const data = await res.json();
      if (res.ok) setPending(data.students || []);
    } catch {}
  }

  async function createSchool() {
    if (!schoolName || !principalEmail) {
      Alert.alert("Error", "School name and principal email are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/auth/super/create-school`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: schoolName,
          category: schoolCategory,
          subsystem: schoolSubsystem,
          address: schoolAddress,
          phone: schoolPhone,
          email: schoolEmail,
          motto: schoolMotto,
          principalName,
          principalPhone,
          principalEmail,
          location
        })
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.error || "Failed to create school");
        setCreating(false);
        return;
      }
      Alert.alert(
        "✅ School Created!",
        `${schoolName} has been registered.\n\nAdmin username: ${data.admin?.username}\n\nWelcome email sent to ${principalEmail}`
      );
      setCreating(false);
      setShowCreateSchool(false);
      // Reset form
      setSchoolName(''); setSchoolCategory('secondary'); setSchoolAddress('');
      setSchoolPhone(''); setSchoolEmail(''); setSchoolMotto('');
      setPrincipalName(''); setPrincipalPhone(''); setPrincipalEmail(''); setLocation('');
      loadSchools(token);
    } catch {
      Alert.alert("Error", "Failed to create school");
      setCreating(false);
    }
  }

  async function approveStudent(studentId, studentName) {
    try {
      const res = await fetch(`${API_URL}/auth/super/approve-student/${studentId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("✅ Approved!", `${studentName} has been approved.\nStudent ID: ${data.studentCode}\nCredentials sent to school admin.`);
        loadPending(token);
      } else {
        Alert.alert("Error", data.error || "Failed to approve student");
      }
    } catch {
      Alert.alert("Error", "Failed to approve student");
    }
  }

  // ── Login Screen ──────────────────────────────────────────
  if (!loggedIn) {
    return (
      <View style={[styles.container, { backgroundColor: '#0f1923' }]}>
        <ScrollView contentContainerStyle={styles.loginScroll}>
          <Text style={styles.appTitle}>EducAid</Text>
          <View style={[styles.badge, { backgroundColor: '#c0394b' }]}>
            <Text style={styles.badgeTitle}>👑 Super Admin</Text>
            <Text style={styles.badgeSub}>Platform Management</Text>
          </View>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor="#7a7066"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#7a7066"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#c0394b' }]}
            onPress={login}
            disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In →</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: '#0f1923' }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>👑 Super Admin</Text>
          <Text style={styles.headerSub}>EducAid Platform</Text>
        </View>
        <TouchableOpacity onPress={() => setLoggedIn(false)} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{schools.length}</Text>
          <Text style={styles.statLabel}>Schools</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{pendingStudents.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: '#c0394b' }]}
          onPress={() => setShowCreateSchool(true)}>
          <Text style={styles.statNum}>+</Text>
          <Text style={styles.statLabel}>New School</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['schools','pending'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'schools' ? `🏫 Schools (${schools.length})` : `⏳ Pending (${pendingStudents.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {tab === 'schools' && (
          <>
            {schools.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🏫</Text>
                <Text style={styles.emptyText}>No schools registered yet.{'\n'}Tap + New School to add one.</Text>
              </View>
            ) : (
              schools.map(school => (
                <View key={school.id} style={styles.card}>
                  <View style={[styles.cardDot, { backgroundColor: school.theme_primary || '#1a7a6e' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{school.name}</Text>
                    <Text style={styles.cardSub}>{school.category} · {school.subsystem?.toUpperCase()}</Text>
                    <Text style={styles.cardMeta}>{school.student_count || 0} students · {school.class_count || 0} classes</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {tab === 'pending' && (
          <>
            {pendingStudents.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyText}>No pending students.{'\n'}All students are approved.</Text>
              </View>
            ) : (
              pendingStudents.map(student => (
                <View key={student.id} style={styles.card}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{student.name}</Text>
                    <Text style={styles.cardSub}>{student.school_name} · {student.class_name}</Text>
                    <Text style={styles.cardMeta}>Registered · Awaiting approval</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => approveStudent(student.id, student.name)}>
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Create School Modal */}
      <Modal visible={showCreateSchool} animationType="slide">
        <View style={[styles.container, { backgroundColor: '#0f1923' }]}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <TouchableOpacity onPress={() => setShowCreateSchool(false)} style={styles.backBtn}>
              <Text style={styles.backText}>← Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Register New School</Text>

            <Text style={styles.sectionTitle}>SCHOOL INFORMATION</Text>
            <Text style={styles.label}>School Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Greenview Academy" placeholderTextColor="#7a7066" value={schoolName} onChangeText={setSchoolName} />

            <Text style={styles.label}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBtn, schoolCategory === cat && styles.catBtnActive]}
                  onPress={() => setSchoolCategory(cat)}>
                  <Text style={[styles.catText, schoolCategory === cat && styles.catTextActive]}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Subsystem</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, schoolSubsystem === 'en' && styles.toggleBtnActive]}
                onPress={() => setSchoolSubsystem('en')}>
                <Text style={[styles.toggleText, schoolSubsystem === 'en' && { color: '#fff' }]}>🇬🇧 English</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, schoolSubsystem === 'fr' && styles.toggleBtnActive]}
                onPress={() => setSchoolSubsystem('fr')}>
                <Text style={[styles.toggleText, schoolSubsystem === 'fr' && { color: '#fff' }]}>🇫🇷 French</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Address</Text>
            <TextInput style={styles.input} placeholder="Street address" placeholderTextColor="#7a7066" value={schoolAddress} onChangeText={setSchoolAddress} />

            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} placeholder="+237 6XX XXX XXX" placeholderTextColor="#7a7066" value={schoolPhone} onChangeText={setSchoolPhone} keyboardType="phone-pad" />

            <Text style={styles.label}>School Email</Text>
            <TextInput style={styles.input} placeholder="info@school.com" placeholderTextColor="#7a7066" value={schoolEmail} onChangeText={setSchoolEmail} autoCapitalize="none" keyboardType="email-address" />

            <Text style={styles.label}>School Motto</Text>
            <TextInput style={styles.input} placeholder="e.g. Excellence Through Knowledge" placeholderTextColor="#7a7066" value={schoolMotto} onChangeText={setSchoolMotto} />

            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} placeholder="e.g. Yaoundé, Cameroon" placeholderTextColor="#7a7066" value={location} onChangeText={setLocation} />

            <Text style={styles.sectionTitle}>PRINCIPAL / ADMIN INFORMATION</Text>

            <Text style={styles.label}>Principal Name</Text>
            <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#7a7066" value={principalName} onChangeText={setPrincipalName} />

            <Text style={styles.label}>Principal Phone</Text>
            <TextInput style={styles.input} placeholder="+237 6XX XXX XXX" placeholderTextColor="#7a7066" value={principalPhone} onChangeText={setPrincipalPhone} keyboardType="phone-pad" />

            <Text style={styles.label}>Principal Email * (credentials will be sent here)</Text>
            <TextInput style={styles.input} placeholder="principal@email.com" placeholderTextColor="#7a7066" value={principalEmail} onChangeText={setPrincipalEmail} autoCapitalize="none" keyboardType="email-address" />

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#c0394b', marginTop: 8 }]}
              onPress={createSchool}
              disabled={creating}>
              {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>✅ Register School</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  loginScroll:     { padding: 24, paddingTop: 80 },
  appTitle:        { fontSize: 40, fontWeight: '800', color: '#fff', marginBottom: 24 },
  badge:           { borderRadius: 14, padding: 16, marginBottom: 24 },
  badgeTitle:      { fontSize: 18, fontWeight: '700', color: '#fff' },
  badgeSub:        { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  label:           { fontSize: 11, fontWeight: '700', color: '#7a8fa8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  input:           { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 14, color: '#fff', fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  btn:             { borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  btnText:         { color: '#fff', fontSize: 16, fontWeight: '700' },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  headerTitle:     { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub:       { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  signOutBtn:      { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 8, paddingHorizontal: 12 },
  signOutText:     { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  statsRow:        { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  statCard:        { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, alignItems: 'center' },
  statNum:         { fontSize: 28, fontWeight: '800', color: '#fff' },
  statLabel:       { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  tabRow:          { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 12 },
  tabBtn:          { flex: 1, padding: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center' },
  tabBtnActive:    { backgroundColor: '#c0394b' },
  tabText:         { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  tabTextActive:   { color: '#fff' },
  content:         { flex: 1, paddingHorizontal: 20 },
  emptyCard:       { alignItems: 'center', padding: 40, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, marginTop: 20 },
  emptyIcon:       { fontSize: 40, marginBottom: 12 },
  emptyText:       { fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 22 },
  card:            { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, marginBottom: 10 },
  cardDot:         { width: 12, height: 12, borderRadius: 6, marginRight: 14 },
  cardTitle:       { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 3 },
  cardSub:         { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  cardMeta:        { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
  approveBtn:      { backgroundColor: '#1a7a6e', borderRadius: 8, padding: 10, paddingHorizontal: 14 },
  approveBtnText:  { color: '#fff', fontSize: 13, fontWeight: '700' },
  modalScroll:     { padding: 24, paddingTop: 60, paddingBottom: 40 },
  modalTitle:      { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 24 },
  sectionTitle:    { fontSize: 10, fontWeight: '700', color: '#7a8fa8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 8 },
  backBtn:         { marginBottom: 16 },
  backText:        { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  toggleRow:       { flexDirection: 'row', gap: 10, marginBottom: 16 },
  toggleBtn:       { flex: 1, padding: 12, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#1a7a6e' },
  toggleText:      { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  catBtn:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', marginRight: 8 },
  catBtnActive:    { backgroundColor: '#c0394b' },
  catText:         { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  catTextActive:   { color: '#fff' },
});
