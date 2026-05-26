import React, {
  useContext
} from 'react';

import {
  createBottomTabNavigator
} from '@react-navigation/bottom-tabs';

import {
  Ionicons
} from '@expo/vector-icons';

import {
  useSafeAreaInsets
} from 'react-native-safe-area-context';

import DashboardScreen
from '../screens/DashboardScreen';

import ChecklistScreen
from '../screens/ChecklistScreen';

import HistoricoScreen
from '../screens/HistoricoScreen';

import FrotaScreen
from '../screens/FrotaScreen';

import SinistrosScreen
from '../screens/SinistrosScreen';

import {
  AuthContext
} from '../context/AuthContext';

const Tab =
createBottomTabNavigator();

const TAB_LABELS = {
  Home: 'Home',
  Checklist: 'Checklist',
  Historico: 'Histórico',
  Frota: 'Frota',
  Sinistros: 'Sinistros'
};

export default function BottomTabs() {

  const insets =
    useSafeAreaInsets();

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

    if (routeName === 'Historico') {
      return 'time';
    }

    if (routeName === 'Frota') {
      return 'car-sport';
    }

    if (routeName === 'Sinistros') {
      return 'alert-circle';
    }

    return 'ellipse';
  }

  return (

    <Tab.Navigator

      screenOptions={({ route }) => ({

        headerShown: false,

        tabBarLabel: TAB_LABELS[route.name] || route.name,

        tabBarActiveTintColor: '#0A1E40',

        tabBarInactiveTintColor: '#999',

        tabBarStyle: {
          height: 70 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
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
        name="Historico"
        component={HistoricoScreen}
      />

      <Tab.Screen
        name="Frota"
        component={FrotaScreen}
      />

      {isAdmin && (

        <Tab.Screen
          name="Sinistros"
          component={SinistrosScreen}
        />

      )}

    </Tab.Navigator>

  );

}
