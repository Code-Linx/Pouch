import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: { email, password },
    });
    if (res.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/dash');
      }, 1500);
    }
  } catch (err) {
    showAlert('err', err.response.data.message);
  }
};
