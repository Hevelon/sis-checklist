import React,{
useState,
useContext
} from 'react';

import {
View,
Text,
StyleSheet,
TextInput,
TouchableOpacity,
Alert,
ScrollView,
KeyboardAvoidingView,
Platform,
TouchableWithoutFeedback,
Keyboard
} from 'react-native';

import {
collection,
addDoc,
serverTimestamp
} from 'firebase/firestore';

import {
db
} from '../services/firebase';

import {
AuthContext
} from '../context/AuthContext';

export default function CadastrarVeiculoScreen(){

const{
usuario
}=useContext(AuthContext);

const[
placa,
setPlaca
]=useState('');

const[
marca,
setMarca
]=useState('');

const[
modelo,
setModelo
]=useState('');

const[
km,
setKm
]=useState('');

const[
tipo,
setTipo
]=useState('');

const[
traccarId,
setTraccarId
]=useState('');

const[
obs,
setObs
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
!placa ||
!marca ||
!modelo
){

Alert.alert(
'Atenção',
'Preencha os campos obrigatórios'
);

return;

}

try{

setLoading(true);

await addDoc(
collection(
db,
'veiculos'
),
{

placa:
placa
.trim()
.toUpperCase(),

marca:
marca.trim(),

modelo:
modelo.trim(),

km:
Number(km) || 0,

tipo:
tipo.trim(),

traccarId:
Number(traccarId) || null,

obs:
obs.trim(),

status:'offline',

createdAt:
serverTimestamp()

}
);

Alert.alert(
'Sucesso',
'Veículo cadastrado'
);

setPlaca('');
setMarca('');
setModelo('');
setKm('');
setTipo('');
setTraccarId('');
setObs('');

}catch(e){

console.log(e);

Alert.alert(
'Erro',
'Não foi possível salvar'
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
Cadastrar Veículo
</Text>

<Text style={styles.subtitulo}>
Adicionar veículo à frota
</Text>

<TextInput
style={styles.input}
placeholder="Placa"
placeholderTextColor="#777"
autoCapitalize="characters"
value={placa}
onChangeText={setPlaca}
/>

<TextInput
style={styles.input}
placeholder="Marca"
placeholderTextColor="#777"
value={marca}
onChangeText={setMarca}
/>

<TextInput
style={styles.input}
placeholder="Modelo"
placeholderTextColor="#777"
value={modelo}
onChangeText={setModelo}
/>

<TextInput
style={styles.input}
placeholder="KM"
placeholderTextColor="#777"
keyboardType="numeric"
value={km}
onChangeText={setKm}
/>

<TextInput
style={styles.input}
placeholder="Tipo"
placeholderTextColor="#777"
value={tipo}
onChangeText={setTipo}
/>

<TextInput
style={styles.input}
placeholder="ID Traccar"
placeholderTextColor="#777"
keyboardType="numeric"
value={traccarId}
onChangeText={setTraccarId}
/>

<TextInput
style={styles.obs}
placeholder="Observações"
placeholderTextColor="#777"
multiline
value={obs}
onChangeText={setObs}
/>

<TouchableOpacity
style={styles.botao}
onPress={salvar}
disabled={loading}
>

<Text style={styles.botaoTexto}>

{loading
? 'Salvando...'
: 'Salvar Veículo'}

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
maxWidth:500,
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
fontSize:32,
fontWeight:'bold',
marginTop:50,
color:'#111'
},

subtitulo:{
fontSize:16,
color:'#666',
marginTop:8,
marginBottom:25
},

input:{
backgroundColor:'#fff',
height:60,
borderRadius:15,
paddingHorizontal:18,
marginBottom:15,
fontSize:16,
color:'#111'
},

obs:{
backgroundColor:'#fff',
height:120,
borderRadius:15,
paddingHorizontal:18,
paddingTop:15,
marginBottom:20,
fontSize:16,
color:'#111',
textAlignVertical:'top'
},

botao:{
backgroundColor:'#2CC36B',
height:60,
borderRadius:15,
justifyContent:'center',
alignItems:'center',
marginBottom:50
},

botaoTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:20
}

});