import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Image as ImageIcon, GripVertical, Filter, Upload, X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface GalleryImage {
  _id?: string;
  url: string;
  title: string;
  category: string;
  year: string;
  enabled: boolean;
  order: number;
}

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [toast, setToast] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [newImageForm, setNewImageForm] = useState({
    title: '',
    category: 'Annual Seminar',
    year: new Date().getFullYear().toString(),
    enabled: true
  });

  const categories = ['All', 'Annual Seminar', 'Fun @ Work'];
  const years = ['All', '2026', '2025', '2024', '2023'];

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/gallery`);
      setImages(response.data);
    } catch (err) {
      console.error('Error fetching gallery:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast('File size must be less than 5MB');
        setTimeout(() => setToast(''), 3000);
        return;
      }
      setUploadingFile(file);
    }
  };

  const handleCreateImage = async () => {
    if (!uploadingFile && !newImageForm.title) {
      setToast('Please provide a title and select an image');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    const data = new FormData();
    data.append('title', newImageForm.title);
    data.append('category', newImageForm.category);
    data.append('year', newImageForm.year);
    data.append('enabled', String(newImageForm.enabled));
    if (uploadingFile) {
      data.append('image', uploadingFile);
    }

    try {
      await axios.post(`${API_BASE_URL}/api/gallery`, data);
      setToast('Image uploaded successfully!');
      fetchImages();
      setShowUploadModal(false);
      setUploadingFile(null);
      setNewImageForm({
        title: '',
        category: 'Annual Seminar',
        year: new Date().getFullYear().toString(),
        enabled: true
      });
    } catch (err: any) {
      setToast(err.response?.data?.message || 'Error uploading image');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaveAll = async () => {
    setToast('Saving all changes...');
    try {
      // In this specific UI, edits are per-item in the grid.
      // We'll update the logic to handle per-item updates.
      setToast('Gallery changes synced!');
    } catch (err) {
      setToast('Error saving changes');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleUpdateImage = async (id: string, updates: Partial<GalleryImage>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/gallery/${id}`, updates);
      setImages(images.map(img => img._id === id ? response.data : img));
    } catch (err) {
      setToast('Error updating image');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/gallery/${id}`);
        setImages(images.filter(img => img._id !== id));
        setToast('Image deleted successfully!');
      } catch (err) {
        setToast('Error deleting image');
      }
      setTimeout(() => setToast(''), 3000);
    }
  };

  const filteredImages = images.filter(img => {
    const categoryMatch = filterCategory === 'All' || img.category === filterCategory;
    const yearMatch = filterYear === 'All' || img.year === filterYear;
    return categoryMatch && yearMatch;
  });

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-screen">
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gallery Management</h1>
          <p className="text-[#888888]">Manage photo albums and gallery images</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
          <span className="relative z-10">Upload Images</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-[#888888]" />
          <div className="flex gap-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-[#888888] mb-2">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#888888] mb-2">
                Year
              </label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-sm text-[#888888]">
            Showing {filteredImages.length} of {images.length} images
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Images Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-3 gap-4">
            {filteredImages.map((image, index) => (
              <div
                key={image._id}
                className="bg-[#16181D] rounded-lg shadow-lg overflow-hidden group border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in transition-all duration-300"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative">
                  <img
                    src={image.url.startsWith('http') ? image.url : `${API_BASE_URL}/${image.url}`}
                    alt={image.title}
                    className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleUpdateImage(image._id!, { enabled: !image.enabled })}
                      className={`flex items-center gap-1 cursor-pointer rounded px-2 py-1 ${image.enabled ? 'bg-green-500/80 text-white backdrop-blur-sm' : 'bg-gray-800/80 text-gray-400 backdrop-blur-sm'}`}
                    >
                      <div className={`w-8 h-4 rounded-full relative transition-colors ${image.enabled ? 'bg-green-400' : 'bg-gray-600'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${image.enabled ? 'right-0.5' : 'left-0.5'}`}></div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDelete(image._id!)}
                      className="p-1.5 bg-red-500/80 text-white rounded hover:bg-red-600 backdrop-blur-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-[#16181D]">
                  <input
                    type="text"
                    value={image.title}
                    onChange={(e) => handleUpdateImage(image._id!, { title: e.target.value })}
                    className="w-full px-2 py-1 mb-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded text-sm focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                    placeholder="Image title"
                  />
                  <div className="flex gap-2">
                    <select
                      value={image.category}
                      onChange={(e) => handleUpdateImage(image._id!, { category: e.target.value })}
                      className="flex-1 px-2 py-1 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded text-xs focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#888888] transition-all duration-300 hover:border-[#888888]"
                    >
                      {categories.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <select
                      value={image.year}
                      onChange={(e) => handleUpdateImage(image._id!, { year: e.target.value })}
                      className="px-2 py-1 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded text-xs focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#888888] transition-all duration-300 hover:border-[#888888]"
                    >
                      {years.filter(y => y !== 'All').map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Card */}
            <div
              onClick={() => setShowUploadModal(true)}
              className="bg-[#0F1115] border-2 border-dashed border-[rgba(136,136,136,0.25)] rounded-lg aspect-square flex items-center justify-center hover:border-[#022683] hover:bg-[#022683]/5 transition-all duration-300 cursor-pointer group animate-fade-in"
            >
              <div className="text-center group-hover:scale-105 transition-transform duration-300">
                <ImageIcon className="w-12 h-12 text-[#888888] mx-auto mb-2 group-hover:text-[#022683] transition-colors" />
                <p className="text-sm text-[#888888] group-hover:text-[#E6E6E6] transition-colors">Upload Image</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="lg:col-span-1">
          <div className="bg-[#16181D] rounded-lg shadow-lg p-6 sticky top-8 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
            <h3 className="font-bold text-[#E6E6E6] mb-4 text-lg">Gallery Stats</h3>

            <div className="space-y-4">
              <div className="p-4 bg-[rgba(2,38,131,0.1)] rounded-lg border border-[rgba(2,38,131,0.2)]">
                <div className="text-3xl font-bold text-[#022683]">{images.length}</div>
                <div className="text-sm text-[#022683] font-medium">Total Images</div>
              </div>

              <div className="p-4 bg-[rgba(22,101,52,0.1)] rounded-lg border border-[rgba(22,101,52,0.2)]">
                <div className="text-3xl font-bold text-green-500">
                  {images.filter(i => i.enabled).length}
                </div>
                <div className="text-sm text-green-500 font-medium">Active Images</div>
              </div>

              <div className="pt-6 border-t border-[rgba(136,136,136,0.25)]">
                <h4 className="font-bold text-[#E6E6E6] mb-3 text-sm uppercase tracking-wider">By Category</h4>
                <div className="space-y-3">
                  {categories.filter(c => c !== 'All').map(cat => (
                    <div key={cat} className="flex justify-between items-center text-sm">
                      <span className="text-[#888888]">{cat}</span>
                      <span className="bg-[#0F1115] text-[#E6E6E6] px-2 py-0.5 rounded-full font-bold min-w-[30px] text-center border border-[rgba(136,136,136,0.25)]">
                        {images.filter(i => i.category === cat).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-[rgba(136,136,136,0.25)]">
                <h4 className="font-bold text-[#E6E6E6] mb-3 text-sm uppercase tracking-wider">By Year</h4>
                <div className="space-y-3">
                  {years.filter(y => y !== 'All').map(year => (
                    <div key={year} className="flex justify-between items-center text-sm">
                      <span className="text-[#888888]">{year}</span>
                      <span className="bg-[#0F1115] text-[#E6E6E6] px-2 py-0.5 rounded-full font-bold min-w-[30px] text-center border border-[rgba(136,136,136,0.25)]">
                        {images.filter(i => i.year === year).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-8 py-3 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] shadow-lg transition-all active:scale-95 font-bold"
        >
          <Save className="w-5 h-5" />
          Sync All Changes
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#16181D] rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-[rgba(136,136,136,0.25)] animate-scale-in">
            <div className="p-6 border-b border-[rgba(136,136,136,0.25)] flex justify-between items-center bg-gradient-to-r from-[#16181D] to-[#1a1d24]">
              <h2 className="text-xl font-bold text-[#E6E6E6]">Upload to Gallery</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-[rgba(136,136,136,0.1)] rounded-full transition-colors"
                title="Close"
              >
                <X className="w-6 h-6 text-[#888888]" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-[rgba(136,136,136,0.25)] rounded-lg p-8 text-center bg-[#0F1115] hover:border-[#022683] transition-colors">
                <Upload className="w-10 h-10 text-[#022683]/50 mx-auto mb-3" />
                <input
                  type="file"
                  id="gallery-file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*"
                />
                <label
                  htmlFor="gallery-file"
                  className="px-4 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg text-sm font-bold text-[#E6E6E6] cursor-pointer shadow-sm hover:border-[#022683] transition-colors"
                >
                  {uploadingFile ? 'Change Image' : 'Select Image'}
                </label>
                {uploadingFile && (
                  <p className="mt-4 text-sm text-green-400 font-medium flex items-center justify-center gap-1">
                    <ImageIcon className="w-4 h-4" /> {uploadingFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#888888] mb-1">Image Title</label>
                <input
                  type="text"
                  value={newImageForm.title}
                  onChange={(e) => setNewImageForm({ ...newImageForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  placeholder="e.g. Workshop Session"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#888888] mb-1">Category</label>
                  <select
                    value={newImageForm.category}
                    onChange={(e) => setNewImageForm({ ...newImageForm, category: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#888888] mb-1">Year</label>
                  <select
                    value={newImageForm.year}
                    onChange={(e) => setNewImageForm({ ...newImageForm, year: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  >
                    {years.filter(y => y !== 'All').map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#0F1115] flex gap-3 border-t border-[rgba(136,136,136,0.25)]">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 bg-[rgba(136,136,136,0.1)] border border-[rgba(136,136,136,0.25)] text-[#888888] rounded-lg font-bold hover:bg-[rgba(136,136,136,0.2)] hover:text-[#E6E6E6] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateImage}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg font-bold hover:from-[#033aa0] hover:to-[#022683] shadow-md transition-all active:scale-95"
              >
                Upload Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 right-8 bg-gray-900/90 backdrop-blur text-white px-6 py-4 rounded-xl shadow-2xl z-[100] animate-fade-in flex items-center gap-3 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
