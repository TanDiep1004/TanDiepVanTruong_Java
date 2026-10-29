import axiosCustom from '../axiosCustom.js';

export const promotionService = {
  applyPromotion: (promotionRequest) => {
    return axiosCustom.post('/public/promotions/apply', promotionRequest);
  },

  getAllPromotionsAdmin: () => {
    return axiosCustom.get('/admin/promotions');
  },

  createPromotion: (promotionData) => {
    return axiosCustom.post('/admin/promotions', promotionData);
  },

  updatePromotion: (id, promotionData) => {
    return axiosCustom.put(`/admin/promotions/${id}`, promotionData);
  },

  deletePromotion: (id) => {
    return axiosCustom.delete(`/admin/promotions/${id}`);
  },
};

export default promotionService;
