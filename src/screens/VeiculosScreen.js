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
ActivityIndicator,
Alert
} from 'react-native';

import {
useFocusEffect
} from '@react-navigation/native';

import {
collection,
getDocs,
doc,
setDoc
} from 'firebase/firestore';

import {
db
} from '../services/firebase';

import {
AuthContext
} from '../context/AuthContext';

import axios from 'axios';

export default function VeiculosScreen(){

const{
usuario
}=useContext(AuthContext);

const[
veiculos,
setVeiculos
]=useState([]);

const[
loading,
setLoading
]=useState(true);

const[
sincronizando,
setSincronizando
]=useState(false);

async function carregarVeiculos(){

try{

setLoading(true);

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

}finally{

setLoading(false);

}

}

// ✅ CORRIGIDO
// Atualiza automaticamente
// ao voltar para tela

useFocusEffect(

useCallback(()=>{

carregarVeiculos();

},[])

);

async function sincronizarTraccar(){

try{

setSincronizando(true);

const response=
await axios.get(
'https://us-central1-sis-checklist.cloudfunctions.net/getTraccarDevices'
);

const lista=
response.data;

for(const item of lista){

await setDoc(

doc(
db,
'veiculos',
String(item.id)
),

{

traccarId:
item.id,

placa:
item.name || '-',

modelo:
item.model || '-',

categoria:
item.category || '-',

status:
item.status || 'offline',

createdAt:
new Date()

},

{
merge:true
}

);

}

Alert.alert(
'Sucesso',
'Veículos sincronizados'
);

// ✅ Atualiza lista automaticamente

carregarVeiculos();

}catch(e){

console.log(e);

Alert.alert(
'Erro',
'Erro ao sincronizar veículos'
);

}finally{

setSincronizando(false);

}

}

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

if(loading){

return(

<View style={styles.loading}>

<ActivityIndicator
size="large"
color="#2CC36B"
/>

</View>

)

}

return(

<ScrollView
style={styles.container}
showsVerticalScrollIndicator={false}
contentContainerStyle={{
paddingBottom:120
}}
>

<View style={styles.content}>

<Text style={styles.titulo}>
Veículos
</Text>

<Text style={styles.sub}>
Frota cadastrada no sistema
</Text>

<TouchableOpacity
style={styles.botaoSync}
onPress={sincronizarTraccar}
disabled={sincronizando}
>

<Text style={styles.botaoTexto}>

{sincronizando
? 'Sincronizando...'
: 'Sincronizar Traccar'}

</Text>

</TouchableOpacity>

{veiculos.map((item)=>(

<View
key={item.id}
style={styles.card}
>

<View style={styles.topo}>

<Text style={styles.nome}>
🚗 {item.placa}
</Text>

<View
style={[

styles.status,

{
backgroundColor:
item.status === 'online'
? '#2CC36B'
: '#E53935'
}

]}
>

<Text style={styles.statusTexto}>

{item.status || 'offline'}

</Text>

</View>

</View>

<Text style={styles.info}>
Modelo:
{' '}
{item.modelo || '-'}
</Text>

<Text style={styles.info}>
Categoria:
{' '}
{item.categoria || '-'}
</Text>

<Text style={styles.info}>
ID Traccar:
{' '}
{item.traccarId || '-'}
</Text>

</View>

))}

{veiculos.length===0 &&(

<View style={styles.vazio}>

<Text style={styles.vazioTexto}>
Nenhum veículo encontrado
</Text>

</View>

)}

</View>

</ScrollView>

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
maxWidth:700,
alignSelf:'center'
},

loading:{
flex:1,
justifyContent:'center',
alignItems:'center',
backgroundColor:'#F3F5F8'
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
fontSize:38,
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

botaoSync:{
backgroundColor:'#0A1E40',
height:58,
borderRadius:16,
justifyContent:'center',
alignItems:'center',
marginBottom:25
},

botaoTexto:{
color:'#FFF',
fontSize:18,
fontWeight:'bold'
},

card:{
backgroundColor:'#FFF',
padding:20,
borderRadius:20,
marginBottom:18
},

topo:{
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center',
marginBottom:12
},

nome:{
fontSize:22,
fontWeight:'bold',
color:'#111',
flex:1
},

status:{
paddingHorizontal:12,
paddingVertical:5,
borderRadius:10
},

statusTexto:{
color:'#FFF',
fontWeight:'bold',
fontSize:12,
textTransform:'uppercase'
},

info:{
fontSize:15,
color:'#444',
marginTop:6
},

vazio:{
backgroundColor:'#FFF',
padding:30,
borderRadius:20,
alignItems:'center'
},

vazioTexto:{
fontSize:16,
color:'#777'
}

});