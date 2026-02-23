import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, Eye, Briefcase, ChevronDown, ChevronUp, Download, FileText, Loader, MapPin, DollarSign, ExternalLink, X, MessageSquare } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Job {
  _id: string;
  role: string;
  shortDescription: string;
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
  _id: string;
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
  message: string;
  date: string;
  createdAt?: string;
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
  const [savingIntro, setSavingIntro] = useState(false);
  const [savingJobs, setSavingJobs] = useState(false);
  const [savingApplications, setSavingApplications] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [deleteState, setDeleteState] = useState<{
    type: "category" | "job" | "application" | null;
    categoryId?: string;
    jobId?: string;
    applicationId?: string;
  }>({ type: null });

  const [deleting, setDeleting] = useState(false);
  const [viewingMessage, setViewingMessage] = useState<Application | null>(null);



  const openDeleteCategory = (categoryId: string) => {
    setDeleteState({ type: "category", categoryId });
  };

  const openDeleteJob = (categoryId: string, jobId: string) => {
    setDeleteState({ type: "job", categoryId, jobId });
  };

  const openDeleteApplication = (applicationId: string) => {
    setDeleteState({ type: "application", applicationId });
  };

  const confirmDelete = async () => {
    if (!deleteState.type) return;

    try {
      setDeleting(true);

      if (deleteState.type === "category" && deleteState.categoryId) {
        const res = await fetch(
          `${API_BASE_URL}/api/job-categories/${deleteState.categoryId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error();

        setJobCategories((prev) =>
          prev.filter((cat) => cat._id !== deleteState.categoryId)
        );

        showToast("Category deleted!");
      }

      if (
        deleteState.type === "job" &&
        deleteState.categoryId &&
        deleteState.jobId
      ) {
        const res = await fetch(
          `${API_BASE_URL}/api/job-categories/${deleteState.categoryId}/jobs/${deleteState.jobId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        const updatedCategory = await res.json();

        setJobCategories((prev) =>
          prev.map((cat) =>
            cat._id === deleteState.categoryId ? updatedCategory : cat
          )
        );

        showToast("Job deleted!");
      }

      if (
        deleteState.type === "application" &&
        deleteState.applicationId
      ) {
        const res = await fetch(
          `${API_BASE_URL}/api/applications/${deleteState.applicationId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error();

        setApplications((prev) =>
          prev.filter((app) => app._id !== deleteState.applicationId)
        );

        showToast("Application deleted!");
      }
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleting(false);
      setDeleteState({ type: null });
    }
  };


  // SECTION 1: Career Intro
  const [careerIntro, setCareerIntro] = useState<CareerIntro>({
    title: '',
    subtitle: '',
    description: '',
    ctaText: '',
    enabled: true
  });

  // SECTION 2: Job Openings
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([]);

  // SECTION 3: Applications
  const [applications, setApplications] = useState<Application[]>([]);

  const showToast = (message: string, type: string = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3000);
  };

  // ============ SECTION 1: CAREER INTRO ============
  useEffect(() => {
    fetchCareerIntro();
    fetchApplications();
    fetchJobCategories();   // 👈 ADD THIS
  }, []);

  const fetchCareerIntro = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/career-intro`, {
        credentials: 'include'
      });
      const data = await res.json();
      setCareerIntro(data);
    } catch (error) {
      showToast('Failed to load career intro', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateCareerIntro = (field: keyof CareerIntro, value: any) => {
    setCareerIntro(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveCareerIntro = async () => {
    try {
      setSavingIntro(true);
      const res = await fetch(`${API_BASE_URL}/api/career-intro`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(careerIntro)
      });

      if (!res.ok) throw new Error('Failed to save');
      showToast('Career intro saved successfully!');
    } catch (error) {
      showToast('Error saving career intro', 'error');
    } finally {
      setSavingIntro(false);
    }
  };

  // ============ SECTION 2: JOB OPENINGS ============

  const fetchJobCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/job-categories`, {
        credentials: "include",
      });

      const data = await res.json();
      setJobCategories(data);
    } catch {
      showToast("Failed to load job categories", "error");
    }
  };

  const addNewCategory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/job-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: "New Category",
          enabled: true,
          jobs: [],
        }),
      });

      if (!res.ok) throw new Error();

      const newCategory = await res.json();

      setJobCategories((prev) => [newCategory, ...prev]);
      showToast("Category created!");
    } catch {
      showToast("Failed to create category", "error");
    }
  };


  const updateCategoryName = async (categoryId: string, name: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/job-categories/${categoryId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name }),
        }
      );

      if (!res.ok) throw new Error();

      const updated = await res.json();

      setJobCategories((prev) =>
        prev.map((cat) => (cat._id === categoryId ? updated : cat))
      );
    } catch {
      showToast("Failed to update category", "error");
    }
  };


  const toggleCategoryEnabled = async (categoryId: string, enabled: boolean) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/job-categories/${categoryId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ enabled }),
        }
      );

      const updated = await res.json();

      setJobCategories((prev) =>
        prev.map((cat) => (cat._id === categoryId ? updated : cat))
      );
    } catch {
      showToast("Failed to update category", "error");
    }
  };

  const deleteCategory = async (categoryId: string) => {

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/job-categories/${categoryId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error();

      setJobCategories((prev) =>
        prev.filter((cat) => cat._id !== categoryId)
      );

      showToast("Category deleted!");
    } catch {
      showToast("Delete failed", "error");
    }
  };


  const addJobToCategory = async (categoryId: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/job-categories/${categoryId}/jobs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            role: "",
            shortDescription: "",
            description: "",
            requirements: "",
            responsibilities: "",
            location: "",
            experience: "",
            employmentType: "Full-time",
            applyLink: "",
            image: "",
            enabled: true,
          }),
        }
      );

      const updatedCategory = await res.json();

      setJobCategories((prev) =>
        prev.map((cat) =>
          cat._id === categoryId ? updatedCategory : cat
        )
      );
    } catch {
      showToast("Failed to add job", "error");
    }
  };



  const updateJobField = async (
    categoryId: string,
    jobId: string,
    field: keyof Job,
    value: any
  ) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/job-categories/${categoryId}/jobs/${jobId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ [field]: value }),
        }
      );

      const updatedCategory = await res.json();

      setJobCategories((prev) =>
        prev.map((cat) =>
          cat._id === categoryId ? updatedCategory : cat
        )
      );
    } catch {
      showToast("Failed to update job", "error");
    }
  };


  const deleteJob = async (categoryId: string, jobId: string) => {

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/job-categories/${categoryId}/jobs/${jobId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const updatedCategory = await res.json();

      setJobCategories((prev) =>
        prev.map((cat) =>
          cat._id === categoryId ? updatedCategory : cat
        )
      );
    } catch {
      showToast("Failed to delete job", "error");
    }
  };


  const saveJobOpenings = async () => {
    try {
      setSavingJobs(true);
      const response = await fetch(`${API_BASE_URL}/api/job-categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(jobCategories),
      });

      if (!response.ok) throw new Error('Failed to save');
      const data = await response.json();
      setJobCategories(data);
      showToast("Job openings saved successfully!");
    } catch (error) {
      showToast("Error saving job openings", 'error');
    } finally {
      setSavingJobs(false);
    }
  };

  // ============ SECTION 3: APPLICATIONS ============
  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications`, {
        credentials: 'include'
      });
      const data = await res.json();
      setApplications(data);
    } catch (error) {
      showToast('Failed to load applications', 'error');
    }
  };

  const updateApplicationField = async (
    applicationId: string,
    value: string
  ) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: value }),
        }
      );

      if (!res.ok) throw new Error();

      const updated = await res.json();

      setApplications((prev) =>
        prev.map((app) =>
          app._id === updated._id ? updated : app
        )
      );

      showToast("Status updated successfully!");
    } catch {
      showToast("Failed to update status", "error");
    }
  };


  const deleteApplication = async (applicationId: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/applications/${applicationId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error();

      setApplications((prev) =>
        prev.filter((app) => app._id !== applicationId)
      );

      showToast("Application deleted successfully!");
    } catch {
      showToast("Failed to delete application", "error");
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
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
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
          </div>

          <div className="space-y-6">
            {/* ============ SECTION 1: CAREER INTRODUCTION ============ */}
            <div className="bg-[#16181D] rounded-xl shadow-xl p-6 border border-[rgba(136,136,136,0.2)] transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Career Introduction Section</h2>
                  <p className="text-sm text-[#888888]">Manage the main intro section of the careers page</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#888888]">Enabled</span>

                    <button
                      type="button"
                      onClick={() =>
                        updateCareerIntro("enabled", !careerIntro.enabled)
                      }
                      className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${careerIntro.enabled ? "bg-green-500" : "bg-gray-600"
                        }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${careerIntro.enabled ? "translate-x-6" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>



                  <button
                    onClick={saveCareerIntro}
                    disabled={savingIntro}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-md disabled:opacity-50"
                  >
                    {savingIntro ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {savingIntro ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>


              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#888888] mb-2">Title</label>
                    <input
                      type="text"
                      value={careerIntro.title}
                      onChange={(e) => updateCareerIntro('title', e.target.value)}
                      className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#888888] mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={careerIntro.subtitle}
                      onChange={(e) => updateCareerIntro('subtitle', e.target.value)}
                      className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#888888] mb-2">CTA Text</label>
                    <input
                      type="text"
                      value={careerIntro.ctaText}
                      onChange={(e) => updateCareerIntro('ctaText', e.target.value)}
                      className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#888888] mb-2">Description</label>
                    <textarea
                      value={careerIntro.description}
                      onChange={(e) => updateCareerIntro('description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ============ SECTION 2: JOB OPENINGS ============ */}
            <div className="bg-[#16181D] rounded-xl shadow-xl p-6 border border-[rgba(136,136,136,0.2)] transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Job Openings & Categories</h2>
                  <p className="text-sm text-[#888888]">Manage job roles and categories</p>
                </div>
                <button
                  onClick={addNewCategory}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add New Category
                </button>
              </div>

              <div className="space-y-4">
                {jobCategories.length === 0 ? (
                  <p className="text-center text-[#888888] py-8">No categories yet. Add one to get started.</p>
                ) : (
                  jobCategories.map((category) => (
                    <div
                      key={category._id}
                      className="border border-[rgba(136,136,136,0.25)] rounded-lg bg-[#0F1115] overflow-hidden"
                    >
                      {/* Category Header */}
                      <div className="p-4 bg-[#16181D] flex items-center justify-between border-b border-[rgba(136,136,136,0.1)]">
                        <div className="flex items-center gap-3 flex-1">
                          <Briefcase className="w-5 h-5 text-[#022683]" />
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) =>
                              updateCategoryName(category._id!, e.target.value)
                            }
                            className="flex-1 px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-[#888888]">
                            {category.jobs.filter((j) => j.enabled).length}/{category.jobs.length} active
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              toggleCategoryEnabled(category._id!, !category.enabled)
                            }
                            className={`relative w-10 h-5 flex items-center rounded-full p-1 transition-all duration-300 ${category.enabled ? "bg-green-500" : "bg-gray-600"
                              }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${category.enabled ? "translate-x-5" : "translate-x-0"
                                }`}
                            />
                          </button>
                          <button
                            onClick={() =>
                              setExpandedCategory(
                                expandedCategory === category._id
                                  ? null
                                  : category._id!
                              )
                            }
                            className="text-[#888888] hover:text-[#E6E6E6] transition"
                          >
                            {expandedCategory === category._id ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </button>
                          <button
                            onClick={() => openDeleteCategory(category._id!)}
                            className="text-red-500 hover:text-red-400 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Jobs List */}
                      {expandedCategory === category._id && (
                        <div className="p-4 space-y-4 bg-[#0F1115]">
                          {category.jobs.length === 0 ? (
                            <p className="text-center text-[#888888] py-8">No jobs in this category yet.</p>
                          ) : (
                            category.jobs.map((job) => (
                              <div
                                key={job._id}
                                className="bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg"
                              >
                                {/* JOB HEADER */}
                                <div
                                  className="p-4 flex justify-between items-center cursor-pointer"
                                  onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                                >
                                  <span className="text-white font-medium">
                                    {job.role || "New Job"}
                                  </span>
                                  <span className="text-[#888888]">
                                    {expandedJob === job._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                  </span>
                                </div>

                                {expandedJob === job._id && (
                                  <div className="p-4 space-y-4 border-t border-[rgba(136,136,136,0.1)]">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-xs font-medium text-[#888888] mb-1">Job Role *</label>
                                        <input
                                          type="text"
                                          value={job.role}
                                          onChange={(e) => updateJobField(category._id!, job._id!, "role", e.target.value)}
                                          className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white outline-none focus:ring-1 focus:ring-[#022683]"
                                        />
                                      </div>
                                      <div className="flex items-center justify-end gap-2">
                                        <span className="text-xs text-[#888888]">Enabled</span>
                                        <button
                                          type="button"
                                          onClick={() => updateJobField(category._id!, job._id!, "enabled", !job.enabled)}
                                          className={`relative w-10 h-5 flex items-center rounded-full p-1 transition-all ${job.enabled ? "bg-green-500" : "bg-gray-600"}`}
                                        >
                                          <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${job.enabled ? "translate-x-5" : "translate-x-0"}`} />
                                        </button>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-[#888888] mb-1">Short Description (Accordion Header)</label>
                                      <input
                                        type="text"
                                        value={job.shortDescription}
                                        placeholder="Briefly describe the role for the summary..."
                                        onChange={(e) => updateJobField(category._id!, job._id!, "shortDescription", e.target.value)}
                                        className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white outline-none focus:ring-1 focus:ring-[#022683]"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-[#888888] mb-1">Full Description</label>
                                      <textarea
                                        rows={3}
                                        value={job.description}
                                        onChange={(e) => updateJobField(category._id!, job._id!, "description", e.target.value)}
                                        className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white outline-none resize-none focus:ring-1 focus:ring-[#022683]"
                                      />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-xs font-medium text-[#888888] mb-1">Location</label>
                                        <input
                                          type="text"
                                          value={job.location}
                                          onChange={(e) => updateJobField(category._id!, job._id!, "location", e.target.value)}
                                          className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white outline-none focus:ring-1 focus:ring-[#022683]"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-[#888888] mb-1">Experience</label>
                                        <input
                                          type="text"
                                          value={job.experience}
                                          onChange={(e) => updateJobField(category._id!, job._id!, "experience", e.target.value)}
                                          className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white outline-none focus:ring-1 focus:ring-[#022683]"
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-xs font-medium text-[#888888] mb-1">Employment Type</label>
                                        <select
                                          value={job.employmentType}
                                          onChange={(e) => updateJobField(category._id!, job._id!, "employmentType", e.target.value)}
                                          className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white outline-none focus:ring-1 focus:ring-[#022683]"
                                        >
                                          <option>Full-time</option>
                                          <option>Part-time</option>
                                          <option>Contract</option>
                                          <option>Internship</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-[#888888] mb-1">Apply Link</label>
                                        <input
                                          type="url"
                                          value={job.applyLink}
                                          onChange={(e) => updateJobField(category._id!, job._id!, "applyLink", e.target.value)}
                                          className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white outline-none focus:ring-1 focus:ring-[#022683]"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-[#888888] mb-1">Requirements</label>
                                      <textarea
                                        rows={3}
                                        value={job.requirements}
                                        onChange={(e) => updateJobField(category._id!, job._id!, "requirements", e.target.value)}
                                        className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white outline-none resize-none focus:ring-1 focus:ring-[#022683]"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-[#888888] mb-1">Responsibilities</label>
                                      <textarea
                                        rows={3}
                                        value={job.responsibilities}
                                        onChange={(e) => updateJobField(category._id!, job._id!, "responsibilities", e.target.value)}
                                        className="w-full px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white outline-none resize-none focus:ring-1 focus:ring-[#022683]"
                                      />
                                    </div>

                                    <div className="flex justify-end pt-3 border-t border-[rgba(136,136,136,0.25)]">
                                      <button
                                        onClick={() => openDeleteJob(category._id!, job._id!)}
                                        className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded transition-all"
                                      >
                                        <Trash2 size={16} />
                                        Delete Job
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                          <button
                            onClick={() => addJobToCategory(category._id!)}
                            className="flex items-center gap-2 px-4 py-2.5 w-full justify-center bg-[#022683] hover:bg-[#033aa0] text-white rounded-lg transition-all"
                          >
                            <Plus size={18} />
                            Add Job to {category.name}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ============ SECTION 3: APPLICATIONS ============ */}
            <div className="bg-[#16181D] rounded-xl shadow-xl p-6 border border-[rgba(136,136,136,0.2)] transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Recent Applications</h2>
                  <p className="text-sm text-[#888888]">Manage job applications</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-600 text-white rounded-lg transition-all shadow-md active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>


                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(136,136,136,0.25)]">
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Applied For</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Resume</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(136,136,136,0.1)]">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-[#888888]">
                          No applications yet
                        </td>
                      </tr>
                    ) : (
                      applications.map((app) => (
                        <tr key={app._id} className="hover:bg-[rgba(136,136,136,0.05)] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#022683] to-[#033aa0] flex items-center justify-center text-white text-[10px] font-bold shadow-lg flex-shrink-0">
                                {app.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                              <div className="text-sm text-[#E6E6E6] font-medium truncate max-w-[120px]" title={app.name}>
                                {app.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#888888]">{app.email}</td>
                          <td className="px-4 py-3 text-sm text-[#E6E6E6]">
                            <span className="px-2 py-1 bg-[rgba(136,136,136,0.1)] rounded text-[11px] text-[#888888]">
                              {app.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <a
                              href={`${API_BASE_URL}/uploads/resumes/${app.resumeFile}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[#0077b5] hover:text-[#005a8c] transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              View
                            </a>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#888888]">
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={app.status}
                              onChange={(e) =>
                                updateApplicationField(app._id!, e.target.value)
                              }
                              className="text-xs rounded-full px-3 py-1.5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none cursor-pointer"
                            >
                              <option value="New">New</option>
                              <option value="Received">Received</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              {/* <button
                                onClick={() => setViewingMessage(app)}
                                className="p-1.5 text-[#888888] hover:text-white hover:bg-white/5 rounded transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button> */}
                              <button
                                onClick={() => openDeleteApplication(app._id!)}
                                className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {toast.message && (
        <div className={`fixed bottom-8 right-8 ${toast.type === 'error' ? 'bg-red-500/90 border-red-500/50' : 'bg-green-500/90 border-green-500/50'} text-white px-6 py-3 rounded-lg shadow-2xl backdrop-blur-sm border animate-fade-in flex items-center gap-2`}>
          {toast.message}
        </div>
      )}
      {deleteState.type && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] 
      border border-red-500/30 
      shadow-2xl 
      rounded-xl 
      p-8 
      w-full 
      max-w-md 
      animate-scale-in">

            <h3 className="text-lg font-semibold text-white mb-3">
              Confirm Deletion
            </h3>

            <p className="text-sm text-[#888888] mb-6">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteState({ type: null })}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-[rgba(136,136,136,0.2)] text-white hover:bg-[rgba(136,136,136,0.3)] transition-all"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Side Drawer */}
      {viewingMessage && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setViewingMessage(null)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-lg bg-[#16181D] h-full shadow-2xl border-l border-[rgba(136,136,136,0.1)] flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-[rgba(136,136,136,0.1)] flex items-center justify-between bg-[#0F1115]">
              <h3 className="text-xl font-bold text-white">Application Detail</h3>
              <button
                onClick={() => setViewingMessage(null)}
                className="p-2 hover:bg-white/10 rounded-full text-[#888888] hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Header Info */}
              <div className="flex items-center gap-5 pb-8 border-b border-[rgba(136,136,136,0.05)]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#022683] to-[#033aa0] flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                  {viewingMessage.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-1">{viewingMessage.name}</h4>
                  <span className="px-3 py-1 bg-[#022683]/20 text-[#022683] text-xs font-semibold rounded-full border border-[#022683]/30">
                    {viewingMessage.role}
                  </span>
                </div>
              </div>

              {/* Contact Details Grid */}
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-[#0F1115] rounded-xl border border-[rgba(136,136,136,0.1)]">
                    <X className="w-4 h-4 text-[#888888] rotate-45" /> {/* Placeholder for Email icon if needed */}
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-[#E6E6E6] font-medium">{viewingMessage.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-[#0F1115] rounded-xl border border-[rgba(136,136,136,0.1)]">
                    <MapPin className="w-4 h-4 text-[#888888]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] uppercase tracking-wider mb-1">Mobile Number</p>
                    <p className="text-[#E6E6E6] font-medium">{viewingMessage.mobile || 'Not Provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-[#0F1115] rounded-xl border border-[rgba(136,136,136,0.1)]">
                    <FileText className="w-4 h-4 text-[#888888]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] uppercase tracking-wider mb-1">Resume</p>
                    <a
                      href={`${API_BASE_URL}/uploads/resumes/${viewingMessage.resumeFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#022683] hover:underline font-medium flex items-center gap-1"
                    >
                      View Resume Document <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-3 pt-4">
                <p className="text-xs text-[#888888] uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Cover Message
                </p>
                <div className="bg-[#0F1115] p-6 rounded-2xl border border-[rgba(136,136,136,0.1)] relative group">
                  <p className="text-[#E6E6E6] leading-relaxed whitespace-pre-wrap italic">
                    "{viewingMessage.message || 'No message provided'}"
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#0F1115] border-t border-[rgba(136,136,136,0.1)] flex gap-3">
              <button
                onClick={() => setViewingMessage(null)}
                className="flex-1 py-3 bg-[rgba(136,136,136,0.1)] hover:bg-[rgba(136,136,136,0.2)] text-white rounded-xl transition-all font-medium"
              >
                Close Panel
              </button>
              <button
                onClick={() => {
                  window.location.href = `mailto:${viewingMessage.email}`;
                }}
                className="flex-1 py-3 bg-[#022683] hover:bg-[#033aa0] text-white rounded-xl transition-all font-medium shadow-lg"
              >
                Reply via Email
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
