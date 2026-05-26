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
Alert,
ActivityIndicator,
RefreshControl
} from 'react-native';

import {
collection,
getDocs,
addDoc,
updateDoc,
deleteDoc,
doc,
query,
where,
setDoc,
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
placa,
setPlaca
]=useState('');

const[
modelo,
setModelo
]=useState('');

const[
categoria,
setCategoria
]=useState('');

const[
tipoOperacional,
setTipoOperacional
]=useState('');

const[
traccarId,
setTraccarId
]=useState('');

const[
editando,
setEditando
]=useState(null);

const[
busca,
setBusca
]=useState('');


// ==========================================
// BUSCAR VEÍCULOS
// ==========================================

async function buscarVeiculos(){

try{

setLoading(true);

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

Alert.alert(
'Erro',
'Erro ao buscar veículos'
);

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

buscarVeiculos();

}

},[usuario]);


// ==========================================
// REFRESH
// ==========================================

function atualizar(){

setRefreshing(true);

buscarVeiculos();

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
response.data || [];

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

buscarVeiculos();

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
// RESET FORM
// ==========================================

function limparFormulario(){

setPlaca('');
setModelo('');
setCategoria('');
setTipoOperacional('');
setTraccarId('');
setEditando(null);

}


// ==========================================
// SALVAR
// ==========================================

async function salvarVeiculo(){

if(
!placa ||
!modelo
){

Alert.alert(
'Atenção',
'Preencha placa e modelo'
);

return;

}

try{

const dados={

empresaId,

placa:
placa.toUpperCase(),

modelo,

categoria,

tipoOperacional,

traccarId,

status:'offline',

createdAt:
new Date()

};

if(editando){

await updateDoc(

doc(
db,
'veiculos',
editando.id
),

dados

);

Alert.alert(
'Sucesso',
'Veículo atualizado'
);

}else{

await addDoc(

collection(
db,
'veiculos'
),

dados

);

Alert.alert(
'Sucesso',
'Veículo cadastrado'
);

}

limparFormulario();

buscarVeiculos();

}catch(e){

console.log(e);

Alert.alert(
'Erro',
'Erro ao salvar veículo'
);

}

}


// ==========================================
// EXCLUIR VEÍCULO
// ==========================================

function confirmarExcluir(item){

Alert.alert(

'Excluir veículo',

`Deseja excluir ${item.placa}?`,

[
{
text:'Cancelar',
style:'cancel'
},

{
text:'Excluir',

style:'destructive',

onPress:()=>excluirVeiculo(item)
}
]

);

}


async function excluirVeiculo(item){

try{

await deleteDoc(

doc(
db,
'veiculos',
item.id
)

);

Alert.alert(
'Sucesso',
'Veículo excluído'
);

buscarVeiculos();

}catch(e){

console.log(e);

Alert.alert(
'Erro',
'Erro ao excluir veículo'
);

}

}


// ==========================================
// FILTRO
// ==========================================

const veiculosFiltrados =

Array.isArray(veiculos)

? veiculos.filter((item)=>{

const texto=
busca.toLowerCase();

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

);

})

: [];


// ==========================================
// LOADING
// ==========================================

if(loading){

return(

<View style={styles.loading}>

<ActivityIndicator
size="large"
color="#021B49"
/>

<Text style={styles.loadingText}>
Carregando veículos...
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
🚘 Veículos
</Text>

<Text style={styles.sub}>
Gestão da frota
</Text>


<TextInput

style={styles.input}

placeholder="Placa"

placeholderTextColor="#777"

value={placa}

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

setPlaca(valor);

}}

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

placeholder="Categoria"

placeholderTextColor="#777"

value={categoria}

onChangeText={setCategoria}

/>


<TextInput

style={styles.input}

placeholder="Tipo Operacional"

placeholderTextColor="#777"

value={tipoOperacional}

onChangeText={setTipoOperacional}

/>


<TextInput

style={styles.input}

placeholder="ID Traccar"

placeholderTextColor="#777"

value={traccarId}

onChangeText={setTraccarId}

/>


<TouchableOpacity

style={styles.salvarBtn}

onPress={salvarVeiculo}

>

<Text style={styles.salvarTexto}>

{editando
? 'Atualizar Veículo'
: 'Salvar Veículo'}

</Text>

</TouchableOpacity>


{editando &&(

<TouchableOpacity

style={styles.cancelarBtn}

onPress={limparFormulario}

>

<Text style={styles.cancelarTexto}>
Cancelar edição
</Text>

</TouchableOpacity>

)}


<TouchableOpacity

style={styles.syncBtn}

onPress={sincronizarTraccar}

disabled={sincronizando}

>

