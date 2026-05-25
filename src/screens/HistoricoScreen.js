import React, {
  useContext,
  useEffect,
  useState
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  RefreshControl
} from 'react-native';

import {
  collection,
  getDocs,
  query,
  orderBy,
  where
} from 'firebase/firestore';

import {
  DatePickerModal,
  registerTranslation,
  pt
} from 'react-native-paper-dates';

import {
  db
} from '../services/firebase';

import {
  AuthContext
} from '../context/AuthContext';

registerTranslation(
  'pt',
  pt
);

export default function HistoricoScreen({
  navigation
}) {

  const {
    usuario
  } = useContext(AuthContext);

  const empresaId =
    usuario?.empresaId || 'default';

  const [
    checklists,
    setChecklists
  ] = useState([]);

  const [
    placaFiltro,
    setPlacaFiltro
  ] = useState('');

  const [
    dataFiltro,
    setDataFiltro
  ] = useState('');

  const [
    openDate,
    setOpenDate
  ] = useState(false);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    refreshing,
    setRefreshing
  ] = useState(false);

  function dataDoChecklist(item) {

    const valor =
      item.data ||
      item.createdAt;

    if (!valor) {

      return null;

    }

    if (typeof valor.toDate === 'function') {

      return valor.toDate();

    }

    const data =
      new Date(valor);

    return Number.isNaN(data.getTime())
      ? null
      : data;

  }

  function formatarData(item) {

    const data =
      dataDoChecklist(item);

    return data
      ? data.toLocaleDateString('pt-BR')
      : '-';

  }

  function formatarDataHora(item) {

    const data =
      dataDoChecklist(item);

    return data
      ? data.toLocaleString('pt-BR')
      : '-';

  }

  function formatarPlaca(valor) {

    let placa =
      String(valor || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');

    if (placa.length > 3) {

      placa =
        `${placa.slice(0, 3)}-${placa.slice(3, 7)}`;

    }

    return placa;

  }

  async function buscarChecklists() {

    if (!usuario) {

      setChecklists([]);
      setLoading(false);
      setRefreshing(false);
      return;

    }

    try {

      setLoading(true);

      const q = query(
        collection(
          db,
          'checklists'
        ),
        where(
          'empresaId',
          '==',
          empresaId
        ),
        orderBy(
          'data',
          'desc'
        )
      );

      const querySnapshot =
        await getDocs(q);

      const lista = [];

      querySnapshot.forEach((docItem) => {

        lista.push({
          id: docItem.id,
          ...docItem.data()
        });

      });

      if (
        usuario?.nivel !== 'admin' &&
        usuario?.nivel !== 'supervisor'
      ) {

        setChecklists(
          lista.filter((item) =>
            item.usuario?.uid === usuario?.uid
          )
        );

        return;

      }

      setChecklists(lista);

    } catch (e) {

      console.log(e);
      setChecklists([]);

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  }

  useEffect(() => {

    buscarChecklists();

  }, []);

  function atualizar() {

    setRefreshing(true);
    buscarChecklists();

  }

  const listaFiltrada =
    checklists.filter((item) => {

      const placa =
        formatarPlaca(item.veiculo?.placa)
          .toLowerCase();

      const data =
        formatarData(item)
          .toLowerCase();

      return (
        placa.includes(
          placaFiltro.toLowerCase()
        ) &&
        data.includes(
          dataFiltro.toLowerCase()
        )
      );

    });

  if (loading && !refreshing) {

    return (

      <View style={styles.loading}>

        <ActivityIndicator
          size="large"
          color="#0A1E40"
        />

        <Text style={styles.loadingTexto}>
          Carregando histórico...
        </Text>

      </View>

    );

  }

  return (

    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
    >

      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          contentContainerStyle={{
            paddingBottom: 120
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={atualizar}
            />
          }
        >

          <View style={styles.content}>

            <Text style={styles.titulo}>
              Histórico
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Filtrar placa"
              placeholderTextColor="#777"
              value={placaFiltro}
              onChangeText={(texto) =>
                setPlacaFiltro(
                  formatarPlaca(texto)
                )
              }
            />

            <View style={styles.dataContainer}>

              <TextInput
                style={styles.inputData}
                placeholder="Filtrar data"
                placeholderTextColor="#777"
                value={dataFiltro}
                onChangeText={setDataFiltro}
              />

              <TouchableOpacity
                style={styles.calendarioIcone}
                onPress={() =>
                  setOpenDate(true)
                }
              >

                <Text style={styles.iconeTexto}>
                  📅
                </Text>

              </TouchableOpacity>

            </View>

            <DatePickerModal
              locale="pt"
              mode="single"
              visible={openDate}
              onDismiss={() =>
                setOpenDate(false)
              }
              date={new Date()}
              onConfirm={({ date }) => {

                setOpenDate(false);

                if (date) {

                  setDataFiltro(
                    date.toLocaleDateString('pt-BR')
                  );

                }

              }}
            />

            {listaFiltrada.map((item) => (

              <View
                key={item.id}
                style={styles.card}
              >

                <Text style={styles.placa}>
                  🚗 {formatarPlaca(item.veiculo?.placa) || '-'}
                </Text>

                <View style={styles.infoBox}>

                  <Text style={styles.info}>
                    👤 {
                      typeof item.usuario === 'object'
                        ? item.usuario?.nome || '-'
                        : item.usuario || '-'
                    }
                  </Text>

                  <Text style={styles.info}>
                    🧰 {
                      typeof item.usuario === 'object'
                        ? item.usuario?.cargo || '-'
                        : '-'
                    }
                  </Text>

                  <Text style={styles.info}>
                    📋 Tipo: {item.tipoExecucao || '-'}
                  </Text>

                  <Text style={styles.info}>
                    KM: {item.km || 0}
                  </Text>

                  <Text style={styles.info}>
                    📅 {formatarDataHora(item)}
                  </Text>

                  <Text style={styles.info}>
                    Problemas: {
                      Object.values(
                        item.respostas || {}
                      ).filter((v) =>
                        v === 'ruim' ||
                        v === 'nc'
                      ).length
                    }
                  </Text>

                </View>

                <TouchableOpacity
                  style={styles.botao}
                  onPress={() =>
                    navigation.navigate(
                      'DetalhesChecklist',
                      {
                        checklist: item
                      }
                    )
                  }
                >

                  <Text style={styles.botaoTexto}>
                    Ver detalhes
                  </Text>

                </TouchableOpacity>

              </View>

            ))}

            {listaFiltrada.length === 0 && (

              <View style={styles.vazio}>

                <Text style={styles.vazioTexto}>
                  Nenhum checklist encontrado
                </Text>

              </View>

            )}

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </TouchableWithoutFeedback>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F3F5F8'
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F5F8',
    padding: 24
  },

  loadingTexto: {
    marginTop: 15,
    fontSize: 16,
    color: '#555'
  },

  content: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 100,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center'
  },

  titulo: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#111'
  },

  input: {
    backgroundColor: '#fff',
    height: 58,
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 17,
    marginBottom: 18,
    color: '#111'
  },

  dataContainer: {
    position: 'relative',
    marginBottom: 18
  },

  inputData: {
    backgroundColor: '#fff',
    height: 58,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingRight: 60,
    fontSize: 17,
    color: '#111'
  },

  calendarioIcone: {
    position: 'absolute',
    right: 15,
    top: 14
  },

  iconeTexto: {
    fontSize: 24
  },

  card: {
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 22,
    marginBottom: 18
  },

  placa: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 15
  },

  infoBox: {
    marginBottom: 22
  },

  info: {
    fontSize: 18,
    color: '#444',
    marginBottom: 8
  },

  botao: {
    backgroundColor: '#0A1E40',
    height: 58,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },

  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20
  },

  vazio: {
    padding: 40,
    alignItems: 'center'
  },

  vazioTexto: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center'
  }

});
