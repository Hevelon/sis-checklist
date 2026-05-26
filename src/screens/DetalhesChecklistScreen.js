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
// DATA
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
// DADOS
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

const motorista =

typeof checklist.usuario === 'object'
? checklist.usuario?.nome || '-'
: checklist.usuario || '-';


// ==========================================
// STATUS
// ==========================================

const respostas =
Object.entries(
checklist.respostas || {}
);

const totalOk =
respostas.filter(
([,v]) => v === 'ok'
).length;

const totalAlerta =
respostas.filter(
([,v]) => v === 'alerta'
).length;

const totalNc =
respostas.filter(
([,v]) =>
v === 'ruim' ||
v === 'nc'
).length;

const totalNa =
respostas.filter(
([,v]) => v === 'na'
).length;


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

const avarias=[];


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

let imagem = foto;

if(
foto.startsWith('file:')
){

imagem =
await imagemParaBase64(foto);

}

if(imagem){

imagensHtml.push(`

<div class="foto-card">

<img
src="${imagem}"
class="foto"
/>

<div class="foto-legenda">
${item}
</div>

</div>

`);

}

}

}


// ==========================================
// AVARIAS
// ==========================================

respostas.forEach(([item,status])=>{

if(
status === 'alerta' ||
status === 'ruim' ||
status === 'nc'
){

avarias.push(`

<div class="avaria-item">

<div class="avaria-badge">
${status.toUpperCase()}
</div>

<div class="avaria-texto">
${item}
</div>

</div>

`);

}

});


// ==========================================
// COLUNAS
// ==========================================

const metade =
Math.ceil(
respostas.length / 2
);

const coluna1 =
respostas.slice(0, metade);

const coluna2 =
respostas.slice(metade);


// ==========================================
// LINHAS
// ==========================================

