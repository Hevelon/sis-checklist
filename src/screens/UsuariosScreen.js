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
ActivityIndicator
} from 'react-native';

import {
useFocusEffect
} from '@react-navigation/native';

import {
collection,
getDocs
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

const[
usuarios,
setUsuarios
]=useState([]);

const[
loading,
setLoading
]=useState(true);


// ==========================================
// BUSCAR USUÁRIOS
// ==========================================

async function buscarUsuarios(){

try{

setLoading(true);

const querySnapshot=
await getDocs(
collection(
db,
'usuarios'
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

}

}


// ==========================================
// AUTO REFRESH
// ==========================================

useFocusEffect(

useCallback(()=>{

buscarUsuarios();

},[])

);


// ==========================================
// SAIR
// ==========================================

async function sair(){

await signOut(auth);

}


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
Usuários
</Text>

<Text style={styles.sub}>
Usuários cadastrados no sistema
</Text>


{/* ========================================== */}
{/* CADASTRAR USUÁRIO */}
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
{/* LISTA */}
{/* ========================================== */}

{usuarios.map((item)=>(

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

{usuarios.length===0 &&(

<View style={styles.vazio}>

<Text style={styles.vazioTexto}>
Nenhum usuário cadastrado
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
width:'100%',
maxWidth:600,
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
fontSize:36,
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

botaoCadastrar:{
backgroundColor:'#2CC36B',
height:58,
borderRadius:16,
justifyContent:'center',
alignItems:'center',
marginBottom:20
},

botaoTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:18
},

card:{
backgroundColor:'#fff',
padding:20,
borderRadius:20,
marginBottom:18
},

topo:{
flexDirection:'row',
alignItems:'center'
},

emoji:{
fontSize:34,
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
color:'#0A1E40',
marginTop:6
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
},

botaoSair:{
backgroundColor:'#111',
height:60,
borderRadius:15,
justifyContent:'center',
alignItems:'center',
marginTop:10,
marginBottom:50
}

});