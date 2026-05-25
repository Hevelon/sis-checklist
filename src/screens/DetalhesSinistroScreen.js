import React,{
useState,
useContext
} from 'react';

import {
View,
Text,
StyleSheet,
ScrollView,
Image,
TouchableOpacity,
TextInput,
Alert
} from 'react-native';

import {
doc,
updateDoc
} from 'firebase/firestore';

import {
db
} from '../services/firebase';

import {
AuthContext
} from '../context/AuthContext';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function DetalhesSinistroScreen({

route,
navigation

}){

const{
usuario
}=useContext(AuthContext);

const podeEditar =
usuario?.nivel === 'admin' ||
usuario?.nivel === 'supervisor';


// ==========================================
// DADOS
// ==========================================

const{
sinistro
}=route.params;


// ==========================================
// STATES
// ==========================================

const[
status,
setStatus
]=useState(
sinistro?.status || 'aberto'
);

const[
observacoes,
setObservacoes
]=useState(
sinistro?.observacoes || ''
);

const[
loading,
setLoading
]=useState(false);


// ==========================================
// PLACA
// ==========================================

function formatarPlaca(placa=''){

const limpa =
placa
.replace(/[^a-zA-Z0-9]/g,'')
.toUpperCase();

if(limpa.length <= 3){
return limpa;
}

return `${limpa.slice(0,3)}-${limpa.slice(3,7)}`;

}


// ==========================================
// BASE64
// ==========================================

async function imagemParaBase64(uri){

try{

const base64 =
await FileSystem.readAsStringAsync(
uri,
{
encoding:
FileSystem.EncodingType.Base64
}
);

return `data:image/jpeg;base64,${base64}`;

}catch(e){

console.log(e);

return null;

}

}


// ==========================================
// COR STATUS
// ==========================================

function corStatus(valor){

if(valor==='aberto'){
return '#E53935';
}

if(valor==='analise'){
return '#F2C94C';
}

if(valor==='finalizado'){
return '#2CC36B';
}

return '#999';

}


// ==========================================
// COR SEVERIDADE
// ==========================================

function corSeveridade(valor){

if(valor==='leve'){
return '#F2C94C';
}

if(valor==='moderado'){
return '#F2994A';
}

if(valor==='grave'){
return '#E53935';
}

return '#999';

}


// ==========================================
// PDF
// ==========================================

async function gerarPDF(){

try{

let fotosHtml='';

for(const foto of sinistro?.fotos || []){

let imagem=foto;

if(
foto.startsWith('file:')
){

imagem =
await imagemParaBase64(foto);

}

fotosHtml += `

<div class="foto-card">

<img
src="${imagem}"
class="foto"
/>

</div>

`;

}


const qrPayload =
encodeURIComponent(
JSON.stringify({
placa:sinistro?.placa,
motorista:sinistro?.motorista,
data:sinistro?.dataOcorrencia
})
);

const qrUrl =
`https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${qrPayload}`;


const html = `

<html>

<head>

<meta charset="utf-8"/>

<style>

*{
box-sizing:border-box;
}

@page{
size:A4;
margin:10px;
}

body{

font-family:Arial;

background:#F3F5F8;

padding:0;

margin:0;

color:#111;

}

.page{
padding:10px;
}


/* ====================================== */
/* HEADER */
/* ====================================== */

.header{

background:
linear-gradient(
135deg,
#02112D,
#0B2D72
);

padding:18px;

border-radius:20px;

display:flex;

justify-content:space-between;

align-items:center;

color:#fff;

margin-bottom:14px;

}

.header-title{
font-size:28px;
font-weight:bold;
}

.header-sub{
font-size:12px;
opacity:0.8;
margin-top:4px;
}

.header-right{
text-align:right;
}

.badge{

padding:8px 14px;

border-radius:10px;

font-size:11px;

font-weight:bold;

color:#fff;

display:inline-block;

margin-top:8px;

}


/* ====================================== */
/* GRID */
/* ====================================== */

.grid{
display:flex;
gap:10px;
margin-bottom:10px;
}

.card{

flex:1;

background:#fff;

padding:14px;

border-radius:18px;

}

.label{

font-size:11px;

font-weight:bold;

color:#666;

margin-bottom:6px;

}

.valor{

font-size:18px;

font-weight:bold;

color:#111;

}


/* ====================================== */
/* DESCRIÇÃO */
/* ====================================== */

.descricao{

background:#fff;

padding:18px;

border-radius:18px;

margin-bottom:12px;

line-height:24px;

font-size:14px;

}


/* ====================================== */
/* FOTOS */
/* ====================================== */

.fotos{

display:flex;

flex-wrap:wrap;

gap:8px;

margin-bottom:16px;

}

.foto-card{
width:48%;
}

.foto{

width:100%;

height:180px;

object-fit:cover;

border-radius:16px;

}


/* ====================================== */
/* FOOTER */
/* ====================================== */

.footer{

display:flex;

justify-content:space-between;

align-items:flex-end;

margin-top:20px;

}

.ass{
width:40%;
text-align:center;
}

.linha{

border-top:
1px solid #999;

margin-top:40px;

padding-top:8px;

font-size:12px;

}

.qr{
width:90px;
height:90px;
}

</style>

</head>

<body>

<div class="page">


<!-- HEADER -->

<div class="header">

<div>

<div class="header-title">
🚨 SINISTRO
</div>

<div class="header-sub">
Relatório operacional da ocorrência
</div>

</div>

<div class="header-right">

<div>
📅 ${sinistro?.dataOcorrencia || '-'}
</div>

<div
class="badge"
style="
background:${corStatus(status)}
"
>

${String(status).toUpperCase()}

</div>

</div>

</div>


<!-- GRID -->

<div class="grid">

<div class="card">

<div class="label">
PLACA
</div>

<div class="valor">
${formatarPlaca(
sinistro?.placa || '-'
)}
</div>

</div>

<div class="card">

<div class="label">
MOTORISTA
</div>

<div class="valor">
${sinistro?.motorista || '-'}
</div>

</div>

</div>


<div class="grid">

<div class="card">

<div class="label">
LOCAL
</div>

<div class="valor">
${sinistro?.local || '-'}
</div>

</div>

<div class="card">

<div class="label">
SEVERIDADE
</div>

<div
class="badge"
style="
background:${corSeveridade(
sinistro?.severidade
)}
"
>

${sinistro?.severidade || '-'}

</div>

</div>

</div>


<!-- DESCRIÇÃO -->

<div class="descricao">

<b>Descrição:</b><br/><br/>

${sinistro?.descricao || '-'}

</div>


<!-- OBSERVAÇÕES -->

<div class="descricao">

<b>Observações:</b><br/><br/>

${observacoes || 'Sem observações'}

</div>


<!-- FOTOS -->

<div class="fotos">

${fotosHtml}

</div>


<!-- FOOTER -->

<div class="footer">

<div class="ass">

<div class="linha">
Motorista
</div>

</div>

<div>

<img
src="${qrUrl}"
class="qr"
/>

</div>

<div class="ass">

<div class="linha">
Supervisor
</div>

</div>

</div>

</div>

</body>

</html>

`;


const { uri } =
await Print.printToFileAsync({
html
});

await Sharing.shareAsync(uri);

}catch(e){

console.log(e);

Alert.alert(
'Erro',
'Erro ao gerar PDF'
);

}

}


// ==========================================
// SALVAR
// ==========================================

async function salvarAtualizacao(){

if(!podeEditar){

Alert.alert(
'Acesso negado',
'Somente admin ou supervisor pode atualizar sinistros'
);

return;

}

try{

setLoading(true);

await updateDoc(

doc(
db,
'sinistros',
sinistro.id
),

{

empresaId:
sinistro.empresaId || usuario?.empresaId || 'default',

status,
observacoes

}

);

Alert.alert(
'Sucesso',
'Sinistro atualizado'
);

navigation.goBack();

}catch(e){

console.log(e);

Alert.alert(
'Erro',
'Erro ao atualizar sinistro'
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
🚨 Detalhes do Sinistro
</Text>

<Text style={styles.sub}>
Gestão operacional da ocorrência
</Text>


<View style={styles.card}>

<Text style={styles.label}>
Placa
</Text>

<Text style={styles.valor}>
🚘 {formatarPlaca(
sinistro?.placa || '-'
)}
</Text>

</View>


<View style={styles.card}>

<Text style={styles.label}>
Motorista
</Text>

<Text style={styles.valor}>
👤 {sinistro?.motorista || '-'}
</Text>

</View>


<View style={styles.card}>

<Text style={styles.label}>
Data
</Text>

<Text style={styles.valor}>
📅 {sinistro?.dataOcorrencia || '-'}
</Text>

</View>


<View style={styles.card}>

<Text style={styles.label}>
Local
</Text>

<Text style={styles.valor}>
📍 {sinistro?.local || '-'}
</Text>

</View>


<View style={styles.card}>

<Text style={styles.label}>
Descrição
</Text>

<Text style={styles.texto}>
{sinistro?.descricao || '-'}
</Text>

</View>


<View style={styles.card}>

<Text style={styles.label}>
Severidade
</Text>

<View
style={[

styles.badge,

{
backgroundColor:
corSeveridade(
sinistro?.severidade
)
}

]}
>

<Text style={styles.badgeTexto}>
{sinistro?.severidade || '-'}
</Text>

</View>

</View>


<View style={styles.card}>

<Text style={styles.label}>
Status
</Text>


<View style={styles.statusRow}>


<TouchableOpacity

style={[

styles.statusBtn,

{
backgroundColor:
'#E53935'
},

status==='aberto'
&& styles.statusAtivo

]}

onPress={()=>
setStatus('aberto')
}

>

<Text style={styles.statusTexto}>
Aberto
</Text>

</TouchableOpacity>


<TouchableOpacity

style={[

styles.statusBtn,

{
backgroundColor:
'#F2C94C'
},

status==='analise'
&& styles.statusAtivo

]}

onPress={()=>
setStatus('analise')
}

>

<Text style={styles.statusTexto}>
Análise
</Text>

</TouchableOpacity>


<TouchableOpacity

style={[

styles.statusBtn,

{
backgroundColor:
'#2CC36B'
},

status==='finalizado'
&& styles.statusAtivo

]}

onPress={()=>
setStatus('finalizado')
}

>

<Text style={styles.statusTexto}>
Finalizado
</Text>

</TouchableOpacity>

</View>


<View
style={[

styles.statusAtual,

{
backgroundColor:
corStatus(status)
}

]}
>

<Text style={styles.statusAtualTexto}>
{status}
</Text>

</View>

</View>


<View style={styles.card}>

<Text style={styles.label}>
Observações da Oficina
</Text>

<TextInput

style={styles.input}

multiline

placeholder="Adicionar observações"

placeholderTextColor="#777"

value={observacoes}

onChangeText={setObservacoes}

/>

</View>


{!!sinistro?.fotos?.length &&(

<View style={styles.card}>

<Text style={styles.label}>
Fotos
</Text>

{sinistro.fotos.map((foto,index)=>(

<Image
key={index}
source={{uri:foto}}
style={styles.imagem}
/>

))}

</View>

)}


<View style={styles.card}>

<Text style={styles.label}>
Registrado por
</Text>

<Text style={styles.valor}>
👤 {sinistro?.usuario?.nome || '-'}
</Text>

<Text style={styles.info}>
{sinistro?.usuario?.cargo || '-'}
</Text>

</View>


<TouchableOpacity

style={styles.botaoPdf}

onPress={gerarPDF}

>

<Text style={styles.botaoTexto}>
📄 Gerar PDF
</Text>

</TouchableOpacity>


<TouchableOpacity

style={styles.botaoSalvar}

onPress={salvarAtualizacao}

disabled={loading}

>

<Text style={styles.botaoTexto}>

{loading
? 'Salvando...'
: 'Salvar Atualização'}

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

titulo:{
fontSize:32,
fontWeight:'bold',
color:'#E53935'
},

sub:{
fontSize:16,
color:'#666',
marginTop:6,
marginBottom:25
},

card:{
backgroundColor:'#fff',
padding:20,
borderRadius:24,
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

label:{
fontSize:18,
fontWeight:'bold',
marginBottom:12,
color:'#111'
},

valor:{
fontSize:18,
color:'#333'
},

texto:{
fontSize:16,
lineHeight:24,
color:'#444'
},

badge:{
alignSelf:'flex-start',
paddingHorizontal:16,
paddingVertical:10,
borderRadius:12
},

badgeTexto:{
color:'#fff',
fontWeight:'bold',
textTransform:'uppercase'
},

statusRow:{
flexDirection:'row',
justifyContent:'space-between',
gap:10
},

statusBtn:{
flex:1,
height:52,
borderRadius:14,
justifyContent:'center',
alignItems:'center',
opacity:0.5
},

statusAtivo:{
opacity:1
},

statusTexto:{
color:'#fff',
fontWeight:'bold'
},

statusAtual:{
marginTop:18,
padding:14,
borderRadius:14,
alignItems:'center'
},

statusAtualTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:16,
textTransform:'uppercase'
},

input:{
backgroundColor:'#F7F7F7',
borderRadius:16,
padding:18,
minHeight:140,
fontSize:16,
textAlignVertical:'top',
color:'#111'
},

imagem:{
width:'100%',
height:240,
borderRadius:18,
marginBottom:15
},

info:{
marginTop:8,
fontSize:15,
color:'#666'
},

botaoPdf:{
backgroundColor:'#021B49',
height:60,
borderRadius:18,
justifyContent:'center',
alignItems:'center',
marginBottom:15
},

botaoSalvar:{
backgroundColor:'#E53935',
height:60,
borderRadius:18,
justifyContent:'center',
alignItems:'center',
marginBottom:60
},

botaoTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:18
}

});