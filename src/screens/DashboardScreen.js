import React,{
useState,
useContext,
useEffect,
useCallback
} from 'react';

import {
View,
Text,
StyleSheet,
TouchableOpacity,
ScrollView,
Dimensions,
ActivityIndicator
} from 'react-native';

import {
collection,
getDocs,
query,
where
} from 'firebase/firestore';

import {
useFocusEffect
} from '@react-navigation/native';

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

import {
LineChart
} from 'react-native-chart-kit';

const largura =
Dimensions.get('window').width;

export default function DashboardScreen(props){

const navigation =
props?.navigation;

const{
usuario
}=useContext(AuthContext);

const empresaId =
usuario?.empresaId || 'default';


// ==========================================
// PERMISSÃO
// ==========================================

const isAdmin =
usuario?.nivel === 'admin' ||
usuario?.nivel === 'supervisor';


// ==========================================
// STATES
// ==========================================

const[
loading,
setLoading
]=useState(true);

const[
veiculos,
setVeiculos
]=useState(0);

const[
usuarios,
setUsuarios
]=useState(0);

const[
checklists,
setChecklists
]=useState(0);

const[
sinistros,
setSinistros
]=useState(0);

const[
graficoChecklist,
setGraficoChecklist
]=useState([0,0,0,0,0,0,0]);


// ==========================================
// LOAD INICIAL
// ==========================================

useEffect(()=>{

if(usuario){

carregarDados();

}

},[usuario]);


// ==========================================
// AUTO UPDATE AO VOLTAR
// ==========================================

useFocusEffect(

useCallback(()=>{

if(usuario){

carregarDados();

}

},[usuario])

);


// ==========================================
// LOGOUT
// ==========================================

async function sair(){

try{

await signOut(auth);

}catch(e){

console.log(e);

}

}


// ==========================================
// LOADING USER
// ==========================================

if(!usuario){

return(

<View style={styles.loading}>

<ActivityIndicator
size="large"
color="#021B49"
/>

<Text style={styles.loadingTexto}>
Carregando dashboard...
</Text>

</View>

);

}


// ==========================================
// CARREGAR DADOS
// ==========================================

async function carregarDados(){

try{

setLoading(true);


// ==========================================
// QUERY MULTIEMPRESA
// ==========================================

const checklistSnap=
await getDocs(
query(
collection(
db,
'checklists'
),
where(
'empresaId',
'==',
empresaId
)
)
);


// ==========================================
// CHECKLIST MOTORISTA
// ==========================================

const listaChecklist=[];

checklistSnap.forEach((doc)=>{

listaChecklist.push(doc.data());

});


// ==========================================
// FILTRA MOTORISTA
// ==========================================

const meusChecklists =

isAdmin

? listaChecklist

: listaChecklist.filter(
(item)=>
item.usuario?.uid === usuario?.uid
);


// ==========================================
// TOTAL CHECKLISTS
// ==========================================

setChecklists(
meusChecklists.length
);


// ==========================================
// GRÁFICO
// ==========================================

const dias=[
0,0,0,0,0,0,0
];

meusChecklists.forEach((data)=>{

if(data.createdAt?.seconds){

const dia =
new Date(
data.createdAt.seconds * 1000
).getDay();

dias[dia] += 1;

}

});

setGraficoChecklist(dias);


// ==========================================
// ADMIN
// ==========================================

if(isAdmin){

const veiculosSnap=
await getDocs(
query(
collection(
db,
'veiculos'
),
where(
'empresaId',
'==',
empresaId
)
)
);

const usuariosSnap=
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

const sinistrosSnap=
await getDocs(
query(
collection(
db,
'sinistros'
),
where(
'empresaId',
'==',
empresaId
)
)
);

setVeiculos(
veiculosSnap.size
);

setUsuarios(
usuariosSnap.size
);

setSinistros(
sinistrosSnap.size
);

}

}catch(e){

console.log(e);

}finally{

setLoading(false);

}

}


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

<Text style={styles.loadingTexto}>
Carregando dados...
</Text>

</View>

);

}


