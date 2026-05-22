import React, {
  useState
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';

import {
  signInWithEmailAndPassword
} from 'firebase/auth';

import {
  auth
} from '../services/firebase';

export default function LoginScreen() {

  const [email, setEmail] =
    useState('');

  const [senha, setSenha] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  async function entrar() {

    if (!email || !senha) {

      Alert.alert(
        'Atenção',
        'Preencha email e senha'
      );

      return;

    }

    try {

      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );

    } catch (e) {

      console.log(e);

      Alert.alert(
        'Erro ao entrar',
        'Email ou senha inválidos'
      );

    } finally {

      setLoading(false);

    }

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

        <View style={styles.card}>

          <Text style={styles.logo}>
            SIS
          </Text>

          <Text style={styles.titulo}>
            Sistema Inteligente de Checklist Veicular
          </Text>

          <Text style={styles.subtitulo}>
            Faça login para continuar
          </Text>

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#777"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#777"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity
            style={styles.botao}
            onPress={entrar}
            disabled={loading}
          >

            <Text style={styles.textoBotao}>

              {loading
                ? 'Entrando...'
                : 'Entrar'}

            </Text>

          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>

    </TouchableWithoutFeedback>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#0A1E40',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },

  card: {
    width: '100%',
    maxWidth: 450
  },

  logo: {
    fontSize: 65,
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'center'
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 15
  },

  subtitulo: {
    color: '#C8D0E0',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 35,
    fontSize: 16
  },

  input: {
    backgroundColor: '#fff',
    height: 60,
    borderRadius: 15,
    paddingHorizontal: 18,
    marginBottom: 15,
    fontSize: 16,
    color: '#111'
  },

  botao: {
    backgroundColor: '#2CC36B',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },

  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20
  }

});