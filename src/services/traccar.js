import axios from 'axios';

const api = axios.create({
  baseURL:
    'https://gettraccardevices-2r6flvkjna-uc.a.run.app',
});

export async function buscarVeiculosTraccar() {
  try {

    const response = await api.get('/');

    return response.data;

  } catch (error) {

    console.log(error);

    return [];

  }
}