import {
httpsCallable
} from 'firebase/functions';

import {
functions
} from './firebase';

export const criarUsuarioApp =
httpsCallable(
functions,
'createAppUser'
);

export const buscarVeiculosTraccar =
httpsCallable(
functions,
'getTraccarDevices'
);
