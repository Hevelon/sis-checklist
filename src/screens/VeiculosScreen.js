import React,{
useState,
useContext,
useEffect
} from 'react';

import {
View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
ActivityIndicator,
Alert,
Modal,
TextInput,
RefreshControl
} from 'react-native';

import {
collection,
getDocs,
doc,
setDoc,
updateDoc,
query,
where,
serverTimestamp
} from 'firebase/firestore';

import {
db
} from '../services/firebase';

import {
AuthContext
} from '../context/AuthContext';

import {
buscarVeiculosTraccar
} from '../services/functions';

export default function VeiculosScreen({

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
veiculos,
setVeiculos
]=useState([]);

const[
veiculosFiltrados,
setVeiculosFiltrados
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
sincronizando,
setSincronizando
]=useState(false);

const[
editando,
setEditando
]=useState(null);

const[
categoria,
setCategoria
]=useState('');

const[
tipoOperacional,
setTipoOperacional
]=useState('');

const[
busca,
setBusca
]=useState('');

const[
filtroStatus,
setFiltroStatus
]=useState('todos');


// ==========================================
// CARREGAR VEÍCULOS
// ==========================================

async function carregarVeiculos(){

try{

setLoading(true);


// ==========================================
// QUERY MULTIEMPRESA
// ==========================================

const q=query(
collection(
db,
'veiculos'
),
where(
'empresaId',
'==',
empresaId
)
);

const querySnapshot=
await getDocs(q);

const lista=[];

querySnapshot.forEach((docItem)=>{

lista.push({

id:docItem.id,
...docItem.data()

});

});

setVeiculos(lista);

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

carregarVeiculos();

}

},[usuario]);


// ==========================================
// FILTROS
// ==========================================

useEffect(()=>{

let lista=[...veiculos];


// ==========================================
// BUSCA
// ==========================================

if(busca){

const texto =
busca.toLowerCase();

lista = lista.filter((item)=>{

return(

item.placa
?.toLowerCase()
.includes(texto)

||

item.modelo
?.toLowerCase()
.includes(texto)

||

item.categoria
?.toLowerCase()
.includes(texto)

||

item.tipoOperacional
?.toLowerCase()
.includes(texto)

);

});

}


// ==========================================
// STATUS
// ==========================================

if(filtroStatus !== 'todos'){

lista = lista.filter((item)=>

item.status === filtroStatus

);

}

setVeiculosFiltrados(lista);

},[
veiculos,
busca,
filtroStatus
]);


// ==========================================
// REFRESH
// ==========================================

function atualizar(){

setRefreshing(true);

carregarVeiculos();

}


// ==========================================
// SINCRONIZAR TRACCAR
// ==========================================

