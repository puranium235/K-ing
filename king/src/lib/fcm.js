import { client } from './axios';

export const postFcmToken = async (token) => {
  try {
    const res = await client.post('/fcm/register', token);
    return res;
  } catch (err) {
    console.error(err);
  }
};
