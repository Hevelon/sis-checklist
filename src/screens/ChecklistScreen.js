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
ActivityIndicator,
Alert,
Image
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

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
fotos,
setFotos
]=useState({});

const[
observacaoGeral,
setObservacaoGeral
]=useState('');


// ==========================================
// BUSCAR VEÍCULO
// ==========================================

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


// ==========================================
// IDENTIFICA TIPO
// ==========================================

let tipo='leve';

if(dados.categoria){

const categoria=
dados.categoria.toLowerCase();

if(categoria==='truck'){

tipo='pesado';

}else if(categoria==='car'){

tipo='leve';

}else if(categoria==='bus'){

tipo='pesado';

}else if(categoria==='granel'){

tipo='granel';

}

}


// ==========================================
// DEFINE DOCUMENTO
// ==========================================

let documentoChecklist=
'veiculo_leve';

if(tipo==='pesado'){

documentoChecklist=
'veiculo_pesado';

}

if(tipo==='granel'){

documentoChecklist=
'granel_liquido';

}


// ==========================================
// BUSCA CHECKLIST
// ==========================================

const modeloRef=
doc(
db,
'modelosChecklist',
documentoChecklist
);

const modeloSnap=
await getDoc(modeloRef);

if(!modeloSnap.exists()){

Alert.alert(
'Erro',
'Checklist não encontrado'
);

return;

}

const modelo=
modeloSnap.data();

setModeloChecklist(modelo);


// ==========================================
// RESPOSTAS INICIAIS
// ==========================================

const respostasIniciais={};

modelo.secoes?.forEach((secao)=>{

secao.itens?.forEach((item)=>{

respostasIniciais[item]='ok';

});

});

setRespostas(
respostasIniciais
);

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


// ==========================================
// ALTERAR STATUS
// ==========================================

function alterarResposta(
item,
valor
){

setRespostas((prev)=>({

...prev,

[item]:valor

}));

}


// ==========================================
// ALTERAR OBS
// ==========================================

function alterarObservacao(
item,
texto
){

setObservacoes((prev)=>({

...prev,

[item]:texto

}));

}


// ==========================================
// FOTO
// ==========================================

async function tirarFoto(item){

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

setFotos((prev)=>({

...prev,

[item]:[
...(prev[item] || []),
foto
]

}));

}


// ==========================================
// SALVAR
// ==========================================

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

fotos,

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

setFotos({});

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
Categoria: {veiculo.categoria || 'car'}
</Text>

</View>

)}


{modeloChecklist &&(

<>

<Text style={styles.secao}>
Checklist
</Text>


{modeloChecklist.secoes?.map((secao,sIndex)=>(

<View
key={sIndex}
style={styles.secaoBox}
>

<Text style={styles.secaoTitulo}>
{secao.titulo}
</Text>


{secao.itens?.map((item,index)=>(

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
OK
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
AT
</Text>

</TouchableOpacity>



<TouchableOpacity

style={[

styles.statusBtn,

respostas[item]==='nc'
&& styles.ruim

]}

onPress={()=>

alterarResposta(
item,
'nc'
)

}

>

<Text style={styles.statusTexto}>
N/C
</Text>

</TouchableOpacity>



<TouchableOpacity

style={[

styles.statusBtn,

respostas[item]==='na'
&& styles.na

]}

onPress={()=>

alterarResposta(
item,
'na'
)

}

>

<Text style={styles.statusTexto}>
N/A
</Text>

</TouchableOpacity>

</View>


{(
respostas[item]==='alerta'
||
respostas[item]==='nc'
) &&(

<>

<TextInput
style={styles.obs}
placeholder="Descreva o problema..."
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


<TouchableOpacity

style={styles.fotoBtn}

onPress={()=>

tirarFoto(item)

}

>

<Text style={styles.fotoTexto}>
📷 Adicionar Foto
</Text>

</TouchableOpacity>


{fotos[item]?.map((foto,index)=>(

<Image
key={index}
source={{uri:foto}}
style={styles.foto}
/>

))}

</>

)}

</View>

))}

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

{loading ? (

<ActivityIndicator
color="#fff"
/>

):(

<Text style={styles.salvarTexto}>
Salvar Checklist
</Text>

)}

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
padding:16,
paddingTop:40,
paddingBottom:50,
width:'100%',
maxWidth:700,
alignSelf:'center'
},

titulo:{
fontSize:32,
fontWeight:'bold',
color:'#111'
},

subtitulo:{
fontSize:16,
color:'#666',
marginTop:5,
marginBottom:20
},

input:{
backgroundColor:'#fff',
height:52,
borderRadius:14,
paddingHorizontal:16,
fontSize:16,
marginBottom:15,
color:'#111'
},

buscarBtn:{
backgroundColor:'#0A1E40',
height:52,
borderRadius:14,
justifyContent:'center',
alignItems:'center',
marginBottom:20
},

buscarTexto:{
color:'#fff',
fontSize:17,
fontWeight:'bold'
},

veiculoBox:{
backgroundColor:'#fff',
padding:18,
borderRadius:18,
marginBottom:20
},

veiculoPlaca:{
fontSize:24,
fontWeight:'bold',
color:'#111'
},

veiculoInfo:{
fontSize:15,
color:'#555',
marginTop:5
},

secao:{
fontSize:26,
fontWeight:'bold',
marginBottom:15,
color:'#111'
},

secaoBox:{
marginBottom:25
},

secaoTitulo:{
fontSize:24,
fontWeight:'bold',
marginBottom:12,
color:'#0A1E40'
},

card:{
backgroundColor:'#fff',
padding:16,
borderRadius:18,
marginBottom:14
},

itemTitulo:{
fontSize:17,
fontWeight:'bold',
marginBottom:14,
color:'#111'
},

botoes:{
flexDirection:'row',
justifyContent:'space-between'
},

statusBtn:{
width:55,
height:55,
borderRadius:14,
justifyContent:'center',
alignItems:'center',
backgroundColor:'#EEE'
},

ok:{
backgroundColor:'#2CC36B'
},

alerta:{
backgroundColor:'#F2C94C'
},

ruim:{
backgroundColor:'#EB5757'
},

na:{
backgroundColor:'#9E9E9E'
},

statusTexto:{
fontSize:16,
fontWeight:'bold',
color:'#fff'
},

obs:{
backgroundColor:'#F8F8F8',
borderRadius:14,
padding:14,
marginTop:14,
fontSize:15,
color:'#111',
minHeight:90,
textAlignVertical:'top'
},

fotoBtn:{
backgroundColor:'#0A1E40',
height:45,
borderRadius:12,
justifyContent:'center',
alignItems:'center',
marginTop:10
},

fotoTexto:{
color:'#fff',
fontWeight:'bold'
},

foto:{
width:'100%',
height:180,
borderRadius:12,
marginTop:10
},

obsGrande:{
backgroundColor:'#fff',
borderRadius:16,
padding:16,
minHeight:120,
fontSize:15,
marginBottom:25,
textAlignVertical:'top',
color:'#111'
},

salvarBtn:{
backgroundColor:'#2CC36B',
height:58,
borderRadius:16,
justifyContent:'center',
alignItems:'center',
marginBottom:40
},

salvarTexto:{
color:'#fff',
fontSize:18,
fontWeight:'bold'
}

});