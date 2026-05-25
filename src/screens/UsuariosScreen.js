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
TextInput,
RefreshControl
} from 'react-native';

import {
collection,
getDocs,
query,
where
} from 'firebase/firestore';

import {
signOut
} from 'firebase/auth';

import {
db,
auth
} from '../services/firebase';

import {
AuthContext
} from '../context/AuthContext';

export default function UsuariosScreen({

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
usuarios,
setUsuarios
]=useState([]);

const[
usuariosFiltrados,
setUsuariosFiltrados
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
filtroNivel,
setFiltroNivel
]=useState('todos');


// ==========================================
// BUSCAR USUÁRIOS
// ==========================================

async function buscarUsuarios(){

try{

setLoading(true);


// ==========================================
// QUERY MULTIEMPRESA
// ==========================================

const querySnapshot=
await getDocs(
query(
collection(
db,
'usuarios'
),
where(
'empresaId',
'==',
empresaId
)
)
);

const lista=[];

querySnapshot.forEach((doc)=>{

lista.push({

id:doc.id,
...doc.data()

});

});

setUsuarios(lista);

}catch(e){

console.log(e);

}

finally{

setLoading(false);
setRefreshing(false);

}

}


// ==========================================
// LOAD
// ==========================================

useEffect(()=>{

if(usuario){

buscarUsuarios();

}

},[usuario]);


// ==========================================
// FILTROS
// ==========================================

useEffect(()=>{

let lista=[...usuarios];


// ==========================================
// BUSCA
// ==========================================

if(busca){

lista = lista.filter((item)=>{

const texto =
busca.toLowerCase();

return(

item.nome
?.toLowerCase()
.includes(texto)

||

item.email
?.toLowerCase()
.includes(texto)

||

item.cargo
?.toLowerCase()
.includes(texto)

);

});

}


// ==========================================
// NÍVEL
// ==========================================

if(filtroNivel !== 'todos'){

lista = lista.filter((item)=>

item.nivel === filtroNivel

);

}

setUsuariosFiltrados(lista);

},[
usuarios,
busca,
filtroNivel
]);


// ==========================================
// REFRESH
// ==========================================

function atualizar(){

setRefreshing(true);

buscarUsuarios();

}


// ==========================================
// SAIR
// ==========================================

async function sair(){

await signOut(auth);

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
// ÍCONE CARGO
// ==========================================

function iconeCargo(cargo){

const texto=
cargo?.toLowerCase() || '';

if(texto.includes('motorista'))
return '🚗';

if(texto.includes('operador'))
return '🛠️';

if(texto.includes('supervisor'))
return '👔';

if(texto.includes('admin'))
return '⚙️';

return '👤';

}


// ==========================================
// TOTALIZADORES
// ==========================================

const totalAdmins =
usuarios.filter(
u=>u.nivel==='admin'
).length;

const totalSupervisores =
usuarios.filter(
u=>u.nivel==='supervisor'
).length;

const totalUsuarios =
usuarios.length;


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
Carregando usuários...
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

keyboardShouldPersistTaps="handled"

nestedScrollEnabled={true}

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
👥 Usuários
</Text>

<Text style={styles.sub}>
Usuários cadastrados no sistema
</Text>


{/* ========================================== */}
{/* CARDS */}
{/* ========================================== */}

<View style={styles.cardsRow}>


<View style={[
styles.cardInfo,
{
backgroundColor:'#021B49'
}
]}>
<Text style={styles.cardNumero}>
{totalUsuarios}
</Text>
<Text style={styles.cardTexto}>
Usuários
</Text>
</View>


<View style={[
styles.cardInfo,
{
backgroundColor:'#2CC36B'
}
]}>
<Text style={styles.cardNumero}>
{totalAdmins}
</Text>
<Text style={styles.cardTexto}>
Admins
</Text>
</View>


<View style={[
styles.cardInfo,
{
backgroundColor:'#F2994A'
}
]}>
<Text style={styles.cardNumero}>
{totalSupervisores}
</Text>
<Text style={styles.cardTexto}>
Supervisores
</Text>
</View>

</View>


{/* ========================================== */}
{/* CADASTRAR */}
{/* ========================================== */}

<TouchableOpacity

style={styles.botaoCadastrar}

onPress={()=>
navigation.navigate(
'CadastrarUsuario'
)
}

>

<Text style={styles.botaoTexto}>
+ Cadastrar Usuário
</Text>

</TouchableOpacity>


{/* ========================================== */}
{/* BUSCA */}
{/* ========================================== */}

<TextInput

style={styles.inputBusca}

placeholder="Buscar usuário"

placeholderTextColor="#777"

value={busca}

onChangeText={setBusca}

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
'admin',
'supervisor',
'usuario'
].map((item)=>(

<TouchableOpacity

key={item}

style={[

styles.filtroBtn,

filtroNivel===item &&
styles.filtroAtivo

]}

onPress={()=>
setFiltroNivel(item)
}

>

<Text style={[

styles.filtroTexto,

filtroNivel===item &&
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

{usuariosFiltrados.map((item)=>(

<TouchableOpacity
key={item.id}
style={styles.card}
activeOpacity={0.9}
>

<View style={styles.topo}>

<Text style={styles.emoji}>
{iconeCargo(item.cargo)}
</Text>

<View style={{flex:1}}>

<Text style={styles.nome}>
{item.nome}
</Text>

<Text style={styles.cargo}>
{item.cargo}
</Text>

</View>

</View>

<View style={styles.infoBox}>

<Text style={styles.info}>
📧 {item.email}
</Text>

{!!item.telefone &&(

<Text style={styles.info}>
📱 {item.telefone}
</Text>

)}

<Text style={styles.nivel}>
🔐 {item.nivel}
</Text>

</View>

</TouchableOpacity>

))}


{/* ========================================== */}
{/* VAZIO */}
{/* ========================================== */}

{usuariosFiltrados.length===0 &&(

<View style={styles.vazio}>

<Text style={styles.vazioEmoji}>
👥
</Text>

<Text style={styles.vazioTitulo}>
Nenhum usuário encontrado
</Text>

<Text style={styles.vazioTexto}>
Tente alterar os filtros ou cadastrar um novo usuário.
</Text>

</View>

)}


{/* ========================================== */}
{/* SAIR */}
{/* ========================================== */}

<TouchableOpacity
style={styles.botaoSair}
onPress={sair}
>

<Text style={styles.botaoTexto}>
Sair
</Text>

</TouchableOpacity>

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

botaoTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:18
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
backgroundColor:'#fff',
padding:22,
borderRadius:26,
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
alignItems:'center'
},

emoji:{
fontSize:38,
marginRight:15
},

nome:{
fontSize:22,
fontWeight:'bold',
color:'#111'
},

cargo:{
fontSize:16,
color:'#666',
marginTop:3
},

infoBox:{
marginTop:18,
paddingTop:15,
borderTopWidth:1,
borderTopColor:'#EEE'
},

info:{
fontSize:15,
color:'#444',
marginBottom:8
},

nivel:{
fontSize:15,
fontWeight:'bold',
color:'#021B49',
marginTop:6
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
},

botaoSair:{
backgroundColor:'#111',
height:60,
borderRadius:18,
justifyContent:'center',
alignItems:'center',
marginTop:10,
marginBottom:50
}

});