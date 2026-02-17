import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, GripVertical, Save, Eye, Upload, Loader2, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function TeamManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    city: '',
    bio: '',
    photo: '',
    showOnHome: false,
    showOnTeam: true
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    designation: '',
    city: '',
    bio: ''
  });
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/team-members`);
      setTeamMembers(res.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      showToast('Error loading team members');
    }
  };

  const validateForm = () => {
    const errors = {
      name: '',
      designation: '',
      city: '',
      bio: ''
    };

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.designation.trim()) errors.designation = 'Designation is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.bio.trim()) errors.bio = 'Bio is required';

    setFormErrors(errors);
    return !Object.values(errors).some(err => err !== '');
  };

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      designation: '',
      city: '',
      bio: '',
      photo: '',
      showOnHome: false,
      showOnTeam: true
    });
    setFormErrors({
      name: '',
      designation: '',
      city: '',
      bio: ''
    });
    setShowModal(true);
  };

  const openEditModal = (member: any) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      designation: member.designation,
      city: member.city,
      bio: member.bio,
      photo: member.photo,
      showOnHome: member.showOnHome,
      showOnTeam: member.showOnTeam
    });
    setFormErrors({
      name: '',
      designation: '',
      city: '',
      bio: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setFormData({
      name: '',
      designation: '',
      city: '',
      bio: '',
      photo: '',
      showOnHome: false,
      showOnTeam: true
    });
    setFormErrors({
      name: '',
      designation: '',
      city: '',
      bio: ''
    });
  };

  const handleSaveMember = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingMember) {
        await axios.put(`${API_BASE_URL}/api/team-members/${editingMember._id}`, formData);
        showToast('Team member updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/api/team-members`, formData);
        showToast('Team member added successfully!');
      }
      fetchTeamMembers();
      closeModal();
    } catch (error) {
      console.error('Error saving team member:', error);
      showToast('Error saving team member');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
  if (!deleteId) return;

  setDeleting(true);
  try {
    await axios.delete(`${API_BASE_URL}/api/team-members/${deleteId}`);
    showToast('Team member deleted successfully!');
    fetchTeamMembers();
  } catch (error) {
    console.error('Error deleting team member:', error);
    showToast('Error deleting team member');
  } finally {
    setDeleting(false);
    setDeleteId(null);
  }
};


  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
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
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const clearPhoto = () => {
    setFormData({ ...formData, photo: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-screen">
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-[#888888]">Manage team members and their profiles</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
          <span className="relative z-10">Add Team Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List */}
        <div className="lg:col-span-2 space-y-4">
          {teamMembers.map((member, index) => (
            <div
              key={member._id}
              className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <GripVertical className="w-5 h-5 text-[#888888] cursor-move mt-2 hover:text-[#E6E6E6] transition-colors duration-300" />

                <div className="w-20 h-20 bg-gradient-to-br from-[#0F1115] to-[#16181D] rounded-lg overflow-hidden flex-shrink-0 border border-[rgba(136,136,136,0.25)] hover:border-[#888888] transition-all duration-300">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#888888]">
                      <Upload className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-white">{member.name}</h3>
                  <p className="text-sm text-[#022683] mb-1">{member.designation}</p>
                  <p className="text-sm text-[#888888] mb-2">{member.city}</p>
                  <p className="text-sm text-[#E6E6E6]">{member.bio}</p>
                  <div className="flex gap-3 mt-3">
                    {member.showOnHome && (
                      <span className="px-2 py-1 bg-gradient-to-r from-[rgba(34,197,94,0.3)] to-[rgba(34,197,94,0.2)] text-green-400 text-xs rounded border border-[rgba(34,197,94,0.5)]">Home</span>
                    )}
                    {member.showOnTeam && (
                      <span className="px-2 py-1 bg-gradient-to-r from-[rgba(34,197,94,0.3)] to-[rgba(34,197,94,0.2)] text-green-400 text-xs rounded border border-[rgba(34,197,94,0.5)]">Team Page</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-2 text-[#022683] hover:bg-[rgba(2,38,131,0.1)] rounded transition-all duration-300 hover:scale-110"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(member._id)}
                    className="p-2 text-red-400 hover:bg-[rgba(255,0,0,0.1)] rounded transition-all duration-300 hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {teamMembers.length === 0 && (
            <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-12 border border-[rgba(136,136,136,0.25)] text-center">
              <Upload className="w-16 h-16 text-[#888888] mx-auto mb-4" />
              <p className="text-[#888888] text-lg">No team members added yet</p>
              <p className="text-[#888888] text-sm mt-2">Click "Add Team Member" to create your first profile</p>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] sticky top-8 hover-card-lift animate-fade-in">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#888888]" />
              Card Preview
            </h3>

            {teamMembers.filter(m => m.showOnHome)[0] && (
              <div className="border border-[rgba(136,136,136,0.25)] rounded-lg p-4 mb-4 bg-gradient-to-br from-[#0F1115] to-[#16181D]">
                <div className="w-full aspect-square bg-gradient-to-br from-[#0F1115] to-[#16181D] rounded-lg mb-3 overflow-hidden border border-[rgba(136,136,136,0.25)]">
                  <img
                    src={teamMembers.filter(m => m.showOnHome)[0].photo}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold text-white mb-1">
                  {teamMembers.filter(m => m.showOnHome)[0].name}
                </h4>
                <p className="text-sm text-[#022683] mb-1">
                  {teamMembers.filter(m => m.showOnHome)[0].designation}
                </p>
                <p className="text-xs text-[#888888]">
                  {teamMembers.filter(m => m.showOnHome)[0].city}
                </p>
              </div>
            )}

            <div className="p-3 bg-gradient-to-r from-[rgba(2,38,131,0.2)] to-[rgba(136,136,136,0.2)] rounded-lg border border-[rgba(136,136,136,0.25)]">
              <p className="text-sm text-[#E6E6E6] mb-2">
                <strong>Total Members:</strong> {teamMembers.length}
              </p>
              <p className="text-sm text-[#E6E6E6] mb-2">
                <strong>On Home Page:</strong> {teamMembers.filter(m => m.showOnHome).length}
              </p>
              <p className="text-sm text-[#E6E6E6]">
                <strong>On Team Page:</strong> {teamMembers.filter(m => m.showOnTeam).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Team Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] p-6 rounded-lg w-[600px] border border-[rgba(136,136,136,0.25)] shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingMember ? 'Edit Team Member' : 'Add Team Member'}
            </h3>

            <div className="space-y-4">
              {/* Name and Designation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setFormErrors({ ...formErrors, name: '' });
                    }}
                    className={`w-full px-3 py-2 bg-[#0F1115] border ${formErrors.name ? 'border-red-500' : 'border-[rgba(136,136,136,0.25)]'} rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300`}
                  />
                  {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Partner"
                    value={formData.designation}
                    onChange={(e) => {
                      setFormData({ ...formData, designation: e.target.value });
                      setFormErrors({ ...formErrors, designation: '' });
                    }}
                    className={`w-full px-3 py-2 bg-[#0F1115] border ${formErrors.designation ? 'border-red-500' : 'border-[rgba(136,136,136,0.25)]'} rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300`}
                  />
                  {formErrors.designation && <p className="text-red-400 text-xs mt-1">{formErrors.designation}</p>}
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-1">
                  City *
                </label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                    setFormErrors({ ...formErrors, city: '' });
                  }}
                  className={`w-full px-3 py-2 bg-[#0F1115] border ${formErrors.city ? 'border-red-500' : 'border-[rgba(136,136,136,0.25)]'} rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300`}
                />
                {formErrors.city && <p className="text-red-400 text-xs mt-1">{formErrors.city}</p>}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-1">
                  Bio *
                </label>
                <textarea
                  placeholder="Enter professional bio"
                  value={formData.bio}
                  onChange={(e) => {
                    setFormData({ ...formData, bio: e.target.value });
                    setFormErrors({ ...formErrors, bio: '' });
                  }}
                  rows={3}
                  className={`w-full px-3 py-2 bg-[#0F1115] border ${formErrors.bio ? 'border-red-500' : 'border-[rgba(136,136,136,0.25)]'} rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300`}
                />
                {formErrors.bio && <p className="text-red-400 text-xs mt-1">{formErrors.bio}</p>}
              </div>

              {/* Photo URL */}
              {/* Photo URL & Upload */}
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-1">
                  Photo
                </label>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste photo URL or upload..."
                      value={formData.photo.startsWith('data:') ? 'Local Image Selected' : formData.photo}
                      onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                      readOnly={formData.photo.startsWith('data:')}
                      className={`flex-1 px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 ${formData.photo.startsWith('data:') ? 'opacity-70' : ''}`}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={triggerFileSelect}
                      className="px-4 py-2 bg-[rgba(136,136,136,0.3)] text-[#E6E6E6] rounded-lg hover:bg-[rgba(136,136,136,0.4)] transition-all duration-300 flex items-center gap-2"
                      title="Upload from system"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    {formData.photo && (
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="px-3 py-2 bg-red-900/30 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-900/50 transition-all duration-300"
                        title="Clear photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {formData.photo && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[rgba(136,136,136,0.25)] bg-[#0F1115]">
                      <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <p className="text-[10px] text-white font-bold">Preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Visibility Checkboxes */}
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.showOnHome}
                    onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                    className="w-4 h-4 text-[#022683] bg-[#0F1115] border-[rgba(136,136,136,0.25)] rounded focus:ring-[#022683]"
                  />
                  <span className="text-sm text-[#E6E6E6] group-hover:text-white transition-colors duration-300">Show on Home Page</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.showOnTeam}
                    onChange={(e) => setFormData({ ...formData, showOnTeam: e.target.checked })}
                    className="w-4 h-4 text-[#022683] bg-[#0F1115] border-[rgba(136,136,136,0.25)] rounded focus:ring-[#022683]"
                  />
                  <span className="text-sm text-[#E6E6E6] group-hover:text-white transition-colors duration-300">Show on Team Page</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                disabled={loading}
                className="px-4 py-2 bg-[rgba(136,136,136,0.3)] text-[#E6E6E6] rounded hover:bg-[rgba(136,136,136,0.4)] transition-all duration-300 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveMember}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{editingMember ? 'Update' : 'Add'} Member</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50">
          {toast}
        </div>
      )}
      {deleteId && (
  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
    <div className="bg-[#16181D] border border-red-500/30 shadow-2xl rounded-lg p-6 w-96 animate-fade-in pointer-events-auto">
      
      <h3 className="text-sm font-semibold text-white mb-2">
        Delete this team member?
      </h3>

      <p className="text-xs text-[#888888] mb-4">
        This action cannot be undone.
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
          disabled={deleting}
          className="px-3 py-1.5 text-xs rounded bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

    </div>
  </div>
)}

    </div>
  );
}