import axiosCustom from '../axiosCustom.js';

export const contactService = {
  getAllContactsAdmin: () => {
    return axiosCustom.get('/admin/contacts');
  },

  updateStatus: (id, status) => {
    return axiosCustom.put(`/admin/contacts/${id}/status?status=${encodeURIComponent(status)}`);
  },

  deleteContact: (id) => {
    return axiosCustom.delete(`/admin/contacts/${id}`);
  },
};

export default contactService;