async function sincronizarTraccar(){

try{

setSincronizando(true);

const response=
await buscarVeiculosTraccar();

const lista=
response.data;

for(const item of lista){

let placa=
(item.name || '-')
.toUpperCase()
.replace(/[^A-Z0-9]/g,'');

if(placa.length > 3){

placa=
placa.slice(0,3)
+
'-'
+
placa.slice(3,7);

}

await setDoc(

doc(
db,
'veiculos',
`${empresaId}_${item.id}`
),

{

empresaId,

traccarId:
item.id,

placa,

modelo:
item.model || '-',

categoria:
item.category || 'car',

tipoOperacional:
null,

status:
item.status || 'offline',

createdAt:
serverTimestamp()

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


// ==========================================
// SALVAR EDIÇÃO
// ==========================================

async function salvarEdicao(){

try{

await updateDoc(

doc(
db,
'veiculos',
editando.id
),

{

empresaId,

categoria,
tipoOperacional:
tipoOperacional || null

}

);

Alert.alert(
'Sucesso',
'Veículo atualizado'
);

setEditando(null);

carregarVeiculos();

}catch(e){

console.log(e);

Alert.alert(
'Erro',
'Erro ao atualizar veículo'
);

}

}


// ==========================================
// PERMISSÃO
// ==========================================

if(!usuario){

return(

<View style={styles.loading}>

<ActivityIndicator
size="large"
color="#2CC36B"
/>

<Text style={styles.loadingTexto}>
Carregando...
</Text>

</View>

);

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


// ==========================================
// TOTALIZADORES
// ==========================================

const totalOnline =
veiculos.filter(
v=>v.status==='online'
).length;

const totalOffline =
veiculos.filter(
v=>v.status!=='online'
).length;

const totalVeiculos =
veiculos.length;


// ==========================================
// LOADING
// ==========================================

if(loading){

return(

<View style={styles.loading}>

<ActivityIndicator
size="large"
color="#2CC36B"
/>

<Text style={styles.loadingTexto}>
Carregando veículos...
</Text>

</View>

)

}


// ==========================================
// RENDER
// ==========================================

return(

<>

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
🚛 Veículos
</Text>

<Text style={styles.sub}>
Gestão inteligente da frota
</Text>


{/* ========================================== */}
{/* TOTALIZADORES */}
{/* ========================================== */}

<View style={styles.cardsRow}>


<View style={[
styles.cardInfo,
{
backgroundColor:'#021B49'
}
]}>
<Text style={styles.cardNumero}>
{totalVeiculos}
</Text>
<Text style={styles.cardTexto}>
Frota
</Text>
</View>


<View style={[
styles.cardInfo,
{
backgroundColor:'#2CC36B'
}
]}>
<Text style={styles.cardNumero}>
{totalOnline}
</Text>
<Text style={styles.cardTexto}>
Online
</Text>
</View>


<View style={[
styles.cardInfo,
{
backgroundColor:'#E53935'
}
]}>
<Text style={styles.cardNumero}>
{totalOffline}
</Text>
<Text style={styles.cardTexto}>
Offline
</Text>
</View>

</View>


{/* ========================================== */}
{/* BOTÃO CADASTRAR */}
{/* ========================================== */}

<TouchableOpacity

style={styles.botaoCadastrar}

onPress={()=>
navigation.navigate(
'CadastrarVeiculo'
)
}

>

<Text style={styles.botaoTexto}>
+ Cadastrar Veículo
</Text>

</TouchableOpacity>


{/* ========================================== */}
{/* BUSCA */}
{/* ========================================== */}

<TextInput

style={styles.inputBusca}

placeholder="Buscar veículo"

placeholderTextColor="#777"

value={busca}

onChangeText={(texto)=>{

let valor=
texto
.toUpperCase()
.replace(/[^A-Z0-9]/g,'');

if(valor.length > 3){

valor=
valor.slice(0,3)
+
'-'
+
valor.slice(3,7);

}

setBusca(valor);

}}

/>


{/* ========================================== */}
{/* FILTROS */}
{/* ========================================== */}

<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
style={styles.filtrosRow}
>

{[
'todos',
'online',
'offline'
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
{/* BOTÃO SYNC */}
{/* ========================================== */}

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


{/* ========================================== */}
{/* LISTA */}
{/* ========================================== */}

{veiculosFiltrados.map((item)=>(

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


{!!item.tipoOperacional &&(

<Text style={styles.info}>
Operação:
{' '}
{item.tipoOperacional}
</Text>

)}


<Text style={styles.info}>
ID Traccar:
{' '}
{item.traccarId || '-'}
</Text>


<TouchableOpacity

style={styles.editarBtn}

onPress={()=>{

setEditando(item);

setCategoria(
item.categoria || ''
);

setTipoOperacional(
item.tipoOperacional || ''
);

}}

>

<Text style={styles.editarTexto}>
Editar
</Text>

</TouchableOpacity>

</View>

))}


{/* ========================================== */}
{/* VAZIO */}
{/* ========================================== */}

{veiculosFiltrados.length===0 &&(

<View style={styles.vazio}>

<Text style={styles.vazioEmoji}>
🚛
</Text>

<Text style={styles.vazioTitulo}>
Nenhum veículo encontrado
</Text>

<Text style={styles.vazioTexto}>
Tente alterar os filtros ou sincronizar com o Traccar.
</Text>

</View>

)}

</View>

</ScrollView>


{/* ========================================== */}
{/* MODAL */}
{/* ========================================== */}

<Modal
visible={!!editando}
transparent
animationType="slide"
>

<View style={styles.modalBg}>

<View style={styles.modal}>

<Text style={styles.modalTitulo}>
Editar Veículo
</Text>


<Text style={styles.label}>
Categoria
</Text>

<TextInput
style={styles.input}
value={categoria}
onChangeText={setCategoria}
placeholder="car/truck/bus"
/>


<Text style={styles.label}>
Tipo Operacional
</Text>

<TextInput
style={styles.input}
value={tipoOperacional}
onChangeText={setTipoOperacional}
placeholder="granel/munck"
/>


<TouchableOpacity
style={styles.salvarBtn}
onPress={salvarEdicao}
>

<Text style={styles.salvarTexto}>
Salvar
</Text>

</TouchableOpacity>


<TouchableOpacity
style={styles.cancelarBtn}
onPress={()=>setEditando(null)}
>

<Text style={styles.cancelarTexto}>
Cancelar
</Text>

</TouchableOpacity>

</View>

</View>

</Modal>

</>

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
fontSize:34,
fontWeight:'bold',
color:'#111'
},

sub:{
fontSize:16,
color:'#666',
marginTop:6,
marginBottom:20
},

cardsRow:{
flexDirection:'row',
justifyContent:'space-between',
marginBottom:20,
gap:10
},

cardInfo:{
flex:1,
paddingVertical:16,
paddingHorizontal:10,
borderRadius:22,
alignItems:'center'
},

cardNumero:{
fontSize:30,
fontWeight:'bold',
color:'#fff'
},

cardTexto:{
color:'#fff',
fontWeight:'bold',
marginTop:6,
fontSize:13
},

botaoCadastrar:{
backgroundColor:'#2CC36B',
height:58,
borderRadius:18,
justifyContent:'center',
alignItems:'center',
marginBottom:18
},

botaoSync:{
backgroundColor:'#021B49',
height:58,
borderRadius:18,
justifyContent:'center',
alignItems:'center',
marginBottom:20
},

botaoTexto:{
color:'#FFF',
fontSize:18,
fontWeight:'bold'
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

filtrosRow:{
marginBottom:18
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
backgroundColor:'#FFF',
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
marginBottom:12
},

nome:{
fontSize:24,
fontWeight:'bold',
color:'#111',
flex:1
},

status:{
paddingHorizontal:14,
paddingVertical:7,
borderRadius:12
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

editarBtn:{
backgroundColor:'#021B49',
paddingHorizontal:18,
paddingVertical:12,
borderRadius:12,
marginTop:18,
alignSelf:'flex-start'
},

editarTexto:{
color:'#fff',
fontWeight:'bold'
},

vazio:{
backgroundColor:'#FFF',
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
},

modalBg:{
flex:1,
backgroundColor:'rgba(0,0,0,0.5)',
justifyContent:'center',
padding:20
},

modal:{
backgroundColor:'#fff',
borderRadius:28,
padding:22
},

modalTitulo:{
fontSize:24,
fontWeight:'bold',
marginBottom:20,
color:'#111'
},

label:{
fontWeight:'bold',
marginBottom:8,
marginTop:10,
color:'#111'
},

input:{
backgroundColor:'#F3F5F8',
height:58,
borderRadius:16,
paddingHorizontal:16,
fontSize:16,
marginBottom:10,
color:'#111'
},

salvarBtn:{
backgroundColor:'#2CC36B',
height:58,
borderRadius:16,
justifyContent:'center',
alignItems:'center',
marginTop:15
},

salvarTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:18
},

cancelarBtn:{
marginTop:18,
alignItems:'center'
},

cancelarTexto:{
color:'#E53935',
fontWeight:'bold',
fontSize:16
}

});
