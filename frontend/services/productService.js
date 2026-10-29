import axiosCustom from '../axiosCustom.js';

export const productService = {
  getAllProducts: () => {
    return axiosCustom.get('/public/products');
  },

  getAllProductsPublic: () => {
    return axiosCustom.get('/public/products');
  },

  getProductById: (id) => {
    return axiosCustom.get(`/public/products/${id}`);
  },

  getAllProductsAdmin: () => {
    return axiosCustom.get('/admin/products');
  },

  createProduct: (productData) => {
    return axiosCustom.post('/admin/products', productData);
  },

  updateProduct: (id, productData) => {
    return axiosCustom.put(`/admin/products/${id}`, productData);
  },

  deleteProduct: (id) => {
    return axiosCustom.delete(`/admin/products/${id}`);
  },
};

export default productService;
