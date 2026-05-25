import React,{
useState,
useEffect,
useContext
} from 'react';

import {
View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
TextInput,
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
db
} from '../services/firebase';

import {
AuthContext
} from '../context/AuthContext';

export default function SinistrosScreen({

navigation

}){

const{
usuario
}=useContext(AuthContext);


// ==========================================
// EMPRESA
// ==========================================

const empresaId =
usuario?.empresaId || 'default';


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
refreshing,
setRefreshing
]=useState(false);

const[
busca,
setBusca
]=useState('');

const[
filtroStatus,
setFiltroStatus
]=useState('todos');

const[
filtroSeveridade,
setFiltroSeveridade
]=useState('todas');

const[
dataInicial,
setDataInicial
]=useState('');

const[
dataFinal,
setDataFinal
]=useState('');


// ==========================================
// FORMATA PLACA
// ==========================================

function formatarPlaca(placa=''){

const limpa =
placa
.replace(/[^a-zA-Z0-9]/g,'')
.toUpperCase();

if(limpa.length <= 3){
return limpa;
}

return `${limpa.slice(0,3)}-${limpa.slice(3,7)}`;

}


// ==========================================
// FORMATA DATA
// ==========================================

function formatarDataInput(valor=''){

const numeros =
valor.replace(/\D/g,'');

if(numeros.length <= 2){
return numeros;
}

if(numeros.length <= 4){
return `${numeros.slice(0,2)}/${numeros.slice(2)}`;
}

return `${numeros.slice(0,2)}/${numeros.slice(2,4)}/${numeros.slice(4,8)}`;

}


// ==========================================
// BUSCAR SINISTROS
// ==========================================

