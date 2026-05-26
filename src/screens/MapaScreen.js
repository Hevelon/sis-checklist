import React,{
useEffect,
useRef,
useState
} from 'react';

import {
View,
Text,
StyleSheet,
TouchableOpacity,
ActivityIndicator,
Dimensions,
Alert
} from 'react-native';

import MapView,{
Marker,
Polyline
} from 'react-native-maps';

import {
Ionicons,
FontAwesome5
} from '@expo/vector-icons';

import {
buscarVeiculosTraccar
} from '../services/functions';

const{
width,
height
}=Dimensions.get('window');

export default function MapaScreen({
route,
navigation
}){

const veiculoId =
route?.params?.veiculoId;

const mapRef =
useRef(null);

const[
loading,
setLoading
]=useState(true);

const[
veiculos,
setVeiculos
]=useState([]);

const[
veiculoSelecionado,
setVeiculoSelecionado
]=useState(null);


// ==========================================
// LOAD
// ==========================================

async function carregarMapa(){

try{

setLoading(true);

const response =
await buscarVeiculosTraccar();

const lista =

Array.isArray(response?.data)
? response.data
: [];

setVeiculos(lista);

}catch(e){

console.log(e);

}finally{

setLoading(false);

}

}


// ==========================================
// AUTO REFRESH
// ==========================================

useEffect(()=>{

carregarMapa();

const interval =

setInterval(()=>{

carregarMapa();

},30000);

return()=>clearInterval(interval);

},[]);


// ==========================================
// CENTRALIZA VEÍCULO
// ==========================================

useEffect(()=>{

if(
veiculoId &&
veiculos.length > 0
){

const encontrado =

veiculos.find(

(v)=>

String(v.id) ===
String(veiculoId)

);

if(
encontrado?.position
){

setVeiculoSelecionado(
encontrado
);

setTimeout(()=>{

mapRef.current
?.animateToRegion({

latitude:
encontrado.position.latitude,

longitude:
encontrado.position.longitude,

latitudeDelta:0.02,

longitudeDelta:0.02

});

},1000);

}

}

},[
veiculoId,
veiculos
]);


// ==========================================
// DETALHES
// ==========================================

function abrirDetalhes(){

if(!veiculoSelecionado){

return;

}

Alert.alert(

veiculoSelecionado.name,

`Status:
${veiculoSelecionado.status}

Velocidade:
${Math.round(
(veiculoSelecionado.position?.speed || 0)
* 1.852
)} km/h

Latitude:
${veiculoSelecionado.position?.latitude}

Longitude:
${veiculoSelecionado.position?.longitude}

Ignição:
${veiculoSelecionado.position?.attributes?.ignition
? 'Ligada'
: 'Desligada'}

Movimento:
${veiculoSelecionado.position?.attributes?.motion
? 'Em movimento'
: 'Parado'}

Endereço:
${veiculoSelecionado.position?.address ||
'Não disponível'}
`

);

}


// ==========================================
// LOADING
// ==========================================

if(loading){

return(

<View style={styles.loading}>

<ActivityIndicator
size="large"
color="#2CC36B"
/>

<Text style={styles.loadingText}>
Carregando mapa...
</Text>

</View>

)

}


// ==========================================
// REGIÃO INICIAL
// ==========================================

const initialRegion =

veiculos[0]?.position

? {

latitude:
veiculos[0].position.latitude,

longitude:
veiculos[0].position.longitude,

latitudeDelta:0.08,

longitudeDelta:0.08

}

: {

latitude:-12.5797,

longitude:-38.0045,

latitudeDelta:0.08,

longitudeDelta:0.08

};


// ==========================================
// ROTA MOCK
// ==========================================




// ==========================================
// RENDER
// ==========================================

return(

<View style={styles.container}>


<MapView

ref={mapRef}

style={styles.map}

initialRegion={initialRegion}

showsUserLocation

showsTraffic

>


{veiculos.map((item,index)=>{

if(!item.position){

return null;

}

const online =
item.status === 'online';

return(

<Marker

key={index}

coordinate={{

latitude:
item.position.latitude,

longitude:
item.position.longitude

}}

onPress={()=>{

setVeiculoSelecionado(item);

mapRef.current?.animateToRegion({

latitude:
item.position.latitude,

longitude:
item.position.longitude,

latitudeDelta:0.02,

longitudeDelta:0.02

});

}}

>

<View style={[

styles.marker,

{
backgroundColor:
online
? '#2CC36B'
: '#E53935'
}

]}>

<FontAwesome5
name="truck"
size={18}
color="#fff"
/>

</View>

</Marker>

)

})}

</MapView>


{/* ====================================== */}
{/* TOPO */}
{/* ====================================== */}

<View style={styles.topBar}>


<TouchableOpacity

style={styles.menuBtn}

onPress={()=>
navigation.goBack()
}

>

<Ionicons
name="arrow-back"
size={26}
color="#111"
/>

</TouchableOpacity>


<View style={styles.filtroBox}>

<Text style={styles.filtroTexto}>
Mapa da Frota
</Text>

</View>

</View>


{/* ====================================== */}
{/* CARD INFERIOR */}
{/* ====================================== */}

{veiculoSelecionado &&(

<View style={styles.bottomCard}>


<Text style={styles.veiculoNome}>
🚛 {veiculoSelecionado.name}
</Text>


<Text style={styles.info}>

Velocidade:
{' '}

{Math.round(
(veiculoSelecionado.position?.speed || 0)
* 1.852
)}

 km/h

</Text>


<Text style={styles.info}>

Status:
{' '}

{veiculoSelecionado.status}

</Text>


<Text style={styles.info}>

Endereço:
{' '}

{veiculoSelecionado.position?.address ||
'Não disponível'}

</Text>


<TouchableOpacity

style={styles.detailsBtn}

onPress={abrirDetalhes}

>

<Text style={styles.detailsText}>
Ver detalhes
</Text>

</TouchableOpacity>

</View>

)}

</View>

)

}


