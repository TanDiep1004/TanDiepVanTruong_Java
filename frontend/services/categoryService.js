import axiosCustom from '../axiosCustom.js';

export const categoryService = {
  getAllCategories: () => {
    return axiosCustom.get('/public/categories');
  },

  getAllCategoriesAdmin: () => {
    return axiosCustom.get('/admin/categories');
  },

  createCategory: (categoryData) => {
    return axiosCustom.post('/admin/categories', categoryData);
  },

  updateCategory: (id, categoryData) => {
    return axiosCustom.put(`/admin/categories/${id}`, categoryData);
  },

  deleteCategory: (id) => {
    return axiosCustom.delete(`/admin/categories/${id}`);
  },
};

export default categoryService;
