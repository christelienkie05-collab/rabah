// mobile/src/screens/FeedScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, RefreshControl, Pressable, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';
import { TalentCard } from '../components/TalentCard';
import { FilterChips } from '../components/FilterChips';

const CATEGORIES = ['Tous','Piano','Guitare','Chant','Violon','Saxophone','Trompette','DJ','Danseur'];

// Mock data — à remplacer par appels API
const MOCK_TALENTS = [
  { id:'1', name:'Samuel K.',  category:'Piano',   zone:'Paris 75',  verified:true,  boosted:true,  likes:47, youtube:'dQw4w9WgXcQ', tags:['Gospel','Worship'] },
  { id:'2', name:'Grace M.',   category:'Chant',   zone:'Lyon',      verified:true,  boosted:false, likes:32, youtube:null,           tags:['Soprano','Mariage'] },
  { id:'3', name:'David A.',   category:'Guitare', zone:'Paris 93',  verified:false, boosted:false, likes:18, youtube:null,           tags:['Électrique'] },
  { id:'4', name:'Esther N.',  category:'Violon',  zone:'Versailles',verified:true,  boosted:false, likes:29, youtube:null,           tags:['Classique','Gospel'] },
  { id:'5', name:'Nathan B.',  category:'Saxophone',zone:'Bordeaux', verified:false, boosted:false, likes:21, youtube:null,           tags:['Alto','Jazz Gospel'] },
  { id:'6', name:'Miriam T.',  category:'Danseur', zone:'Paris 75',  verified:true,  boosted:true,  likes:55, youtube:null,           tags:['Prophétique'] },
];

export function FeedScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter]   = useState('Tous');
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(false);
  const [talents, setTalents] = useState(MOCK_TALENTS);

  const filtered = talents.filter(t => {
    const matchCat  = filter === 'Tous' || t.category === filter;
    const matchSrch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                      t.zone.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSrch;
  });

  const onRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800); // Remplacer par appel API réel
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Lyra Music</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SOS')} style={styles.sosBadge}>
          <Text style={styles.sosText}>🚨 SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={COLORS.muted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Nom, zone, instrument..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres */}
      <FilterChips items={CATEGORIES} selected={filter} onSelect={setFilter} />

      {/* Feed */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.feed}
        renderItem={({ item }) => (
          <TalentCard
            talent={item}
            onPress={() => navigation.navigate('TalentDetail', { talent: item })}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={COLORS.gold} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun talent trouvé</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.dark },
  header:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, paddingTop:56, paddingBottom:12 },
  logo:        { fontFamily: FONTS.display, fontSize: 26, color: COLORS.gold },
  sosBadge:    { backgroundColor:'rgba(220,60,60,0.15)', borderWidth:1, borderColor:'rgba(220,60,60,0.4)', paddingHorizontal:14, paddingVertical:6, borderRadius:100 },
  sosText:     { color:'#e05555', fontSize:12, fontWeight:'600' },
  searchRow:   { flexDirection:'row', alignItems:'center', marginHorizontal:16, marginBottom:12, backgroundColor:COLORS.dark3, borderRadius:12, borderWidth:0.5, borderColor:COLORS.border, paddingHorizontal:14, height:42 },
  searchInput: { flex:1, color:COLORS.text, fontSize:14 },
  feed:        { paddingHorizontal:12, paddingBottom:40 },
  row:         { justifyContent:'space-between', marginBottom:12 },
  empty:       { alignItems:'center', paddingTop:60 },
  emptyText:   { color:COLORS.muted, fontSize:15 },
});
