import axiosCustom from '../axiosCustom.js';

export const articleService = {
  getAllArticlesPublic: () => {
    return axiosCustom.get('/public/articles');
  },

  getArticleByIdPublic: (id) => {
    return axiosCustom.get(`/public/articles/${id}`);
  },

  getAllArticlesAdmin: () => {
    return axiosCustom.get('/admin/articles');
  },

  createArticle: (articleData) => {
    return axiosCustom.post('/admin/articles', articleData);
  },

  updateArticle: (id, articleData) => {
    return axiosCustom.put(`/admin/articles/${id}`, articleData);
  },

  deleteArticle: (id) => {
    return axiosCustom.delete(`/admin/articles/${id}`);
  },
};

export default articleService;
