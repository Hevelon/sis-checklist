import React from 'react';

import AppRoutes
from './src/navigation/AppRoutes';

import {
AuthProvider
} from './src/context/AuthContext';

import {
SafeAreaProvider
} from 'react-native-safe-area-context';

export default function App(){

return(

<SafeAreaProvider>

<AuthProvider>

<AppRoutes />

</AuthProvider>

</SafeAreaProvider>

)

}
