import {
buscarVeiculosTraccar as buscarVeiculosTraccarCallable
} from './functions';

export async function buscarVeiculosTraccar() {

try {

const response =
await buscarVeiculosTraccarCallable();

return response.data;

} catch (error) {

console.log(error);

return [];

}

}
