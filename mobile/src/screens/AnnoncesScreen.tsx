// mobile/src/screens/AnnoncesScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Modal, TextInput, ScrollView, Alert,
} from 'react-native';
import { COLORS } from '../theme';
import { FilterChips } from '../components/FilterChips';

const EVENT_TYPES = ['Tous','Mariage','Église','Gala','Concert','Anniversaire','Perso'];

const MOCK_ANNONCES = [
  { id:'1', title:'Pianiste pour mariage', type:'Mariage', date:'15 juin 2025', lieu:'Paris 16e', budget:150, sos:true,  instruments:['Piano'], status:'open' },
  { id:'2', title:'Groupe de louange — culte', type:'Église', date:'Tous les dimanches', lieu:'Versailles', budget:80, sos:false, instruments:['Piano','Guitare','Batterie'], status:'open' },
  { id:'3', title:'DJ Gospel — Gala annuel', type:'Gala', date:'28 nov. 2025', lieu:'Lyon', budget:300, sos:false, instruments:['DJ'], status:'open' },
  { id:'4', title:'Violoniste — anniversaire', type:'Anniversaire', date:'2 mai 2025', lieu:'Bordeaux', budget:120, sos:false, instruments:['Violon'], status:'open' },
];

export function AnnoncesScreen() {
  const [filter, setFilter]     = useState('Tous');
  const [modalVisible, setModal] = useState(false);
  const [form, setForm]         = useState({ title:'', type:'Mariage', date:'', lieu:'', budget:'', instruments:'', sos:false });

  const filtered = filter === 'Tous'
    ? MOCK_ANNONCES
    : MOCK_ANNONCES.filter(a => a.type === filter);

  const submitAnnonce = () => {
    if (!form.title || !form.date || !form.lieu) {
      Alert.alert('Champs requis', 'Titre, date et lieu sont obligatoires.');
      return;
    }
    // await api.post('/announcements', form);
    Alert.alert('✅ Annonce publiée !', 'Les talents correspondants seront notifiés.');
    setModal(false);
    setForm({ title:'', type:'Mariage', date:'', lieu:'', budget:'', instruments:'', sos:false });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Missions</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Text style={styles.addBtnText}>+ Publier</Text>
        </TouchableOpacity>
      </View>

      <FilterChips items={EVENT_TYPES} selected={filter} onSelect={setFilter} />

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => <AnnonceCard annonce={item} />}
      />

      {/* Modal création annonce */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvelle annonce</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Text style={{ color: COLORS.muted, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {[
            { label:'Titre *', key:'title', placeholder:'ex: Pianiste pour mariage' },
            { label:'Date *', key:'date', placeholder:'ex: 15 juin 2025' },
            { label:'Lieu *', key:'lieu', placeholder:'ex: Paris 16e' },
            { label:'Budget par musicien (€)', key:'budget', placeholder:'ex: 150', keyboardType:'numeric' },
            { label:'Instruments souhaités', key:'instruments', placeholder:'ex: Piano, Guitare, Batterie' },
          ].map(f => (
            <View key={f.key} style={{ marginBottom: 16 }}>
              <Text style={styles.formLabel}>{f.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor={COLORS.muted}
                value={(form as any)[f.key]}
                onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                keyboardType={(f as any).keyboardType || 'default'}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.sosToggle, form.sos && styles.sosActive]}
            onPress={() => setForm(p => ({ ...p, sos: !p.sos }))}
          >
            <Text style={{ color: form.sos ? '#e05555' : COLORS.muted, fontWeight:'600' }}>
              🚨 Marquer comme SOS Urgence {form.sos ? '(activé)' : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={submitAnnonce}>
            <Text style={styles.submitText}>Publier l'annonce</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

function AnnonceCard({ annonce }: { annonce: any }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle}>{annonce.title}</Text>
        {annonce.sos && <View style={styles.sosBadge}><Text style={styles.sosText}>SOS</Text></View>}
      </View>
      <Text style={styles.cardMeta}>{annonce.type} · {annonce.date} · {annonce.lieu}</Text>
      <View style={styles.row}>
        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6, flex:1 }}>
          {annonce.instruments.map((i: string) => (
            <View key={i} style={styles.tag}><Text style={styles.tagText}>{i}</Text></View>
          ))}
        </View>
        <Text style={styles.budget}>{annonce.budget}€/mus.</Text>
      </View>
      <TouchableOpacity style={styles.postulerBtn}>
        <Text style={styles.postulerText}>Postuler</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex:1, backgroundColor:COLORS.dark },
  header:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, paddingTop:56, paddingBottom:12 },
  title:       { color:COLORS.text, fontSize:26, fontWeight:'600' },
  addBtn:      { backgroundColor:COLORS.gold, paddingHorizontal:16, paddingVertical:8, borderRadius:8 },
  addBtnText:  { color:COLORS.dark, fontWeight:'600', fontSize:14 },
  card:        { backgroundColor:COLORS.dark2, borderRadius:14, borderWidth:0.5, borderColor:COLORS.border, padding:16 },
  cardTop:     { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 },
  cardTitle:   { color:COLORS.text, fontSize:15, fontWeight:'500', flex:1 },
  sosBadge:    { backgroundColor:'rgba(220,60,60,0.15)', borderWidth:1, borderColor:'rgba(220,60,60,0.4)', paddingHorizontal:8, paddingVertical:3, borderRadius:6 },
  sosText:     { color:'#e05555', fontSize:11, fontWeight:'700' },
  cardMeta:    { color:COLORS.muted, fontSize:12, marginBottom:12 },
  row:         { flexDirection:'row', alignItems:'center', marginBottom:14 },
  tag:         { backgroundColor:'rgba(201,168,76,0.1)', borderWidth:0.5, borderColor:COLORS.border, paddingHorizontal:8, paddingVertical:3, borderRadius:100 },
  tagText:     { color:COLORS.gold, fontSize:11 },
  budget:      { color:COLORS.gold, fontWeight:'600', fontSize:14, marginLeft:8 },
  postulerBtn: { backgroundColor:COLORS.gold, borderRadius:8, paddingVertical:10, alignItems:'center' },
  postulerText:{ color:COLORS.dark, fontWeight:'600', fontSize:14 },
  modal:       { flex:1, backgroundColor:COLORS.dark2 },
  modalHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:24 },
  modalTitle:  { color:COLORS.text, fontSize:22, fontWeight:'600' },
  formLabel:   { color:COLORS.text, fontSize:14, fontWeight:'500', marginBottom:6 },
  input:       { backgroundColor:COLORS.dark3, borderWidth:0.5, borderColor:COLORS.border, borderRadius:10, paddingHorizontal:14, paddingVertical:12, color:COLORS.text, fontSize:14 },
  sosToggle:   { borderWidth:1, borderColor:COLORS.border, borderRadius:10, padding:14, marginBottom:20, alignItems:'center' },
  sosActive:   { borderColor:'rgba(220,60,60,0.5)', backgroundColor:'rgba(220,60,60,0.08)' },
  submitBtn:   { backgroundColor:COLORS.gold, borderRadius:12, paddingVertical:16, alignItems:'center' },
  submitText:  { color:COLORS.dark, fontSize:15, fontWeight:'700' },
});
