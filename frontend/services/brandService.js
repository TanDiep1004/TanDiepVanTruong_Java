import axiosCustom from '../axiosCustom.js';

export const brandService = {
  getAllBrands: () => {
    return axiosCustom.get('/public/brands');
  },

  getAllBrandsAdmin: () => {
    return axiosCustom.get('/admin/brands');
  },

  createBrand: (brandData) => {
    return axiosCustom.post('/admin/brands', brandData);
  },

  updateBrand: (id, brandData) => {
    return axiosCustom.put(`/admin/brands/${id}`, brandData);
  },

  deleteBrand: (id) => {
    return axiosCustom.delete(`/admin/brands/${id}`);
  },
};

export default brandService;
