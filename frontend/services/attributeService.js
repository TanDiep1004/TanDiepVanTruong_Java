import axiosCustom from '../axiosCustom';

export const attributeService = {
  getAllAttributes: () => {
    return axiosCustom.get('/attributes');
  },

  getAttributeById: (id) => {
    return axiosCustom.get(`/attributes/${id}`);
  },

  createAttribute: (data) => {
    return axiosCustom.post('/attributes', data);
  },

  addAttributeValue: (attributeId, data) => {
    return axiosCustom.post(`/attributes/${attributeId}/values`, data);
  },

  deleteAttribute: (id) => {
    return axiosCustom.delete(`/attributes/${id}`);
  },

  deleteAttributeValue: (valId) => {
    return axiosCustom.delete(`/attributes/values/${valId}`);
  },
};

export default attributeService;
