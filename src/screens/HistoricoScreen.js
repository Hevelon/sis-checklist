import React,{
useState,
useContext,
useCallback
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
Keyboard
} from 'react-native';

import {
useFocusEffect
} from '@react-navigation/native';

import {
collection,
getDocs,
query,
orderBy
} from 'firebase/firestore';

import {
db
} from '../services/firebase';

import {
AuthContext
} from '../context/AuthContext';

export default function HistoricoScreen({

navigation

}){

const{
usuario
}=useContext(AuthContext);

const[
checklists,
setChecklists
]=useState([]);

const[
placaFiltro,
setPlacaFiltro
]=useState('');

const[
dataFiltro,
setDataFiltro
]=useState('');

// ✅ CORRIGIDO
// Atualiza automaticamente
// ao voltar para tela

useFocusEffect(

useCallback(()=>{

buscarChecklists();

},[])

);

async function buscarChecklists(){

try{

const q=query(

collection(
db,
'checklists'
),

orderBy(
'data',
'desc'
)

);

const querySnapshot=
await getDocs(q);

const lista=[];

querySnapshot.forEach((doc)=>{

const dados=doc.data();

lista.push({

id:doc.id,
...dados

});

});

let filtrados=lista;

if(
usuario?.nivel !== 'admin' &&
usuario?.nivel !== 'supervisor'
){

filtrados=

lista.filter((item)=>

item.usuario?.uid === usuario?.uid

);

}

setChecklists(filtrados);

}catch(e){

console.log(e);

}

}

const listaFiltrada=

checklists.filter((item)=>{

const placa=

item.veiculo?.placa
?.toLowerCase() || '';

const modelo=

item.veiculo?.modelo
?.toLowerCase() || '';

const data=

item.data?.toDate()
.toLocaleDateString('pt-BR')
.toLowerCase();

const buscaPlaca=
placaFiltro.toLowerCase();

const buscaData=
dataFiltro.toLowerCase();

return(

placa.includes(buscaPlaca) ||

modelo.includes(buscaPlaca)

) &&

data.includes(buscaData);

});

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
Histórico
</Text>

<TextInput

style={styles.input}

placeholder="Filtrar placa ou modelo"

placeholderTextColor="#777"

value={placaFiltro}

onChangeText={setPlacaFiltro}

/>

<TextInput

style={styles.input}

placeholder="Filtrar data"

placeholderTextColor="#777"

value={dataFiltro}

onChangeText={setDataFiltro}

/>

{listaFiltrada.map((item)=>(

<View
key={item.id}
style={styles.card}
>

<Text style={styles.placa}>
🚗 {item.veiculo?.placa || '-'}
</Text>

<Text style={styles.modelo}>
{item.veiculo?.marca || ''}
{' '}
{item.veiculo?.modelo || ''}
</Text>

<View style={styles.infoBox}>

{/* ✅ CORRIGIDO */}
{/* Compatível com objeto e string */}

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
📅 {

item.data?.toDate()
.toLocaleString('pt-BR')

}
</Text>

<Text style={styles.info}>
⚠ Problemas: {

Object.values(
item.respostas || {}
).filter(

(v)=>
v === 'ruim'

).length

}
</Text>

</View>

<TouchableOpacity

style={styles.botao}

onPress={()=>

navigation.navigate(

'DetalhesChecklist',

{

checklist:item

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

{listaFiltrada.length === 0 &&(

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

)

}

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:'#F3F5F8'
},

content:{
padding:20,
paddingTop:50,
paddingBottom:100,
width:'100%',
maxWidth:600,
alignSelf:'center'
},

titulo:{
fontSize:34,
fontWeight:'bold',
marginBottom:30,
color:'#111'
},

input:{
backgroundColor:'#fff',
height:58,
borderRadius:16,
paddingHorizontal:18,
fontSize:17,
marginBottom:18,
color:'#111'
},

card:{
backgroundColor:'#fff',
padding:22,
borderRadius:22,
marginBottom:18
},

placa:{
fontSize:28,
fontWeight:'bold',
color:'#111'
},

modelo:{
fontSize:18,
color:'#666',
marginTop:5,
marginBottom:18
},

infoBox:{
marginBottom:22
},

info:{
fontSize:18,
color:'#444',
marginBottom:8
},

botao:{
backgroundColor:'#0A1E40',
height:58,
borderRadius:15,
justifyContent:'center',
alignItems:'center'
},

botaoTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:20
},

vazio:{
padding:40,
alignItems:'center'
},

vazioTexto:{
fontSize:18,
color:'#777'
}

});