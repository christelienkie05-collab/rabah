// mobile/src/screens/BoutiqueScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Dimensions, Linking, Alert, Modal, ScrollView,
} from 'react-native';
import { COLORS } from '../theme';
import { FilterChips } from '../components/FilterChips';

const { width } = Dimensions.get('window');
const CARD_W = (width - 44) / 2;

const MARGIN_RATES: Record<string, number> = {
  PIANO:0.08, GUITARE:0.12, SAXOPHONE:0.10, VIOLON:0.10,
  TROMPETTE:0.10, ACCESSOIRE_CABLE:0.25, PEDALE_EFFET:0.18,
  PEDALE_SUSTAIN:0.20, MEDIATOR:0.30, IN_EAR:0.15,
};
const MIN_MARGINS: Record<string, number> = {
  PIANO:30, GUITARE:15, SAXOPHONE:18, VIOLON:12, TROMPETTE:12,
  ACCESSOIRE_CABLE:2, PEDALE_EFFET:8, PEDALE_SUSTAIN:5, MEDIATOR:0.5, IN_EAR:10,
};
function calcPrice(src: number, cat: string) {
  const r = MARGIN_RATES[cat] || 0.15;
  const m = MIN_MARGINS[cat] || 5;
  const margin = Math.max(src * r, m);
  return { src, our: parseFloat((src + margin).toFixed(2)) };
}

const PRODUCTS = [
  { id:'1', name:'Casio CT-S300', brand:'Casio', cat:'PIANO', src:89, emoji:'🎹' },
  { id:'2', name:'Yamaha PSR-E373', brand:'Yamaha', cat:'PIANO', src:179, emoji:'🎹' },
  { id:'3', name:'Roland FP-30X', brand:'Roland', cat:'PIANO', src:649, emoji:'🎹' },
  { id:'4', name:'Fender CD-60S', brand:'Fender', cat:'GUITARE', src:219, emoji:'🎸' },
  { id:'5', name:'Yamaha Alto YAS-280', brand:'Yamaha', cat:'SAXOPHONE', src:680, emoji:'🎷' },
  { id:'6', name:'Bach Stradivarius 37', brand:'Bach', cat:'TROMPETTE', src:1890, emoji:'🎺' },
  { id:'7', name:'Shure SE215', brand:'Shure', cat:'IN_EAR', src:99, emoji:'🎧' },
  { id:'8', name:'Boss DS-1', brand:'Boss', cat:'PEDALE_EFFET', src:55, emoji:'🎛' },
  { id:'9', name:'Pédale sustain M-Audio', brand:'M-Audio', cat:'PEDALE_SUSTAIN', src:19, emoji:'🦶' },
  { id:'10', name:'Câble Jack 6m Cordial', brand:'Cordial', cat:'ACCESSOIRE_CABLE', src:12, emoji:'🔌' },
  { id:'11', name:'Pack Médiators Dunlop', brand:'Dunlop', cat:'MEDIATOR', src:4, emoji:'🎵' },
];

const FILTERS = ['Tous','PIANO','GUITARE','SAXOPHONE','IN_EAR','PEDALE_EFFET','ACCESSOIRE_CABLE'];
const FILTER_LABELS: Record<string, string> = {
  Tous:'Tous', PIANO:'Piano', GUITARE:'Guitare', SAXOPHONE:'Sax.',
  IN_EAR:'In-ear', PEDALE_EFFET:'Pédales', ACCESSOIRE_CABLE:'Câbles',
};

