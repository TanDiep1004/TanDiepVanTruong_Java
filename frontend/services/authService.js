import axiosCustom from '../axiosCustom.js';

export const authService = {
  login: (credentials) => {
    return axiosCustom.post('/public/auth/login', credentials);
  },

  register: (userData) => {
    return axiosCustom.post('/public/auth/register', userData);
  },

  getProfile: () => {
    return axiosCustom.get('/user/profile');
  },
};

export default authService;
