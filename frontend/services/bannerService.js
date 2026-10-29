import axiosCustom from '../axiosCustom.js';

export const bannerService = {
  getAllBannersPublic: () => {
    return axiosCustom.get('/public/banners');
  },

  getAllBannersAdmin: () => {
    return axiosCustom.get('/admin/banners');
  },

  createBanner: (bannerData) => {
    return axiosCustom.post('/admin/banners', bannerData);
  },

  updateBanner: (id, bannerData) => {
    return axiosCustom.put(`/admin/banners/${id}`, bannerData);
  },

  deleteBanner: (id) => {
    return axiosCustom.delete(`/admin/banners/${id}`);
  },
};

export default bannerService;
