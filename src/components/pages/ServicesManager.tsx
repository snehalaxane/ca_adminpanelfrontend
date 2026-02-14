import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Save, Eye, Upload, Search, Loader2, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ServicesManager() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
const [deleting, setDeleting] = useState(false);

  // Form State for Editing/Adding
  const [formData, setFormData] = useState<any>({
    name: '',
    category: 'Core Services',
    icon: '📌',
    shortDescription: '',
    detailedDescription: '',
    slug: '',
    enabled: true,
    seoTitle: '',
    seoDescription: '',
    image: '',
    subServices: []
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/services`);
      setServices(res.data);
    } catch (error) {
      showToast('Error loading services');
    }
  };

  const categories = Array.from(new Set(services.map(s => s.category)));
  if (!categories.includes('Core Services')) categories.push('Core Services');
  if (!categories.includes('Advisory Services')) categories.push('Advisory Services');

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleEdit = (service: any) => {
    if (editingId === service._id) {
      setEditingId(null);
    } else {
      setEditingId(service._id);
      setFormData({ ...service });
      setExpandedService(service._id);
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name?.trim() || !formData.slug?.trim()) {
      showToast('Name and Slug are required');
      return;
    }

    if (!formData.shortDescription?.trim() || !formData.detailedDescription?.trim()) {
      showToast('Short and Detailed descriptions are required');
      return;
    }

    // Sub-service validation
    const invalidSub = formData.subServices.find((s: any) => !s.name?.trim());
    if (invalidSub) {
      showToast('All sub-services must have a name');
      return;
    }

    setLoading(true);
    try {
      // Sanitize data: remove temporary _id if it's 'new'
      const dataToSave = { ...formData };
      if (dataToSave._id === 'new') {
        delete dataToSave._id;
      }

      if (editingId && editingId !== 'new' && editingId.length > 5) { // Existing in DB
        await axios.put(`${API_BASE_URL}/api/services/${editingId}`, dataToSave);
        showToast('Service updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/api/services`, dataToSave);
        showToast('Service added successfully!');
      }
      setEditingId(null);
      fetchServices();
      setExpandedService(null);
    } catch (error: any) {
      console.error('Error saving service:', error);
      showToast(error.response?.data?.message || 'Error saving service: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = (id: string) => {
  setDeleteId(id); // open modal
};
const confirmDelete = async () => {
  if (!deleteId) return;

  setDeleting(true);
  try {
    await axios.delete(`${API_BASE_URL}/api/services/${deleteId}`);
    showToast('Service deleted successfully!');
    fetchServices();
  } catch (error) {
    showToast('Error deleting service');
  } finally {
    setDeleting(false);
    setDeleteId(null);
  }
};


  const handleAddService = () => {
    const newService = {
      name: 'New Service',
      category: 'Core Services',
      icon: '📌',
      shortDescription: '',
      detailedDescription: '',
      slug: `/services/new-service-${Date.now()}`,
      enabled: true,
      seoTitle: '',
      seoDescription: '',
      image: '',
      subServices: []
    };
    setEditingId('new');
    setFormData(newService);
    setExpandedService('new');
  };

  const handleToggleService = async (service: any) => {
    try {
      await axios.put(`${API_BASE_URL}/api/services/${service._id}`, { ...service, enabled: !service.enabled });
      fetchServices();
    } catch (error) {
      showToast('Error updating status');
    }
  };

  const handleAddSubService = () => {
    const updatedSubServices = [...formData.subServices, { name: 'New Sub-service', enabled: true }];
    setFormData({ ...formData, subServices: updatedSubServices });
  };

  const handleRemoveSubService = (index: number) => {
    const updatedSubServices = formData.subServices.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, subServices: updatedSubServices });
  };

  const handleSubServiceChange = (index: number, field: string, value: any) => {
    const updatedSubServices = [...formData.subServices];
    updatedSubServices[index] = { ...updatedSubServices[index], [field]: value };
    setFormData({ ...formData, subServices: updatedSubServices });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-screen">
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Services Management</h1>
          <p className="text-[#888888]">Manage service categories, descriptions, and SEO settings</p>
        </div>
        <button
          onClick={handleAddService}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
          <span className="relative z-10">Add Service</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-4 border border-[rgba(136,136,136,0.25)] animate-fade-in">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-10 pr-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services List */}
        <div className="lg:col-span-2 space-y-4">
          {(editingId === 'new' ? [{ _id: 'new', ...formData }, ...filteredServices] : filteredServices).map((service, index) => (
            <div
              key={service._id}
              className={`bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in transition-all duration-300 ${expandedService === service._id ? 'ring-1 ring-[#022683]' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Service Header */}
              <div className="p-6 border-b border-[rgba(136,136,136,0.15)]">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => setExpandedService(expandedService === service._id ? null : service._id)}
                      className="p-1 hover:bg-[rgba(136,136,136,0.1)] rounded mt-1 transition-colors duration-300"
                    >
                      {expandedService === service._id ? (
                        <ChevronDown className="w-5 h-5 text-[#888888]" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[#888888]" />
                      )}
                    </button>
                    <span className="text-2xl mt-1">{service.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg">{service.name}</h3>
                      <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-[rgba(2,38,131,0.3)] to-[rgba(2,38,131,0.2)] text-[#5b8fff] text-xs rounded border border-[rgba(2,38,131,0.5)] mt-1">
                        {service.category}
                      </span>
                      <p className="text-sm text-[#888888] mt-2">{service.shortDescription}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={service.enabled}
                        onChange={() => service._id !== 'new' && handleToggleService(service)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-5 rounded-full transition-all duration-300 ${service.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-[rgba(136,136,136,0.3)]'} group-hover:shadow-lg`}>
                        <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-all duration-300 shadow-md ${service.enabled ? 'translate-x-5' : ''} group-hover:scale-110`}></div>
                      </div>
                    </label>
                    <button
                      onClick={() => handleEdit(service)}
                      className={`p-2 rounded transition-all duration-300 hover:scale-110 ${editingId === service._id ? 'bg-[#022683] text-white' : 'text-[#022683] hover:bg-[rgba(2,38,131,0.1)]'}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => service._id !== 'new' && handleDeleteService(service._id)}
                      className="p-2 text-red-400 hover:bg-[rgba(255,0,0,0.1)] rounded transition-all duration-300 hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Edit Section */}
              {editingId === service._id && (
                <div className="p-6 bg-[#0F1115] border-b border-[rgba(136,136,136,0.15)] animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-white">Edit Service Details</h4>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {loading ? 'Saving...' : 'Save Service'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#888888] mb-2">
                          Service Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#888888] mb-2">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#888888] mb-2">
                        Short Description <span className="text-xs text-[#888888]">(for cards)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                        maxLength={150}
                      />
                      <p className="text-xs text-[#888888] mt-1">{formData.shortDescription.length}/150 characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#888888] mb-2">
                        Detailed Description <span className="text-xs text-[#888888]">(for service page)</span>
                      </label>
                      <textarea
                        value={formData.detailedDescription}
                        onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#888888] mb-2">
                          Icon/Emoji
                        </label>
                        <input
                          type="text"
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                          placeholder="📊"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#888888] mb-2">
                          Page Slug *
                        </label>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                          placeholder="/services/service-name"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[rgba(136,136,136,0.15)]">
                      <h5 className="font-medium text-white mb-3">SEO Settings</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-[#888888] mb-2">
                            Meta Title
                          </label>
                          <input
                            type="text"
                            value={formData.seoTitle}
                            onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                            maxLength={70}
                            className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#888888] mb-2">
                            Meta Description
                          </label>
                          <textarea
                            value={formData.seoDescription}
                            onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                            maxLength={160}
                            rows={2}
                            className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#888888] mb-2">
                        Service Image
                      </label>
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Image URL or upload..."
                            value={formData.image?.startsWith('data:') ? 'Local Image Selected' : (formData.image || '')}
                            readOnly={formData.image?.startsWith('data:')}
                            className="flex-1 px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg outline-none text-[#E6E6E6]"
                          />
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-[rgba(136,136,136,0.2)] text-white rounded-lg hover:bg-[rgba(136,136,136,0.3)] transition-all"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          {formData.image && (
                            <button onClick={() => setFormData({ ...formData, image: '' })} className="p-2 text-red-400 hover:bg-red-400/10 rounded">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {formData.image && (
                          <div className="w-32 h-20 rounded-lg overflow-hidden border border-[rgba(136,136,136,0.25)]">
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-services */}
              {expandedService === service._id && (
                <div className="p-6 bg-[rgba(136,136,136,0.05)] rounded-b-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-white">Sub-Services</h4>
                    {editingId === service._id && (
                      <button
                        onClick={handleAddSubService}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Add Sub-Service
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {(editingId === service._id ? formData.subServices : service.subServices).map((sub: any, subIndex: number) => (
                      <div key={subIndex} className="flex items-center justify-between p-3 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.15)] animate-fade-in">
                        {editingId === service._id ? (
                          <input
                            type="text"
                            value={sub.name}
                            onChange={(e) => handleSubServiceChange(subIndex, 'name', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded focus:ring-1 focus:ring-[#022683] outline-none text-sm text-[#E6E6E6]"
                          />
                        ) : (
                          <span className={`text-sm ${sub.enabled ? 'text-[#E6E6E6]' : 'text-[#555555]'}`}>{sub.name}</span>
                        )}
                        <div className="flex items-center gap-2 ml-3">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={sub.enabled}
                              onChange={(e) => editingId === service._id && handleSubServiceChange(subIndex, 'enabled', e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-8 h-4 rounded-full transition-all ${sub.enabled ? 'bg-green-500' : 'bg-[rgba(136,136,136,0.3)]'}`}>
                              <div className={`w-3 h-3 bg-white rounded-full m-0.5 transition-all ${sub.enabled ? 'translate-x-4' : ''}`}></div>
                            </div>
                          </label>
                          {editingId === service._id && (
                            <button
                              onClick={() => handleRemoveSubService(subIndex)}
                              className="p-1.5 text-red-400 hover:bg-[rgba(255,0,0,0.1)] rounded transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {(editingId === service._id ? formData.subServices : service.subServices).length === 0 && (
                      <p className="text-sm text-[#888888] italic text-center py-4">No sub-services defined</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {filteredServices.length === 0 && editingId !== 'new' && (
            <div className="text-center py-20 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg border border-dashed border-[rgba(136,136,136,0.25)]">
              <Search className="w-12 h-12 text-[#888888] mx-auto mb-4 opacity-20" />
              <p className="text-[#888888]">No services found matching your search</p>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] sticky top-8 hover-card-lift animate-fade-in">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5 text-[#888888]" />
              Live Card Preview
            </h3>

            {(editingId ? formData : services.find(s => s.enabled)) && (
              <div className="border border-[rgba(136,136,136,0.25)] rounded-lg p-5 mb-6 bg-[#0F1115] hover:shadow-xl transition-all duration-500 group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[rgba(2,38,131,0.2)] to-[rgba(136,136,136,0.1)] rounded-xl flex items-center justify-center border border-[rgba(2,38,131,0.3)] group-hover:scale-110 transition-transform duration-500">
                    <span className="text-3xl">{(editingId ? formData : services.find(s => s.enabled)).icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1 group-hover:text-[#5b8fff] transition-colors">
                      {(editingId ? formData : services.find(s => s.enabled)).name}
                    </h4>
                    <p className="text-xs text-[#888888] line-clamp-2 leading-relaxed">
                      {(editingId ? formData : services.find(s => s.enabled)).shortDescription || 'No description provided'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mt-4 pt-4 border-t border-[rgba(136,136,136,0.1)]">
                  {(editingId ? formData.subServices : (services.find(s => s.enabled)?.subServices || [])).filter((sub: any) => sub.enabled).slice(0, 3).map((sub: any, idx: number) => (
                    <div key={idx} className="text-xs text-[#E6E6E6] flex items-center gap-2 group/item">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#022683] group-hover/item:scale-125 transition-all"></div>
                      {sub.name}
                    </div>
                  ))}
                  {(editingId ? formData.subServices : (services.find(s => s.enabled)?.subServices || [])).filter((sub: any) => sub.enabled).length > 3 && (
                    <div className="text-[10px] text-[#888888] pl-3.5">+ More services</div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 bg-gradient-to-r from-[rgba(2,38,131,0.2)] to-transparent rounded-lg border border-[rgba(2,38,131,0.3)]">
                <div className="text-2xl font-bold text-[#5b8fff]">{services.filter(s => s.enabled).length}</div>
                <div className="text-xs text-[#888888] uppercase tracking-wider font-medium">Active Categories</div>
              </div>

              <div className="p-4 bg-gradient-to-r from-[rgba(34,197,94,0.1)] to-transparent rounded-lg border border-[rgba(34,197,94,0.2)]">
                <div className="text-2xl font-bold text-green-400">
                  {services.reduce((acc, s) => acc + (s.subServices?.filter((sub: any) => sub.enabled).length || 0), 0)}
                </div>
                <div className="text-xs text-[#888888] uppercase tracking-wider font-medium">Total Sub-Services</div>
              </div>

              <div className="pt-4 mt-2 border-t border-[rgba(136,136,136,0.15)]">
                <h4 className="font-medium text-white mb-3 text-sm">By Category</h4>
                <div className="space-y-2">
                  {categories.map(cat => {
                    const count = services.filter(s => s.category === cat && s.enabled).length;
                    return (
                      <div key={cat} className="flex justify-between items-center group/cat">
                        <span className="text-sm text-[#888888] group-hover/cat:text-[#E6E6E6] transition-colors">{cat}</span>
                        <span className="text-xs font-bold text-white bg-[rgba(136,136,136,0.1)] px-2 py-0.5 rounded-full min-w-[24px] text-center">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg shadow-2xl animate-fade-in z-50 flex items-center gap-3 border border-white/10">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          {toast}
        </div>
      )}
    {deleteId && (
  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
    
    <div className="bg-[#16181D] border border-red-500/30 shadow-2xl rounded-lg p-5 w-96 animate-fade-in pointer-events-auto">
      
      <h3 className="text-sm font-semibold text-white mb-2">
        Delete this service?
      </h3>

      <p className="text-xs text-[#888888] mb-4">
        This will also delete all sub-services.
      </p>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setDeleteId(null)}
          className="px-3 py-1.5 text-xs rounded bg-[rgba(136,136,136,0.2)] text-white hover:bg-[rgba(136,136,136,0.3)] transition"
        >
          Cancel
        </button>

        <button
          onClick={confirmDelete}
          className="px-3 py-1.5 text-xs rounded bg-red-500 text-white hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}
