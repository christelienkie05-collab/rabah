// mobile/src/screens/MessagesScreen.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { COLORS } from '../theme';

const MOCK_THREADS = [
  { id:'1', name:'Samuel K.',   last:'Bonjour, je suis disponible le 15 juin !', time:'14:32', unread:2, emoji:'🎹' },
  { id:'2', name:'Grace M.',    last:'Merci pour votre intérêt.', time:'Hier', unread:0, emoji:'🎤' },
  { id:'3', name:'Esther N.',   last:'Pouvez-vous préciser le lieu ?', time:'Lundi', unread:1, emoji:'🎻' },
];

export function MessagesScreen() {
  const [search, setSearch] = useState('');
  const filtered = MOCK_THREADS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <View style={styles.searchBox}>
        <TextInput style={styles.search} placeholder="Rechercher..." placeholderTextColor={COLORS.muted} value={search} onChangeText={setSearch} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding:16, gap:2 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.thread}>
            <View style={styles.avatar}><Text style={{ fontSize:24 }}>{item.emoji}</Text></View>
            <View style={{ flex:1 }}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.last} numberOfLines={1}>{item.last}</Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{item.unread}</Text></View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ── ProfilScreen ─────────────────────────────────────────────────────────────
// mobile/src/screens/ProfilScreen.tsx
import { ScrollView, Linking } from 'react-native';
import { useAuth } from '../store/AuthContext';

