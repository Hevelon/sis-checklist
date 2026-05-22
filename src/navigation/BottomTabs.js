import React, {
  useContext
} from 'react';

import {
  createBottomTabNavigator
} from '@react-navigation/bottom-tabs';

import {
  Ionicons
} from '@expo/vector-icons';

import DashboardScreen
from '../screens/DashboardScreen';

import ChecklistScreen
from '../screens/ChecklistScreen';

import HistoricoScreen
from '../screens/HistoricoScreen';

import UsuariosScreen
from '../screens/UsuariosScreen';

import FrotaScreen
from '../screens/FrotaScreen';

import {
  AuthContext
} from '../context/AuthContext';

import VeiculosScreen
from '../screens/VeiculosScreen';

const Tab =
createBottomTabNavigator();

export default function BottomTabs() {

  const {
    usuario
  } = useContext(AuthContext);

  if (!usuario) {

    return null;

  }

  const isAdmin =

    usuario.nivel === 'admin' ||

    usuario.nivel === 'supervisor';

  function getIcon(routeName) {

    if (routeName === 'Home') {
      return 'home';
    }

    if (routeName === 'Checklist') {
      return 'clipboard';
    }

    if (routeName === 'Histórico') {
      return 'time';
    }

    if (routeName === 'Usuários') {
      return 'people';
    }

    if (routeName === 'Frota') {
      return 'car-sport';
    }

    if (routeName === 'Veículos') {
  return 'car';
}

    return 'ellipse';
  }

  return (

    <Tab.Navigator

      screenOptions={({ route }) => ({

        headerShown: false,

        tabBarActiveTintColor: '#0A1E40',

        tabBarInactiveTintColor: '#999',

        tabBarStyle: {
          height: 70,
          paddingBottom: 8,
          paddingTop: 5
        },

        tabBarLabelStyle: {
          fontSize: 12
        },

        tabBarIcon: ({
          color,
          size
        }) => (

          <Ionicons
            name={getIcon(route.name)}
            size={size}
            color={color}
          />

        )

      })}

    >

      {isAdmin && (

        <Tab.Screen
          name="Home"
          component={DashboardScreen}
        />

      )}

      <Tab.Screen
        name="Checklist"
        component={ChecklistScreen}
      />

      <Tab.Screen
        name="Histórico"
        component={HistoricoScreen}
      />

      <Tab.Screen
        name="Frota"
        component={FrotaScreen}
      />

      <Tab.Screen
name="Veículos"
component={VeiculosScreen}
/>

      {isAdmin && (

        <Tab.Screen
          name="Usuários"
          component={UsuariosScreen}
        />

      )}

    </Tab.Navigator>

  );

}