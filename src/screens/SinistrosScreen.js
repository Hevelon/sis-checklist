import React,{
useState,
useEffect
} from 'react';

import {
View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
TextInput,
ActivityIndicator
} from 'react-native';

import {
collection,
getDocs,
query,
orderBy
} from 'firebase/firestore';

import {
db
} from '../services/firebase';

export default function SinistrosScreen({

navigation

}){


// ==========================================
// STATES
// ==========================================

const[
sinistros,
setSinistros
]=useState([]);

const[
loading,
setLoading
]=useState(true);

const[
busca,
setBusca
]=useState('');


// ==========================================
// BUSCAR SINISTROS
// ==========================================

async function buscarSinistros(){

try{

setLoading(true);

const q=query(

collection(
db,
'sinistros'
),

orderBy(
'createdAt',
'desc'
)

);

const querySnapshot=
await getDocs(q);

const lista=[];

querySnapshot.forEach((doc)=>{

lista.push({

id:doc.id,
...doc.data()

});

});

setSinistros(lista);

}catch(e){

console.log(e);

}finally{

setLoading(false);

}

}


// ==========================================
// LOAD
// ==========================================

useEffect(()=>{

buscarSinistros();

},[]);


// ==========================================
// FILTRO
// ==========================================

const listaFiltrada=

sinistros.filter((item)=>{

const texto=
busca.toLowerCase();

return(

item.placa
?.toLowerCase()
.includes(texto)

||

item.motorista
?.toLowerCase()
.includes(texto)

);

});


// ==========================================
// STATUS COLOR
// ==========================================

function corStatus(status){

if(status==='aberto'){

return '#E53935';

}

if(status==='analise'){

return '#F2C94C';

}

if(status==='finalizado'){

return '#2CC36B';

}

return '#999';

}


// ==========================================
// SEVERIDADE COLOR
// ==========================================

function corSeveridade(severidade){

if(severidade==='leve'){

return '#F2C94C';

}

if(severidade==='moderado'){

return '#F2994A';

}

if(severidade==='grave'){

return '#E53935';

}

return '#999';

}


// ==========================================
// LOADING
// ==========================================

if(loading){

return(

<View style={styles.loading}>

<ActivityIndicator
size="large"
color="#E53935"
/>

</View>

)

}


// ==========================================
// RENDER
// ==========================================

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
🚨 Sinistros
</Text>

<Text style={styles.sub}>
Ocorrências registradas
</Text>


{/* ========================================== */}
{/* BUSCA */}
{/* ========================================== */}

<TextInput

style={styles.inputBusca}

placeholder="Buscar placa ou motorista"

placeholderTextColor="#777"

value={busca}

onChangeText={setBusca}

/>


{/* ========================================== */}
{/* LISTA */}
{/* ========================================== */}

{listaFiltrada.map((item)=>(

<TouchableOpacity

key={item.id}

style={styles.card}

activeOpacity={0.9}

onPress={()=>

navigation.navigate(

'DetalhesSinistro',

{

sinistro:item

}

)

}

>


{/* ========================================== */}
{/* TOPO */}
{/* ========================================== */}

<View style={styles.topo}>

<Text style={styles.placa}>
🚗 {item.placa}
</Text>


<View
style={[

styles.status,

{
backgroundColor:
corStatus(item.status)
}

]}
>

<Text style={styles.statusTexto}>
{item.status || '-'}
</Text>

</View>

</View>


{/* ========================================== */}
{/* MOTORISTA */}
{/* ========================================== */}

<Text style={styles.info}>
👤 {item.motorista || '-'}
</Text>


{/* ========================================== */}
{/* DATA */}
{/* ========================================== */}

<Text style={styles.info}>
📅 {item.dataOcorrencia || '-'}
</Text>


{/* ========================================== */}
{/* LOCAL */}
{/* ========================================== */}

<Text style={styles.info}>
📍 {item.local || '-'}
</Text>


{/* ========================================== */}
{/* SEVERIDADE */}
{/* ========================================== */}

<View
style={[

styles.severidade,

{
backgroundColor:
corSeveridade(item.severidade)
}

]}
>

<Text style={styles.severidadeTexto}>
{item.severidade || '-'}
</Text>

</View>


{/* ========================================== */}
{/* DETALHES */}
{/* ========================================== */}

<TouchableOpacity
style={styles.botaoDetalhes}
>

<Text style={styles.botaoTexto}>
Ver detalhes
</Text>

</TouchableOpacity>

</TouchableOpacity>

))}


{/* ========================================== */}
{/* VAZIO */}
{/* ========================================== */}

{listaFiltrada.length===0 &&(

<View style={styles.vazio}>

<Text style={styles.vazioTexto}>
Nenhum sinistro encontrado
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
paddingTop:50,
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

titulo:{
fontSize:36,
fontWeight:'bold',
color:'#E53935'
},

sub:{
fontSize:16,
color:'#666',
marginTop:6,
marginBottom:25
},

inputBusca:{
backgroundColor:'#fff',
height:58,
borderRadius:16,
paddingHorizontal:18,
fontSize:16,
marginBottom:22,
color:'#111'
},

card:{
backgroundColor:'#fff',
padding:20,
borderRadius:22,
marginBottom:18
},

topo:{
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center',
marginBottom:15
},

placa:{
fontSize:24,
fontWeight:'bold',
color:'#111'
},

status:{
paddingHorizontal:12,
paddingVertical:6,
borderRadius:10
},

statusTexto:{
color:'#fff',
fontWeight:'bold',
textTransform:'uppercase'
},

info:{
fontSize:16,
color:'#444',
marginBottom:10
},

severidade:{
alignSelf:'flex-start',
paddingHorizontal:15,
paddingVertical:8,
borderRadius:12,
marginTop:5
},

severidadeTexto:{
color:'#fff',
fontWeight:'bold',
textTransform:'uppercase'
},

botaoDetalhes:{
backgroundColor:'#0A1E40',
height:52,
borderRadius:14,
justifyContent:'center',
alignItems:'center',
marginTop:20
},

botaoTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:17
},

vazio:{
backgroundColor:'#fff',
padding:30,
borderRadius:20,
alignItems:'center'
},

vazioTexto:{
fontSize:16,
color:'#777'
}

});