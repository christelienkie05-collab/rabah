// mobile/src/screens/SOSScreen.tsx
// Écran SOS Urgence — envoie une alerte push à tous les talents d'une catégorie
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../theme';

const CATEGORIES = ['Piano','Guitare','Chant','Violon','Saxophone','Trompette','DJ','Batterie','Danseur'];

export function SOSScreen() {
  const navigation = useNavigation();
  const [category, setCategory] = useState('');
  const [zone, setZone]         = useState('');
  const [message, setMessage]   = useState('');
  const [sending, setSending]   = useState(false);

  const handleSend = async () => {
    if (!category || !zone) {
      Alert.alert('Champs requis', 'Sélectionne une catégorie et une zone.');
      return;
    }
    setSending(true);
    try {
      // await api.post('/announcements/sos', { category, zone, message });
      await new Promise(r => setTimeout(r, 1000)); // Simulation
      Alert.alert('🚨 Alerte envoyée !', `Tous les ${category}s de ${zone} ont été notifiés.`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch {
      Alert.alert('Erreur', "Impossible d'envoyer l'alerte.");
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>🚨 SOS Urgence</Text>
        <Text style={styles.bannerSub}>Notifie instantanément tous les talents disponibles dans ta zone.</Text>
      </View>

      <Text style={styles.label}>Instrument / Catégorie *</Text>
      <View style={styles.chips}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[styles.chip, category === cat && styles.chipActive]} onPress={() => setCategory(cat)}>
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Zone géographique *</Text>
      <TextInput
        style={styles.input}
        placeholder="ex: Paris, Lyon, Versailles..."
        placeholderTextColor={COLORS.muted}
        value={zone} onChangeText={setZone}
      />

      <Text style={styles.label}>Message personnalisé (optionnel)</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="ex: Besoin urgent pour mariage samedi 14h..."
        placeholderTextColor={COLORS.muted}
        multiline numberOfLines={4}
        value={message} onChangeText={setMessage}
      />

      <TouchableOpacity style={[styles.btn, sending && { opacity: 0.6 }]} onPress={handleSend} disabled={sending}>
        <Text style={styles.btnText}>{sending ? 'Envoi en cours...' : '🚨 Envoyer l\'alerte SOS'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── AuthContext (stub) ──────────────────────────────────────────────────────
// mobile/src/store/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthCtx { user: any; login: (u: any) => void; logout: () => void; }
const Ctx = createContext<AuthCtx>({ user: null, login: () => {}, logout: () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>({ id:'1', name:'Christ-Elie', plan:'PRO' }); // Mock logged in
  return <Ctx.Provider value={{ user, login: setUser, logout: () => setUser(null) }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0505' },
  banner:    { backgroundColor:'rgba(220,60,60,0.1)', borderWidth:1, borderColor:'rgba(220,60,60,0.3)', borderRadius:12, padding:20, marginBottom:28 },
  bannerTitle:{ color:'#e05555', fontSize:20, fontWeight:'700', marginBottom:6 },
  bannerSub:  { color:'rgba(224,85,85,0.7)', fontSize:14, lineHeight:20 },
  label:     { color: COLORS.text, fontSize: 14, fontWeight:'500', marginBottom: 10, marginTop: 4 },
  chips:     { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:20 },
  chip:      { paddingHorizontal:14, paddingVertical:7, borderRadius:100, backgroundColor:COLORS.dark3, borderWidth:0.5, borderColor:COLORS.border },
  chipActive:{ backgroundColor:'rgba(220,60,60,0.2)', borderColor:'rgba(220,60,60,0.5)' },
  chipText:  { color: COLORS.muted, fontSize: 13 },
  chipTextActive:{ color:'#e05555', fontWeight:'600' },
  input:     { backgroundColor:COLORS.dark3, borderWidth:0.5, borderColor:COLORS.border, borderRadius:10, paddingHorizontal:14, paddingVertical:12, color:COLORS.text, fontSize:14, marginBottom:20 },
  textarea:  { height:100, textAlignVertical:'top' },
  btn:       { backgroundColor:'#e05555', borderRadius:12, paddingVertical:16, alignItems:'center' },
  btnText:   { color:'#fff', fontSize:15, fontWeight:'700' },
});
