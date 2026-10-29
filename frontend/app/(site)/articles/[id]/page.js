'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Eye, Share2 } from 'lucide-react';
import { articleService } from '@/services/articleService';

export default function ArticleDetailPage({ params }) {
  const resolvedParams = use(params);
  const articleId = resolvedParams.id;

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        const res = await articleService.getArticleByIdPublic(articleId);
        if (res.data) setArticle(res.data);
      } catch (err) {
        console.error('Lỗi tải bài viết:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [articleId]);

  const formatArticleDate = (dateVal) => {
    if (!dateVal) {
      // Fallback to formatted standard datetime
      const now = new Date();
      return now.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Đang tải nội dung bài viết...</span>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Không tìm thấy bài viết</h2>
        <Link href="/articles" className="inline-flex items-center gap-1 text-slate-900 font-bold text-xs">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài viết
        </Link>
      </div>
    );
  }

  const publishedDateStr = formatArticleDate(article.createdAt || article.createdDate || article.updatedAt || article.date);
  
  let authorName = 'Ban Biên Tập NTD Eyewear';
  if (typeof article.author === 'string' && article.author.trim()) {
    authorName = article.author;
  } else if (article.author && typeof article.author === 'object') {
    authorName = article.author.fullName || article.author.name || article.author.email || 'Ban Biên Tập NTD Eyewear';
  } else if (typeof article.createdByName === 'string' && article.createdByName.trim()) {
    authorName = article.createdByName;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <Link href="/articles" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Tất cả bài viết tin tức
      </Link>

      <article className="space-y-6">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 border-y border-slate-200 py-3">
          <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-slate-900" /> Tác giả: <strong className="text-slate-700">{authorName}</strong></span>
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-900" /> Ngày đăng: <strong className="text-slate-900 font-mono">{publishedDateStr}</strong></span>
        </div>

        <div className="h-96 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
          <img
            src={article.thumbnail || 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=800'}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose  max-w-none text-slate-700 text-sm md:text-base leading-relaxed space-y-4 pt-4">
          <p className="whitespace-pre-line">{article.content}</p>
        </div>
      </article>
    </div>
  );
}
