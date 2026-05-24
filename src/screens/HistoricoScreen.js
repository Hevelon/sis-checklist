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
TextInput,
KeyboardAvoidingView,
Platform,
TouchableWithoutFeedback,
Keyboard
} from 'react-native';

import {
DatePickerModal
} from 'react-native-paper-dates';

import {
useFocusEffect
} from '@react-navigation/native';

import {
collection,
getDocs,
query,
orderBy
} from 'firebase/firestore';

import {
db
} from '../services/firebase';

import {
AuthContext
} from '../context/AuthContext';

export default function HistoricoScreen({

navigation

}){

const{
usuario
}=useContext(AuthContext);


// ==========================================
// STATES
// ==========================================

const[
checklists,
setChecklists
]=useState([]);

const[
placaFiltro,
setPlacaFiltro
]=useState('');

const[
dataFiltro,
setDataFiltro
]=useState('');

const[
dataSelecionada,
setDataSelecionada
]=useState(null);

const[
openCalendario,
setOpenCalendario
]=useState(false);


// ==========================================
// CARREGAR CHECKLISTS
// ==========================================

useFocusEffect(

useCallback(()=>{

buscarChecklists();

},[])

);


// ==========================================
// BUSCAR CHECKLISTS
// ==========================================

async function buscarChecklists(){

try{

const q=query(

collection(
db,
'checklists'
),

orderBy(
'data',
'desc'
)

);

const querySnapshot=
await getDocs(q);

const lista=[];

querySnapshot.forEach((doc)=>{

lista.push({

id:doc.id,
...doc.data()

});

});

let filtrados=lista;


// ==========================================
// FILTRO DE USUÁRIO
// ==========================================

if(
usuario?.nivel !== 'admin' &&
usuario?.nivel !== 'supervisor'
){

filtrados=

lista.filter((item)=>

item.usuario?.uid === usuario?.uid

);

}

setChecklists(filtrados);

}catch(e){

console.log(e);

}

}


// ==========================================
// FILTROS
// ==========================================

const listaFiltrada=

checklists.filter((item)=>{

const placa=

item.veiculo?.placa
?.toLowerCase() || '';

const data=

item.data?.toDate()
.toLocaleDateString('pt-BR')
.toLowerCase();

const buscaPlaca=
placaFiltro.toLowerCase();

const buscaData=
dataFiltro.toLowerCase();

return(

placa.includes(buscaPlaca)

) &&

data.includes(buscaData);

});


// ==========================================
// RENDER
// ==========================================

return(

<TouchableWithoutFeedback
onPress={Keyboard.dismiss}
>

<KeyboardAvoidingView

style={styles.container}

behavior={
Platform.OS==='ios'
? 'padding'
: 'height'
}

>

<ScrollView
showsVerticalScrollIndicator={false}
keyboardShouldPersistTaps="handled"
nestedScrollEnabled={true}
contentContainerStyle={{
paddingBottom:120
}}
>

<View style={styles.content}>


<Text style={styles.titulo}>
Histórico
</Text>


{/* ========================================== */}
{/* BUSCA PLACA */}
{/* ========================================== */}

<TextInput

style={styles.input}

placeholder="Filtrar placa"

placeholderTextColor="#777"

value={placaFiltro}

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

setPlacaFiltro(valor);

}}

/>


{/* ========================================== */}
{/* CAMPO DATA ESTILO ERP */}
{/* ========================================== */}

<View style={styles.dataContainer}>

<TextInput

style={styles.inputData}

placeholder="Filtrar data"

placeholderTextColor="#777"

value={dataFiltro}

onChangeText={setDataFiltro}

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


{/* ========================================== */}
{/* MODAL CALENDÁRIO */}
{/* ========================================== */}

<DatePickerModal

locale="pt"

mode="single"

visible={openCalendario}

onDismiss={()=>setOpenCalendario(false)}

date={
dataSelecionada || new Date()
}

onConfirm={({date})=>{

setOpenCalendario(false);

setDataSelecionada(date);

setDataFiltro(

date.toLocaleDateString('pt-BR')

);

}}

/>


{/* ========================================== */}
{/* LISTA */}
{/* ========================================== */}

{listaFiltrada.map((item)=>(

<View
key={item.id}
style={styles.card}
>

<Text style={styles.placa}>
🚗 {item.veiculo?.placa || '-'}
</Text>


<View style={styles.infoBox}>


<Text style={styles.info}>
👤 {

typeof item.usuario === 'object'

? item.usuario?.nome || '-'

: item.usuario || '-'

}
</Text>


<Text style={styles.info}>
🧰 {

typeof item.usuario === 'object'

? item.usuario?.cargo || '-'

: '-'

}
</Text>


<Text style={styles.info}>
📅 {

item.data?.toDate()
.toLocaleString('pt-BR')

}
</Text>


<Text style={styles.info}>
⚠ Problemas: {

Object.values(
item.respostas || {}
).filter(

(v)=>

v === 'ruim'
||
v === 'nc'

).length

}
</Text>

</View>


<TouchableOpacity

style={styles.botao}

onPress={()=>

navigation.navigate(

'DetalhesChecklist',

{

checklist:item

}

)

}

>

<Text style={styles.botaoTexto}>
Ver detalhes
</Text>

</TouchableOpacity>

</View>

))}


{/* ========================================== */}
{/* VAZIO */}
{/* ========================================== */}

{listaFiltrada.length === 0 &&(

<View style={styles.vazio}>

<Text style={styles.vazioTexto}>
Nenhum checklist encontrado
</Text>

</View>

)}

</View>

</ScrollView>

</KeyboardAvoidingView>

</TouchableWithoutFeedback>

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
paddingBottom:100,
width:'100%',
maxWidth:600,
alignSelf:'center'
},

titulo:{
fontSize:34,
fontWeight:'bold',
marginBottom:30,
color:'#111'
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

card:{
backgroundColor:'#fff',
padding:22,
borderRadius:22,
marginBottom:18
},

placa:{
fontSize:28,
fontWeight:'bold',
color:'#111',
marginBottom:15
},

infoBox:{
marginBottom:22
},

info:{
fontSize:18,
color:'#444',
marginBottom:8
},

botao:{
backgroundColor:'#0A1E40',
height:58,
borderRadius:15,
justifyContent:'center',
alignItems:'center'
},

botaoTexto:{
color:'#fff',
fontWeight:'bold',
fontSize:20
},

vazio:{
padding:40,
alignItems:'center'
},

vazioTexto:{
fontSize:18,
color:'#777'
}

});