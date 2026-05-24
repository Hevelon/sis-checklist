import React from 'react';

import AppRoutes
from './src/navigation/AppRoutes';

import {
AuthProvider
} from './src/context/AuthContext';

export default function App(){

return(

<AuthProvider>

<AppRoutes />

</AuthProvider>

)

}
import {
registerTranslation,
pt
} from 'react-native-paper-dates';

registerTranslation(
'pt',
pt
);