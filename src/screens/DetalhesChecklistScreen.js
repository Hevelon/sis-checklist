import React from 'react';

import {
View,
Text,
StyleSheet,
ScrollView,
Image
} from 'react-native';

export default function DetalhesChecklistScreen({

route

}){

const { checklist } = route.params;

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

// ✅ Compatibilidade com
// checklist novo e antigo

const placa=

checklist.veiculo?.placa ||

checklist.placa ||

'-';

const marca=

checklist.veiculo?.marca ||

'';

const modelo=

checklist.veiculo?.modelo ||

'';

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
👤 Responsável:
{' '}
{

typeof checklist.usuario === 'object'

? checklist.usuario?.nome || '-'

: checklist.usuario || '-'

}
</Text>

<Text style={styles.info}>
🧰 Cargo:
{' '}
{

typeof checklist.usuario === 'object'

? checklist.usuario?.cargo || '-'

: '-'

}
</Text>

<Text style={styles.info}>
📅 Data:
{' '}
{formatarData(checklist.data)}
</Text>

</View>

<Text style={styles.subtitulo}>
Itens Inspecionados
</Text>

{Object.keys(
checklist.respostas || {}
).map((item,index)=>{

const status=
checklist.respostas[item];

return(

<View
key={index}
style={styles.item}
>

<View style={styles.topoItem}>

<Text style={styles.nome}>
{item}
</Text>

<View
style={[

styles.status,

status==='ok'
&& styles.ok,

status==='alerta'
&& styles.alerta,

status==='ruim'
&& styles.ruim

]}
>

<Text style={styles.statusTexto}>

{status==='ok'
&& 'OK'}

{status==='alerta'
&& 'ALERTA'}

{status==='ruim'
&& 'PROBLEMA'}

</Text>

</View>

</View>

{checklist.problemas?.[item] &&(

<View style={styles.problemaBox}>

<Text style={styles.problemaTitulo}>
Defeito:
</Text>

<Text style={styles.problemaTexto}>
{checklist.problemas[item]}
</Text>

</View>

)}

{checklist.fotos?.[item] &&(

<Image
source={{
uri:checklist.fotos[item]
}}
style={styles.imagem}
/>

)}

</View>

)

})}

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

titulo:{
fontSize:30,
fontWeight:'bold',
marginTop:50,
marginBottom:25,
color:'#111'
},

cardTopo:{
backgroundColor:'#fff',
padding:20,
borderRadius:16,
marginBottom:25
},

placa:{
fontSize:32,
fontWeight:'bold',
color:'#0A1E40',
marginBottom:8
},

modelo:{
fontSize:18,
color:'#666',
marginBottom:15
},

info:{
fontSize:16,
color:'#444',
marginBottom:8
},

subtitulo:{
fontSize:24,
fontWeight:'bold',
marginBottom:20,
color:'#111'
},

item:{
backgroundColor:'#fff',
padding:18,
borderRadius:15,
marginBottom:18
},

topoItem:{
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center'
},

nome:{
fontSize:18,
fontWeight:'bold',
color:'#111',
flex:1,
paddingRight:10
},

status:{
paddingHorizontal:15,
paddingVertical:8,
borderRadius:30
},

ok:{
backgroundColor:'#66D37E'
},

alerta:{
backgroundColor:'#F2D046'
},

ruim:{
backgroundColor:'#FF7A7A'
},

statusTexto:{
fontWeight:'bold',
color:'#111'
},

problemaBox:{
marginTop:15,
backgroundColor:'#FFF5F5',
padding:15,
borderRadius:12
},

problemaTitulo:{
fontWeight:'bold',
marginBottom:5,
color:'#B00020'
},

problemaTexto:{
color:'#333',
lineHeight:22
},

imagem:{
width:'100%',
height:220,
borderRadius:14,
marginTop:15
}

});