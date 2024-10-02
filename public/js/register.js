import axios from 'axios';

import { showAlert } from './alert';

export const register = async (
  firstName,
  lastName,
  userName,
  email,
  DOB,
  password,
  passwordConfirm
) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/register',
      data: {
        firstName,
        lastName,
        userName,
        email,
        DOB,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Sign up successfull!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
