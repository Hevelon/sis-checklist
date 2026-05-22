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

const Stack=
createNativeStackNavigator();

export default function AppRoutes(){

const{
usuario,
loading
}=useContext(AuthContext);

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

return(

<NavigationContainer>

<Stack.Navigator
screenOptions={{
headerShown:false
}}
>

{usuario ? (

<>

<Stack.Screen
name="Principal"
component={BottomTabs}
/>

<Stack.Screen
name="CadastrarUsuario"
component={CadastrarUsuarioScreen}
/>

<Stack.Screen
name="CadastrarVeiculo"
component={CadastrarVeiculoScreen}
/>

<Stack.Screen
name="DetalhesChecklist"
component={DetalhesChecklistScreen}
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