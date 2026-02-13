import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GripVertical, Save, X, Briefcase, MapPin, User, Upload, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

interface Alumni {
  _id?: string;
  name: string;
  company: string;
  designation: string;
  country: string;
  yearJoined: string;
  yearLeft: string;
  photo: string;
  bio: string;
  linkedin: string;
  achievements: string;
  enabled: boolean;
  order: number;
}

export default function AlumniManager() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<Alumni | null>(null);
  const [toast, setToast] = useState('');
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    designation: '',
    country: '',
    yearJoined: '',
    yearLeft: '',
    photo: '',
    bio: '',
    linkedin: '',
    achievements: '',
    enabled: true
  });

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      const response = await axios.get(`${API_BASE}/alumni`);
      setAlumni(response.data);
    } catch (err) {
      console.error('Error fetching alumni:', err);
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

  const handleAddNew = () => {
    setEditingAlumni(null);
    setUploadingFile(null);
    setFormData({
      name: '',
      company: '',
      designation: '',
      country: '',
      yearJoined: '',
      yearLeft: '',
      photo: '',
      bio: '',
      linkedin: '',
      achievements: '',
      enabled: true
    });
    setShowModal(true);
  };

  const handleEdit = (alum: Alumni) => {
    setEditingAlumni(alum);
    setUploadingFile(null);
    setFormData({
      name: alum.name,
      company: alum.company,
      designation: alum.designation,
      country: alum.country,
      yearJoined: alum.yearJoined,
      yearLeft: alum.yearLeft,
      photo: alum.photo,
      bio: alum.bio,
      linkedin: alum.linkedin,
      achievements: alum.achievements,
      enabled: alum.enabled
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.company || !formData.designation) {
      setToast('Please fill in all required fields');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('company', formData.company);
    data.append('designation', formData.designation);
    data.append('country', formData.country);
    data.append('yearJoined', formData.yearJoined);
    data.append('yearLeft', formData.yearLeft);
    data.append('bio', formData.bio);
    data.append('linkedin', formData.linkedin);
    data.append('achievements', formData.achievements);
    data.append('enabled', String(formData.enabled));

    if (uploadingFile) {
      data.append('photo', uploadingFile);
    } else if (formData.photo) {
      data.append('photo', formData.photo);
    }

    try {
      if (editingAlumni) {
        await axios.put(`${API_BASE}/alumni/${editingAlumni._id}`, data);
        setToast('Alumni updated successfully!');
      } else {
        await axios.post(`${API_BASE}/alumni`, data);
        setToast('Alumni added successfully!');
      }
      fetchAlumni();
      setShowModal(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error saving alumni';
      setToast(errorMessage);
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this alumni?')) {
      try {
        await axios.delete(`${API_BASE}/alumni/${id}`);
        setToast('Alumni deleted successfully!');
        fetchAlumni();
      } catch (err) {
        setToast('Error deleting alumni');
      }
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Alumni Management</h1>
          <p className="text-[#888888]">Manage alumni profiles and achievements</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
          <span className="relative z-10">Add Alumni</span>
        </button>
      </div>

      {/* Alumni Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {alumni.map((alum, index) => (
          <div
            key={alum._id}
            className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg border border-[rgba(136,136,136,0.25)] overflow-hidden hover-card-lift animate-fade-in transition-all duration-300"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Header with drag handle and status */}
            <div className="flex items-center justify-between p-4 border-b border-[rgba(136,136,136,0.25)] bg-gradient-to-r from-[rgba(136,136,136,0.05)] to-transparent">
              <GripVertical className="w-5 h-5 text-[#888888] cursor-move hover:text-[#E6E6E6] transition-colors duration-300" />
              <span className={`px-2 py-1 text-xs rounded ${alum.enabled
                ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30'
                : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border border-gray-500/30'
                }`}>
                {alum.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Photo and Basic Info */}
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#0F1115] to-[#16181D] border border-[rgba(136,136,136,0.25)]">
                  {alum.photo ? (
                    <img
                      src={alum.photo.startsWith('http') ? alum.photo : `http://localhost:5000/${alum.photo}`}
                      alt={alum.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-[#888888] opacity-50" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-1 truncate">{alum.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-[#888888] mb-1">
                    <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{alum.designation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#888888]">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{alum.country}</span>
                  </div>
                </div>
              </div>

              {/* Company and Years */}
              <div className="mb-4 p-3 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.25)]">
                <p className="text-sm font-medium text-white mb-1">{alum.company}</p>
                <p className="text-xs text-[#888888]">
                  {alum.yearJoined} - {alum.yearLeft}
                  <span className="mx-2">•</span>
                  {(parseInt(alum.yearLeft) || 0) - (parseInt(alum.yearJoined) || 0)} years
                </p>
              </div>

              {/* Bio */}
              {alum.bio && (
                <p className="text-sm text-[#888888] mb-4 line-clamp-3">{alum.bio}</p>
              )}

              {/* Achievements */}
              {alum.achievements && (
                <div className="mb-4 p-3 bg-gradient-to-r from-[#022683]/10 to-[#033aa0]/10 rounded-lg border border-[#022683]/20">
                  <p className="text-xs text-[#888888] line-clamp-2">
                    <strong className="text-[#E6E6E6]">Notable:</strong> {alum.achievements}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-[rgba(136,136,136,0.25)]">
                <button
                  onClick={() => handleEdit(alum)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[rgba(136,136,136,0.1)] text-[#888888] rounded hover:bg-[rgba(136,136,136,0.2)] hover:text-[#E6E6E6] transition-all duration-300 hover:scale-105"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(alum._id!)}
                  className="p-2 text-red-400 hover:bg-[rgba(255,0,0,0.1)] rounded transition-all duration-300 hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {alumni.length === 0 && (
          <div className="col-span-full text-center py-12">
            <User className="w-12 h-12 mx-auto mb-3 text-[#888888] opacity-50" />
            <p className="text-[#888888]">No alumni records found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-gradient-to-br from-[#0F1115] via-[#16181D] to-[#0F1115] rounded-lg shadow-2xl border border-[rgba(136,136,136,0.25)] w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#16181D] to-[#1a1d24] px-6 py-4 flex items-center justify-between border-b border-[rgba(136,136,136,0.25)] z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                {editingAlumni ? 'Edit Alumni' : 'Add New Alumni'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-[rgba(136,136,136,0.1)] rounded-lg transition-all duration-300 hover:rotate-90"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Name and Photo URL */}
              <div className="grid grid-cols-2 gap-4">
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Vikram Singh"
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Photo
                  </label>
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-[rgba(136,136,136,0.25)] rounded-lg p-4 text-center hover:border-[#888888] transition-all duration-300 bg-[#0F1115]">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-[#888888]" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer text-[#022683] hover:text-[#033aa0] font-medium text-sm"
                      >
                        {uploadingFile ? 'Change Photo' : 'Click to upload photo'}
                      </label>
                      {uploadingFile && (
                        <p className="mt-1 text-xs text-green-400 flex items-center justify-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {uploadingFile.name}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ImageIcon className="h-4 w-4 text-[#888888]" />
                      </div>
                      <input
                        type="text"
                        value={formData.photo}
                        onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                        placeholder="Or paste a photo URL here..."
                        className="w-full pl-10 pr-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                      />
                    </div>
                    {(formData.photo && !uploadingFile) && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-[rgba(136,136,136,0.25)] mx-auto">
                        <img
                          src={formData.photo.startsWith('http') ? formData.photo : `http://localhost:5000/${formData.photo}`}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Company and Designation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Current Company <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Deloitte"
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Designation <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g., Senior Manager - Tax"
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>
              </div>

              {/* Country and LinkedIn */}
              <div className="grid grid-cols-2 gap-4">
                <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g., India"
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>
              </div>

              {/* Years */}
              <div className="grid grid-cols-2 gap-4">
                <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Year Joined
                  </label>
                  <input
                    type="text"
                    value={formData.yearJoined}
                    onChange={(e) => setFormData({ ...formData, yearJoined: e.target.value })}
                    placeholder="e.g., 2015"
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '0.45s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Year Left
                  </label>
                  <input
                    type="text"
                    value={formData.yearLeft}
                    onChange={(e) => setFormData({ ...formData, yearLeft: e.target.value })}
                    placeholder="e.g., 2020"
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Short Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief professional summary"
                  rows={3}
                  className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>

              {/* Achievements */}
              <div className="animate-fade-in" style={{ animationDelay: '0.55s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Notable Achievements
                </label>
                <textarea
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  placeholder="Key accomplishments and highlights"
                  rows={2}
                  className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>

              {/* Active Toggle */}
              <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <label className="flex items-center gap-3 cursor-pointer group p-4 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.25)] hover:border-[#888888] transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-all duration-300 ${formData.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-[rgba(136,136,136,0.3)]'} group-hover:shadow-lg`}>
                    <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-all duration-300 shadow-md ${formData.enabled ? 'translate-x-6' : ''} group-hover:scale-110`}></div>
                  </div>
                  <div className="flex-1">
                    <span className="text-[#E6E6E6] font-medium">Active on Website</span>
                    <p className="text-xs text-[#888888] mt-1">Display this alumni on the website</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-[#16181D] to-[#1a1d24] px-6 py-4 flex items-center justify-end gap-3 border-t border-[rgba(136,136,136,0.25)]">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 border border-[rgba(136,136,136,0.25)] text-[#888888] rounded-lg hover:bg-[rgba(136,136,136,0.1)] hover:text-[#E6E6E6] transition-all duration-300 hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Save className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                <span className="relative z-10">{editingAlumni ? 'Update' : 'Add'} Alumni</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-[#888888] to-[#022683] text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in border border-[rgba(255,255,255,0.2)] animate-glow-pulse z-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}