// ==========================================
// SAFE NAVIGATE
// ==========================================

function navegar(rota){

if(!navigation){

console.log(
'Navigation undefined'
);

return;

}

navigation.navigate(rota);

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
🚛 SIS Dashboard
</Text>

<Text style={styles.sub}>
Sistema Inteligente de Checklist Veicular
</Text>


{/* ========================================== */}
{/* USUÁRIO */}
{/* ========================================== */}

<View style={styles.usuarioBox}>

<Text style={styles.usuarioNome}>
👤 {usuario?.nome}
</Text>

<Text style={styles.usuarioCargo}>
{usuario?.cargo}
</Text>

<Text style={styles.usuarioNivel}>
🔐 {usuario?.nivel}
</Text>


<TouchableOpacity
style={styles.sairMini}
onPress={sair}
>

<Text style={styles.sairMiniTexto}>
SAIR
</Text>

</TouchableOpacity>

</View>


{/* ========================================== */}
{/* KPIs ADMIN */}
{/* ========================================== */}

{isAdmin &&(

<View style={styles.cardsRow}>


<TouchableOpacity

style={styles.cardMini}

activeOpacity={0.9}

onPress={()=>
navegar('Veiculos')
}

>

<Text style={styles.numero}>
{veiculos}
</Text>

<Text style={styles.cardTexto}>
Veículos
</Text>

</TouchableOpacity>


<TouchableOpacity

style={styles.cardMini}

activeOpacity={0.9}

onPress={()=>
navegar('Usuarios')
}

>

<Text style={styles.numero}>
{usuarios}
</Text>

<Text style={styles.cardTexto}>
Usuários
</Text>

</TouchableOpacity>

</View>

)}


{/* ========================================== */}
{/* CHECKLISTS */}
{/* ========================================== */}

<TouchableOpacity

style={styles.cardGrande}

activeOpacity={0.9}

onPress={()=>
navegar('Historico')
}

>

<Text style={styles.numeroGrande}>
{checklists}
</Text>

<Text style={styles.cardTextoGrande}>

{isAdmin
? 'Checklists realizados'
: 'Meus checklists'}

</Text>

</TouchableOpacity>


{/* ========================================== */}
{/* SINISTROS */}
{/* ========================================== */}

{isAdmin &&(

<TouchableOpacity

style={styles.cardSinistro}

activeOpacity={0.9}

onPress={()=>
navegar('Sinistros')
}

>

<Text style={styles.sinistroTitulo}>
🚨 Sinistros
</Text>

<Text style={styles.sinistroNumero}>
{sinistros}
</Text>

<Text style={styles.sinistroTexto}>
Ocorrências registradas
</Text>

</TouchableOpacity>

)}


{/* ========================================== */}
{/* GRÁFICO */}
{/* ========================================== */}

<View style={styles.graficoCard}>

<Text style={styles.graficoTitulo}>
📊 Operações da Semana
</Text>

<LineChart

data={{

labels:[
'Dom',
'Seg',
'Ter',
'Qua',
'Qui',
'Sex',
'Sáb'
],

datasets:[{

data:
graficoChecklist.every(v=>v===0)
? [0,0,0,0,0,0,0]
: graficoChecklist

}]

}}

width={largura - 80}

height={220}

chartConfig={{

backgroundGradientFrom:'#021B49',

backgroundGradientTo:'#021B49',

decimalPlaces:0,

color:(opacity=1)=>
`rgba(255,255,255,${opacity})`,

labelColor:(opacity=1)=>
`rgba(255,255,255,${opacity})`,

propsForDots:{
r:'5',
strokeWidth:'2',
stroke:'#fff'
}

}}

bezier

style={{
borderRadius:20
}}

/>

</View>


{/* ========================================== */}
{/* AÇÕES */}
{/* ========================================== */}

<Text style={styles.secao}>
⚡ Ações rápidas
</Text>


<TouchableOpacity

style={styles.botaoChecklist}

onPress={()=>
navegar('Historico')
}

>

<Text style={styles.botaoTexto}>
✅ Histórico Checklist
</Text>

</TouchableOpacity>


<TouchableOpacity

style={styles.botaoSinistro}

onPress={()=>
navegar('RegistrarSinistro')
}

>

<Text style={styles.botaoTexto}>
🚨 Registrar Sinistro
</Text>

</TouchableOpacity>


{isAdmin &&(

<TouchableOpacity

style={styles.botaoMapa}

onPress={()=>
navegar('Veiculos')
}

>

<Text style={styles.botaoTexto}>
🚛 Gestão de Frota
</Text>

</TouchableOpacity>

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

loadingTexto:{
marginTop:15,
fontSize:16,
color:'#555'
},

titulo:{
fontSize:34,
fontWeight:'bold',
marginTop:50,
color:'#111'
},

sub:{
fontSize:16,
color:'#666',
marginTop:8,
marginBottom:25
},

usuarioBox:{
backgroundColor:'#fff',
padding:22,
borderRadius:26,
marginBottom:25,

shadowColor:'#000',

shadowOffset:{
width:0,
height:4
},

shadowOpacity:0.08,

shadowRadius:8,

elevation:3

},

usuarioNome:{
fontSize:24,
fontWeight:'bold',
color:'#111'
},

usuarioCargo:{
fontSize:16,
color:'#666',
marginTop:5
},

usuarioNivel:{
fontSize:15,
color:'#021B49',
marginTop:8,
fontWeight:'bold'
},

sairMini:{
alignSelf:'flex-start',
marginTop:12,
backgroundColor:'#111',
paddingHorizontal:14,
paddingVertical:8,
borderRadius:10
},

sairMiniTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:13,
textTransform:'uppercase'
},

cardsRow:{
flexDirection:'row',
justifyContent:'space-between',
marginBottom:15,
gap:15
},

cardMini:{
flex:1,
backgroundColor:'#fff',
padding:22,
borderRadius:24,

shadowColor:'#000',

shadowOffset:{
width:0,
height:4
},

shadowOpacity:0.08,

shadowRadius:8,

elevation:3

},

numero:{
fontSize:38,
fontWeight:'bold',
color:'#021B49'
},

cardTexto:{
marginTop:10,
color:'#555',
fontSize:15
},

cardGrande:{
backgroundColor:'#021B49',
padding:28,
borderRadius:28,
marginBottom:20
},

numeroGrande:{
fontSize:54,
fontWeight:'bold',
color:'#fff'
},

cardTextoGrande:{
marginTop:10,
fontSize:16,
color:'#fff'
},

cardSinistro:{
backgroundColor:'#E53935',
padding:28,
borderRadius:28,
marginBottom:25
},

sinistroTitulo:{
fontSize:24,
fontWeight:'bold',
color:'#fff'
},

sinistroNumero:{
fontSize:54,
fontWeight:'bold',
color:'#fff',
marginTop:10
},

sinistroTexto:{
fontSize:16,
color:'#fff',
marginTop:5
},

graficoCard:{
backgroundColor:'#fff',
padding:20,
borderRadius:28,
marginBottom:25,

shadowColor:'#000',

shadowOffset:{
width:0,
height:4
},

shadowOpacity:0.08,

shadowRadius:8,

elevation:3

},

graficoTitulo:{
fontSize:22,
fontWeight:'bold',
marginBottom:20,
color:'#111'
},

secao:{
fontSize:22,
fontWeight:'bold',
marginBottom:20,
color:'#111'
},

botaoChecklist:{
backgroundColor:'#2CC36B',
height:62,
borderRadius:18,
justifyContent:'center',
alignItems:'center',
marginBottom:15
},

botaoSinistro:{
backgroundColor:'#E53935',
height:62,
borderRadius:18,
justifyContent:'center',
alignItems:'center',
marginBottom:15
},

botaoMapa:{
backgroundColor:'#1F8BFF',
height:62,
borderRadius:18,
justifyContent:'center',
alignItems:'center',
marginBottom:15
},

botaoTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:18
}

});