<Text style={styles.syncTexto}>

{sincronizando
? 'Sincronizando...'
: '🔄 Sincronizar Traccar'}

</Text>

</TouchableOpacity>


<TextInput

style={styles.inputBusca}

placeholder="Buscar veículo"

placeholderTextColor="#777"

value={busca}

onChangeText={setBusca}

/>


{veiculosFiltrados?.map((item)=>(

<TouchableOpacity

key={item.id}

style={styles.card}

activeOpacity={0.92}

onPress={()=>

navigation.navigate(

'Mapa',

{

veiculoId:item.traccarId,
placa:item.placa

}

)

}

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
Modelo: {item.modelo || '-'}
</Text>

<Text style={styles.info}>
Categoria: {item.categoria || '-'}
</Text>


{!!item.tipoOperacional &&(

<Text style={styles.info}>
Operação: {item.tipoOperacional}
</Text>

)}


<Text style={styles.info}>
ID Traccar: {item.traccarId || '-'}
</Text>


<View style={styles.acoesRow}>


<TouchableOpacity

style={styles.mapaBtn}

onPress={()=>

navigation.navigate(

'Mapa',

{

veiculoId:item.traccarId,
placa:item.placa

}

)

}

>

<Text style={styles.mapaTexto}>
🗺️ Ver mapa
</Text>

</TouchableOpacity>


<TouchableOpacity

style={styles.editarBtn}

onPress={()=>{

setEditando(item);

setPlaca(
item.placa || ''
);

setModelo(
item.modelo || ''
);

setCategoria(
item.categoria || ''
);

setTipoOperacional(
item.tipoOperacional || ''
);

setTraccarId(
String(item.traccarId || '')
);

}}

>

<Text style={styles.editarTexto}>
Editar
</Text>

</TouchableOpacity>


<TouchableOpacity

style={styles.excluirBtn}

onPress={()=>
confirmarExcluir(item)
}

>

<Text style={styles.excluirTexto}>
Excluir
</Text>

</TouchableOpacity>

</View>

</TouchableOpacity>

))}


{veiculosFiltrados.length===0 &&(

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
paddingTop:50
},

loading:{
flex:1,
justifyContent:'center',
alignItems:'center',
backgroundColor:'#F3F5F8'
},

loadingText:{
marginTop:15,
fontSize:16,
color:'#555'
},

titulo:{
fontSize:34,
fontWeight:'bold',
color:'#111'
},

sub:{
fontSize:16,
color:'#666',
marginTop:5,
marginBottom:25
},

input:{
backgroundColor:'#fff',
height:58,
borderRadius:16,
paddingHorizontal:18,
fontSize:16,
marginBottom:15,
color:'#111'
},

inputBusca:{
backgroundColor:'#fff',
height:58,
borderRadius:16,
paddingHorizontal:18,
fontSize:16,
marginTop:20,
marginBottom:20,
color:'#111'
},

salvarBtn:{
backgroundColor:'#021B49',
height:58,
borderRadius:16,
justifyContent:'center',
alignItems:'center',
marginTop:5
},

salvarTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:18
},

cancelarBtn:{
backgroundColor:'#E53935',
height:52,
borderRadius:16,
justifyContent:'center',
alignItems:'center',
marginTop:12
},

cancelarTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:16
},

syncBtn:{
backgroundColor:'#021B49',
height:58,
borderRadius:16,
justifyContent:'center',
alignItems:'center',
marginTop:15,
marginBottom:10
},

syncTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:18
},

card:{
backgroundColor:'#fff',
padding:22,
borderRadius:24,
marginBottom:18
},

topo:{
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center',
marginBottom:15
},

nome:{
fontSize:24,
fontWeight:'bold',
color:'#111'
},

status:{
paddingHorizontal:14,
paddingVertical:8,
borderRadius:12
},

statusTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:13,
textTransform:'uppercase'
},

info:{
fontSize:16,
color:'#444',
marginBottom:8
},

acoesRow:{
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center',
marginTop:18,
gap:8
},

mapaBtn:{
flex:1,
backgroundColor:'#1565F9',
paddingVertical:12,
borderRadius:12,
alignItems:'center'
},

mapaTexto:{
color:'#fff',
fontWeight:'bold'
},

editarBtn:{
flex:1,
backgroundColor:'#2CC36B',
paddingVertical:12,
borderRadius:12,
alignItems:'center'
},

editarTexto:{
color:'#fff',
fontWeight:'bold'
},

excluirBtn:{
flex:1,
backgroundColor:'#E53935',
paddingVertical:12,
borderRadius:12,
alignItems:'center'
},

excluirTexto:{
color:'#fff',
fontWeight:'bold'
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