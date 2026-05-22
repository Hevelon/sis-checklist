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
db
} from '../services/firebase';

import {
AuthContext
} from '../context/AuthContext';

export default function UsuariosScreen(){

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

// ✅ CORRIGIDO
// Atualiza automaticamente
// quando voltar para tela

useFocusEffect(

useCallback(()=>{

buscarUsuarios();

},[])

);

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

{usuarios.length===0 &&(

<View style={styles.vazio}>

<Text style={styles.vazioTexto}>
Nenhum usuário cadastrado
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
}

});