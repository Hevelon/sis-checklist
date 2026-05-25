import React from 'react';

import {
View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
Alert
} from 'react-native';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function DetalhesChecklistScreen({ route }) {

const { checklist } = route.params;


// ==========================================
// FORMATAR DATA
// ==========================================

function formatarData(data){

if(!data) return '';

if(data.seconds){

return new Date(
data.seconds * 1000
).toLocaleString('pt-BR');

}

return new Date(data)
.toLocaleString('pt-BR');

}


// ==========================================
// VEICULO
// ==========================================

const placa =
checklist.veiculo?.placa ||
checklist.placa ||
'-';

const marca =
checklist.veiculo?.marca ||
'';

const modelo =
checklist.veiculo?.modelo ||
'';


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
// PDF
// ==========================================

async function gerarPDF(){

try{

const imagensHtml=[];


// ==========================================
// FOTOS
// ==========================================

for(const item in checklist.fotos || {}){

const fotos =

Array.isArray(
checklist.fotos[item]
)

? checklist.fotos[item]

: [checklist.fotos[item]];

for(const foto of fotos){

if(!foto) continue;

let imagem=foto;

if(
foto.startsWith('file:')
){

imagem =
await imagemParaBase64(foto);

}

if(imagem){

imagensHtml.push(`

<div class="foto-card">

<div class="foto-title">
${item}
</div>

<img
src="${imagem}"
class="foto"
/>

</div>

`);

}

}

}


// ==========================================
// HTML
// ==========================================

const html = `

<html>

<head>

<meta charset="utf-8"/>

<style>

*{
box-sizing:border-box;
}

@page{
size:A4 landscape;
margin:8px;
}

body{
font-family:Arial;
background:#F4F6FA;
margin:0;
padding:0;
color:#1E293B;
font-size:10px;
}

.page{
width:100%;
}

.header{

background:#0B1F52;

color:#fff;

padding:10px 14px;

border-radius:10px;

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:8px;

}

.header-left{
display:flex;
align-items:center;
}

.logo{
font-size:28px;
margin-right:10px;
}

.title{
font-size:18px;
font-weight:bold;
}

.subtitle{
font-size:10px;
opacity:0.9;
margin-top:2px;
}

.header-right{
text-align:right;
font-size:10px;
}

.tipo{

background:#22C55E;

padding:4px 10px;

border-radius:6px;

font-weight:bold;

display:inline-block;

margin-top:5px;

}

.veiculo{

background:#fff;

border-radius:10px;

padding:10px;

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:8px;

border:1px solid #DDE5EF;

}

.veiculo-left{
display:flex;
align-items:center;
}

.car{
font-size:34px;
margin-right:10px;
}

.placa{
font-size:20px;
font-weight:bold;
}

.modelo{
font-size:11px;
margin-top:2px;
}

.info-grid{
display:flex;
gap:18px;
}

.info-box{
font-size:10px;
}

.info-label{
font-weight:bold;
color:#64748B;
}

.info-value{
font-size:13px;
font-weight:bold;
margin-top:2px;
}

.cards{
display:flex;
gap:6px;
margin-bottom:8px;
}

.card{

flex:1;

background:#fff;

border-radius:8px;

padding:8px;

text-align:center;

border-top:4px solid #ccc;

}

.card-ok{
border-color:#22C55E;
}

.card-alerta{
border-color:#FACC15;
}

.card-nc{
border-color:#EF4444;
}

.card-na{
border-color:#9CA3AF;
}

.card-total{
border-color:#3B82F6;
}

.card-title{
font-size:10px;
font-weight:bold;
margin-bottom:3px;
}

.card-num{
font-size:20px;
font-weight:bold;
}

.content{
display:flex;
gap:8px;
}

.left{
width:68%;
}

.right{
width:32%;
}

.box{

background:#fff;

border-radius:10px;

overflow:hidden;

border:1px solid #DDE5EF;

margin-bottom:8px;

}

.box-header{

background:#0B1F52;

color:#fff;

padding:6px 10px;

font-size:12px;

font-weight:bold;

}

.box-content{
padding:8px;
}

.duas-colunas{

display:flex;

gap:10px;

}

.duas-colunas table{

width:50%;

}

table{
width:100%;
border-collapse:collapse;
}

tr{
border-bottom:1px solid #EDF2F7;
}

td{
padding:4px;
font-size:9px;
}

.numero{
width:22px;
font-weight:bold;
}

.item{
font-weight:bold;
}

.status{
text-align:center;
width:60px;
}

.badge{

display:inline-block;

padding:3px 6px;

border-radius:5px;

font-size:8px;

font-weight:bold;

color:#fff;

min-width:48px;

}

.ok{
background:#22C55E;
}

.alerta{
background:#FACC15;
color:#111827;
}

.nc{
background:#EF4444;
}

.na{
background:#9CA3AF;
}

.foto-grid{
display:flex;
flex-wrap:wrap;
gap:6px;
}

.foto-card{
width:48%;
}

.foto-title{
font-size:9px;
font-weight:bold;
margin-bottom:3px;
}

.foto{
width:100%;
height:70px;
object-fit:cover;
border-radius:6px;
border:1px solid #E5E7EB;
}

.obs{
background:#FFF8E7;
padding:8px;
border-radius:6px;
line-height:14px;
font-size:9px;
}

.assinaturas{
display:flex;
justify-content:space-between;
margin-top:15px;
}

.ass{
width:45%;
text-align:center;
}

.ass-line{
border-top:1px solid #94A3B8;
padding-top:4px;
margin-top:20px;
font-size:9px;
font-weight:bold;
}

.footer{
margin-top:6px;
text-align:center;
font-size:8px;
color:#64748B;
}

</style>

</head>

<body>

<div class="page">


<!-- HEADER -->

<div class="header">

<div class="header-left">

<div class="logo">
✅
</div>

<div>

<div class="title">
SIS CHECKLIST
</div>

<div class="subtitle">
RELATÓRIO DE INSPEÇÃO VEICULAR
</div>

</div>

</div>

<div class="header-right">

<div>
📅 ${formatarData(checklist.data)}
</div>

<div style="margin-top:3px;">
🆔 ${checklist.id || '-'}
</div>

<div class="tipo">
${checklist.tipoExecucao || 'SAÍDA'}
</div>

</div>

</div>


<!-- VEICULO -->

<div class="veiculo">

<div class="veiculo-left">

<div class="car">
🚘
</div>

<div>

<div class="placa">
${placa}
</div>

<div class="modelo">
${marca} ${modelo}
</div>

</div>

</div>

<div class="info-grid">

<div class="info-box">
<div class="info-label">
Motorista
</div>
<div class="info-value">
${
typeof checklist.usuario === 'object'
? checklist.usuario?.nome || '-'
: checklist.usuario || '-'
}
</div>
</div>

<div class="info-box">
<div class="info-label">
KM
</div>
<div class="info-value">
${checklist.km || 0}
</div>
</div>

<div class="info-box">
<div class="info-label">
Tipo
</div>
<div class="info-value">
${checklist.tipoExecucao || '-'}
</div>
</div>

</div>

</div>


<!-- STATUS -->

<div class="cards">

<div class="card card-ok">

<div class="card-title">
OK
</div>

<div class="card-num">
${Object.values(checklist.respostas || {}).filter((v)=>v==='ok').length}
</div>

</div>

<div class="card card-alerta">

<div class="card-title">
ATENÇÃO
</div>

<div class="card-num">
${Object.values(checklist.respostas || {}).filter((v)=>v==='alerta').length}
</div>

</div>

<div class="card card-nc">

<div class="card-title">
N/C
</div>

<div class="card-num">
${Object.values(checklist.respostas || {}).filter((v)=>v==='ruim'||v==='nc').length}
</div>

</div>

<div class="card card-na">

<div class="card-title">
N/A
</div>

<div class="card-num">
${Object.values(checklist.respostas || {}).filter((v)=>v==='na').length}
</div>

</div>

<div class="card card-total">

<div class="card-title">
TOTAL
</div>

<div class="card-num">
${Object.keys(checklist.respostas || {}).length}
</div>

</div>

</div>


<!-- CONTENT -->

<div class="content">


<!-- LEFT -->

<div class="left">

<div class="box">

<div class="box-header">
CHECKLIST
</div>

<div class="box-content">

${(() => {

const respostas =
Object.entries(
checklist.respostas || {}
);

const metade =
Math.ceil(
respostas.length / 2
);

const coluna1 =
respostas.slice(0, metade);

const coluna2 =
respostas.slice(metade);

function renderizarLinha(
[item,status],
index
){

let badge='ok';

if(status==='alerta'){
badge='alerta';
}

if(
status==='ruim' ||
status==='nc'
){
badge='nc';
}

if(status==='na'){
badge='na';
}

return `

<tr>

<td class="numero">
${index+1}
</td>

<td class="item">
${item}
</td>

<td class="status">

<span class="badge ${badge}">
${status.toUpperCase()}
</span>

</td>

</tr>

`;

}

return `

<div class="duas-colunas">

<table>

${coluna1.map(
(item,index)=>
renderizarLinha(
item,
index
)
).join('')}

</table>

<table>

${coluna2.map(
(item,index)=>
renderizarLinha(
item,
index + metade
)
).join('')}

</table>

</div>

`;

})()}

</div>

</div>

</div>


<!-- RIGHT -->

<div class="right">

<div class="box">

<div class="box-header">
📸 FOTOS
</div>

<div class="box-content">

<div class="foto-grid">

${imagensHtml.join('') || 'Sem fotos'}

</div>

</div>

</div>

<div class="box">

<div class="box-header">
📝 OBSERVAÇÕES
</div>

<div class="box-content">

<div class="obs">

${checklist.observacaoGeral || 'Sem observações'}

</div>

</div>

</div>

<div class="box">

<div class="box-header">
✍️ ASSINATURAS
</div>

<div class="box-content">

<div class="assinaturas">

<div class="ass">

<div class="ass-line">
Motorista
</div>

</div>

<div class="ass">

<div class="ass-line">
Supervisor
</div>

</div>

</div>

</div>

</div>

</div>

</div>

<div class="footer">

Documento gerado automaticamente pelo SIS CHECKLIST

</div>

</div>

</body>

</html>

`;


// ==========================================
// GERAR PDF
// ==========================================

const { uri } =
await Print.printToFileAsync({
html
});


// ==========================================
// COMPARTILHAR
// ==========================================

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
// RENDER
// ==========================================

return(

<View style={styles.container}>

<ScrollView>

<View style={styles.content}>

<Text style={styles.titulo}>
Detalhes Checklist
</Text>

<View style={styles.cardTopo}>

<Text style={styles.placa}>
🚗 {placa}
</Text>

<Text style={styles.modelo}>
{marca} {modelo}
</Text>

<Text style={styles.info}>
👤 {
typeof checklist.usuario === 'object'
? checklist.usuario?.nome || '-'
: checklist.usuario || '-'
}
</Text>

<Text style={styles.info}>
📋 {checklist.tipoExecucao || '-'}
</Text>

<Text style={styles.info}>
🛣️ KM: {checklist.km || 0}
</Text>

</View>

<TouchableOpacity
style={styles.pdfBtn}
onPress={gerarPDF}
>

<Text style={styles.pdfTexto}>
📄 Gerar PDF
</Text>

</TouchableOpacity>

</View>

</ScrollView>

</View>

)

}


const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:'#EEF2F7'
},

content:{
padding:20
},

titulo:{
fontSize:32,
fontWeight:'bold',
marginTop:50,
marginBottom:20,
color:'#041B4D'
},

cardTopo:{
backgroundColor:'#fff',
padding:20,
borderRadius:18
},

placa:{
fontSize:32,
fontWeight:'bold',
marginBottom:10
},

modelo:{
fontSize:20,
marginBottom:15
},

info:{
fontSize:16,
marginBottom:8
},

pdfBtn:{
backgroundColor:'#041B4D',
height:55,
borderRadius:16,
justifyContent:'center',
alignItems:'center',
marginTop:25
},

pdfTexto:{
color:'#fff',
fontSize:18,
fontWeight:'bold'
}

});