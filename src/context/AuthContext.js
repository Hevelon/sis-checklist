import React,{
createContext,
useEffect,
useState
} from 'react';

import {
onAuthStateChanged
} from 'firebase/auth';

import {
doc,
getDoc
} from 'firebase/firestore';

import {
auth,
db
} from '../services/firebase';

export const AuthContext=
createContext({});

export function AuthProvider({

children

}){

const[
usuario,
setUsuario
]=useState(null);

const[
loading,
setLoading
]=useState(true);

useEffect(()=>{

const unsubscribe=

onAuthStateChanged(

auth,

async(firebaseUser)=>{

if(firebaseUser){

try{

const docRef=

doc(
db,
'usuarios',
firebaseUser.uid
);

const docSnap=
await getDoc(docRef);

if(docSnap.exists()){

setUsuario({

uid:
firebaseUser.uid,

empresaId:
docSnap.data().empresaId || 'default',

...docSnap.data()

});

}else{

setUsuario(null);

}

}catch(e){

console.log(e);

setUsuario(null);

}

}else{

setUsuario(null);

}

setLoading(false);

}

);

return unsubscribe;

},[]);

return(

<AuthContext.Provider

value={{

usuario,
setUsuario,
loading

}}

>

{children}

</AuthContext.Provider>

)

}
