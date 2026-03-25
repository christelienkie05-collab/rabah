// mobile/src/components/TalentCard.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS } from '../theme';

const CARD_WIDTH = (Dimensions.get('window').width - 44) / 2;

interface TalentCardProps {
  talent: any;
  onPress: () => void;
}

export function TalentCard({ talent, onPress }: TalentCardProps) {
  const [liked, setLiked] = useState(false);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Avatar placeholder */}
      <View style={styles.avatar}>
        <Text style={styles.avatarEmoji}>{getCategoryEmoji(talent.category)}</Text>
        {talent.boosted && <View style={styles.boostBadge}><Text style={styles.boostText}>★</Text></View>}
      </View>

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{talent.name}</Text>
          {talent.verified && <Text style={styles.verified}>✓</Text>}
        </View>
        <Text style={styles.meta}>{talent.category} · {talent.zone}</Text>

        <View style={styles.tags}>
          {talent.tags.slice(0,2).map((tag: string) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.likeRow} onPress={() => setLiked(!liked)}>
          <Text style={[styles.likeIcon, liked && styles.liked]}>{liked ? '♥' : '♡'}</Text>
          <Text style={styles.likeCount}>{liked ? talent.likes + 1 : talent.likes}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function getCategoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    Piano:'🎹', Guitare:'🎸', Chant:'🎤', Violon:'🎻',
    Saxophone:'🎷', Trompette:'🎺', DJ:'🎧', Batterie:'🥁', Danseur:'💃',
  };
  return map[cat] || '🎵';
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH, backgroundColor: COLORS.dark2,
    borderRadius: 14, borderWidth: 0.5, borderColor: COLORS.border, overflow: 'hidden',
  },
  avatar:     { height: CARD_WIDTH * 0.75, backgroundColor: COLORS.dark3, alignItems:'center', justifyContent:'center' },
  avatarEmoji:{ fontSize: 44 },
  boostBadge: { position:'absolute', top:8, right:8, backgroundColor:COLORS.gold, width:22, height:22, borderRadius:11, alignItems:'center', justifyContent:'center' },
  boostText:  { color: COLORS.dark, fontSize: 11, fontWeight:'700' },
  body:       { padding: 12 },
  nameRow:    { flexDirection:'row', alignItems:'center', gap:4, marginBottom:2 },
  name:       { color: COLORS.text, fontSize: 14, fontWeight:'500', flex:1 },
  verified:   { color:'#4caf7d', fontSize:12, fontWeight:'700' },
  meta:       { color: COLORS.muted, fontSize: 11, marginBottom: 8 },
  tags:       { flexDirection:'row', flexWrap:'wrap', gap:4, marginBottom:8 },
  tag:        { backgroundColor:'rgba(201,168,76,0.1)', borderWidth:0.5, borderColor:'rgba(201,168,76,0.3)', paddingHorizontal:7, paddingVertical:2, borderRadius:100 },
  tagText:    { color: COLORS.gold, fontSize: 10 },
  likeRow:    { flexDirection:'row', alignItems:'center', gap:4 },
  likeIcon:   { color: COLORS.muted, fontSize: 14 },
  liked:      { color: '#e05555' },
  likeCount:  { color: COLORS.muted, fontSize: 12 },
});
