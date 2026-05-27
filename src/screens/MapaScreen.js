import React,{
useEffect,
useRef,
useState,
useMemo
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
Marker
} from 'react-native-maps';

import {
Ionicons,
MaterialIcons,
FontAwesome5
} from '@expo/vector-icons';

import {
buscarVeiculosTraccar
} from '../services/functions';

const{
width,
height
}=Dimensions.get('window');


// ==========================================
// GOOGLE GEOCODER
// ==========================================

async function buscarEndereco(
latitude,
longitude
){

try{

const response = await fetch(

`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=SUA_API_KEY_GOOGLE`

);

const data = await response.json();

if(
data.results &&
data.results.length > 0
){

return data.results[0]
.formatted_address
.split(',')
.slice(0,3)
.join(',');

}

return 'Endereço não encontrado';

}catch(e){

console.log(e);

return 'Erro ao buscar endereço';

}

}


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

const[
mapType,
setMapType
]=useState('standard');

const[
mostrarLayers,
setMostrarLayers
]=useState(false);


// ==========================================
// LOAD MAPA
// ==========================================

async function carregarMapa(){

try{

const response =
await buscarVeiculosTraccar();

const lista =

Array.isArray(response?.data)
? response.data
: [];


// ==========================================
// PRIMEIRA CARGA
// ==========================================

if(veiculos.length===0){

setVeiculos(lista);

setLoading(false);

return;

}


// ==========================================
// ATUALIZA SOMENTE POSIÇÕES
// ==========================================

setVeiculos((anteriores)=>{

const atualizados =

anteriores.map((veiculoAnterior)=>{

const novo = lista.find(

(v)=>

String(v.id) ===
String(veiculoAnterior.id)

);

if(!novo){

return veiculoAnterior;

}

return{

...veiculoAnterior,

position:novo.position,

status:novo.status,

lastUpdate:novo.lastUpdate,

driver:novo.driver

};

});


// ==========================================
// NOVOS VEÍCULOS
// ==========================================

lista.forEach((novo)=>{

const existe =

atualizados.find(

(v)=>

String(v.id) ===
String(novo.id)

);

if(!existe){

atualizados.push(novo);

}

});

return atualizados;

});

}catch(e){

console.log(e);

Alert.alert(
'Erro',
'Erro ao carregar mapa'
);

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

},10000);

return()=>clearInterval(interval);

},[]);


// ==========================================
// CENTRALIZA VEÍCULO
// ==========================================

useEffect(()=>{

if(
veiculoId &&
veiculos.length>0
){

const encontrado =

veiculos.find(

(v)=>

String(v.id)
===
String(veiculoId)

);

if(

encontrado?.position?.latitude &&
encontrado?.position?.longitude

){

setVeiculoSelecionado(
encontrado
);

setTimeout(()=>{

mapRef.current
?.animateToRegion({

latitude:Number(
encontrado.position.latitude
),

longitude:Number(
encontrado.position.longitude
),

latitudeDelta:0.005,
longitudeDelta:0.005

});

},700);

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

veiculoSelecionado.name || 'Veículo',

`Status:
${veiculoSelecionado.status || '-'}

Velocidade:
${Math.round(
(Number(
veiculoSelecionado.position?.speed
)||0)*1.852
)} km/h

Ignição:
${veiculoSelecionado.position?.attributes?.ignition
? 'Ligada'
: 'Desligada'}

Movimento:
${veiculoSelecionado.position?.attributes?.motion
? 'Em movimento'
: 'Parado'}

Latitude:
${veiculoSelecionado.position?.latitude || '-'}

Longitude:
${veiculoSelecionado.position?.longitude || '-'}

Endereço:
${veiculoSelecionado.endereco ||
'Não disponível'}
`

);

}


// ==========================================
// PRIMEIRA REGIÃO
// ==========================================

const primeiroValido =

useMemo(()=>{

return veiculos.find(

(v)=>

v?.position?.latitude &&
v?.position?.longitude

);

},[veiculos]);


const initialRegion =

primeiroValido?.position

? {

latitude:Number(
primeiroValido.position.latitude
),

longitude:Number(
primeiroValido.position.longitude
),

latitudeDelta:0.008,
longitudeDelta:0.008

}

: {

latitude:-12.5797,
longitude:-38.0045,

latitudeDelta:0.008,
longitudeDelta:0.008

};


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

);

}


// ==========================================
// RENDER
// ==========================================

