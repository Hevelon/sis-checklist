import React,{
useState,
useContext
} from 'react';

import {
View,
Text,
TextInput,
TouchableOpacity,
StyleSheet,
Alert,
ScrollView,
KeyboardAvoidingView,
Platform,
TouchableWithoutFeedback,
Keyboard
} from 'react-native';

import {
AuthContext
} from '../context/AuthContext';

import {
criarUsuarioApp
} from '../services/functions';

export default function CadastrarUsuarioScreen(){

const{
usuario
}=useContext(AuthContext);

const empresaId =
usuario?.empresaId || 'default';

const[
nome,
setNome
]=useState('');

const[
email,
setEmail
]=useState('');

const[
telefone,
setTelefone
]=useState('');

const[
cargo,
setCargo
]=useState('');

const[
nivel,
setNivel
]=useState('motorista');

const[
senha,
setSenha
]=useState('');

const[
loading,
setLoading
]=useState(false);

if(
usuario?.nivel !== 'admin' &&
usuario?.nivel !== 'supervisor'
){

return(

<View style={styles.bloqueado}>

<Text style={styles.bloqueadoTexto}>
Acesso negado
</Text>

</View>

);

}

async function salvar(){

if(
!nome ||
!email ||
!senha
){

Alert.alert(
'Atenção',
'Preencha os campos obrigatórios'
);

return;

}

if(senha.length < 6){

Alert.alert(
'Atenção',
'A senha deve ter no mínimo 6 caracteres'
);

return;

}

try{

setLoading(true);

await criarUsuarioApp({

nome:
nome.trim(),
email:
email.trim(),
telefone:
telefone.trim(),
cargo:
cargo.trim(),
empresaId,
nivel,
senha

});

Alert.alert(
'Sucesso',
'Usuário cadastrado'
);

setNome('');
setEmail('');
setTelefone('');
setCargo('');
setSenha('');

}catch(e){

console.log(e);

Alert.alert(
'Erro',
e.message || 'Nao foi possivel cadastrar o usuario'
);

}finally{

setLoading(false);

}

}

return(

<TouchableWithoutFeedback
onPress={Keyboard.dismiss}
>

<KeyboardAvoidingView

style={styles.container}

behavior={
Platform.OS==='ios'
? 'padding'
: 'height'
}

>

<ScrollView
showsVerticalScrollIndicator={false}
keyboardShouldPersistTaps="handled"
nestedScrollEnabled={true}
contentContainerStyle={{
paddingBottom:120
}}
>

<View style={styles.content}>

<Text style={styles.titulo}>
Cadastrar Usuário
</Text>

<Text style={styles.sub}>
Adicionar novo colaborador
</Text>

<TextInput
style={styles.input}
placeholder="Nome"
placeholderTextColor="#999"
value={nome}
onChangeText={setNome}
/>

<TextInput
style={styles.input}
placeholder="E-mail"
placeholderTextColor="#999"
value={email}
onChangeText={setEmail}
/>

<TextInput
style={styles.input}
placeholder="Telefone"
placeholderTextColor="#999"
value={telefone}
onChangeText={setTelefone}
/>

<TextInput
style={styles.input}
placeholder="Cargo"
placeholderTextColor="#999"
value={cargo}
onChangeText={setCargo}
/>

<Text style={styles.label}>
Nível de acesso
</Text>

<View style={styles.niveis}>

{[
'admin',
'supervisor',
'operador',
'motorista'
].map((item)=>(

<TouchableOpacity

key={item}

style={[

styles.nivel,

nivel===item &&
styles.nivelAtivo

]}

onPress={()=>
setNivel(item)
}

>

<Text style={[

styles.nivelTexto,

nivel===item &&
styles.nivelTextoAtivo

]}>
{item}
</Text>

</TouchableOpacity>

))}

</View>

<TextInput
style={styles.input}
placeholder="Senha"
placeholderTextColor="#999"
secureTextEntry
value={senha}
onChangeText={setSenha}
/>

<TouchableOpacity
style={styles.botao}
onPress={salvar}
disabled={loading}
>

<Text style={styles.botaoTexto}>
{loading
? 'Salvando...'
: 'Salvar'}
</Text>

</TouchableOpacity>

</View>

</ScrollView>

</KeyboardAvoidingView>

</TouchableWithoutFeedback>

)

}

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:'#F3F5F8'
},

content:{
padding:20,
width:'100%',
maxWidth:600,
alignSelf:'center'
},

bloqueado:{
flex:1,
justifyContent:'center',
alignItems:'center',
backgroundColor:'#F3F5F8'
},

bloqueadoTexto:{
fontSize:24,
fontWeight:'bold',
color:'#E53935'
},

titulo:{
fontSize:36,
fontWeight:'bold',
marginTop:50,
color:'#111'
},

sub:{
fontSize:18,
color:'#666',
marginTop:8,
marginBottom:25
},

input:{
backgroundColor:'#fff',
height:60,
borderRadius:15,
paddingHorizontal:20,
fontSize:18,
marginBottom:18,
color:'#111'
},

label:{
fontSize:18,
fontWeight:'bold',
marginBottom:15,
color:'#111'
},

niveis:{
flexDirection:'row',
flexWrap:'wrap',
marginBottom:20
},

nivel:{
backgroundColor:'#fff',
paddingVertical:12,
paddingHorizontal:18,
borderRadius:12,
marginRight:10,
marginBottom:10
},

nivelAtivo:{
backgroundColor:'#0A1E40'
},

nivelTexto:{
fontWeight:'bold',
color:'#111'
},

nivelTextoAtivo:{
color:'#fff'
},

botao:{
backgroundColor:'#2CC36B',
height:60,
borderRadius:15,
justifyContent:'center',
alignItems:'center',
marginTop:10
},

botaoTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:20
}

});
