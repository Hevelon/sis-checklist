import React,{
useState
} from 'react';

import {
View,
Text,
StyleSheet,
FlatList,
ActivityIndicator,
RefreshControl
} from 'react-native';

import {
useFocusEffect // ✅ ADICIONADO
} from '@react-navigation/native';

import axios from 'axios';

export default function FrotaScreen(){

const[
veiculos,
setVeiculos
]=useState([]);

const[
loading,
setLoading
]=useState(true);

const[
refreshing,
setRefreshing
]=useState(false);

async function carregarVeiculos(){

try{

setLoading(true); // ✅ ADICIONADO

const response=
await axios.get(
'https://us-central1-sis-checklist.cloudfunctions.net/getTraccarDevices'
);

setVeiculos(
response.data
);

}catch(e){

console.log(e);

}finally{

setLoading(false);
setRefreshing(false);

}

}

// ✅ ADICIONADO
// Atualiza automaticamente
// ao voltar para tela

useFocusEffect(

React.useCallback(()=>{

carregarVeiculos();

},[])

);

// ❌ REMOVIDO
// useEffect(()=>{ carregarVeiculos() },[])

function atualizar(){

setRefreshing(true);

carregarVeiculos();

}

function statusColor(status){

return status === 'online'
? '#2CC36B'
: '#E53935';

}

function ignicao(item){

return item.position
?.attributes
?.ignition;

}

function velocidade(item){

if(!item.position?.speed){

return '0 km/h';

}

return `${Math.round(
item.position.speed * 1.852
)} km/h`;

}

if(loading){

return(

<View style={styles.loading}>

<ActivityIndicator
size="large"
color="#0A1E40"
/>

</View>

)

}

return(

<View style={styles.container}>

<Text style={styles.titulo}>
Frota
</Text>

<FlatList

data={veiculos}

keyExtractor={(item)=>
item.id.toString()
}

refreshControl={

<RefreshControl
refreshing={refreshing}
onRefresh={atualizar}
/>

}

showsVerticalScrollIndicator={false}

contentContainerStyle={{
paddingBottom:120
}}

renderItem={({item})=>(

<View style={styles.card}>

<View style={styles.topo}>

<Text style={styles.nome}>
🚗 {item.name}
</Text>

<View
style={[

styles.badge,

{
backgroundColor:
statusColor(
item.status
)
}

]}
>

<Text style={styles.badgeText}>

{item.status === 'online'
? 'ONLINE'
: 'OFFLINE'}

</Text>

</View>

</View>

<Text style={styles.info}>
Modelo:
{' '}
{item.model || '-'}
</Text>

<Text style={styles.info}>
Ignição:
{' '}

<Text
style={{
color:
ignicao(item)
? '#2CC36B'
: '#E53935',
fontWeight:'bold'
}}
>

{ignicao(item)
? 'Ligada'
: 'Desligada'}

</Text>

</Text>

<Text style={styles.info}>
Velocidade:
{' '}
{velocidade(item)}
</Text>

{/* ✅ ADICIONADO */}
{/* GPS REAL */}

<Text style={styles.info}>
GPS:
{' '}
{
item.position
? `${item.position.latitude},
${item.position.longitude}`
: 'Sem GPS'
}
</Text>

{/* ✅ ADICIONADO */}
{/* ENDEREÇO REAL */}

<Text style={styles.info}>
Rua:
{' '}
{
item.position?.address ||
'Localização indisponível'
}
</Text>

<Text style={styles.info}>
Última atualização:
{' '}

{

item.position?.deviceTime

? new Date(
item.position.deviceTime
).toLocaleString('pt-BR')

: '-'

}

</Text>

</View>

)}

ListEmptyComponent={()=>(

<View style={styles.vazio}>

<Text style={styles.vazioTexto}>
Nenhum veículo encontrado
</Text>

</View>

)}

 />

</View>

)

}

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:'#ECEFF1',
paddingTop:60
},

loading:{
flex:1,
justifyContent:'center',
alignItems:'center',
backgroundColor:'#ECEFF1'
},

titulo:{
fontSize:42,
fontWeight:'bold',
marginBottom:20,
paddingHorizontal:20,
color:'#111'
},

card:{
backgroundColor:'#FFF',
marginHorizontal:20,
marginBottom:15,
borderRadius:20,
padding:18
},

topo:{
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center',
marginBottom:10
},

nome:{
fontSize:22,
fontWeight:'bold',
color:'#111',
flex:1,
marginRight:10
},

badge:{
paddingHorizontal:12,
paddingVertical:5,
borderRadius:10
},

badgeText:{
color:'#FFF',
fontWeight:'bold',
fontSize:12
},

info:{
fontSize:16,
color:'#555',
marginTop:5
},

vazio:{
alignItems:'center',
marginTop:50
},

vazioTexto:{
fontSize:18,
color:'#777'
}

});