export function ProfilScreen() {
  const { user, logout } = useAuth();
  const sections = [
    { label:'Mon profil talent', icon:'🎵', action:() => {} },
    { label:'Mes réservations', icon:'📅', action:() => {} },
    { label:'Mes commandes',    icon:'📦', action:() => {} },
    { label:'Mes setlists',     icon:'🎼', action:() => {} },
    { label:'Plan & abonnement',icon:'💳', action:() => {} },
    { label:'Communauté WhatsApp', icon:'💬', action:() => Linking.openURL('https://wa.me/33651426961') },
    { label:'Support',          icon:'🛟', action:() => Linking.openURL('mailto:levitiquepianoschool@gmail.com') },
  ];

  return (
    <ScrollView style={pStyles.container} contentContainerStyle={{ padding:24 }}>
      <View style={pStyles.header}>
        <View style={pStyles.avatar}><Text style={{ fontSize:36 }}>👤</Text></View>
        <View>
          <Text style={pStyles.name}>{user?.name || 'Utilisateur'}</Text>
          <View style={pStyles.planBadge}><Text style={pStyles.planText}>{user?.plan || 'FREE'}</Text></View>
        </View>
      </View>

      <View style={pStyles.card}>
        {sections.map((s, i) => (
          <TouchableOpacity key={s.label} style={[pStyles.row, i < sections.length-1 && pStyles.border]} onPress={s.action}>
            <Text style={{ fontSize:18, marginRight:14 }}>{s.icon}</Text>
            <Text style={pStyles.rowText}>{s.label}</Text>
            <Text style={{ color:COLORS.muted }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={pStyles.logout} onPress={logout}>
        <Text style={pStyles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── TalentDetailScreen ───────────────────────────────────────────────────────
// mobile/src/screens/TalentDetailScreen.tsx
import { Linking as RNLinking } from 'react-native';

export function TalentDetailScreen({ route }: any) {
  const { talent } = route.params;
  const price = calcPrice(talent.src || 0, talent.cat || 'PIANO');

  return (
    <ScrollView style={dStyles.container} contentContainerStyle={{ padding:24 }}>
      <View style={dStyles.hero}>
        <Text style={{ fontSize:72 }}>{getEmoji(talent.category)}</Text>
        <View style={{ flex:1 }}>
          <Text style={dStyles.name}>{talent.name}</Text>
          <Text style={dStyles.meta}>{talent.category} · {talent.zone}</Text>
          <View style={{ flexDirection:'row', gap:6, flexWrap:'wrap', marginTop:6 }}>
            {talent.tags?.map((t: string) => (
              <View key={t} style={dStyles.tag}><Text style={dStyles.tagText}>{t}</Text></View>
            ))}
          </View>
        </View>
      </View>

      {talent.bio && <Text style={dStyles.bio}>{talent.bio}</Text>}

      <TouchableOpacity style={dStyles.ctaWa}
        onPress={() => RNLinking.openURL(`https://wa.me/33651426961?text=Je souhaite contacter ${talent.name}`)}>
        <Text style={dStyles.ctaWaText}>💬 Contacter via WhatsApp</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── ProductScreen ────────────────────────────────────────────────────────────
// mobile/src/screens/ProductScreen.tsx
export function ProductScreen({ route }: any) {
  const { product } = route.params;
  const price = calcPrice(product.src, product.cat);

  return (
    <View style={dStyles.container}>
      <View style={[dStyles.hero, { justifyContent:'center', flexDirection:'column', gap:12 }]}>
        <Text style={{ fontSize:80, textAlign:'center' }}>{product.emoji}</Text>
        <Text style={[dStyles.name, { textAlign:'center' }]}>{product.name}</Text>
        <Text style={[dStyles.meta, { textAlign:'center' }]}>{product.brand}</Text>
        <Text style={{ color:COLORS.gold, fontSize:36, fontWeight:'700', textAlign:'center' }}>{price.our}€</Text>
      </View>
      <View style={{ padding:24, gap:12 }}>
        <TouchableOpacity style={dStyles.ctaWa}
          onPress={() => RNLinking.openURL(`https://wa.me/33651426961?text=Commander: ${product.name} (${price.our}€)`)}>
          <Text style={dStyles.ctaWaText}>💬 Commander via WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={dStyles.ctaPp}
          onPress={() => RNLinking.openURL('https://paypal.me/LevitiquePianoSchool')}>
          <Text style={dStyles.ctaPpText}>💳 Payer via PayPal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── LoginScreen ──────────────────────────────────────────────────────────────
// mobile/src/screens/LoginScreen.tsx
export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');

  const handleLogin = () => {
    // await api.post('/auth/login', { email, password: pass })
    login({ id:'1', name:'Christ-Elie', plan:'PRO', email });
  };

  return (
    <View style={lStyles.container}>
      <Text style={lStyles.logo}>Lyra Music</Text>
      <Text style={lStyles.sub}>La marketplace du gospel francophone</Text>
      <TextInput style={lStyles.input} placeholder="Email" placeholderTextColor={COLORS.muted}
        value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={lStyles.input} placeholder="Mot de passe" placeholderTextColor={COLORS.muted}
        value={pass} onChangeText={setPass} secureTextEntry />
      <TouchableOpacity style={lStyles.btn} onPress={handleLogin}>
        <Text style={lStyles.btnText}>Se connecter</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ marginTop:16 }}>
        <Text style={{ color:COLORS.gold, textAlign:'center', fontSize:14 }}>Créer un compte</Text>
      </TouchableOpacity>
    </View>
  );
}

// Helpers
function getEmoji(cat: string) {
  const map: Record<string,string> = { Piano:'🎹',Guitare:'🎸',Chant:'🎤',Violon:'🎻',Saxophone:'🎷',Trompette:'🎺',DJ:'🎧',Batterie:'🥁',Danseur:'💃' };
  return map[cat] || '🎵';
}
function calcPrice(src: number, cat: string) {
  const r = ({ PIANO:0.08, GUITARE:0.12, SAXOPHONE:0.10, IN_EAR:0.15, PEDALE_EFFET:0.18, ACCESSOIRE_CABLE:0.25 } as any)[cat] || 0.15;
  const m = ({ PIANO:30, GUITARE:15, SAXOPHONE:18, IN_EAR:10, PEDALE_EFFET:8, ACCESSOIRE_CABLE:2 } as any)[cat] || 5;
  return { src, our: parseFloat((src + Math.max(src*r, m)).toFixed(2)) };
}

// ── Styles partagés ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:  { flex:1, backgroundColor:COLORS.dark },
  header:     { paddingHorizontal:20, paddingTop:56, paddingBottom:12 },
  title:      { color:COLORS.text, fontSize:26, fontWeight:'600' },
  searchBox:  { marginHorizontal:16, marginBottom:8 },
  search:     { backgroundColor:COLORS.dark3, borderRadius:10, borderWidth:0.5, borderColor:COLORS.border, paddingHorizontal:14, paddingVertical:10, color:COLORS.text, fontSize:14 },
  thread:     { flexDirection:'row', alignItems:'center', paddingVertical:14, gap:12 },
  avatar:     { width:48, height:48, borderRadius:24, backgroundColor:COLORS.dark3, alignItems:'center', justifyContent:'center' },
  name:       { color:COLORS.text, fontWeight:'600', fontSize:15 },
  row:        { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:2 },
  time:       { color:COLORS.muted, fontSize:12 },
  last:       { color:COLORS.muted, fontSize:13 },
  badge:      { backgroundColor:COLORS.gold, borderRadius:10, minWidth:20, height:20, alignItems:'center', justifyContent:'center', paddingHorizontal:5 },
  badgeText:  { color:COLORS.dark, fontSize:11, fontWeight:'700' },
});
const pStyles = StyleSheet.create({
  container:  { flex:1, backgroundColor:COLORS.dark },
  header:     { flexDirection:'row', alignItems:'center', gap:16, marginBottom:28 },
  avatar:     { width:72, height:72, borderRadius:36, backgroundColor:COLORS.dark3, alignItems:'center', justifyContent:'center' },
  name:       { color:COLORS.text, fontSize:20, fontWeight:'600', marginBottom:4 },
  planBadge:  { backgroundColor:'rgba(201,168,76,0.15)', borderWidth:0.5, borderColor:COLORS.border, paddingHorizontal:10, paddingVertical:3, borderRadius:100, alignSelf:'flex-start' },
  planText:   { color:COLORS.gold, fontSize:12, fontWeight:'600' },
  card:       { backgroundColor:COLORS.dark2, borderRadius:14, borderWidth:0.5, borderColor:COLORS.border, overflow:'hidden', marginBottom:24 },
  row:        { flexDirection:'row', alignItems:'center', paddingHorizontal:18, paddingVertical:16 },
  border:     { borderBottomWidth:0.5, borderBottomColor:COLORS.border },
  rowText:    { color:COLORS.text, fontSize:15, flex:1 },
  logout:     { alignItems:'center', paddingVertical:16 },
  logoutText: { color:'#e05555', fontSize:15, fontWeight:'500' },
});
const dStyles = StyleSheet.create({
  container:  { flex:1, backgroundColor:COLORS.dark },
  hero:       { flexDirection:'row', gap:16, padding:24, backgroundColor:COLORS.dark2, borderBottomWidth:0.5, borderBottomColor:COLORS.border, alignItems:'center' },
  name:       { color:COLORS.text, fontSize:20, fontWeight:'600' },
  meta:       { color:COLORS.muted, fontSize:13, marginTop:4 },
  tag:        { backgroundColor:'rgba(201,168,76,0.1)', borderWidth:0.5, borderColor:COLORS.border, paddingHorizontal:8, paddingVertical:3, borderRadius:100 },
  tagText:    { color:COLORS.gold, fontSize:11 },
  bio:        { color:COLORS.muted, fontSize:14, lineHeight:22, padding:24, paddingTop:16 },
  ctaWa:      { backgroundColor:'rgba(37,211,102,0.15)', borderWidth:1, borderColor:'rgba(37,211,102,0.4)', borderRadius:12, paddingVertical:16, alignItems:'center', marginHorizontal:24, marginTop:8 },
  ctaWaText:  { color:'#25d366', fontWeight:'600', fontSize:15 },
  ctaPp:      { backgroundColor:'rgba(0,112,186,0.15)', borderWidth:1, borderColor:'rgba(0,112,186,0.4)', borderRadius:12, paddingVertical:16, alignItems:'center', marginHorizontal:24 },
  ctaPpText:  { color:'#4da6e0', fontWeight:'600', fontSize:15 },
});
const lStyles = StyleSheet.create({
  container:  { flex:1, backgroundColor:COLORS.dark, justifyContent:'center', padding:32 },
  logo:       { color:COLORS.gold, fontSize:40, fontWeight:'300', textAlign:'center', marginBottom:8, fontStyle:'italic' },
  sub:        { color:COLORS.muted, textAlign:'center', fontSize:14, marginBottom:40 },
  input:      { backgroundColor:COLORS.dark2, borderWidth:0.5, borderColor:COLORS.border, borderRadius:12, paddingHorizontal:16, paddingVertical:14, color:COLORS.text, fontSize:15, marginBottom:12 },
  btn:        { backgroundColor:COLORS.gold, borderRadius:12, paddingVertical:16, alignItems:'center', marginTop:8 },
  btnText:    { color:COLORS.dark, fontSize:16, fontWeight:'700' },
});
