import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import axios from 'axios';

// ⚠️ REEMPLAZA ESTA IP CON LA DIRECCIÓN IPV4 DE TU COMPUTADORA
//const IP_PC = '192.168.100.55'; // Ej: '192.168.100.25'
//const BASE_URL = `http://${IP_PC}:5000/api`;

const BASE_URL = 'https://overcome-stylus-heroes-spell.trycloudflare.com/api';

export default function App() {
  const [pestana, setPestana] = useState<'partidos' | 'tablas' | 'goleadores'>('partidos');
  const [partidos, setPartidos] = useState([]);
  const [tablas, setTablas] = useState({ masculino: [], femenino: [] });
  const [goleadores, setGoleadores] = useState({ masculino: [], femenino: [] });
  const [loading, setLoading] = useState(true);

  // Cargar datos del Backend Flask
  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (pestana === 'partidos') {
        const res = await axios.get(`${BASE_URL}/partidos`);
        setPartidos(res.data);
      } else if (pestana === 'tablas') {
        const res = await axios.get(`${BASE_URL}/tablas`);
        setTablas(res.data);
      } else if (pestana === 'goleadores') {
        const res = await axios.get(`${BASE_URL}/goleadores`);
        setGoleadores(res.data);
      }
    } catch (error: any) {
      console.error('Error conectando con Flask API:', error);
      alert('Error de conexión: ' + (error.message || 'No se pudo conectar al servidor'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [pestana]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#1e293b" />
      
      {/* HEADER DE LA APP */}
      <View style={styles.header}>
        <Text style={styles.tituloHeader}>⚽ Liga Barrial Chillogallo</Text>
        <Text style={styles.subtituloHeader}>Panel Oficial de Torneo</Text>
      </View>

      {/* MENÚ DE PESTAÑAS */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, pestana === 'partidos' && styles.tabActive]} 
          onPress={() => setPestana('partidos')}>
          <Text style={[styles.tabText, pestana === 'partidos' && styles.tabTextActive]}>📅 Partidos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, pestana === 'tablas' && styles.tabActive]} 
          onPress={() => setPestana('tablas')}>
          <Text style={[styles.tabText, pestana === 'tablas' && styles.tabTextActive]}>📊 Posiciones</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, pestana === 'goleadores' && styles.tabActive]} 
          onPress={() => setPestana('goleadores')}>
          <Text style={[styles.tabText, pestana === 'goleadores' && styles.tabTextActive]}>🥇 Goleadores</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO PRINCIPAL */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Cargando información del servidor...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          
          {/* PESTAÑA 1: PARTIDOS Y CALENDARIO */}
          {pestana === 'partidos' && (
            <FlatList
              data={partidos}
              keyExtractor={(item: any) => item.id.toString()}
              contentContainerStyle={{ padding: 16 }}
              onRefresh={cargarDatos}
              refreshing={loading}
              renderItem={({ item }: any) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.fechaBadge}>FECHA {item.fecha_numero} — {item.dia_juego}</Text>
                    <Text style={[styles.generoBadge, item.genero === 'Masculino' ? styles.bgMasc : styles.bgFem]}>
                      {item.genero}
                    </Text>
                  </View>

                  <View style={styles.marcadorRow}>
                    <Text style={styles.equipoText}>{item.local}</Text>
                    <View style={styles.scoreBox}>
                      <Text style={styles.scoreText}>{item.goles_local} - {item.goles_visitante}</Text>
                    </View>
                    <Text style={styles.equipoText}>{item.visitante}</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.footerInfo}>📌 Mesa: <Text style={styles.boldText}>{item.vocalia}</Text></Text>
                    <Text style={styles.footerInfo}>🏁 Árbitro: <Text style={styles.boldText}>{item.arbitro}</Text></Text>
                  </View>
                </View>
              )}
            />
          )}

          {/* PESTAÑA 2: TABLAS DE POSICIONES */}
          {pestana === 'tablas' && (
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text style={styles.seccionTitulo}>👔 Categoría Masculina</Text>
              <TablaPosicionesComponent data={tablas.masculino} />

              <Text style={[styles.seccionTitulo, { marginTop: 24, color: '#be185d' }]}>👚 Categoría Femenina</Text>
              <TablaPosicionesComponent data={tablas.femenino} />
            </ScrollView>
          )}

          {/* PESTAÑA 3: GOLEADORES */}
          {pestana === 'goleadores' && (
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text style={styles.seccionTitulo}>👔 Máximos Anotadores (Masculino)</Text>
              <TablaGoleadoresComponent data={goleadores.masculino} />

              <Text style={[styles.seccionTitulo, { marginTop: 24, color: '#be185d' }]}>👚 Máximas Anotadoras (Femenino)</Text>
              <TablaGoleadoresComponent data={goleadores.femenino} />
            </ScrollView>
          )}

        </View>
      )}
    </SafeAreaView>
  );
}

