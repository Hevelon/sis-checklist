import React,{
useContext
} from 'react';

import {
NavigationContainer
} from '@react-navigation/native';

import {
createNativeStackNavigator
} from '@react-navigation/native-stack';

import {
View,
ActivityIndicator
} from 'react-native';

import {
AuthContext
} from '../context/AuthContext';


// ==========================================
// TELAS
// ==========================================

import LoginScreen
from '../screens/LoginScreen';

import BottomTabs
from './BottomTabs';

import CadastrarUsuarioScreen
from '../screens/CadastrarUsuarioScreen';

import CadastrarVeiculoScreen
from '../screens/CadastrarVeiculoScreen';

import DetalhesChecklistScreen
from '../screens/DetalhesChecklistScreen';


// ==========================================
// SINISTROS
// ==========================================

import RegistrarSinistroScreen
from '../screens/RegistrarSinistroScreen';

import SinistrosScreen
from '../screens/SinistrosScreen';

import DetalhesSinistroScreen
from '../screens/DetalhesSinistroScreen';


// ==========================================
// STACK
// ==========================================

const Stack=
createNativeStackNavigator();


// ==========================================
// APP ROUTES
// ==========================================

export default function AppRoutes(){

const{
usuario,
loading
}=useContext(AuthContext);


// ==========================================
// LOADING
// ==========================================

if(loading){

return(

<View
style={{
flex:1,
justifyContent:'center',
alignItems:'center'
}}
>

<ActivityIndicator
size="large"
color="#2CC36B"
/>

</View>

)

}


// ==========================================
// RENDER
// ==========================================

return(

<NavigationContainer>

<Stack.Navigator
screenOptions={{
headerShown:false
}}
>

{usuario ? (

<>


{/* ========================================== */}
{/* PRINCIPAL */}
{/* ========================================== */}

<Stack.Screen
name="Principal"
component={BottomTabs}
/>


{/* ========================================== */}
{/* USUÁRIOS */}
{/* ========================================== */}

<Stack.Screen
name="CadastrarUsuario"
component={CadastrarUsuarioScreen}
/>


{/* ========================================== */}
{/* VEÍCULOS */}
{/* ========================================== */}

<Stack.Screen
name="CadastrarVeiculo"
component={CadastrarVeiculoScreen}
/>


{/* ========================================== */}
{/* CHECKLIST */}
{/* ========================================== */}

<Stack.Screen
name="DetalhesChecklist"
component={DetalhesChecklistScreen}
/>


{/* ========================================== */}
{/* REGISTRAR SINISTRO */}
{/* ========================================== */}

<Stack.Screen
name="RegistrarSinistro"
component={RegistrarSinistroScreen}
/>


{/* ========================================== */}
{/* LISTA SINISTROS */}
{/* ========================================== */}

<Stack.Screen
name="Sinistros"
component={SinistrosScreen}
/>


{/* ========================================== */}
{/* DETALHES SINISTRO */}
{/* ========================================== */}

<Stack.Screen
name="DetalhesSinistro"
component={DetalhesSinistroScreen}
/>


</>

):(


<Stack.Screen
name="Login"
component={LoginScreen}
/>

)}

</Stack.Navigator>

</NavigationContainer>

)

}