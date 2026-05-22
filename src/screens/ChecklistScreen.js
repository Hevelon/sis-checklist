import React, {
useState,
useEffect,
useContext
} from 'react';

import {
View,
Text,
StyleSheet,
TextInput,
TouchableOpacity,
ScrollView,
ActivityIndicator,
Alert
} from 'react-native';

import {
collection,
getDocs,
query,
where,
addDoc,
serverTimestamp,
doc,
getDoc
} from 'firebase/firestore';

import {
db
} from '../services/firebase';

import {
AuthContext
} from '../context/AuthContext';

export default function ChecklistScreen(){

const{
usuario
}=useContext(AuthContext);

const[
placa,
setPlaca
]=useState('');

const[
veiculo,
setVeiculo
]=useState(null);

const[
modeloChecklist,
setModeloChecklist
]=useState(null);

const[
loading,
setLoading
]=useState(false);

const[
respostas,
setRespostas
]=useState({});

const[
observacoes,
setObservacoes
]=useState({});

const[
observacaoGeral,
setObservacaoGeral
]=useState('');

async function buscarVeiculo(){

if(!placa){

Alert.alert(
'Atenção',
'Digite a placa'
);

return;

}

try{

setLoading(true);

const q=query(

collection(
db,
'veiculos'
),

where(
'placa',
'==',
placa.toUpperCase()
)

);

const querySnapshot=
await getDocs(q);

if(querySnapshot.empty){

Alert.alert(
'Erro',
'Veículo não encontrado'
);

setVeiculo(null);

setModeloChecklist(null);

return;

}

const dados=
querySnapshot.docs[0].data();

setVeiculo(dados);

let tipo='leve';

if(
dados.tipo
){

tipo=
dados.tipo.toLowerCase();

}

const modeloRef=
doc(
db,
'modelosChecklist',
tipo === 'pesado'
? 'veiculo_pesado'
: tipo === 'granel'
? 'granel_liquido'
: 'veiculo_leve'
);

const modeloSnap=
await getDoc(modeloRef);

if(modeloSnap.exists()){

const modelo=
modeloSnap.data();

setModeloChecklist(modelo);

const respostasIniciais={};

modelo.itens.forEach((item)=>{

respostasIniciais[item]='ok';

});

setRespostas(
respostasIniciais
);

}

}catch(e){

console.log(e);

Alert.alert(
'Erro',
'Erro ao buscar veículo'
);

}finally{

setLoading(false);

}

}

function alterarResposta(
item,
valor
){

setRespostas((prev)=>({

...prev,

[item]:valor

}));

}

function alterarObservacao(
item,
texto
){

setObservacoes((prev)=>({

...prev,

[item]:texto

}));

}

async function salvarChecklist(){

if(!veiculo){

Alert.alert(
'Atenção',
'Busque um veículo'
);

return;

}

try{

setLoading(true);

await addDoc(
collection(
db,
'checklists'
),
{

veiculo,

usuario:{

uid:usuario.uid,

nome:usuario.nome,

cargo:usuario.cargo

},

tipoChecklist:
modeloChecklist?.tipo || '',

respostas,

problemas:
observacoes,

observacaoGeral,

status:'concluido',

data:
serverTimestamp()

}
);

Alert.alert(
'Sucesso',
'Checklist salvo'
);

setPlaca('');

setVeiculo(null);

setModeloChecklist(null);

setRespostas({});

setObservacoes({});

setObservacaoGeral('');

}catch(e){

console.log(e);

Alert.alert(
'Erro',
'Erro ao salvar checklist'
);

}finally{

setLoading(false);

}

}

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
Novo Checklist
</Text>

<Text style={styles.subtitulo}>
Inspeção inteligente da frota
</Text>

<TextInput
style={styles.input}
placeholder="Placa do veículo"
placeholderTextColor="#777"
autoCapitalize="characters"
value={placa}
onChangeText={setPlaca}
/>

<TouchableOpacity
style={styles.buscarBtn}
onPress={buscarVeiculo}
disabled={loading}
>

<Text style={styles.buscarTexto}>

{loading
? 'Buscando...'
: 'Buscar Veículo'}

</Text>

</TouchableOpacity>

{veiculo &&(

<View style={styles.veiculoBox}>

<Text style={styles.veiculoPlaca}>
🚗 {veiculo.placa}
</Text>

<Text style={styles.veiculoInfo}>
Modelo: {veiculo.modelo}
</Text>

<Text style={styles.veiculoInfo}>
Tipo: {veiculo.tipo || 'leve'}
</Text>

</View>

)}

{modeloChecklist &&(

<>

<Text style={styles.secao}>
Checklist
</Text>

{modeloChecklist.itens.map((item,index)=>(

<View
key={index}
style={styles.card}
>

<Text style={styles.itemTitulo}>
{item}
</Text>

<View style={styles.botoes}>

<TouchableOpacity

style={[

styles.statusBtn,

respostas[item]==='ok'
&& styles.ok

]}

onPress={()=>

alterarResposta(
item,
'ok'
)

}

>

<Text style={styles.statusTexto}>
✔
</Text>

</TouchableOpacity>

<TouchableOpacity

style={[

styles.statusBtn,

respostas[item]==='alerta'
&& styles.alerta

]}

onPress={()=>

alterarResposta(
item,
'alerta'
)

}

>

<Text style={styles.statusTexto}>
⚠
</Text>

</TouchableOpacity>

<TouchableOpacity

style={[

styles.statusBtn,

respostas[item]==='ruim'
&& styles.ruim

]}

onPress={()=>

alterarResposta(
item,
'ruim'
)

}

>

<Text style={styles.statusTexto}>
✖
</Text>

</TouchableOpacity>

</View>

{respostas[item] !== 'ok' &&(

<TextInput
style={styles.obs}
placeholder="Observações / defeitos"
placeholderTextColor="#777"
multiline
value={
observacoes[item] || ''
}
onChangeText={(t)=>

alterarObservacao(
item,
t
)

}
/>

)}

</View>

))}

<Text style={styles.secao}>
Observação Geral
</Text>

<TextInput
style={styles.obsGrande}
placeholder="Digite observações gerais..."
placeholderTextColor="#777"
multiline
value={observacaoGeral}
onChangeText={setObservacaoGeral}
/>

<TouchableOpacity
style={styles.salvarBtn}
onPress={salvarChecklist}
disabled={loading}
>

<Text style={styles.salvarTexto}>

{loading
? 'Salvando...'
: 'Salvar Checklist'}

</Text>

</TouchableOpacity>

</>

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
paddingTop:50,
paddingBottom:50,
width:'100%',
maxWidth:700,
alignSelf:'center'
},

titulo:{
fontSize:38,
fontWeight:'bold',
color:'#111'
},

subtitulo:{
fontSize:18,
color:'#666',
marginTop:5,
marginBottom:25
},

input:{
backgroundColor:'#fff',
height:60,
borderRadius:16,
paddingHorizontal:18,
fontSize:17,
marginBottom:15,
color:'#111'
},

buscarBtn:{
backgroundColor:'#0A1E40',
height:60,
borderRadius:16,
justifyContent:'center',
alignItems:'center',
marginBottom:25
},

buscarTexto:{
color:'#fff',
fontSize:20,
fontWeight:'bold'
},

veiculoBox:{
backgroundColor:'#fff',
padding:20,
borderRadius:20,
marginBottom:25
},

veiculoPlaca:{
fontSize:28,
fontWeight:'bold',
color:'#111'
},

veiculoInfo:{
fontSize:16,
color:'#555',
marginTop:8
},

secao:{
fontSize:28,
fontWeight:'bold',
marginBottom:20,
color:'#111'
},

card:{
backgroundColor:'#fff',
padding:20,
borderRadius:20,
marginBottom:18
},

itemTitulo:{
fontSize:22,
fontWeight:'bold',
marginBottom:20,
color:'#111'
},

botoes:{
flexDirection:'row',
justifyContent:'space-between'
},

statusBtn:{
width:90,
height:90,
borderRadius:20,
justifyContent:'center',
alignItems:'center',
backgroundColor:'#EEE'
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
fontSize:42,
fontWeight:'bold',
color:'#222'
},

obs:{
backgroundColor:'#F8F8F8',
borderRadius:15,
padding:15,
marginTop:18,
fontSize:16,
color:'#111',
minHeight:100,
textAlignVertical:'top'
},

obsGrande:{
backgroundColor:'#fff',
borderRadius:18,
padding:18,
minHeight:140,
fontSize:16,
marginBottom:25,
textAlignVertical:'top',
color:'#111'
},

salvarBtn:{
backgroundColor:'#2CC36B',
height:65,
borderRadius:18,
justifyContent:'center',
alignItems:'center',
marginBottom:40
},

salvarTexto:{
color:'#fff',
fontSize:22,
fontWeight:'bold'
}

});