// COMPONENTE TABLA POSICIONES
function TablaPosicionesComponent({ data }: { data: any[] }) {
  return (
    <View style={styles.tableCard}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.col, { flex: 3, fontWeight: 'bold' }]}>Equipo</Text>
        <Text style={styles.col}>PJ</Text>
        <Text style={styles.col}>DG</Text>
        <Text style={[styles.col, { fontWeight: 'bold', color: '#2563eb' }]}>PTS</Text>
      </View>
      {data.map((item, index) => (
        <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
          <Text style={[styles.col, { flex: 3, fontWeight: '600' }]} numberOfLines={1}>{index + 1}. {item.equipo}</Text>
          <Text style={styles.col}>{item.pj}</Text>
          <Text style={styles.col}>{item.dg}</Text>
          <Text style={[styles.col, { fontWeight: 'bold', color: '#1e293b' }]}>{item.pts}</Text>
        </View>
      ))}
    </View>
  );
}

// COMPONENTE TABLA GOLEADORES
function TablaGoleadoresComponent({ data }: { data: any[] }) {
  return (
    <View style={styles.tableCard}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.col, { flex: 3, fontWeight: 'bold' }]}>Jugador / Equipo</Text>
        <Text style={[styles.col, { fontWeight: 'bold', color: '#16a34a' }]}>Goles</Text>
      </View>
      {data.map((item, index) => (
        <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
          <View style={{ flex: 3 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#1e293b' }}>{index + 1}. {item.nombre}</Text>
            <Text style={{ fontSize: 10, color: '#64748b' }}>{item.equipo}</Text>
          </View>
          <Text style={[styles.col, { fontWeight: '900', fontSize: 15, color: '#16a34a' }]}>{item.goles}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { backgroundColor: '#0f172a', paddingVertical: 18, alignItems: 'center' },
  tituloHeader: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  subtituloHeader: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderColor: '#2563eb' },
  tabText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  tabTextActive: { color: '#2563eb' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748b', fontSize: 12 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  fechaBadge: { fontSize: 11, fontWeight: 'bold', color: '#475569' },
  generoBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  bgMasc: { backgroundColor: '#dbeafe', color: '#1e40af' },
  bgFem: { backgroundColor: '#fce7f3', color: '#be185d' },
  marcadorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  equipoText: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', flex: 1, textAlign: 'center' },
  scoreBox: { backgroundColor: '#0f172a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginHorizontal: 8 },
  scoreText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
  cardFooter: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-around' },
  footerInfo: { fontSize: 11, color: '#64748b' },
  boldText: { fontWeight: 'bold', color: '#334155' },
  seccionTitulo: { fontSize: 15, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 8 },
  tableCard: { backgroundColor: '#ffffff', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
  tableHeader: { backgroundColor: '#f8fafc', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  rowEven: { backgroundColor: '#ffffff' },
  rowOdd: { backgroundColor: '#f8fafc' },
  col: { flex: 1, textAlign: 'center', fontSize: 12, color: '#334155' }
});