return(

<View style={styles.container}>


<MapView

ref={mapRef}

style={styles.map}

mapType={mapType}

initialRegion={initialRegion}

showsUserLocation

showsTraffic

>

{veiculos.map((item)=>{

if(

!item?.position?.latitude ||

!item?.position?.longitude

){

return null;

}


const online =

item.status === 'online' ||

item?.position?.attributes?.motion ||

item?.position?.attributes?.ignition;


return(

<Marker

tracksViewChanges={false}

key={item.id}

coordinate={{

latitude:Number(
item.position.latitude
),

longitude:Number(
item.position.longitude
)

}}

onPress={()=>{

setVeiculoSelecionado(item);

}}

>

<View style={[

styles.marker,

{
backgroundColor:
online
? '#22C55E'
: '#FF3B30'
}

]}>

<FontAwesome5
name="truck"
size={18}
color="#fff"
/>

</View>

</Marker>

);

})}

</MapView>


{/* ====================================== */}
{/* TOP BAR */}
{/* ====================================== */}

<View style={styles.topBar}>


<TouchableOpacity

style={styles.topBtn}

onPress={()=>
navigation.goBack()
}

>

<Ionicons
name="arrow-back"
size={24}
color="#111"
/>

</TouchableOpacity>


<View style={styles.titleBox}>

<Text style={styles.title}>
Mapa da Frota
</Text>

</View>

</View>


{/* ====================================== */}
{/* FLOAT BUTTONS */}
{/* ====================================== */}

<View style={styles.floatButtons}>


<TouchableOpacity

style={styles.floatBtn}

onPress={()=>
setMostrarLayers(
!mostrarLayers
)
}

>

<MaterialIcons
name="layers"
size={24}
color="#111"
/>

</TouchableOpacity>


<TouchableOpacity

style={styles.floatBtn}

onPress={()=>{

if(
veiculoSelecionado?.position
){

mapRef.current
?.animateToRegion({

latitude:Number(
veiculoSelecionado.position.latitude
),

longitude:Number(
veiculoSelecionado.position.longitude
),

latitudeDelta:0.005,
longitudeDelta:0.005

});

}

}}

>

<Ionicons
name="locate"
size={24}
color="#111"
/>

</TouchableOpacity>


<TouchableOpacity

style={styles.floatBtn}

onPress={carregarMapa}

>

<Ionicons
name="refresh"
size={24}
color="#111"
/>

</TouchableOpacity>

</View>


{/* ====================================== */}
{/* MAP TYPES */}
{/* ====================================== */}

{mostrarLayers &&(

<View style={styles.layersBox}>


<TouchableOpacity

style={styles.layerItem}

onPress={()=>{

setMapType('standard');
setMostrarLayers(false);

}}

>

<Text style={styles.layerText}>
Padrão
</Text>

</TouchableOpacity>


<TouchableOpacity

style={styles.layerItem}

onPress={()=>{

setMapType('satellite');
setMostrarLayers(false);

}}

>

<Text style={styles.layerText}>
Satélite
</Text>

</TouchableOpacity>


<TouchableOpacity

style={styles.layerItem}

onPress={()=>{

setMapType('hybrid');
setMostrarLayers(false);

}}

>

<Text style={styles.layerText}>
Híbrido
</Text>

</TouchableOpacity>

</View>

)}


{/* ====================================== */}
{/* CARD VEÍCULO */}
{/* ====================================== */}

{veiculoSelecionado &&(

<View style={styles.card}>


<Text style={styles.nome}>
🚛 {veiculoSelecionado.name}
</Text>


<View style={[
styles.infoRow,
{
paddingRight:10
}
]}>

<Text style={styles.label}>
📍 Endereço:
</Text>

{veiculoSelecionado.endereco ? (

<Text style={styles.infoText}>

{veiculoSelecionado.endereco}

</Text>

) : (

<TouchableOpacity

onPress={async()=>{

const endereco =

await buscarEndereco(

veiculoSelecionado.position.latitude,
veiculoSelecionado.position.longitude

);

setVeiculoSelecionado({

...veiculoSelecionado,

endereco

});

}}

>

<Text style={styles.linkEndereco}>
Mostrar endereço
</Text>

</TouchableOpacity>

)}

</View>


<Text style={styles.info}>

👨‍✈️ Motorista:
{' '}

{veiculoSelecionado.driver?.name ||
veiculoSelecionado.position?.attributes?.driverUniqueId ||
'Não identificado'}

</Text>


<Text style={styles.info}>

⚡ Velocidade:
{' '}

{Math.round(
(Number(
veiculoSelecionado.position?.speed
)||0)*1.852
)}

 km/h

</Text>


<Text style={styles.info}>

🟢 Status:
{' '}

{veiculoSelecionado.status}

</Text>


<Text style={styles.info}>

🔑 Ignição:
{' '}

{veiculoSelecionado.position?.attributes?.ignition
? 'Ligada'
: 'Desligada'}

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

);

}


const styles = StyleSheet.create({

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
marginTop:10,
fontSize:18,
fontWeight:'500'
},

topBar:{
position:'absolute',
top:60,
left:20,
right:20,

flexDirection:'row',
alignItems:'center'
},

topBtn:{
width:52,
height:52,
borderRadius:16,

backgroundColor:'#fff',

justifyContent:'center',
alignItems:'center',

elevation:5
},

titleBox:{
flex:1,

height:52,

backgroundColor:'#fff',

marginLeft:12,

borderRadius:16,

justifyContent:'center',

paddingHorizontal:18,

elevation:5
},

title:{
fontSize:18,
fontWeight:'bold'
},

floatButtons:{
position:'absolute',
right:20,
top:140
},

floatBtn:{
width:52,
height:52,

borderRadius:16,

backgroundColor:'#fff',

justifyContent:'center',
alignItems:'center',

marginBottom:12,

elevation:5
},

layersBox:{
position:'absolute',

right:82,
top:140,

backgroundColor:'#fff',

borderRadius:16,

paddingVertical:10,

elevation:5
},

layerItem:{
paddingHorizontal:18,
paddingVertical:14
},

layerText:{
fontSize:16
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

card:{
position:'absolute',

left:20,
right:20,
bottom:40,

backgroundColor:'#fff',

borderRadius:24,

padding:20,

elevation:5
},

nome:{
fontSize:22,
fontWeight:'bold',
marginBottom:12
},

info:{
fontSize:16,
marginBottom:8
},

infoRow:{
marginBottom:10
},

label:{
fontSize:16,
fontWeight:'600',
marginBottom:4
},

infoText:{
fontSize:15,
color:'#333',
lineHeight:22,
flexShrink:1
},

linkEndereco:{
fontSize:16,
color:'#22C55E',
fontWeight:'bold'
},

detailsBtn:{
backgroundColor:'#1565F9',

height:52,

borderRadius:16,

justifyContent:'center',
alignItems:'center',

marginTop:15
},

detailsText:{
color:'#fff',
fontWeight:'bold',
fontSize:17
}

});