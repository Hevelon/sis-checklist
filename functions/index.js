const { onCall, HttpsError } =
require('firebase-functions/v2/https');

const admin =
require('firebase-admin');

const axios =
require('axios');

admin.initializeApp();

const firestore =
admin.firestore();


// ==========================================
// BUSCAR PERFIL
// ==========================================

async function buscarPerfil(uid) {

const snap =
await firestore
.collection('usuarios')
.doc(uid)
.get();

if (!snap.exists) {

throw new HttpsError(
'permission-denied',
'Usuario sem perfil cadastrado.'
);

}

return {

uid,

empresaId:
snap.data().empresaId || 'default',

...snap.data()

};

}


// ==========================================
// VALIDAR ADMIN
// ==========================================

function exigirAdminOuSupervisor(perfil) {

if (

perfil?.nivel !== 'admin' &&
perfil?.nivel !== 'supervisor'

) {

throw new HttpsError(

'permission-denied',
'Acesso permitido apenas para admin ou supervisor.'

);

}

}


// ==========================================
// AUTENTICAR
// ==========================================

async function autenticarAdminOuSupervisor(auth) {

if (!auth?.uid) {

throw new HttpsError(
'unauthenticated',
'Faca login para continuar.'
);

}

const perfil =
await buscarPerfil(auth.uid);

exigirAdminOuSupervisor(perfil);

return perfil;

}


// ==========================================
// BUSCAR VEICULOS TRACCAR
// ==========================================

exports.getTraccarDevices =
onCall(async (request) => {

const perfil =
await autenticarAdminOuSupervisor(
request.auth
);

try {


// ==========================================
// BUSCAR EMPRESA
// ==========================================

const empresaSnap =
await firestore
.collection('empresas')
.doc(perfil.empresaId)
.get();

if(!empresaSnap.exists){

throw new HttpsError(
'not-found',
'Empresa nao encontrada.'
);

}

const empresa =
empresaSnap.data();


// ==========================================
// VALIDAR TRACCAR
// ==========================================

if(

!empresa?.traccarUrl ||
!empresa?.traccarUser ||
!empresa?.traccarPassword

){

throw new HttpsError(

'failed-precondition',
'Credenciais do Traccar nao configuradas.'

);

}


// ==========================================
// AUTH TRACCAR
// ==========================================

const auth = {

username:
empresa.traccarUser,

password:
empresa.traccarPassword

};


// ==========================================
// REQUESTS
// ==========================================

const [devices, positions] =
await Promise.all([

axios.get(
`${empresa.traccarUrl}/api/devices`,
{
auth
}
),

axios.get(
`${empresa.traccarUrl}/api/positions`,
{
auth
}
)

]);


// ==========================================
// RETORNO
// ==========================================

return devices.data.map((device) => {

const position =
positions.data.find(
(p) =>
p.deviceId === device.id
);

return {

...device,

empresaId:
perfil.empresaId,

position:
position || null

};

});

} catch (e) {

console.log(
e.response?.data || e
);

throw new HttpsError(
'internal',
'Erro ao buscar veiculos no Traccar.'
);

}

});


// ==========================================
// CRIAR USUARIO APP
// ==========================================

exports.createAppUser =
onCall(async (request) => {

const perfil =
await autenticarAdminOuSupervisor(
request.auth
);

const {

nome,
email,
telefone = '',
cargo = '',
nivel = 'motorista',
senha

} = request.data || {};


// ==========================================
// VALIDACOES
// ==========================================

if (!nome || !email || !senha) {

throw new HttpsError(

'invalid-argument',
'Nome, email e senha sao obrigatorios.'

);

}

if (senha.length < 6) {

throw new HttpsError(

'invalid-argument',
'A senha deve ter no minimo 6 caracteres.'

);

}

const niveisPermitidos =
[
'admin',
'supervisor',
'operador',
'motorista'
];

if (!niveisPermitidos.includes(nivel)) {

throw new HttpsError(

'invalid-argument',
'Nivel de acesso invalido.'

);

}

if (

perfil.nivel !== 'admin' &&

(
nivel === 'admin' ||
nivel === 'supervisor'
)

) {

throw new HttpsError(

'permission-denied',
'Apenas administradores podem criar admin ou supervisor.'

);

}


// ==========================================
// CRIAR USUARIO FIREBASE AUTH
// ==========================================

try {

const usuarioCriado =
await admin.auth().createUser({

email:
email.trim(),

password:
senha,

displayName:
nome.trim()

});


// ==========================================
// PERFIL FIRESTORE
// ==========================================

await firestore
.collection('usuarios')
.doc(usuarioCriado.uid)
.set({

uid:
usuarioCriado.uid,

empresaId:
perfil.empresaId,

nome:
nome.trim(),

email:
email.trim(),

telefone:
telefone.trim(),

cargo:
cargo.trim(),

nivel,

createdAt:
admin.firestore.FieldValue.serverTimestamp(),

createdBy:
request.auth.uid

});


// ==========================================
// RETORNO
// ==========================================

return {

uid:
usuarioCriado.uid

};

} catch (e) {

console.log(e);

throw new HttpsError(

'internal',
e.message || 'Erro ao criar usuario.'

);

}

});