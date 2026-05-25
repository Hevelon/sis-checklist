import React,{ useContext } from 'react';

import {
View,
ActivityIndicator,
StyleSheet
} from 'react-native';

import {
NavigationContainer
} from '@react-navigation/native';

import {
createNativeStackNavigator
} from '@react-navigation/native-stack';

import {
AuthContext
} from '../context/AuthContext';


// ==========================================
// TABS
// ==========================================

import BottomTabs
from './BottomTabs';


// ==========================================
// TELAS
// ==========================================

import LoginScreen
from '../screens/LoginScreen';

import RegistrarSinistroScreen
from '../screens/RegistrarSinistroScreen';

import DetalhesSinistroScreen
from '../screens/DetalhesSinistroScreen';

import CadastrarUsuarioScreen
from '../screens/CadastrarUsuarioScreen';

import CadastrarVeiculoScreen
from '../screens/CadastrarVeiculoScreen';

import DetalhesChecklistScreen
from '../screens/DetalhesChecklistScreen';

import UsuariosScreen
from '../screens/UsuariosScreen';

import VeiculosScreen
from '../screens/VeiculosScreen';


const Stack =
createNativeStackNavigator();

export default function AppRoutes(){

const{
usuario,
loading
}=useContext(AuthContext);

if(loading){

return(

<View style={styles.loading}>

<ActivityIndicator
size="large"
color="#0A1E40"
/>

</View>

);

}


// ==========================================
// LOGIN
// ==========================================

if(!usuario){

return(

<NavigationContainer>

<Stack.Navigator
screenOptions={{
headerShown:false
}}
>

<Stack.Screen
name="Login"
component={LoginScreen}
/>

</Stack.Navigator>

</NavigationContainer>

);

}


// ==========================================
// SISTEMA
// ==========================================

return(

<NavigationContainer>

<Stack.Navigator

initialRouteName="Main"

screenOptions={{

headerShown:false

}}

>

{/* ====================================== */}
{/* TABS */}
{/* ====================================== */}

<Stack.Screen
name="Main"
component={BottomTabs}
/>


{/* ====================================== */}
{/* CHECKLIST */}
{/* ====================================== */}

<Stack.Screen
name="DetalhesChecklist"
component={DetalhesChecklistScreen}
/>


{/* ====================================== */}
{/* SINISTROS */}
{/* ====================================== */}

<Stack.Screen
name="RegistrarSinistro"
component={RegistrarSinistroScreen}
/>

<Stack.Screen
name="DetalhesSinistro"
component={DetalhesSinistroScreen}
/>


{/* ====================================== */}
{/* USUÁRIOS */}
{/* ====================================== */}

<Stack.Screen
name="CadastrarUsuario"
component={CadastrarUsuarioScreen}
/>

<Stack.Screen
name="Usuarios"
component={UsuariosScreen}
/>


{/* ====================================== */}
{/* VEÍCULOS */}
{/* ====================================== */}

<Stack.Screen
name="CadastrarVeiculo"
component={CadastrarVeiculoScreen}
/>

<Stack.Screen
name="Veiculos"
component={VeiculosScreen}
/>

</Stack.Navigator>

</NavigationContainer>

);

}

const styles =
StyleSheet.create({

loading:{
flex:1,
justifyContent:'center',
alignItems:'center',
backgroundColor:'#F3F5F8'
}

});
