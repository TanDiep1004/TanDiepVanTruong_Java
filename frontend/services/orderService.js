import axiosCustom from '../axiosCustom.js';

export const orderService = {
  checkout: (orderData) => {
    return axiosCustom.post('/user/orders', orderData);
  },

  getMyOrders: () => {
    return axiosCustom.get('/user/orders');
  },

  getOrderById: (id) => {
    return axiosCustom.get(`/user/orders/${id}`);
  },

  cancelOrder: (id) => {
    return axiosCustom.put(`/user/orders/${id}/cancel`);
  },

  getAllOrdersAdmin: () => {
    return axiosCustom.get('/admin/orders');
  },

  updateOrderStatus: (id, status) => {
    return axiosCustom.put(`/admin/orders/${id}/status?status=${encodeURIComponent(status)}`);
  },
};

export default orderService;
