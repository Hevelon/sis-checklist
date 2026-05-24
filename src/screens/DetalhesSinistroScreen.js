import React,{
useState
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

export default function DetalhesSinistroScreen({

route,
navigation

}){


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
// SALVAR
// ==========================================

async function salvarAtualizacao(){

try{

setLoading(true);

await updateDoc(

doc(
db,
'sinistros',
sinistro.id
),

{

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


{/* ========================================== */}
{/* TÍTULO */}
{/* ========================================== */}

<Text style={styles.titulo}>
🚨 Detalhes do Sinistro
</Text>

<Text style={styles.sub}>
Gestão operacional da ocorrência
</Text>


{/* ========================================== */}
{/* PLACA */}
{/* ========================================== */}

<View style={styles.card}>

<Text style={styles.label}>
Placa
</Text>

<Text style={styles.valor}>
🚗 {sinistro?.placa || '-'}
</Text>

</View>


{/* ========================================== */}
{/* MOTORISTA */}
{/* ========================================== */}

<View style={styles.card}>

<Text style={styles.label}>
Motorista
</Text>

<Text style={styles.valor}>
👤 {sinistro?.motorista || '-'}
</Text>

</View>


{/* ========================================== */}
{/* DATA */}
{/* ========================================== */}

<View style={styles.card}>

<Text style={styles.label}>
Data
</Text>

<Text style={styles.valor}>
📅 {sinistro?.dataOcorrencia || '-'}
</Text>

</View>


{/* ========================================== */}
{/* LOCAL */}
{/* ========================================== */}

<View style={styles.card}>

<Text style={styles.label}>
Local
</Text>

<Text style={styles.valor}>
📍 {sinistro?.local || '-'}
</Text>

</View>


{/* ========================================== */}
{/* DESCRIÇÃO */}
{/* ========================================== */}

<View style={styles.card}>

<Text style={styles.label}>
Descrição
</Text>

<Text style={styles.texto}>
{sinistro?.descricao || '-'}
</Text>

</View>


{/* ========================================== */}
{/* SEVERIDADE */}
{/* ========================================== */}

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


{/* ========================================== */}
{/* STATUS */}
{/* ========================================== */}

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


{/* ========================================== */}
{/* OBSERVAÇÕES */}
{/* ========================================== */}

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


{/* ========================================== */}
{/* FOTOS */}
{/* ========================================== */}

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


{/* ========================================== */}
{/* RESPONSÁVEL */}
{/* ========================================== */}

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


{/* ========================================== */}
{/* SALVAR */}
{/* ========================================== */}

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
fontSize:34,
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
borderRadius:22,
marginBottom:18
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
borderRadius:16,
marginBottom:15
},

info:{
marginTop:8,
fontSize:15,
color:'#666'
},

botaoSalvar:{
backgroundColor:'#0A1E40',
height:60,
borderRadius:16,
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