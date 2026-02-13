import React, { useState, useEffect } from 'react';
import { Save, Eye, Upload } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface PageSEO {
  _id?: string;
  pageName: string;
  urlSlug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  // ogImage: string;
  indexPage: boolean;
  followLinks: boolean;
  includeInSitemap: boolean;
}

export default function SEOManager() {
  const [pages, setPages] = useState<PageSEO[]>([]);
  const [editingPageName, setEditingPageName] = useState<string | null>('Home');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSEOConfigs();
  }, []);

  const fetchSEOConfigs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/seo`);
      setPages(response.data);
      if (response.data.length > 0 && !editingPageName) {
        setEditingPageName(response.data[0].pageName);
      }
    } catch (err) {
      console.error('Error fetching SEO configs:', err);
      setToast('Error loading SEO settings');
    } finally {
      setLoading(false);
    }
  };

  const currentPage = pages.find(p => p.pageName === editingPageName) || (pages.length > 0 ? pages[0] : null);

  const handleSave = async () => {
    if (!currentPage) return;
    try {
      await axios.put(`${API_BASE_URL}/seo/${currentPage.pageName}`, currentPage);
      setToast('SEO settings saved successfully!');
    } catch (err) {
      console.error('Error saving SEO config:', err);
      setToast('Error saving SEO settings');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddPage = async () => {
    const pageName = prompt('Enter page name (e.g., Portfolio):');
    if (!pageName) return;

    const newPage: PageSEO = {
      pageName,
      urlSlug: `/${pageName.toLowerCase().replace(/\s+/g, '-')}`,
      metaTitle: `${pageName} - Raju & Prasad`,
      metaDescription: '',
      keywords: '',
      // ogImage: '',
      indexPage: true,
      followLinks: true,
      includeInSitemap: true
    };

    try {
      const response = await axios.put(`${API_BASE_URL}/seo/${pageName}`, newPage);
      setPages([...pages, response.data]);
      setEditingPageName(pageName);
      setToast('New SEO page added!');
    } catch (err) {
      setToast('Error adding SEO page');
    }
  };

  const handleDeletePage = async (pageName: string) => {
    if (['Home', 'About', 'Services', 'Contact'].includes(pageName)) {
      alert('Default pages cannot be deleted.');
      return;
    }

    if (confirm(`Are you sure you want to delete SEO settings for "${pageName}"?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/seo/${pageName}`);
        setPages(pages.filter(p => p.pageName !== pageName));
        setEditingPageName('Home');
        setToast('SEO page deleted!');
      } catch (err) {
        setToast('Error deleting SEO page');
      }
    }
  };

  const updateCurrentPage = (updates: Partial<PageSEO>) => {
    if (!editingPageName) return;
    setPages(pages.map(p =>
      p.pageName === editingPageName ? { ...p, ...updates } : p
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#0F1115]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022683]"></div>
      </div>
    );
  }

  if (!currentPage) return <div className="p-8 bg-[#0F1115] text-[#E6E6E6] min-h-screen">No SEO configurations found. Please check backend.</div>;

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-screen">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">SEO & Metadata Management</h1>
        <p className="text-[#888888]">Optimize search engine visibility for each page</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Page Selector */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-4 sticky top-8 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#E6E6E6]">Select Page</h3>
              <button
                onClick={handleAddPage}
                className="p-1 px-2 text-xs bg-[#022683] text-white rounded hover:bg-[#033aa0] transition-colors flex items-center gap-1 shadow-md"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {pages.map((page, index) => (
                <button
                  key={page.pageName}
                  onClick={() => setEditingPageName(page.pageName)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 relative group ${editingPageName === page.pageName
                    ? 'bg-gradient-to-r from-[#022683] to-[#033aa0] text-white shadow-lg shadow-[#022683]/20'
                    : 'bg-gradient-to-br from-[#0F1115] to-[#16181D] text-[#888888] hover:text-[#E6E6E6] border border-transparent hover:border-[rgba(136,136,136,0.25)]'
                    }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <div className="font-medium">{page.pageName}</div>
                      <div className={`text-xs ${editingPageName === page.pageName ? 'text-white/70' : 'text-[#888888]'}`}>
                        {page.urlSlug}
                      </div>
                    </div>
                    {!['Home', 'About', 'Services', 'Contact'].includes(page.pageName) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePage(page.pageName);
                        }}
                        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${editingPageName === page.pageName ? 'hover:bg-white/20' : 'hover:bg-red-500/20 text-red-400'
                          }`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SEO Editor */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
            <h2 className="text-xl font-bold text-[#E6E6E6] mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full"></span>
              SEO Settings: {currentPage.pageName}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#888888]">website.com</span>
                  <input
                    type="text"
                    value={currentPage.urlSlug}
                    onChange={(e) => updateCurrentPage({ urlSlug: e.target.value })}
                    className="flex-1 px-4 py-2 border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none bg-[#0F1115] text-[#E6E6E6] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#888888]">
                    Meta Title
                  </label>
                  <span className="text-xs text-[#888888]">
                    {currentPage.metaTitle.length}/60 characters
                  </span>
                </div>
                <input
                  type="text"
                  value={currentPage.metaTitle}
                  onChange={(e) => updateCurrentPage({ metaTitle: e.target.value })}
                  maxLength={60}
                  className="w-full px-4 py-2 border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none bg-[#0F1115] text-[#E6E6E6] transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#888888]">
                    Meta Description
                  </label>
                  <span className="text-xs text-[#888888]">
                    {currentPage.metaDescription.length}/160 characters
                  </span>
                </div>
                <textarea
                  value={currentPage.metaDescription}
                  onChange={(e) => updateCurrentPage({ metaDescription: e.target.value })}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2 border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none bg-[#0F1115] text-[#E6E6E6] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={currentPage.keywords}
                  onChange={(e) => updateCurrentPage({ keywords: e.target.value })}
                  className="w-full px-4 py-2 border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none bg-[#0F1115] text-[#E6E6E6] transition-all"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Open Graph Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentPage.ogImage}
                    onChange={(e) => updateCurrentPage({ ogImage: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none"
                  />
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                </div>
                <p className="text-xs text-[#888888] mt-1">
                  Recommended size: 1200 x 630 pixels
                </p>
              </div> */}

              <div className="pt-4 border-t border-[rgba(136,136,136,0.25)]">
                <h3 className="font-bold text-[#E6E6E6] mb-3">Additional Settings</h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={currentPage.indexPage}
                      onChange={(e) => updateCurrentPage({ indexPage: e.target.checked })}
                      className="w-4 h-4 text-[#022683] border-gray-300 rounded focus:ring-[#022683]"
                    />
                    <span className="text-sm text-[#888888] group-hover:text-[#E6E6E6] transition-colors">Index this page (allow search engines)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={currentPage.followLinks}
                      onChange={(e) => updateCurrentPage({ followLinks: e.target.checked })}
                      className="w-4 h-4 text-[#022683] border-gray-300 rounded focus:ring-[#022683]"
                    />
                    <span className="text-sm text-[#888888] group-hover:text-[#E6E6E6] transition-colors">Follow links on this page</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={currentPage.includeInSitemap}
                      onChange={(e) => updateCurrentPage({ includeInSitemap: e.target.checked })}
                      className="w-4 h-4 text-[#022683] border-gray-300 rounded focus:ring-[#022683]"
                    />
                    <span className="text-sm text-[#888888] group-hover:text-[#E6E6E6] transition-colors">Include in XML sitemap</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 sticky top-8 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
            <h3 className="font-bold text-[#E6E6E6] mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#888888]" />
              Search Preview
            </h3>

            {/* Google Search Result Preview */}
            <div className="mb-6 p-4 bg-gradient-to-r from-[#888888] to-[#022683] rounded-lg shadow-lg animate-fade-in transition-all duration-300 hover:scale-105">
              <div className="text-xs text-white/70 mb-1 font-medium bg-black/20 inline-block px-1.5 py-0.5 rounded">
                website.com{currentPage.urlSlug}
              </div>
              <div className="text-white text-lg font-medium mb-1 hover:underline cursor-pointer tracking-wide">
                {currentPage.metaTitle || 'Page Title'}
              </div>
              <div className="text-xs text-white/80 leading-relaxed">
                {currentPage.metaDescription || 'No description provided.'}
              </div>
            </div>

            {/* Social Media Preview */}
            <div className="mb-4">
              <h4 className="text-sm font-bold text-[#E6E6E6] mb-3">Social Media Preview</h4>
              <div className="border border-[rgba(136,136,136,0.25)] rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105">
                {/* <div className="bg-gray-200 h-32 flex items-center justify-center">
                  <span className="text-xs text-gray-500">OG Image Preview</span>
                </div> */}
                <div className="p-4 bg-gradient-to-r from-[#888888] to-[#022683]">
                  <div className="text-sm font-bold text-white mb-2">
                    {currentPage.metaTitle || 'Page Title'}
                  </div>
                  <div className="text-xs text-white/80">
                    {(currentPage.metaDescription || '').substring(0, 100)}...
                  </div>
                  <div className="mt-3 text-[10px] text-white/60 uppercase tracking-wider font-semibold">
                    WEBSITE.COM
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Score */}
            <div className="p-4 bg-[rgba(22,163,74,0.1)] rounded-lg border border-green-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#E6E6E6]">SEO Score</span>
                <span className="text-2xl font-bold text-green-500">
                  {Math.min(100, (currentPage.metaTitle.length ? 40 : 0) + (currentPage.metaDescription.length ? 60 : 0))}/100
                </span>
              </div>
              <div className="w-full bg-[#0F1115] rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, (currentPage.metaTitle.length ? 40 : 0) + (currentPage.metaDescription.length ? 60 : 0))}%` }}></div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[rgba(2,38,131,0.2)] rounded-lg border border-[#022683]/30">
              <p className="text-xs text-blue-200">
                <strong>Tip:</strong> Keep meta titles under 60 characters and descriptions under 160 characters for best results.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <Save className="w-4 h-4" />
          Save SEO Settings
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-8 right-8 bg-[#1a1d24] text-[#E6E6E6] px-6 py-3 rounded-lg shadow-2xl border border-[#022683]/50 flex items-center gap-3 z-50 animate-fade-in">
          <div className="w-2 h-2 bg-[#022683] rounded-full animate-ping"></div>
          {toast}
        </div>
      )}
    </div>
  );
}