async function buscarSinistros(){

try{

setLoading(true);


// ==========================================
// QUERY MULTIEMPRESA
// ==========================================

const q=query(

collection(
db,
'sinistros'
),

where(
'empresaId',
'==',
empresaId
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
setRefreshing(false);

}

}


// ==========================================
// LOAD
// ==========================================

useEffect(()=>{

if(usuario){

buscarSinistros();

}

},[usuario]);


// ==========================================
// REFRESH
// ==========================================

function atualizar(){

setRefreshing(true);

buscarSinistros();

}


// ==========================================
// FILTROS
// ==========================================

const listaFiltrada =

sinistros.filter((item)=>{

const texto =
busca.toLowerCase();

const placaNormalizada =
String(item.placa || '')
.replace('-','')
.toLowerCase();

const buscaNormalizada =
texto.replace('-','');

const matchBusca =

placaNormalizada.includes(
buscaNormalizada
)

||

item.motorista
?.toLowerCase()
.includes(texto);

const matchStatus =

filtroStatus === 'todos'

? true

: item.status === filtroStatus;

const matchSeveridade =

filtroSeveridade === 'todas'

? true

: item.severidade === filtroSeveridade;


const matchData = (()=>{

if(
!dataInicial &&
!dataFinal
){
return true;
}

const dataItem =
item.dataOcorrencia || '';

if(
dataInicial &&
dataItem < dataInicial
){
return false;
}

if(
dataFinal &&
dataItem > dataFinal
){
return false;
}

return true;

})();

return(

matchBusca &&
matchStatus &&
matchSeveridade &&
matchData

);

});


// ==========================================
// TOTALIZADORES
// ==========================================

const totalAbertos =
sinistros.filter(
i=>i.status==='aberto'
).length;

const totalAnalise =
sinistros.filter(
i=>i.status==='analise'
).length;

const totalFinalizados =
sinistros.filter(
i=>i.status==='finalizado'
).length;


// ==========================================
// CORES
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

if(!usuario){

return(

<View style={styles.loading}>

<ActivityIndicator
size="large"
color="#E53935"
/>

<Text style={styles.loadingTexto}>
Carregando...
</Text>

</View>

)

}


if(loading){

return(

<View style={styles.loading}>

<ActivityIndicator
size="large"
color="#E53935"
/>

<Text style={styles.loadingTexto}>
Carregando sinistros...
</Text>

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

refreshControl={

<RefreshControl

refreshing={refreshing}

onRefresh={atualizar}

/>

}

>

<View style={styles.content}>


<Text style={styles.titulo}>
🚨 Ocorrências
</Text>

<Text style={styles.sub}>
Gestão de sinistros da frota
</Text>


{/* ========================================== */}
{/* TOTALIZADORES */}
{/* ========================================== */}

<View style={styles.cardsRow}>


<View style={[styles.cardInfo,{
backgroundColor:'#E53935'
}]}>
<Text style={styles.cardNumero}>
{totalAbertos}
</Text>
<Text style={styles.cardTexto}>
Abertos
</Text>
</View>


<View style={[styles.cardInfo,{
backgroundColor:'#F2C94C'
}]}>
<Text style={styles.cardNumero}>
{totalAnalise}
</Text>
<Text style={styles.cardTextoDark}>
Análise
</Text>
</View>


<View style={[styles.cardInfo,{
backgroundColor:'#2CC36B'
}]}>
<Text style={styles.cardNumero}>
{totalFinalizados}
</Text>
<Text style={styles.cardTexto}>
Finalizados
</Text>
</View>

</View>


{/* ========================================== */}
{/* BUSCA */}
{/* ========================================== */}

<TextInput

style={styles.inputBusca}

placeholder="Buscar placa ou motorista"

placeholderTextColor="#777"

value={busca}

onChangeText={(texto)=>{

const limpa =
texto
.replace(/[^a-zA-Z0-9]/g,'')
.toUpperCase();

if(limpa.length <= 3){

setBusca(limpa);

}else{

setBusca(
`${limpa.slice(0,3)}-${limpa.slice(3,7)}`
);

}

}}

/>


{/* ========================================== */}
{/* DATAS */}
{/* ========================================== */}

<View style={styles.datasRow}>

<TextInput

style={styles.inputData}

placeholder="Data inicial"

placeholderTextColor="#777"

keyboardType="numeric"

value={dataInicial}

onChangeText={(texto)=>{

setDataInicial(
formatarDataInput(texto)
);

}}

/>


<TextInput

style={styles.inputData}

placeholder="Data final"

placeholderTextColor="#777"

keyboardType="numeric"

value={dataFinal}

onChangeText={(texto)=>{

setDataFinal(
formatarDataInput(texto)
);

}}

/>

</View>


{/* ========================================== */}
{/* STATUS */}
{/* ========================================== */}

<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
style={styles.filtrosRow}
>

{[
'todos',
'aberto',
'analise',
'finalizado'
].map((item)=>(

<TouchableOpacity

key={item}

style={[

styles.filtroBtn,

filtroStatus===item &&
styles.filtroAtivo

]}

onPress={()=>
setFiltroStatus(item)
}

>

<Text style={[

styles.filtroTexto,

filtroStatus===item &&
styles.filtroTextoAtivo

]}>

{item}

</Text>

</TouchableOpacity>

))}

</ScrollView>


{/* ========================================== */}
{/* SEVERIDADE */}
{/* ========================================== */}

<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
style={styles.filtrosRow}
>

{[
'todas',
'leve',
'moderado',
'grave'
].map((item)=>(

<TouchableOpacity

key={item}

style={[

styles.filtroBtn,

filtroSeveridade===item &&
styles.filtroAtivo

]}

onPress={()=>
setFiltroSeveridade(item)
}

>

<Text style={[

styles.filtroTexto,

filtroSeveridade===item &&
styles.filtroTextoAtivo

]}>

{item}

</Text>

</TouchableOpacity>

))}

</ScrollView>


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


<View style={styles.topo}>

<Text style={styles.placa}>
🚘 {formatarPlaca(item.placa)}
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


<Text style={styles.info}>
👤 {item.motorista || '-'}
</Text>

<Text style={styles.info}>
📅 {item.dataOcorrencia || '-'}
</Text>

<Text style={styles.info}>
📍 {item.local || '-'}
</Text>


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

<Text style={styles.vazioEmoji}>
🚨
</Text>

<Text style={styles.vazioTitulo}>
Nenhuma ocorrência encontrada
</Text>

<Text style={styles.vazioTexto}>
Tente alterar os filtros ou registrar um novo sinistro.
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

loadingTexto:{
marginTop:15,
fontSize:16,
color:'#555'
},

titulo:{
fontSize:28,
fontWeight:'bold',
color:'#E53935'
},

sub:{
fontSize:16,
color:'#666',
marginTop:6,
marginBottom:18
},

cardsRow:{
flexDirection:'row',
justifyContent:'space-between',
marginBottom:20,
gap:10
},

cardInfo:{
flex:1,
paddingVertical:14,
paddingHorizontal:10,
borderRadius:22,
alignItems:'center'
},

cardNumero:{
fontSize:28,
fontWeight:'bold',
color:'#fff'
},

cardTexto:{
color:'#fff',
fontWeight:'bold',
marginTop:5,
fontSize:13
},

cardTextoDark:{
color:'#333',
fontWeight:'bold',
marginTop:5,
fontSize:13
},

inputBusca:{
backgroundColor:'#fff',
height:58,
borderRadius:18,
paddingHorizontal:18,
fontSize:16,
marginBottom:15,
color:'#111'
},

datasRow:{
flexDirection:'row',
gap:10,
marginBottom:15
},

inputData:{
flex:1,
backgroundColor:'#fff',
height:58,
borderRadius:18,
paddingHorizontal:18,
fontSize:16,
color:'#111'
},

filtrosRow:{
marginBottom:14
},

filtroBtn:{
backgroundColor:'#fff',
paddingHorizontal:18,
paddingVertical:12,
borderRadius:16,
marginRight:10
},

filtroAtivo:{
backgroundColor:'#021B49'
},

filtroTexto:{
fontWeight:'bold',
color:'#555',
textTransform:'capitalize',
fontSize:15
},

filtroTextoAtivo:{
color:'#fff'
},

card:{
backgroundColor:'#fff',
padding:22,
borderRadius:28,
marginBottom:18,

shadowColor:'#000',

shadowOffset:{
width:0,
height:4
},

shadowOpacity:0.08,

shadowRadius:8,

elevation:3

},

topo:{
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center',
marginBottom:18
},

placa:{
fontSize:24,
fontWeight:'bold',
color:'#111'
},

status:{
paddingHorizontal:16,
paddingVertical:8,
borderRadius:12
},

statusTexto:{
color:'#fff',
fontWeight:'bold',
textTransform:'uppercase',
fontSize:13
},

info:{
fontSize:17,
color:'#444',
marginBottom:10
},

severidade:{
alignSelf:'flex-start',
paddingHorizontal:16,
paddingVertical:10,
borderRadius:14,
marginTop:8
},

severidadeTexto:{
color:'#fff',
fontWeight:'bold',
textTransform:'uppercase',
fontSize:13
},

botaoDetalhes:{
backgroundColor:'#021B49',
height:58,
borderRadius:18,
justifyContent:'center',
alignItems:'center',
marginTop:22
},

botaoTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:18
},

vazio:{
backgroundColor:'#fff',
padding:40,
borderRadius:28,
alignItems:'center',
marginTop:20
},

vazioEmoji:{
fontSize:52,
marginBottom:10
},

vazioTitulo:{
fontSize:22,
fontWeight:'bold',
color:'#111',
marginBottom:10
},

vazioTexto:{
fontSize:15,
color:'#777',
textAlign:'center',
lineHeight:22
}

});