const styles=StyleSheet.create({

container:{
flex:1
},

map:{
width,
height
},

loading:{
flex:1,
justifyContent:'center',
alignItems:'center',
backgroundColor:'#F3F5F8'
},

loadingText:{
marginTop:15,
fontSize:16,
color:'#555'
},

topBar:{
position:'absolute',
top:60,
left:20,
right:20,

flexDirection:'row',
alignItems:'center'
},

menuBtn:{
width:55,
height:55,
borderRadius:18,

backgroundColor:'#fff',

justifyContent:'center',
alignItems:'center',

shadowColor:'#000',

shadowOffset:{
width:0,
height:4
},

shadowOpacity:0.1,

shadowRadius:6,

elevation:5
},

filtroBox:{
flex:1,

marginLeft:12,

height:55,

borderRadius:18,

backgroundColor:'#fff',

justifyContent:'center',

paddingHorizontal:18,

shadowColor:'#000',

shadowOffset:{
width:0,
height:4
},

shadowOpacity:0.1,

shadowRadius:6,

elevation:5
},

filtroTexto:{
fontSize:18,
fontWeight:'bold',
color:'#111'
},

marker:{
width:48,
height:48,
borderRadius:24,

justifyContent:'center',
alignItems:'center',

borderWidth:4,
borderColor:'#fff'
},

bottomCard:{
position:'absolute',

left:20,
right:20,
bottom:40,

backgroundColor:'#fff',

borderRadius:24,

padding:20,

shadowColor:'#000',

shadowOffset:{
width:0,
height:4
},

shadowOpacity:0.1,

shadowRadius:8,

elevation:6
},

veiculoNome:{
fontSize:24,
fontWeight:'bold',
marginBottom:15,
color:'#111'
},

info:{
fontSize:16,
marginBottom:10,
color:'#444'
},

detailsBtn:{
backgroundColor:'#1565F9',

height:55,

borderRadius:16,

justifyContent:'center',
alignItems:'center',

marginTop:15
},

detailsText:{
color:'#fff',
fontWeight:'bold',
fontSize:18
}

});