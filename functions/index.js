const { onRequest } =
require('firebase-functions/v2/https');

const axios =
require('axios');

exports.getTraccarDevices =
onRequest(async (req, res) => {

try {

const [devices, positions] =

await Promise.all([

axios.get(
'https://sisitconnect.com/api/devices',
{
auth:{
username:'comercial@sisitconnect.com',
password:'Team152014'
}
}
),

axios.get(
'https://sisitconnect.com/api/positions',
{
auth:{
username:'comercial@sisitconnect.com',
password:'Team152014'
}
}
)

]);

const veiculos =

devices.data.map((device)=>{

const posicao =

positions.data.find(

(p)=>
p.deviceId === device.id

);

return {

...device,

position:
posicao || null

};

});

res.json(veiculos);

}catch(e){

console.log(e.response?.data || e);

res.status(500).json({

erro:
e.response?.data || 'Erro'

});

}

});