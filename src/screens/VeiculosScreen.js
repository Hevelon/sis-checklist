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
Alert,
Modal,
TextInput
} from 'react-native';

import {
useFocusEffect
} from '@react-navigation/native';

import {
collection,
getDocs,
doc,
setDoc,
updateDoc,
query,
where
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

const empresaId =
usuario?.empresaId || 'default';


// ==========================================
// CARREGAR VEÍCULOS
// ==========================================

async function carregarVeiculos(){

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

}finally{

setLoading(false);

}

}


// ==========================================
// AUTO REFRESH
// ==========================================

useFocusEffect(

useCallback(()=>{

carregarVeiculos();

},[])

);


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
// FILTRO
// ==========================================

const listaFiltrada=

veiculos.filter((item)=>{

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

||

item.tipoOperacional
?.toLowerCase()
.includes(texto)

);

});


// ==========================================
// PERMISSÃO
// ==========================================

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
// LOADING
// ==========================================

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
>

<View style={styles.content}>


<Text style={styles.titulo}>
Veículos
</Text>

<Text style={styles.sub}>
Frota cadastrada
</Text>


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

onChangeText={setBusca}

/>


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

{listaFiltrada.map((item)=>(

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

{listaFiltrada.length===0 &&(

<View style={styles.vazio}>

<Text style={styles.vazioTexto}>
Nenhum veículo encontrado
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
marginBottom:20
},

botaoCadastrar:{
backgroundColor:'#2CC36B',
height:58,
borderRadius:16,
justifyContent:'center',
alignItems:'center',
marginBottom:20
},

inputBusca:{
backgroundColor:'#fff',
height:55,
borderRadius:14,
paddingHorizontal:16,
fontSize:16,
marginBottom:20,
color:'#111'
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

editarBtn:{
backgroundColor:'#0A1E40',
paddingHorizontal:15,
paddingVertical:10,
borderRadius:10,
marginTop:15,
alignSelf:'flex-start'
},

editarTexto:{
color:'#fff',
fontWeight:'bold'
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
},

modalBg:{
flex:1,
backgroundColor:'rgba(0,0,0,0.5)',
justifyContent:'center',
padding:20
},

modal:{
backgroundColor:'#fff',
borderRadius:20,
padding:20
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
height:55,
borderRadius:14,
paddingHorizontal:15,
fontSize:16,
marginBottom:10,
color:'#111'
},

salvarBtn:{
backgroundColor:'#2CC36B',
height:55,
borderRadius:14,
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
marginTop:15,
alignItems:'center'
},

cancelarTexto:{
color:'#E53935',
fontWeight:'bold',
fontSize:16
}

});
