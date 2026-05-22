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
ScrollView,
Alert
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

export default function DashboardScreen({

navigation

}){

const{
usuario
}=useContext(AuthContext);

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

// ✅ CORRIGIDO
// Atualiza automaticamente
// quando voltar para tela

useFocusEffect(

useCallback(()=>{

carregarDados();

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

setVeiculos(
veiculosSnap.size
);

setUsuarios(
usuariosSnap.size
);

setChecklists(
checklistSnap.size
);

}catch(e){

console.log(e);

}

}

async function sair(){

try{

await signOut(auth);

}catch(e){

Alert.alert(
'Erro',
'Não foi possível sair'
);

}

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
SIS Dashboard
</Text>

<Text style={styles.sub}>
Sistema Inteligente de Checklist Veicular
</Text>

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

<View style={styles.cardGrande}>

<Text style={styles.numeroGrande}>
{checklists}
</Text>

<Text style={styles.cardTextoGrande}>
Checklists realizados
</Text>

</View>

<TouchableOpacity

style={styles.botao}

onPress={()=>
navigation.navigate(
'CadastrarUsuario'
)
}

>

<Text style={styles.botaoTexto}>
Cadastrar Usuário
</Text>

</TouchableOpacity>

<TouchableOpacity

style={styles.botao}

onPress={()=>
navigation.navigate(
'CadastrarVeiculo'
)
}

>

<Text style={styles.botaoTexto}>
Cadastrar Veículo
</Text>

</TouchableOpacity>

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
marginBottom:30
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

botao:{
backgroundColor:'#0A1E40',
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

botaoSair:{
backgroundColor:'#E53935',
height:60,
borderRadius:15,
justifyContent:'center',
alignItems:'center',
marginBottom:50
},

botaoTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:18
}

});