import React,{
useState,
useContext,
useCallback
} from 'react';

import {
View,
Text,
StyleSheet,
TouchableOpacity,
ScrollView
} from 'react-native';

import {
useFocusEffect
} from '@react-navigation/native';

import {
collection,
getDocs
} from 'firebase/firestore';

import {
db
} from '../services/firebase';

import {
AuthContext
} from '../context/AuthContext';

export default function DashboardScreen({

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


// ==========================================
// AUTO REFRESH
// ==========================================

useFocusEffect(

useCallback(()=>{

carregarDados();

},[])

);


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
// CARREGAR DADOS
// ==========================================

async function carregarDados(){

try{

const veiculosSnap=
await getDocs(
collection(
db,
'veiculos'
)
);

const usuariosSnap=
await getDocs(
collection(
db,
'usuarios'
)
);

const checklistSnap=
await getDocs(
collection(
db,
'checklists'
)
);

const sinistrosSnap=
await getDocs(
collection(
db,
'sinistros'
)
);

setVeiculos(
veiculosSnap.size
);

setUsuarios(
usuariosSnap.size
);

setChecklists(
checklistSnap.size
);

setSinistros(
sinistrosSnap.size
);

}catch(e){

console.log(e);

}

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
>

<View style={styles.content}>


<Text style={styles.titulo}>
SIS Dashboard
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

</View>


{/* ========================================== */}
{/* CARDS */}
{/* ========================================== */}

<View style={styles.cardsRow}>

<View style={styles.cardMini}>

<Text style={styles.numero}>
{veiculos}
</Text>

<Text style={styles.cardTexto}>
Veículos
</Text>

</View>

<View style={styles.cardMini}>

<Text style={styles.numero}>
{usuarios}
</Text>

<Text style={styles.cardTexto}>
Usuários
</Text>

</View>

</View>


{/* ========================================== */}
{/* CHECKLISTS */}
{/* ========================================== */}

<View style={styles.cardGrande}>

<Text style={styles.numeroGrande}>
{checklists}
</Text>

<Text style={styles.cardTextoGrande}>
Checklists realizados
</Text>

</View>


{/* ========================================== */}
{/* SINISTROS CLICÁVEL */}
{/* ========================================== */}

<TouchableOpacity

style={styles.cardSinistro}

activeOpacity={0.9}

onPress={()=>
navigation.navigate(
'Sinistros'
)
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


{/* ========================================== */}
{/* BOTÃO REGISTRAR SINISTRO */}
{/* ========================================== */}

<TouchableOpacity

style={styles.botaoSinistro}

onPress={()=>
navigation.navigate(
'RegistrarSinistro'
)
}

>

<Text style={styles.botaoTexto}>
🚨 Registrar Sinistro
</Text>

</TouchableOpacity>


{/* ========================================== */}
{/* FROTA */}
{/* ========================================== */}

<TouchableOpacity
style={styles.botaoMapa}

onPress={()=>
navigation.navigate('Frota')
}

>

<Text style={styles.botaoTexto}>
Frota
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
width:'100%',
maxWidth:600,
alignSelf:'center'
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
padding:20,
borderRadius:20,
marginBottom:25
},

usuarioNome:{
fontSize:22,
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
color:'#0A1E40',
marginTop:8,
fontWeight:'bold'
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
padding:20,
borderRadius:18
},

numero:{
fontSize:36,
fontWeight:'bold',
color:'#0A1E40'
},

cardTexto:{
marginTop:10,
color:'#555'
},

cardGrande:{
backgroundColor:'#fff',
padding:25,
borderRadius:18,
marginBottom:20
},

numeroGrande:{
fontSize:48,
fontWeight:'bold',
color:'#0A1E40'
},

cardTextoGrande:{
marginTop:10,
fontSize:16,
color:'#555'
},


// ==========================================
// SINISTRO
// ==========================================

cardSinistro:{
backgroundColor:'#E53935',
padding:25,
borderRadius:20,
marginBottom:25
},

sinistroTitulo:{
fontSize:24,
fontWeight:'bold',
color:'#fff'
},

sinistroNumero:{
fontSize:52,
fontWeight:'bold',
color:'#fff',
marginTop:10
},

sinistroTexto:{
fontSize:16,
color:'#fff',
marginTop:5
},


// ==========================================
// BOTÕES
// ==========================================

botaoSinistro:{
backgroundColor:'#E53935',
height:60,
borderRadius:15,
justifyContent:'center',
alignItems:'center',
marginBottom:15
},

botaoMapa:{
backgroundColor:'#1F8BFF',
height:60,
borderRadius:15,
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