export function BoutiqueScreen() {
  const [filter, setFilter]   = useState('Tous');
  const [selected, setSelected] = useState<any>(null);

  const items = filter === 'Tous' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);

  const openOrder = (product: any) => setSelected(product);

  const orderViaWhatsApp = (product: any) => {
    const price = calcPrice(product.src, product.cat);
    const msg = `Bonjour, je souhaite commander : ${product.name} (${product.our}€) via Lyra Music. Merci de me confirmer la disponibilité.`;
    Linking.openURL(`https://wa.me/33651426961?text=${encodeURIComponent(msg)}`);
    setSelected(null);
  };

  const orderViaPayPal = () => {
    Linking.openURL('https://paypal.me/LevitiquePianoSchool');
    setSelected(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Boutique</Text>
        <Text style={styles.subtitle}>Instruments & accessoires</Text>
      </View>

      <FilterChips
        items={FILTERS}
        selected={filter}
        onSelect={setFilter}
      />

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => {
          const price = calcPrice(item.src, item.cat);
          return (
            <TouchableOpacity style={styles.card} onPress={() => openOrder({ ...item, ...price })}>
              <View style={styles.imgBox}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <View style={styles.body}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.brand}>{item.brand}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.ourPrice}>{price.our}€</Text>
                  <Text style={styles.srcPrice}>{price.src}€</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Modal commande */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
              <Text style={{ color: COLORS.muted }}>✕</Text>
            </TouchableOpacity>
            {selected && (
              <>
                <Text style={styles.sheetEmoji}>{selected.emoji}</Text>
                <Text style={styles.sheetName}>{selected.name}</Text>
                <Text style={styles.sheetPrice}>{selected.our}€</Text>
                <Text style={styles.sheetSub}>Livraison depuis notre partenaire · Suivi inclus</Text>

                <TouchableOpacity style={styles.waBtn} onPress={() => orderViaWhatsApp(selected)}>
                  <Text style={styles.waBtnText}>💬 Commander via WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ppBtn} onPress={orderViaPayPal}>
                  <Text style={styles.ppBtnText}>💳 Payer via PayPal</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:COLORS.dark },
  header:    { paddingHorizontal:20, paddingTop:56, paddingBottom:12 },
  title:     { color:COLORS.text, fontSize:26, fontWeight:'600' },
  subtitle:  { color:COLORS.muted, fontSize:14, marginTop:2 },
  row:       { justifyContent:'space-between', marginBottom:12 },
  card:      { width:CARD_W, backgroundColor:COLORS.dark2, borderRadius:14, borderWidth:0.5, borderColor:COLORS.border, overflow:'hidden' },
  imgBox:    { height:CARD_W*0.8, backgroundColor:COLORS.dark3, alignItems:'center', justifyContent:'center' },
  emoji:     { fontSize:48 },
  body:      { padding:12 },
  name:      { color:COLORS.text, fontSize:13, fontWeight:'500', marginBottom:3, lineHeight:18 },
  brand:     { color:COLORS.muted, fontSize:11, marginBottom:8 },
  priceRow:  { flexDirection:'row', alignItems:'baseline', gap:6 },
  ourPrice:  { color:COLORS.gold, fontSize:18, fontWeight:'700' },
  srcPrice:  { color:COLORS.muted, fontSize:12, textDecorationLine:'line-through' },
  overlay:   { flex:1, backgroundColor:'rgba(0,0,0,0.7)', justifyContent:'flex-end' },
  sheet:     { backgroundColor:COLORS.dark2, borderTopLeftRadius:24, borderTopRightRadius:24, padding:28, paddingBottom:48, borderWidth:0.5, borderColor:COLORS.border, alignItems:'center' },
  closeBtn:  { position:'absolute', top:16, right:20, padding:8 },
  sheetEmoji:{ fontSize:56, marginBottom:8, marginTop:8 },
  sheetName: { color:COLORS.text, fontSize:20, fontWeight:'600', textAlign:'center', marginBottom:4 },
  sheetPrice:{ color:COLORS.gold, fontSize:32, fontWeight:'700', marginBottom:6 },
  sheetSub:  { color:COLORS.muted, fontSize:13, textAlign:'center', marginBottom:24, lineHeight:18 },
  waBtn:     { backgroundColor:'rgba(37,211,102,0.15)', borderWidth:1, borderColor:'rgba(37,211,102,0.4)', borderRadius:12, paddingVertical:14, paddingHorizontal:24, width:'100%', alignItems:'center', marginBottom:10 },
  waBtnText: { color:'#25d366', fontWeight:'600', fontSize:15 },
  ppBtn:     { backgroundColor:'rgba(0,112,186,0.15)', borderWidth:1, borderColor:'rgba(0,112,186,0.4)', borderRadius:12, paddingVertical:14, paddingHorizontal:24, width:'100%', alignItems:'center' },
  ppBtnText: { color:'#4da6e0', fontWeight:'600', fontSize:15 },
});