function renderLinha(
[item,status],
index
){

let classe='ok';
let texto='OK';

if(status==='alerta'){

classe='alerta';
texto='ATENÇÃO';

}

if(
status==='ruim' ||
status==='nc'
){

classe='nc';
texto='N/C';

}

if(status==='na'){

classe='na';
texto='N/A';

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

<span class="badge ${classe}">
${texto}
</span>

</td>

</tr>

`;

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
margin:6px;
}

body{

font-family:Arial;

background:#F1F5F9;

margin:0;

padding:0;

color:#1E293B;

font-size:10px;

}

.page{
padding:6px;
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

border-radius:16px;

padding:12px 16px;

display:flex;

justify-content:space-between;

align-items:center;

color:#fff;

margin-bottom:8px;

}

.header-left{
display:flex;
align-items:center;
}

.logo{

width:54px;
height:54px;

background:#fff;

border-radius:14px;

display:flex;

justify-content:center;

align-items:center;

font-size:30px;

margin-right:12px;

}

.header-title{
font-size:22px;
font-weight:bold;
}

.header-subtitle{
font-size:10px;
opacity:0.8;
margin-top:2px;
}

.header-right{
text-align:right;
font-size:10px;
}

.tipo{

display:inline-block;

margin-top:5px;

background:#22C55E;

padding:5px 12px;

border-radius:7px;

font-size:10px;

font-weight:bold;

}


/* ====================================== */
/* VEICULO */
/* ====================================== */

.veiculo{

background:#fff;

border-radius:16px;

padding:12px;

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:8px;

border:1px solid #E2E8F0;

}

.veiculo-left{
display:flex;
align-items:center;
}

.car{
font-size:48px;
margin-right:12px;
}

.placa{
font-size:28px;
font-weight:bold;
color:#02112D;
}

.modelo{
font-size:11px;
margin-top:2px;
color:#64748B;
}

.info-grid{
display:flex;
gap:14px;
}

.info-box{

background:#F8FAFC;

padding:8px 12px;

border-radius:10px;

text-align:center;

min-width:95px;

}

.info-label{
font-size:9px;
font-weight:bold;
color:#64748B;
margin-bottom:2px;
}

.info-value{
font-size:14px;
font-weight:bold;
color:#0F172A;
}


/* ====================================== */
/* STATUS */
/* ====================================== */

.cards{
display:flex;
gap:6px;
margin-bottom:8px;
}

.card{

flex:1;

padding:10px;

border-radius:12px;

color:#fff;

text-align:center;

}

.card.ok{
background:#16A34A;
}

.card.alerta{
background:#EAB308;
color:#111827;
}

.card.nc{
background:#DC2626;
}

.card.na{
background:#64748B;
}

.card.total{
background:#2563EB;
}

.card-title{
font-size:9px;
font-weight:bold;
}

.card-num{
font-size:24px;
font-weight:bold;
margin-top:4px;
}


/* ====================================== */
/* CONTENT */
/* ====================================== */

.content{
display:flex;
gap:8px;
}

.left{
width:69%;
}

.right{
width:31%;
}


/* ====================================== */
/* BOX */
/* ====================================== */

.box{

background:#fff;

border-radius:14px;

overflow:hidden;

margin-bottom:8px;

border:1px solid #E2E8F0;

}

.box-header{

background:#0B2D72;

padding:8px 10px;

font-size:11px;

font-weight:bold;

color:#fff;

}

.box-content{
padding:8px;
}


/* ====================================== */
/* CHECKLIST */
/* ====================================== */

.duas-colunas{
display:flex;
gap:8px;
}

.duas-colunas table{
width:50%;
border-collapse:collapse;
}

tr:nth-child(even){
background:#F8FAFC;
}

td{
padding:5px;
font-size:9px;
border-bottom:1px solid #EDF2F7;
}

.numero{
width:24px;
font-weight:bold;
color:#64748B;
}

.item{
font-weight:bold;
color:#0F172A;
}

.status{
width:60px;
text-align:center;
}

.badge{

display:inline-block;

padding:4px 6px;

border-radius:6px;

font-size:8px;

font-weight:bold;

min-width:50px;

color:#fff;

}

.badge.ok{
background:#16A34A;
}

.badge.alerta{
background:#EAB308;
color:#111827;
}

.badge.nc{
background:#DC2626;
}

.badge.na{
background:#64748B;
}


/* ====================================== */
/* AVARIAS */
/* ====================================== */

.avaria-item{

display:flex;

align-items:center;

justify-content:space-between;

padding:8px;

background:#FEF2F2;

border-radius:10px;

margin-bottom:6px;

border-left:4px solid #DC2626;

}

.avaria-badge{

background:#DC2626;

color:#fff;

padding:4px 8px;

border-radius:6px;

font-size:8px;

font-weight:bold;

}

.avaria-texto{

font-size:9px;

font-weight:bold;

color:#7F1D1D;

margin-left:8px;

flex:1;

}


/* ====================================== */
/* FOTOS */
/* ====================================== */

.foto-grid{
display:flex;
flex-wrap:wrap;
gap:6px;
}

.foto-card{
width:48%;
}

.foto{

width:100%;

height:82px;

object-fit:cover;

border-radius:10px;

border:2px solid #E2E8F0;

}

.foto-legenda{

font-size:8px;

font-weight:bold;

margin-top:3px;

text-align:center;

color:#334155;

}


/* ====================================== */
/* OBS */
/* ====================================== */

.obs{

background:#FFF8E7;

padding:10px;

border-radius:10px;

font-size:9px;

line-height:14px;

color:#334155;

}


/* ====================================== */
/* ASS */
/* ====================================== */

.assinaturas{
display:flex;
justify-content:space-between;
margin-top:6px;
}

.ass{
width:45%;
text-align:center;
}

.ass-line{

border-top:
1px solid #64748B;

padding-top:5px;

margin-top:18px;

font-size:9px;

font-weight:bold;

}


/* ====================================== */
/* FOOTER */
/* ====================================== */

.footer{

margin-top:4px;

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

<div class="header-title">
SIS CHECKLIST
</div>

<div class="header-subtitle">
RELATÓRIO PROFISSIONAL DE INSPEÇÃO
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
MOTORISTA
</div>

<div class="info-value">
${motorista}
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
TIPO
</div>

<div class="info-value">
${checklist.tipoExecucao || '-'}
</div>

</div>

</div>

</div>


<!-- STATUS -->

<div class="cards">

<div class="card ok">

<div class="card-title">
OK
</div>

<div class="card-num">
${totalOk}
</div>

</div>

<div class="card alerta">

<div class="card-title">
ATENÇÃO
</div>

<div class="card-num">
${totalAlerta}
</div>

</div>

<div class="card nc">

<div class="card-title">
N/C
</div>

<div class="card-num">
${totalNc}
</div>

</div>

<div class="card na">

<div class="card-title">
N/A
</div>

<div class="card-num">
${totalNa}
</div>

</div>

<div class="card total">

<div class="card-title">
TOTAL
</div>

<div class="card-num">
${respostas.length}
</div>

</div>

</div>


<!-- CONTENT -->

<div class="content">


<!-- LEFT -->

<div class="left">

<div class="box">

<div class="box-header">
✔ CHECKLIST COMPLETO
</div>

<div class="box-content">

<div class="duas-colunas">

<table>

${coluna1.map(
(item,index)=>
renderLinha(
item,
index
)
).join('')}

</table>

<table>

${coluna2.map(
(item,index)=>
renderLinha(
item,
index + metade
)
).join('')}

</table>

</div>

</div>

</div>

</div>


<!-- RIGHT -->

<div class="right">


<!-- AVARIAS -->

<div class="box">

<div class="box-header">
🚨 AVARIAS
</div>

<div class="box-content">

${avarias.join('') || 'Nenhuma avaria encontrada'}

</div>

</div>


<!-- FOTOS -->

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


<!-- OBS -->

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


<!-- ASS -->

<div class="box">

<div class="box-header">
✍ ASSINATURAS
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
// PDF
// ==========================================

const { uri } =
await Print.printToFileAsync({
html
});


// ==========================================
// SHARE
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
// SCREEN
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
👤 {motorista}
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
📄 GERAR PDF
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
backgroundColor:'#F1F5F9'
},

content:{
padding:20
},

titulo:{
fontSize:32,
fontWeight:'bold',
marginTop:50,
marginBottom:20,
color:'#02112D'
},

cardTopo:{

backgroundColor:'#fff',

padding:20,

borderRadius:18,

shadowColor:'#000',

shadowOpacity:0.05,

shadowRadius:8,

elevation:3

},

placa:{
fontSize:32,
fontWeight:'bold',
marginBottom:10,
color:'#02112D'
},

modelo:{
fontSize:20,
marginBottom:15,
color:'#64748B'
},

info:{
fontSize:16,
marginBottom:8,
color:'#334155'
},

pdfBtn:{

backgroundColor:'#02112D',

height:58,

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