"use client";

import { useEffect, useState } from "react";
import { Search, BookOpen, Eye, ThumbsUp, Video, ArrowLeft, ThumbsDown, Filter } from "lucide-react";

interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  views: number;
  helpfulCount: number;
  isVideo: boolean;
  content?: string;
  slug: string;
}

export default function KnowledgebasePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Article | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [voted, setVoted] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      const res = await fetch(`http://localhost:3001/api/marketing-suite/knowledgebase?${params}`, { headers });
      const data = await res.json();
      const list = data.articles || data.guides || [];
      setArticles(list);
      const cats = [...new Set(list.map((a: Article) => a.category).filter(Boolean))] as string[];
      setCategories(cats);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchArticles(); }, [category, search]);

  const viewArticle = async (article: Article) => {
    setSelected(null);
    try {
      const res = await fetch(`http://localhost:3001/api/marketing-suite/knowledgebase/${article.slug}`, { headers });
      const data = await res.json();
      setSelected(data.article || data);
    } catch { setSelected(article); }
    setVoted(false);
  };

  const vote = async (helpful: boolean) => {
    if (!selected || voted) return;
    try {
      await fetch(`http://localhost:3001/api/marketing-suite/knowledgebase/${selected.id}/vote`, {
        method: "POST", headers,
        body: JSON.stringify({ helpful }),
      });
      setVoted(true);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Knowledgebase</h1>
        <p className="text-gray-500">Browse guides, tutorials, and documentation</p>
      </div>

      {selected ? (
        <div className="space-y-4">
          <button onClick={() => setSelected(null)} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Back to Articles</button>
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-info text-xs">{selected.category}</span>
              {selected.isVideo && <span className="badge badge-warning text-xs flex items-center gap-1"><Video className="w-3 h-3" /> Video</span>}
            </div>
            <h2 className="text-xl font-bold mb-4">{selected.title}</h2>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{selected.content || selected.excerpt}</div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-3">Was this helpful?</p>
              <div className="flex gap-3">
                <button onClick={() => vote(true)} disabled={voted} className={`btn-secondary text-sm ${voted ? "opacity-50" : ""}`}><ThumbsUp className="w-4 h-4" /> Yes</button>
                <button onClick={() => vote(false)} disabled={voted} className={`btn-secondary text-sm ${voted ? "opacity-50" : ""}`}><ThumbsDown className="w-4 h-4" /> No</button>
                {voted && <span className="text-xs text-green-600 self-center">Thanks for your feedback!</span>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" placeholder="Search articles..." />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select value={category} onChange={e => setCategory(e.target.value)} className="input-field w-44">
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : (
            <div className="space-y-3">
              {articles.length === 0 ? (
                <div className="card p-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">No Articles Found</h3>
                  <p className="text-gray-500">Try a different search or category</p>
                </div>
              ) : articles.map(article => (
                <div key={article.id} className="card p-5 hover:shadow-md cursor-pointer transition-shadow" onClick={() => viewArticle(article)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-info text-xs">{article.category}</span>
                        {article.isVideo && <span className="badge badge-warning text-xs flex items-center gap-1"><Video className="w-3 h-3" /> Video</span>}
                      </div>
                      <h3 className="font-semibold text-brand-600">{article.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{article.excerpt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views || 0}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {article.helpfulCount || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
