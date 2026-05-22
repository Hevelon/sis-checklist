import React,{
useContext,
useState,
useCallback
} from 'react';

import {
View,
Text,
StyleSheet,
TextInput,
TouchableOpacity,
ScrollView,
Image,
Alert,
KeyboardAvoidingView,
Platform,
TouchableWithoutFeedback,
Keyboard
} from 'react-native';

import * as ImagePicker
from 'expo-image-picker';

import {
useFocusEffect
} from '@react-navigation/native';

import {
collection,
addDoc,
getDocs
} from 'firebase/firestore';

import {
db
} from '../services/firebase';

import {
AuthContext
} from '../context/AuthContext';

export default function ChecklistScreen(){

const{
usuario
}=useContext(AuthContext);

if(!usuario){

return null;

}

const itens=[

'Nível óleo motor',
'Água',
'Faróis',
'Lanternas',
'Pneus',
'Retrovisores',
'Freios',
'Documentação'

];

const[
veiculos,
setVeiculos
]=useState([]);

const[
buscaVeiculo,
setBuscaVeiculo
]=useState('');

const[
veiculoSelecionado,
setVeiculoSelecionado
]=useState(null);

const[
mostrarSugestoes,
setMostrarSugestoes
]=useState(false);

const[
respostas,
setRespostas
]=useState({});

const[
fotos,
setFotos
]=useState({});

const[
problemas,
setProblemas
]=useState({});

// ✅ CORRIGIDO
// Atualiza automaticamente ao voltar para tela

useFocusEffect(

useCallback(()=>{

buscarVeiculos();

},[])

);

async function buscarVeiculos(){

try{

const querySnapshot=
await getDocs(
collection(
db,
'veiculos'
)
);

const lista=[];

querySnapshot.forEach((doc)=>{

lista.push({

id:doc.id,
...doc.data()

});

});

setVeiculos(lista);

}catch(e){

console.log(e);

}

}

const veiculosFiltrados=

veiculos.filter((v)=>{

const texto=
`${v.placa} ${v.modelo} ${v.marca}`
.toLowerCase();

return texto.includes(
buscaVeiculo.toLowerCase()
);

});

async function selecionar(
item,
status
){

setRespostas({

...respostas,
[item]:status

});

if(status==='ruim'){

abrirCamera(item);

}

}

async function abrirCamera(item){

const permissao=

await ImagePicker
.requestCameraPermissionsAsync();

if(!permissao.granted){

Alert.alert(
'Atenção',
'Permita acesso à câmera'
);

return;

}

const resultado=

await ImagePicker
.launchCameraAsync({

quality:0.7

});

if(!resultado.canceled){

setFotos({

...fotos,

[item]:
resultado.assets[0].uri

});

}

}

async function finalizar(){

if(!veiculoSelecionado){

Alert.alert(
'Atenção',
'Selecione veículo'
);

return;

}

try{

await addDoc(
collection(
db,
'checklists'
),
{

usuario:{

uid:usuario.uid,
nome:usuario.nome,
email:usuario.email,
cargo:usuario.cargo,
nivel:usuario.nivel

},

veiculo:{

placa:
veiculoSelecionado.placa,

marca:
veiculoSelecionado.marca,

modelo:
veiculoSelecionado.modelo,

tipo:
veiculoSelecionado.tipo

},

respostas,

problemas,

fotos,

data:new Date()

}
);

Alert.alert(
'Sucesso',
'Checklist salvo'
);

setBuscaVeiculo('');
setVeiculoSelecionado(null);
setMostrarSugestoes(false);
setRespostas({});
setProblemas({});
setFotos({});

}catch(e){

console.log(e);

Alert.alert(
'Erro',
'Não foi possível salvar'
);

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
Novo Checklist
</Text>

<View style={styles.usuarioBox}>

<Text style={styles.usuarioNome}>
👤 {usuario?.nome}
</Text>

<Text style={styles.usuarioCargo}>
{usuario?.cargo}
</Text>

</View>

<Text style={styles.label}>
Veículo
</Text>

<TextInput
style={styles.busca}
placeholder="Digite placa ou modelo..."
placeholderTextColor="#777"
value={buscaVeiculo}
onChangeText={(texto)=>{

setBuscaVeiculo(texto);

setMostrarSugestoes(true);

}}
onFocus={()=>
setMostrarSugestoes(true)
}
/>

{mostrarSugestoes &&
buscaVeiculo !== '' && (

<View style={styles.box}>

{veiculosFiltrados.map((v)=>(

<TouchableOpacity
key={v.id}

style={styles.card}

onPress={()=>{

setVeiculoSelecionado(v);

setBuscaVeiculo(v.placa);

setMostrarSugestoes(false);

}}

>

<Text style={styles.cardNome}>
🚗 {v.placa}
</Text>

<Text style={styles.cardSub}>
{v.marca} - {v.modelo}
</Text>

</TouchableOpacity>

))}

</View>

)}

{veiculoSelecionado && (

<View style={styles.selecionadoBox}>

<Text style={styles.selecionadoNome}>
🚗 {veiculoSelecionado.placa}
</Text>

<Text style={styles.selecionadoSub}>
{veiculoSelecionado.marca} - {veiculoSelecionado.modelo}
</Text>

</View>

)}

<Text style={styles.sub}>
Inspeção Básica
</Text>

{itens.map((item,index)=>(

<View
key={index}
style={styles.item}
>

<Text style={styles.nome}>
{item}
</Text>

<View style={styles.acoes}>

<TouchableOpacity

style={[

styles.ok,

respostas[item]==='ok' &&
styles.selecionado

]}

onPress={()=>
selecionar(item,'ok')
}

>

<Text style={styles.icone}>
✔
</Text>

</TouchableOpacity>

<TouchableOpacity

style={[

styles.alerta,

respostas[item]==='alerta' &&
styles.selecionado

]}

onPress={()=>
selecionar(item,'alerta')
}

>

<Text style={styles.icone}>
⚠
</Text>

</TouchableOpacity>

<TouchableOpacity

style={[

styles.ruim,

respostas[item]==='ruim' &&
styles.selecionado

]}

onPress={()=>
selecionar(item,'ruim')
}

>

<Text style={styles.icone}>
✖
</Text>

</TouchableOpacity>

</View>

{fotos[item] &&(

<Image
source={{
uri:fotos[item]
}}
style={styles.preview}
/>

)}

{respostas[item]==='ruim' &&(

<TextInput

style={styles.problema}

placeholder="Descreva o defeito..."

placeholderTextColor="#777"

multiline

onChangeText={(texto)=>

setProblemas({

...problemas,

[item]:texto

})

}

/>

)}

</View>

))}

<TouchableOpacity
style={styles.botao}
onPress={finalizar}
>

<Text style={styles.botaoTexto}>
Finalizar Checklist
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

titulo:{
fontSize:34,
fontWeight:'bold',
marginTop:50,
marginBottom:25,
color:'#111'
},

usuarioBox:{
backgroundColor:'#fff',
padding:20,
borderRadius:18,
marginBottom:25
},

usuarioNome:{
fontSize:22,
fontWeight:'bold',
color:'#111'
},

usuarioCargo:{
fontSize:16,
color:'#666',
marginTop:6
},

label:{
fontSize:22,
fontWeight:'bold',
marginBottom:15,
color:'#111'
},

busca:{
backgroundColor:'#fff',
height:58,
borderRadius:14,
paddingHorizontal:18,
fontSize:17,
marginBottom:15,
color:'#111'
},

box:{
marginBottom:20
},

card:{
backgroundColor:'#fff',
padding:18,
borderRadius:18,
marginBottom:10
},

cardNome:{
fontSize:18,
fontWeight:'bold',
color:'#111'
},

cardSub:{
fontSize:15,
color:'#666',
marginTop:5
},

selecionadoBox:{
backgroundColor:'#EFFFF4',
padding:18,
borderRadius:18,
marginBottom:25,
borderWidth:2,
borderColor:'#2CC36B'
},

selecionadoNome:{
fontSize:20,
fontWeight:'bold',
color:'#111'
},

selecionadoSub:{
fontSize:15,
color:'#666',
marginTop:5
},

sub:{
fontSize:24,
fontWeight:'bold',
marginBottom:20,
color:'#111'
},

item:{
backgroundColor:'#fff',
padding:15,
borderRadius:18,
marginBottom:15
},

nome:{
fontWeight:'bold',
fontSize:20,
marginBottom:15,
color:'#111'
},

acoes:{
flexDirection:'row',
justifyContent:'space-between'
},

ok:{
backgroundColor:'#66D37E',
padding:16,
width:70,
borderRadius:12,
alignItems:'center'
},

alerta:{
backgroundColor:'#F2D046',
padding:16,
width:70,
borderRadius:12,
alignItems:'center'
},

ruim:{
backgroundColor:'#FF7A7A',
padding:16,
width:70,
borderRadius:12,
alignItems:'center'
},

icone:{
fontSize:28
},

selecionado:{
borderWidth:3,
borderColor:'#0A1E40'
},

preview:{
width:'100%',
height:220,
marginTop:15,
borderRadius:15
},

problema:{
backgroundColor:'#F5F5F5',
height:100,
padding:12,
marginTop:12,
borderRadius:12,
textAlignVertical:'top',
color:'#111'
},

botao:{
backgroundColor:'#2CC36B',
height:60,
borderRadius:15,
justifyContent:'center',
alignItems:'center',
marginTop:20,
marginBottom:60
},

botaoTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:20
}

});