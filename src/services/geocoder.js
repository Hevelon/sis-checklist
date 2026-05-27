export async function buscarEndereco(
latitude,
longitude
){

try{

const response = await fetch(

`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=SUA_API_KEY`

);

const data = await response.json();

if(
data.results &&
data.results.length > 0
){

return data.results[0].formatted_address;

}

return 'Endereço não encontrado';

}catch(e){

console.log(e);

return 'Erro ao buscar endereço';

}

}