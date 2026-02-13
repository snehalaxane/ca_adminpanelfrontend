import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, Eye, FileText, Globe, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

interface LegalPage {
  _id?: string;
  pageTitle: string;
  pageSlug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  status: 'draft' | 'published';
  lastUpdated: string;
}

export default function LegalPagesManager() {
  const [legalPages, setLegalPages] = useState<LegalPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSEOPanel, setShowSEOPanel] = useState(true);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/legal`);
      setLegalPages(response.data);
      if (response.data.length > 0 && !selectedPageId) {
        setSelectedPageId(response.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching legal pages:', err);
      setToast('Error loading pages');
    } finally {
      setLoading(false);
    }
  };

  const selectedPage = legalPages.find(p => p._id === selectedPageId);

  const handleSaveDraft = async () => {
    if (selectedPage && selectedPageId) {
      try {
        const response = await axios.put(`${API_BASE}/legal/${selectedPageId}`, {
          ...selectedPage,
          status: 'draft'
        });
        setLegalPages(legalPages.map(p => p._id === selectedPageId ? response.data : p));
        setToast('Saved as draft!');
      } catch (err) {
        setToast('Error saving draft');
      }
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handlePublish = async () => {
    if (selectedPage && selectedPageId) {
      try {
        const response = await axios.put(`${API_BASE}/legal/${selectedPageId}`, {
          ...selectedPage,
          status: 'published'
        });
        setLegalPages(legalPages.map(p => p._id === selectedPageId ? response.data : p));
        setToast('Page published successfully!');
      } catch (err) {
        setToast('Error publishing page');
      }
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleAddPage = async () => {
    const newPageData: Partial<LegalPage> = {
      pageTitle: 'New Legal Page',
      pageSlug: `/new-legal-page-${Date.now()}`,
      content: '## New Legal Page\n\nStart writing your content here...',
      metaTitle: 'New Legal Page',
      metaDescription: 'Description for new legal page',
      status: 'draft'
    };

    try {
      const response = await axios.post(`${API_BASE}/legal`, newPageData);
      setLegalPages([...legalPages, response.data]);
      setSelectedPageId(response.data._id);
      setEditMode(true);
      setShowPreview(false);
      setToast('New page created!');
    } catch (err) {
      setToast('Error creating new page');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleDeletePage = async (id: string) => {
    if (confirm('Are you sure you want to delete this legal page?')) {
      try {
        await axios.delete(`${API_BASE}/legal/${id}`);
        const updatedList = legalPages.filter(p => p._id !== id);
        setLegalPages(updatedList);
        if (selectedPageId === id) {
          setSelectedPageId(updatedList.length > 0 ? updatedList[0]._id! : null);
        }
        setToast('Page deleted!');
      } catch (err) {
        setToast('Error deleting page');
      }
      setTimeout(() => setToast(''), 3000);
    }
  };

  const updateSelectedPage = (updates: Partial<LegalPage>) => {
    if (selectedPageId) {
      setLegalPages(legalPages.map(p =>
        p._id === selectedPageId ? { ...p, ...updates } : p
      ));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F1115]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022683]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-screen">
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Legal Pages Management</h1>
          <p className="text-[#888888]">Manage Terms & Conditions, Privacy Policy, and other legal pages</p>
        </div>
        <button
          onClick={handleAddPage}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
          <span className="relative z-10">Add New Legal Page</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Pages List */}
        <div className="col-span-3 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-4 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
          <h3 className="font-bold text-[#E6E6E6] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full"></span>
            Legal Pages
          </h3>

          <div className="space-y-2">
            {legalPages.map((page, index) => (
              <button
                key={page._id}
                onClick={() => {
                  setSelectedPageId(page._id!);
                  setEditMode(false);
                  setShowPreview(false);
                }}
                className={`w-full text-left p-3 rounded-lg transition-all duration-300 relative overflow-hidden group ${selectedPageId === page._id
                  ? 'bg-gradient-to-r from-[#022683] to-[#033aa0] text-white shadow-lg shadow-[#022683]/20'
                  : 'bg-gradient-to-br from-[#0F1115] to-[#16181D] text-[#888888] hover:text-[#E6E6E6]'
                  }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {selectedPageId !== page._id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                {selectedPageId === page._id && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#888888] to-[#022683] animate-pulse"></div>
                )}
                <div className="flex items-start justify-between gap-2 relative z-10">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate transition-all duration-300 group-hover:translate-x-1">{page.pageTitle}</div>
                    <div className={`text-xs mt-1 ${selectedPageId === page._id ? 'text-white/70' : 'text-[#888888]'}`}>
                      {page.pageSlug}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {page.status === 'published' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[rgba(136,136,136,0.25)]">
            <div className="text-sm text-[#888888]">
              <div className="flex items-center justify-between mb-2">
                <span>Total Pages:</span>
                <span className="font-medium text-[#E6E6E6]">{legalPages.length}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span>Published:</span>
                <span className="font-medium text-green-500">
                  {legalPages.filter(p => p.status === 'published').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Drafts:</span>
                <span className="font-medium text-yellow-500">
                  {legalPages.filter(p => p.status === 'draft').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Content Editor */}
        <div className={`${showSEOPanel ? 'col-span-6' : 'col-span-9'} bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in`}>
          {selectedPage ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-[rgba(136,136,136,0.25)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#888888]" />
                    <div>
                      <h2 className="text-xl font-bold text-[#E6E6E6]">{selectedPage.pageTitle}</h2>
                      <p className="text-sm text-[#888888]">Last updated: {selectedPage.lastUpdated}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedPage.status === 'published'
                      ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                      : 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
                      }`}>
                      {selectedPage.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="p-2 text-[#888888] hover:bg-[rgba(136,136,136,0.1)] rounded transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePage(selectedPage._id!)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveDraft}
                    className="flex items-center gap-2 px-4 py-2 bg-[rgba(136,136,136,0.2)] text-[#E6E6E6] rounded-lg hover:bg-[rgba(136,136,136,0.3)] border border-[rgba(136,136,136,0.25)] transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Draft
                  </button>
                  <button
                    onClick={handlePublish}
                    className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-all shadow-md active:scale-95"
                  >
                    <Globe className="w-4 h-4" />
                    Publish
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6">
                {showPreview ? (
                  // Preview Mode
                  <div className="max-w-4xl mx-auto">
                    <div className="prose prose-lg max-w-none">
                      <h1 className="text-3xl font-bold text-[#888888] mb-6">{selectedPage.pageTitle}</h1>
                      <div
                        className="text-[#E6E6E6] leading-relaxed"
                        style={{ whiteSpace: 'pre-line' }}
                      >
                        {selectedPage.content.split('\n').map((line, idx) => {
                          if (line.startsWith('## ')) {
                            return <h2 key={idx} className="text-2xl font-bold text-[#888888] mt-8 mb-4">{line.replace('## ', '')}</h2>;
                          } else if (line.startsWith('### ')) {
                            return <h3 key={idx} className="text-xl font-bold text-[#888888] mt-6 mb-3">{line.replace('### ', '')}</h3>;
                          } else if (line.startsWith('• ')) {
                            return <li key={idx} className="ml-6 mb-2 text-[#E6E6E6]">{line.replace('• ', '')}</li>;
                          } else if (line.trim() === '') {
                            return <br key={idx} />;
                          } else {
                            return <p key={idx} className="mb-4 text-[#E6E6E6]">{line}</p>;
                          }
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#888888] mb-2">
                        Page Title
                      </label>
                      <input
                        type="text"
                        value={selectedPage.pageTitle}
                        onChange={(e) => updateSelectedPage({ pageTitle: e.target.value })}
                        className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#888888] mb-2">
                        Page Slug <span className="text-xs text-[#888888]/70">(must be unique)</span>
                      </label>
                      <input
                        type="text"
                        value={selectedPage.pageSlug}
                        onChange={(e) => updateSelectedPage({ pageSlug: e.target.value })}
                        className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none font-mono text-sm text-[#E6E6E6] transition-all"
                        placeholder="/page-url"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#888888] mb-2">
                        Content <span className="text-xs text-[#888888]/70">(Markdown supported: ## for H2, ### for H3, • for bullets)</span>
                      </label>
                      <textarea
                        value={selectedPage.content}
                        onChange={(e) => updateSelectedPage({ content: e.target.value })}
                        rows={20}
                        className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none font-mono text-sm text-[#E6E6E6] transition-all"
                        placeholder="## Section Title&#10;&#10;Your content here...&#10;&#10;• Bullet point&#10;• Another point"
                      />
                    </div>

                    <div className="p-4 bg-[rgba(2,38,131,0.1)] border border-[rgba(136,136,136,0.25)] rounded-lg">
                      <p className="text-sm text-[#E6E6E6]">
                        <strong>💡 Formatting Tips:</strong>
                      </p>
                      <ul className="text-sm text-[#888888] mt-2 space-y-1">
                        <li>• Use <code className="bg-[rgba(136,136,136,0.2)] px-1 rounded text-[#E6E6E6]">## Title</code> for main headings (H2)</li>
                        <li>• Use <code className="bg-[rgba(136,136,136,0.2)] px-1 rounded text-[#E6E6E6]">### Title</code> for subheadings (H3)</li>
                        <li>• Use <code className="bg-[rgba(136,136,136,0.2)] px-1 rounded text-[#E6E6E6]">• Item</code> for bullet points</li>
                        <li>• Leave blank lines between paragraphs</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-[#888888]">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-bounce" />
              <p>Select a legal page to edit or create a new one</p>
            </div>
          )}
        </div>

        {/* Right Panel - SEO Settings */}
        {showSEOPanel && selectedPage && (
          <div className="col-span-3 bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#E6E6E6]">SEO Settings</h3>
              <button
                onClick={() => setShowSEOPanel(false)}
                className="text-[#888888] hover:text-[#E6E6E6] transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={selectedPage.metaTitle}
                  onChange={(e) => updateSelectedPage({ metaTitle: e.target.value })}
                  maxLength={60}
                  className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-sm text-[#E6E6E6] transition-all"
                />
                <p className="text-xs text-[#888888] mt-1">{selectedPage.metaTitle.length}/60 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Meta Description
                </label>
                <textarea
                  value={selectedPage.metaDescription}
                  onChange={(e) => updateSelectedPage({ metaDescription: e.target.value })}
                  maxLength={160}
                  rows={4}
                  className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-sm text-[#E6E6E6] transition-all"
                />
                <p className="text-xs text-[#888888] mt-1">{selectedPage.metaDescription.length}/160 characters</p>
              </div>

              <div className="pt-4 border-t border-[rgba(136,136,136,0.25)]">
                <h4 className="text-sm font-bold text-[#E6E6E6] mb-3">Google Preview</h4>
                <div className="p-3 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.15)] shadow-inner">
                  <div className="text-xs text-green-400 mb-1 truncate">rajuandprasad.com{selectedPage.pageSlug}</div>
                  <div className="text-sm text-[#4c8bf5] font-medium mb-1 line-clamp-1">{selectedPage.metaTitle || 'Page Title'}</div>
                  <div className="text-xs text-[#888888] line-clamp-2">{selectedPage.metaDescription || 'Add a meta description to see how this page appears in search results.'}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-[rgba(136,136,136,0.25)]">
                <h4 className="text-sm font-bold text-[#E6E6E6] mb-3">Visibility</h4>
                <div className="p-3 bg-green-600/10 border border-green-600/30 rounded-lg">
                  <p className="text-xs text-green-400">
                    {selectedPage.status === 'published'
                      ? '✓ This page is live and visible in the footer.'
                      : '⏳ This page is hidden. Publish it to show.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showSEOPanel && selectedPage && (
          <button
            onClick={() => setShowSEOPanel(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 bg-[#022683] text-white px-3 py-6 rounded-l-lg hover:bg-[#033aa0] transition-all shadow-lg z-50 animate-slide-in-right"
          >
            <span className="text-sm font-medium" style={{ writingMode: 'vertical-rl' }}>SEO Settings</span>
          </button>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-[#1a1d24] text-[#E6E6E6] px-6 py-3 rounded-lg shadow-2xl animate-fade-in border border-[#022683]/50 z-[100] flex items-center gap-3">
          <div className="w-2 h-2 bg-[#022683] rounded-full animate-ping"></div>
          {toast}
        </div>
      )}
    </div>
  );
}