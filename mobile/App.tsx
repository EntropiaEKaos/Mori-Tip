import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, StatusBar } from 'react-native';

export default function MoriMobile() {
  const [activeTab, setActiveTab] = useState('feed');
  const [showConcierge, setShowConcierge] = useState(false);
  const [conciergeMsg, setConciergeMsg] = useState('');
  const [chat, setChat] = useState([
    { id: 1, from: 'ai', text: 'Olá! Sou o Mori Concierge 🧭. Onde você quer viajar hoje?' }
  ]);

  const sendToConcierge = () => {
    if (!conciergeMsg.trim()) return;
    setChat([...chat, { id: Date.now(), from: 'user', text: conciergeMsg }]);
    setTimeout(() => {
      const responses = [
        'Encontrei 3 pousadas incríveis em Jericoacoara com diárias a partir de R$ 380!',
        'Temos um roteiro de 4 dias na Chapada Diamantina perfeito para você.',
        'O guia Pedro está disponível em Jeri por R$ 350/dia. Quer contato?'
      ];
      setChat(prev => [...prev, { 
        id: Date.now() + 1, 
        from: 'ai', 
        text: responses[Math.floor(Math.random() * responses.length)] 
      }]);
    }, 800);
    setConciergeMsg('');
  };

  const tabs = [
    { key: 'feed', icon: '🏠', label: 'Feed' },
    { key: 'explore', icon: '🔍', label: 'Explorar' },
    { key: 'roteiros', icon: '🗺️', label: 'Roteiros' },
    { key: 'pousadas', icon: '🏨', label: 'Pousadas' },
    { key: 'profile', icon: '👤', label: 'Perfil' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircle}><Text style={styles.logoText}>🧭</Text></View>
          <Text style={styles.logo}>Mori</Text>
        </View>
        <TouchableOpacity onPress={() => setShowConcierge(true)} style={styles.conciergeBtn}>
          <Text style={styles.conciergeText}>IA</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'feed' && (
          <>
            <Text style={styles.sectionTitle}>Momentos de hoje</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
              {['Marina', 'Rafael', 'Juliana', 'Pedro'].map((name, i) => (
                <View key={i} style={styles.momentCircle}>
                  <View style={styles.momentInner}><Text style={{ fontSize: 22 }}>{['🌊','🏔️','🌅','🧭'][i]}</Text></View>
                  <Text style={styles.momentName}>{name}</Text>
                </View>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Para você</Text>
            {[1,2,3].map(i => (
              <View key={i} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.avatar} />
                  <View><Text style={styles.postAuthor}>Marina Serrano</Text><Text style={styles.postMeta}>Florianópolis • 2h</Text></View>
                </View>
                <Text style={styles.postText}>Amanhecer em Floripa é sempre mágico. Acordei cedo para ver o sol nascer na Praia Mole ☀️</Text>
                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.actionBtn}><Text>❤️ 124</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}><Text>💬 38</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === 'explore' && (
          <View>
            <Text style={styles.sectionTitle}>Descubra novos destinos</Text>
            {['Jericoacoara', 'Monte Verde', 'Chapada Diamantina', 'Ouro Preto'].map((dest, i) => (
              <View key={i} style={styles.exploreCard}><Text style={styles.exploreTitle}>{dest}</Text><Text style={styles.exploreMeta}>42 viajantes • 18 pousadas</Text></View>
            ))}
          </View>
        )}

        {activeTab === 'roteiros' && (
          <View>
            <Text style={styles.sectionTitle}>Roteiros em destaque</Text>
            {[{title:'3 dias em Jeri',days:3,budget:1800},{title:'Chapada Diamantina',days:5,budget:2400},{title:'Serra dos Órgãos',days:4,budget:1200}].map((r, i) => (
              <View key={i} style={styles.roteiroCard}><Text style={styles.roteiroTitle}>{r.title}</Text><Text style={styles.roteiroMeta}>{r.days} dias • R$ {r.budget}</Text></View>
            ))}
          </View>
        )}

        {activeTab === 'pousadas' && (
          <View>
            <Text style={styles.sectionTitle}>Pousadas verificadas</Text>
            {[{name:'Pousada do Sol',city:'Jericoacoara',price:380},{name:'Chalé Verde',city:'Monte Verde',price:520},{name:'Lagoa da Serra',city:'Gramado',price:410}].map((p, i) => (
              <View key={i} style={styles.pousadaCard}><Text style={styles.pousadaName}>{p.name}</Text><Text style={styles.pousadaMeta}>{p.city} • R$ {p.price}/noite</Text></View>
            ))}
          </View>
        )}

        {activeTab === 'profile' && (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <View style={styles.bigAvatar} />
            <Text style={styles.profileName}>Marina Serrano</Text>
            <Text style={styles.profileMeta}>@marina • Nível 7 • 1.240 Moris</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}><Text style={styles.statNumber}>84</Text><Text style={styles.statLabel}>Posts</Text></View>
              <View style={styles.stat}><Text style={styles.statNumber}>312</Text><Text style={styles.statLabel}>Seguidores</Text></View>
              <View style={styles.stat}><Text style={styles.statNumber}>89</Text><Text style={styles.statLabel}>Seguindo</Text></View>
            </View>
            <TouchableOpacity style={styles.premiumBtn}><Text style={styles.premiumText}>Assinar Premium</Text></TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.key} style={styles.navItem} onPress={() => setActiveTab(tab.key)}>
            <Text style={{ fontSize: 20, opacity: activeTab === tab.key ? 1 : 0.5 }}>{tab.icon}</Text>
            <Text style={[styles.navLabel, activeTab === tab.key && { color: '#c5a84a', fontWeight: '700' }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {showConcierge && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mori Concierge 🧭</Text>
              <TouchableOpacity onPress={() => setShowConcierge(false)}><Text style={{ fontSize: 24, color: '#8a826a' }}>×</Text></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320, marginBottom: 16 }}>
              {chat.map(msg => (
                <View key={msg.id} style={[styles.chatBubble, msg.from === 'user' && styles.chatBubbleUser]}>
                  <Text style={[styles.chatText, msg.from === 'user' && { color: '#fff' }]}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInputRow}>
              <TextInput style={styles.chatInput} placeholder="Onde você quer viajar?" value={conciergeMsg} onChangeText={setConciergeMsg} />
              <TouchableOpacity style={styles.sendBtn} onPress={sendToConcierge}><Text style={{ color: '#c5a84a', fontWeight: '700' }}>Enviar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf8f3' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e8e2d4' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: { width: 36, height: 36, backgroundColor: '#0f0f11', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#c5a84a', fontSize: 18 },
  logo: { fontSize: 26, fontWeight: '700', color: '#0f0f11', letterSpacing: -1 },
  conciergeBtn: { backgroundColor: '#0f0f11', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  conciergeText: { color: '#c5a84a', fontWeight: '800', fontSize: 12 },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#0f0f11' },
  momentCircle: { alignItems: 'center', marginRight: 18 },
  momentInner: { width: 68, height: 68, borderRadius: 34, borderWidth: 3, borderColor: '#c5a84a', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  momentName: { marginTop: 6, fontSize: 11, color: '#5c5648' },
  postCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#e8e2d4' },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 42, height: 42, backgroundColor: '#c5a84a', borderRadius: 21, marginRight: 12 },
  postAuthor: { fontWeight: '700', fontSize: 15 },
  postMeta: { fontSize: 12, color: '#8a826a' },
  postText: { fontSize: 15, lineHeight: 22, color: '#1a1815' },
  postActions: { flexDirection: 'row', gap: 20, marginTop: 16 },
  actionBtn: { backgroundColor: '#f5f1e8', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  exploreCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: '#e8e2d4' },
  exploreTitle: { fontSize: 18, fontWeight: '700' },
  exploreMeta: { color: '#8a826a', marginTop: 4 },
  roteiroCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: '#e8e2d4' },
  roteiroTitle: { fontSize: 17, fontWeight: '700' },
  roteiroMeta: { color: '#c5a84a', marginTop: 4, fontWeight: '600' },
  pousadaCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: '#e8e2d4' },
  pousadaName: { fontSize: 17, fontWeight: '700' },
  pousadaMeta: { color: '#8a826a', marginTop: 4 },
  bigAvatar: { width: 96, height: 96, backgroundColor: '#c5a84a', borderRadius: 48, marginBottom: 16 },
  profileName: { fontSize: 24, fontWeight: '700' },
  profileMeta: { color: '#8a826a', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 40, marginTop: 24 },
  stat: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '700', color: '#0f0f11' },
  statLabel: { fontSize: 11, color: '#8a826a', marginTop: 2 },
  premiumBtn: { marginTop: 32, backgroundColor: '#0f0f11', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 999 },
  premiumText: { color: '#c5a84a', fontWeight: '700', fontSize: 15 },
  bottomNav: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e8e2d4', paddingBottom: 20, paddingTop: 8 },
  navItem: { flex: 1, alignItems: 'center' },
  navLabel: { fontSize: 10, marginTop: 2, color: '#8a826a' },
  modal: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f0f11' },
  chatBubble: { backgroundColor: '#f5f1e8', padding: 14, borderRadius: 16, borderTopLeftRadius: 4, marginBottom: 10, maxWidth: '85%' },
  chatBubbleUser: { backgroundColor: '#0f0f11', alignSelf: 'flex-end' },
  chatText: { fontSize: 15, lineHeight: 21, color: '#1a1815' },
  chatInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  chatInput: { flex: 1, backgroundColor: '#f5f1e8', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 12, fontSize: 15 },
  sendBtn: { backgroundColor: '#0f0f11', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 },
});
