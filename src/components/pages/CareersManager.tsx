import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, Eye, Briefcase, Download, FileText, Loader, MapPin, DollarSign, ExternalLink, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Job {
  _id?: string;
  role: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  experience: string;
  employmentType: string;
  image: string;
  applyLink: string;
  enabled: boolean;
}

interface JobCategory {
  _id?: string;
  name: string;
  enabled: boolean;
  jobs: Job[];
}

interface Application {
  _id?: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  resumeFile: string;
  date: string;
  status: 'New' | 'Received' | 'Shortlisted' | 'Rejected';
}

interface CareerIntro {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  enabled: boolean;
}

export default function CareersManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [careerIntro, setCareerIntro] = useState<CareerIntro>({
    title: '',
    subtitle: '',
    description: '',
    ctaText: '',
    enabled: true
  });

  const [jobCategories, setJobCategories] = useState<JobCategory[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const showToast = (message: string, type: string = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3000);
  };

  // Fetch data from backend
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCareerIntro(),
        fetchJobOpenings(),
        fetchApplications()
      ]);
    } catch (error) {
      showToast('Error loading careers data', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCareerIntro = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/career-intro`);
      if (!response.ok) throw new Error('Failed to fetch career intro');
      const data = await response.json();
      setCareerIntro(data);
    } catch (error) {
      console.error('Error fetching career intro:', error);
    }
  };

  const fetchJobOpenings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/job-openings`);
      if (!response.ok) throw new Error('Failed to fetch job openings');
      const data = await response.json();
      setJobCategories(data);
    } catch (error) {
      console.error('Error fetching job openings:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/applications`);
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const updateCareerIntro = (field: string, value: string | boolean) => {
    setCareerIntro({ ...careerIntro, [field]: value });
  };

  const updateCategoryName = (id: string, name: string) => {
    setJobCategories(jobCategories.map(cat =>
      cat._id === id ? { ...cat, name } : cat
    ));
  };

  const toggleCategoryEnabled = (id: string) => {
    setJobCategories(jobCategories.map(cat =>
      cat._id === id ? { ...cat, enabled: !cat.enabled } : cat
    ));
  };

  const updateJobField = (categoryId: string, jobId: string, field: string, value: string | boolean) => {
    setJobCategories(jobCategories.map(cat =>
      cat._id === categoryId ? {
        ...cat,
        jobs: cat.jobs.map(job =>
          job._id === jobId ? { ...job, [field]: value } : job
        )
      } : cat
    ));
  };

  const deleteJob = async (categoryId: string, jobId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/job-openings/${categoryId}/jobs/${jobId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete');

      setJobCategories(jobCategories.map(cat =>
        cat._id === categoryId ? {
          ...cat,
          jobs: cat.jobs.filter(job => job._id !== jobId)
        } : cat
      ));
      showToast('Job deleted successfully');
    } catch (error) {
      showToast('Error deleting job', 'error');
      console.error('Error:', error);
    }
  };

  const updateApplicationField = (id: string, field: string, value: string) => {
    setApplications(applications.map(app =>
      app._id === id ? { ...app, [field]: value } : app
    ));
  };

  const deleteApplication = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete');

      setApplications(applications.filter(app => app._id !== id));
      showToast('Application deleted successfully');
    } catch (error) {
      showToast('Error deleting application', 'error');
      console.error('Error:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Save career intro
      await fetch(`${API_BASE_URL}/api/career-intro`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(careerIntro)
      });

      // Save job openings
      await fetch(`${API_BASE_URL}/api/job-openings/save-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ jobCategories })
      });

      // Save applications
      await fetch(`${API_BASE_URL}/api/applications/save-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ applications })
      });

      showToast('Careers page saved successfully!');
    } catch (error) {
      showToast('Error saving careers data', 'error');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/applications/export`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `applications_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('Applications exported to CSV successfully!');
    } catch (error) {
      showToast('Error exporting applications', 'error');
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-screen">
      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 text-[#022683] animate-spin" />
            <p className="text-[#888888]">Loading careers data...</p>
          </div>
        </div>
      )}

      {!loading && (
        <>
          <div className="mb-8 flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Careers Management</h1>
              <p className="text-[#888888]">Manage career page content, job openings and applications</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
              <Plus className="w-4 h-4" />
              Add Job Category
            </button>
          </div>

          <div className="space-y-6">
            {/* ========== SECTION 1: CAREER INTRODUCTION ========== */}
            <div className="bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#E6E6E6]">Career Introduction Section</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={careerIntro.enabled} onChange={() => updateCareerIntro('enabled', !careerIntro.enabled)} className="sr-only" />
                  <div className={`w-10 h-5 rounded-full duration-300 ${careerIntro.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-600 to-gray-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform duration-300 ${careerIntro.enabled ? 'translate-x-5' : ''}`}></div>
                  </div>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Main Title
                  </label>
                  <input
                    type="text"
                    value={careerIntro.title}
                    onChange={(e) => updateCareerIntro('title', e.target.value)}
                    placeholder="e.g., Careers"
                    className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={careerIntro.subtitle}
                    onChange={(e) => updateCareerIntro('subtitle', e.target.value)}
                    placeholder="e.g., Join a team built on professionalism, growth, and integrity."
                    className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Description
                  </label>
                  <textarea
                    value={careerIntro.description}
                    onChange={(e) => updateCareerIntro('description', e.target.value)}
                    rows={3}
                    placeholder="Additional description about careers..."
                    className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">

              {/* ========== SECTION 2: JOB OPENINGS ========== */}
              <div className="bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
                <h2 className="text-xl font-bold text-[#E6E6E6] mb-6">Job Openings</h2>

                <div className="space-y-4">
                  {jobCategories.map((category) => (
                    <div key={category._id} className="border border-[rgba(136,136,136,0.25)] rounded-lg bg-[#0F1115]">
                      <div className="p-4 bg-[#16181D] flex items-center justify-between rounded-t-lg border-b border-[rgba(136,136,136,0.1)]">
                        <div className="flex items-center gap-3 flex-1">
                          <Briefcase className="w-5 h-5 text-[#022683]" />
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => updateCategoryName(category._id || '', e.target.value)}
                            className="flex-1 px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none font-bold text-[#E6E6E6] hover:border-[#888888] transition-colors"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#888888]">
                            {category.jobs.filter(j => j.enabled).length} openings
                          </span>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={category.enabled} onChange={() => toggleCategoryEnabled(category._id || '')} className="sr-only" />
                            <div className={`w-10 h-5 rounded-full duration-300 ${category.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-600 to-gray-700'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform duration-300 ${category.enabled ? 'translate-x-5' : ''}`}></div>
                            </div>
                          </label>
                          <button
                            onClick={() => setExpandedCategory(expandedCategory === category._id ? null : category._id || '')}
                            className="p-2 hover:bg-[rgba(136,136,136,0.1)] rounded text-[#888888] hover:text-[#E6E6E6] transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {expandedCategory === category._id && (
                        <div className="p-4 space-y-3">
                          {category.jobs.map((job) => (
                            <div key={job._id} className="p-4 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg">
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-[#888888] mb-1">
                                    Job Role
                                  </label>
                                  <input
                                    type="text"
                                    value={job.role}
                                    onChange={(e) => updateJobField(category._id || '', job._id || '', 'role', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                                    placeholder="e.g., Senior Auditor"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-[#888888] mb-1">
                                    Job Description
                                  </label>
                                  <textarea
                                    value={job.description}
                                    rows={2}
                                    onChange={(e) => updateJobField(category._id || '', job._id || '', 'description', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                                    placeholder="Brief description of the role..."
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[#888888] mb-1">
                                    Requirements
                                  </label>
                                  <textarea
                                    value={job.requirements}
                                    rows={3}
                                    onChange={(e) => updateJobField(category._id || '', job._id || '', 'requirements', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                                    placeholder="Enter requirements (one per line)..."
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[#888888] mb-1">
                                    Key Responsibilities
                                  </label>
                                  <textarea
                                    value={job.responsibilities}
                                    rows={3}
                                    onChange={(e) => updateJobField(category._id || '', job._id || '', 'responsibilities', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                                    placeholder="Enter responsibilities (one per line)..."
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-medium text-[#888888] mb-1">
                                      Location
                                    </label>
                                    <input
                                      type="text"
                                      value={job.location}
                                      onChange={(e) => updateJobField(category._id || '', job._id || '', 'location', e.target.value)}
                                      className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                                      placeholder="e.g., Mumbai, Bangalore"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-[#888888] mb-1">
                                      Experience Required
                                    </label>
                                    <input
                                      type="text"
                                      value={job.experience}
                                      onChange={(e) => updateJobField(category._id || '', job._id || '', 'experience', e.target.value)}
                                      className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                                      placeholder="e.g., 5+ years, 0-1 years"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-medium text-[#888888] mb-1">
                                      Employment Type
                                    </label>
                                    <select
                                      value={job.employmentType}
                                      onChange={(e) => updateJobField(category._id || '', job._id || '', 'employmentType', e.target.value)}
                                      className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                                    >
                                      <option>Full-time</option>
                                      <option>Part-time</option>
                                      <option>Contract</option>
                                      <option>Internship</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-[#888888] mb-1">
                                      Apply Link
                                    </label>
                                    <input
                                      type="text"
                                      value={job.applyLink}
                                      onChange={(e) => updateJobField(category._id || '', job._id || '', 'applyLink', e.target.value)}
                                      className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                                      placeholder="/apply/job-id"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[#888888] mb-1">
                                    Job Image URL
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={job.image}
                                      onChange={(e) => updateJobField(category._id || '', job._id || '', 'image', e.target.value)}
                                      placeholder="https://example.com/image.jpg"
                                      className="flex-1 px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                                    />
                                    <button className="px-3 py-2 bg-[#1A1D24] text-[#888888] rounded-lg hover:text-[#E6E6E6] border border-[rgba(136,136,136,0.25)]">
                                      Upload
                                    </button>
                                  </div>
                                  {job.image && (
                                    <div className="mt-2 w-32 h-32 bg-[#0F1115] rounded-lg overflow-hidden border border-[rgba(136,136,136,0.25)]">
                                      <img src={job.image} alt={job.role} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/128?text=No+Image'; }} />
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-[rgba(136,136,136,0.25)]">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-sm font-medium text-[#888888]">Enable/Disable</span>
                                    <input type="checkbox" checked={job.enabled} onChange={() => updateJobField(category._id || '', job._id || '', 'enabled', !job.enabled)} className="sr-only" />
                                    <div className={`w-10 h-5 rounded-full duration-300 ${job.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-600 to-gray-700'}`}>
                                      <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform duration-300 ${job.enabled ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                  </label>
                                  <button
                                    onClick={() => deleteJob(category._id || '', job._id || '')}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          <button className="w-full py-2 border-2 border-dashed border-[rgba(136,136,136,0.25)] rounded-lg text-sm text-[#888888] hover:border-[#022683] hover:text-[#022683] hover:bg-[#022683]/5 transition-all">
                            + Add Job Role
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ========== SECTION 3: RECENT APPLICATIONS ========== */}
              <div className="bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#E6E6E6]">Recent Applications</h2>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all shadow-md active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[rgba(136,136,136,0.25)]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Mobile</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Role Applied</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Resume</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(136,136,136,0.1)]">
                      {applications.map((app) => (
                        <tr key={app._id} className="hover:bg-[rgba(136,136,136,0.05)] transition-colors">
                          <td className="px-4 py-3 text-sm text-[#E6E6E6] font-medium">{app.name}</td>
                          <td className="px-4 py-3 text-sm text-[#888888]">{app.email}</td>
                          <td className="px-4 py-3 text-sm text-[#888888]">{app.mobile}</td>
                          <td className="px-4 py-3 text-sm text-[#E6E6E6]">{app.role}</td>
                          <td className="px-4 py-3 text-sm">
                            <a href="#" className="flex items-center gap-1 text-[#0077b5] hover:text-[#005a8c] transition-colors">
                              <FileText className="w-4 h-4" />
                              {app.resumeFile}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#888888]">{app.date}</td>
                          <td className="px-4 py-3">
                            <select
                              value={app.status}
                              onChange={(e) => updateApplicationField(app._id || '', 'status', e.target.value)}
                              className="text-xs rounded-full px-3 py-1 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none"
                            >
                              <option>New</option>
                              <option>Received</option>
                              <option>Shortlisted</option>
                              <option>Rejected</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => deleteApplication(app._id || '')}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="lg:col-span-1">
              <div className="bg-[#16181D] rounded-lg shadow-lg p-6 sticky top-8 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
                <h3 className="font-bold text-[#E6E6E6] mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#022683]" />
                  Overview
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-[rgba(2,38,131,0.1)] rounded-lg border border-[rgba(2,38,131,0.2)]">
                    <div className="text-2xl font-bold text-[#022683]">
                      {jobCategories.reduce((acc, cat) => acc + cat.jobs.filter(j => j.enabled).length, 0)}
                    </div>
                    <div className="text-sm text-[#022683]">Active Openings</div>
                  </div>

                  <div className="p-4 bg-[rgba(22,101,52,0.1)] rounded-lg border border-[rgba(22,101,52,0.2)]">
                    <div className="text-2xl font-bold text-green-500">{applications.length}</div>
                    <div className="text-sm text-green-500">Total Applications</div>
                  </div>

                  <div className="p-4 bg-[rgba(147,51,234,0.1)] rounded-lg border border-[rgba(147,51,234,0.2)]">
                    <div className="text-2xl font-bold text-purple-500">
                      {applications.filter(a => a.status === 'Shortlisted').length}
                    </div>
                    <div className="text-sm text-purple-500">Shortlisted</div>
                  </div>

                  <div className="pt-4 border-t border-[rgba(136,136,136,0.25)]">
                    <h4 className="font-medium text-[#E6E6E6] mb-3">Applications by Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#888888]">New</span>
                        <span className="font-medium text-[#E6E6E6]">
                          {applications.filter(a => a.status === 'New').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#888888]">Received</span>
                        <span className="font-medium text-[#E6E6E6]">
                          {applications.filter(a => a.status === 'Received').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#888888]">Shortlisted</span>
                        <span className="font-medium text-[#E6E6E6]">
                          {applications.filter(a => a.status === 'Shortlisted').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#888888]">Rejected</span>
                        <span className="font-medium text-[#E6E6E6]">
                          {applications.filter(a => a.status === 'Rejected').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </>
      )}

      {toast.message && (
        <div className={`fixed bottom-8 right-8 ${toast.type === 'error' ? 'bg-red-500/90 border-red-500/50' : 'bg-green-500/90 border-green-500/50'} text-white px-6 py-3 rounded-lg shadow-2xl backdrop-blur-sm border animate-fade-in flex items-center gap-2`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}