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
  Keyboard,
  ActivityIndicator
} from 'react-native';

import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword
} from 'firebase/auth';

import {
  auth
} from '../services/firebase';

function mensagemErroFirebase(codigo) {

  if (codigo === 'auth/invalid-email') {
    return 'Digite um e-mail válido.';
  }

  if (
    codigo === 'auth/user-not-found' ||
    codigo === 'auth/wrong-password' ||
    codigo === 'auth/invalid-credential'
  ) {
    return 'E-mail ou senha inválidos.';
  }

  if (codigo === 'auth/too-many-requests') {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  }

  if (codigo === 'auth/network-request-failed') {
    return 'Verifique sua conexão com a internet.';
  }

  return 'Não foi possível entrar agora. Tente novamente.';

}

export default function LoginScreen() {

  const [
    email,
    setEmail
  ] = useState('');

  const [
    senha,
    setSenha
  ] = useState('');

  const [
    loading,
    setLoading
  ] = useState(false);

  const emailLimpo =
    email.trim();

  async function entrar() {

    if (!emailLimpo || !senha) {

      Alert.alert(
        'Atenção',
        'Preencha e-mail e senha.'
      );

      return;

    }

    try {

      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        emailLimpo,
        senha
      );

    } catch (e) {

      console.log(e);

      Alert.alert(
        'Erro ao entrar',
        mensagemErroFirebase(e.code)
      );

    } finally {

      setLoading(false);

    }

  }

  async function recuperarSenha() {

    if (!emailLimpo) {

      Alert.alert(
        'Recuperar senha',
        'Digite seu e-mail para receber o link de recuperação.'
      );

      return;

    }

    try {

      setLoading(true);

      await sendPasswordResetEmail(
        auth,
        emailLimpo
      );

      Alert.alert(
        'E-mail enviado',
        'Enviamos um link para você redefinir sua senha.'
      );

    } catch (e) {

      console.log(e);

      Alert.alert(
        'Não foi possível enviar',
        mensagemErroFirebase(e.code)
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
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#777"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            editable={!loading}
            onSubmitEditing={entrar}
          />

          <TouchableOpacity
            style={[
              styles.botao,
              loading && styles.botaoDisabled
            ]}
            onPress={entrar}
            disabled={loading}
          >

            {loading ? (

              <ActivityIndicator
                color="#fff"
              />

            ) : (

              <Text style={styles.textoBotao}>
                Entrar
              </Text>

            )}

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBotao}
            onPress={recuperarSenha}
            disabled={loading}
          >

            <Text style={styles.linkTexto}>
              Esqueci minha senha
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

  botaoDisabled: {
    opacity: 0.75
  },

  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20
  },

  linkBotao: {
    alignItems: 'center',
    paddingVertical: 18
  },

  linkTexto: {
    color: '#C8D0E0',
    fontWeight: 'bold',
    fontSize: 15
  }

});
