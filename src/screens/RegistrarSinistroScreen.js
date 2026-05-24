import React,{
useState,
useContext
} from 'react';

import {
View,
Text,
StyleSheet,
TextInput,
TouchableOpacity,
ScrollView,
Alert,
Image,
ActivityIndicator
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import {
DatePickerModal
} from 'react-native-paper-dates';

import {
collection,
addDoc,
serverTimestamp
} from 'firebase/firestore';

import {
db
} from '../services/firebase';

import {
AuthContext
} from '../context/AuthContext';

export default function RegistrarSinistroScreen(){

const{
usuario
}=useContext(AuthContext);


// ==========================================
// STATES
// ==========================================

const[
placa,
setPlaca
]=useState('');

const[
motorista,
setMotorista
]=useState('');

const[
local,
setLocal
]=useState('');

const[
descricao,
setDescricao
]=useState('');

const[
severidade,
setSeveridade
]=useState('leve');

const[
fotos,
setFotos
]=useState([]);

const[
loading,
setLoading
]=useState(false);

const[
data,
setData
]=useState(
new Date()
);

const[
dataTexto,
setDataTexto
]=useState(
new Date()
.toLocaleDateString('pt-BR')
);

const[
openCalendario,
setOpenCalendario
]=useState(false);


// ==========================================
// FOTO
// ==========================================

async function tirarFoto(){

const permissao=

await ImagePicker.requestCameraPermissionsAsync();

if(!permissao.granted){

Alert.alert(
'Atenção',
'Permissão da câmera negada'
);

return;

}

const resultado=

await ImagePicker.launchCameraAsync({

quality:0.5,
allowsEditing:true

});

if(resultado.canceled){

return;

}

const foto=
resultado.assets[0].uri;

setFotos((prev)=>[
...prev,
foto
]);

}


// ==========================================
// SALVAR
// ==========================================

async function salvarSinistro(){

if(
!placa ||
!motorista ||
!local ||
!descricao
){

Alert.alert(
'Atenção',
'Preencha todos os campos'
);

return;

}

try{

setLoading(true);

await addDoc(

collection(
db,
'sinistros'
),

{

placa,

motorista,

local,

descricao,

severidade,

fotos,

status:'aberto',

usuario:{

uid:usuario?.uid,

nome:usuario?.nome,

cargo:usuario?.cargo

},

dataOcorrencia:dataTexto,

createdAt:
serverTimestamp()

}

);

Alert.alert(
'Sucesso',
'Sinistro registrado'
);


// ==========================================
// RESET
// ==========================================

setPlaca('');
setMotorista('');
setLocal('');
setDescricao('');
setSeveridade('leve');
setFotos([]);

}catch(e){

console.log(e);

Alert.alert(
'Erro',
'Erro ao registrar sinistro'
);

}finally{

setLoading(false);

}

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
🚨 Registrar Sinistro
</Text>

<Text style={styles.sub}>
Registro operacional de ocorrência
</Text>


{/* ========================================== */}
{/* PLACA */}
{/* ========================================== */}

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


{/* ========================================== */}
{/* MOTORISTA */}
{/* ========================================== */}

<TextInput

style={styles.input}

placeholder="Motorista"

placeholderTextColor="#777"

value={motorista}

onChangeText={setMotorista}

/>


{/* ========================================== */}
{/* LOCAL */}
{/* ========================================== */}

<TextInput

style={styles.input}

placeholder="Local do sinistro"

placeholderTextColor="#777"

value={local}

onChangeText={setLocal}

/>


{/* ========================================== */}
{/* DATA */}
{/* ========================================== */}

<View style={styles.dataContainer}>

<TextInput

style={styles.inputData}

placeholder="Data"

placeholderTextColor="#777"

value={dataTexto}

onChangeText={setDataTexto}

/>


<TouchableOpacity

style={styles.calendarioIcone}

onPress={()=>setOpenCalendario(true)}

>

<Text style={styles.iconeTexto}>
📅
</Text>

</TouchableOpacity>

</View>


<DatePickerModal

locale="pt"

mode="single"

visible={openCalendario}

onDismiss={()=>setOpenCalendario(false)}

date={data}

onConfirm={({date})=>{

setOpenCalendario(false);

if(date){

setData(date);

setDataTexto(

date.toLocaleDateString('pt-BR')

);

}

}}

/>


{/* ========================================== */}
{/* SEVERIDADE */}
{/* ========================================== */}

<Text style={styles.label}>
Severidade
</Text>

<View style={styles.severidadeRow}>


<TouchableOpacity

style={[

styles.severidadeBtn,

styles.leve,

severidade==='leve'
&& styles.ativo

]}

onPress={()=>
setSeveridade('leve')
}

>

<Text style={styles.severidadeTexto}>
Leve
</Text>

</TouchableOpacity>


<TouchableOpacity

style={[

styles.severidadeBtn,

styles.moderado,

severidade==='moderado'
&& styles.ativo

]}

onPress={()=>
setSeveridade('moderado')
}

>

<Text style={styles.severidadeTexto}>
Moderado
</Text>

</TouchableOpacity>


<TouchableOpacity

style={[

styles.severidadeBtn,

styles.grave,

severidade==='grave'
&& styles.ativo

]}

onPress={()=>
setSeveridade('grave')
}

>

<Text style={styles.severidadeTexto}>
Grave
</Text>

</TouchableOpacity>

</View>


{/* ========================================== */}
{/* DESCRIÇÃO */}
{/* ========================================== */}

<TextInput

style={styles.descricao}

placeholder="Descrição da ocorrência"

placeholderTextColor="#777"

multiline

value={descricao}

onChangeText={setDescricao}

/>


{/* ========================================== */}
{/* FOTO */}
{/* ========================================== */}

<TouchableOpacity

style={styles.fotoBtn}

onPress={tirarFoto}

>

<Text style={styles.fotoTexto}>
📷 Adicionar Foto
</Text>

</TouchableOpacity>


{fotos.map((foto,index)=>(

<Image
key={index}
source={{uri:foto}}
style={styles.foto}
/>

))}


{/* ========================================== */}
{/* SALVAR */}
{/* ========================================== */}

<TouchableOpacity

style={styles.salvarBtn}

onPress={salvarSinistro}

disabled={loading}

>

{loading ? (

<ActivityIndicator
color="#fff"
/>

):(

<Text style={styles.salvarTexto}>
Salvar Sinistro
</Text>

)}

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

titulo:{
fontSize:34,
fontWeight:'bold',
color:'#E53935'
},

sub:{
fontSize:16,
color:'#666',
marginTop:8,
marginBottom:25
},

input:{
backgroundColor:'#fff',
height:58,
borderRadius:16,
paddingHorizontal:18,
fontSize:17,
marginBottom:18,
color:'#111'
},

dataContainer:{
position:'relative',
marginBottom:18
},

inputData:{
backgroundColor:'#fff',
height:58,
borderRadius:16,
paddingHorizontal:18,
paddingRight:60,
fontSize:17,
color:'#111'
},

calendarioIcone:{
position:'absolute',
right:15,
top:14
},

iconeTexto:{
fontSize:24
},

label:{
fontSize:18,
fontWeight:'bold',
marginBottom:15,
color:'#111'
},

severidadeRow:{
flexDirection:'row',
justifyContent:'space-between',
marginBottom:20,
gap:10
},

severidadeBtn:{
flex:1,
height:55,
borderRadius:14,
justifyContent:'center',
alignItems:'center',
opacity:0.5
},

ativo:{
opacity:1
},

leve:{
backgroundColor:'#F2C94C'
},

moderado:{
backgroundColor:'#F2994A'
},

grave:{
backgroundColor:'#E53935'
},

severidadeTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:16
},

descricao:{
backgroundColor:'#fff',
borderRadius:18,
padding:18,
fontSize:16,
minHeight:140,
textAlignVertical:'top',
marginBottom:20,
color:'#111'
},

fotoBtn:{
backgroundColor:'#0A1E40',
height:55,
borderRadius:15,
justifyContent:'center',
alignItems:'center',
marginBottom:20
},

fotoTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:17
},

foto:{
width:'100%',
height:220,
borderRadius:18,
marginBottom:15
},

salvarBtn:{
backgroundColor:'#E53935',
height:60,
borderRadius:16,
justifyContent:'center',
alignItems:'center',
marginTop:10,
marginBottom:50
},

salvarTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:18
}

});