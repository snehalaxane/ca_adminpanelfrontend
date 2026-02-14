import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, MapPin, Mail, Phone, Eye, GripVertical, Check } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ContactManager() {
  const [formSettings, setFormSettings] = useState({
    heading: 'Get in Touch',
    subheading: 'We would love to hear from you. Send us a message and we will respond as soon as possible.',
    callNow: '+91 40 2331 6023',
    emailUs: 'info@rajuprasad.com',
    enabled: true
  });

  const [formFields, setFormFields] = useState([
    { id: 1, label: 'Full Name', fieldType: 'text', required: true, enabled: true, order: 1, placeholder: 'Enter your name' },
    { id: 2, label: 'Email Address', fieldType: 'email', required: true, enabled: true, order: 2, placeholder: 'your@email.com' },
    { id: 3, label: 'Mobile Number', fieldType: 'tel', required: true, enabled: true, order: 3, placeholder: '+91 XXXXX XXXXX' },
    { id: 4, label: 'Company Name', fieldType: 'text', required: false, enabled: true, order: 4, placeholder: 'Your company (optional)' },
    { id: 5, label: 'Message', fieldType: 'textarea', required: true, enabled: true, order: 5, placeholder: 'How can we help you?' }
  ]);

  const [offices, setOffices] = useState([
    {
      id: 1,
      cityName: 'Mumbai',
      officeName: 'Head Office - Mumbai',
      address: '123 Marine Drive, Mumbai - 400001, Maharashtra, India',
      phone: '+91 22 1234 5678',
      email: 'mumbai@rajuprasad.com',
      mapEmbed: 'https://maps.google.com/embed?pb=!1m18!1m12!1m3!1d3774.0',
      enabled: true,
      order: 1
    },
    {
      id: 2,
      cityName: 'Delhi',
      officeName: 'Delhi Branch',
      address: '456 Connaught Place, New Delhi - 110001, Delhi, India',
      phone: '+91 11 2345 6789',
      email: 'delhi@rajuprasad.com',
      mapEmbed: 'https://maps.google.com/embed?pb=!1m18!1m12!1m3!1d3774.1',
      enabled: true,
      order: 2
    },
    {
      id: 3,
      cityName: 'Bangalore',
      officeName: 'Bangalore Office',
      address: '789 MG Road, Bangalore - 560001, Karnataka, India',
      phone: '+91 80 3456 7890',
      email: 'bangalore@rajuprasad.com',
      mapEmbed: 'https://maps.google.com/embed?pb=!1m18!1m12!1m3!1d3774.2',
      enabled: true,
      order: 3
    }
  ]);

  const [editingOfficeId, setEditingOfficeId] = useState<number | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | number | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'fields' | 'offices'>('form');
  const [toast, setToast] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [deleteConfig, setDeleteConfig] = useState<{
  type: 'office' | 'field' | null;
  id: any;
} | null>(null);


  useEffect(() => {
    // fetch contact form settings from backend
    const fetchContactForm = async () => {
      try {
        // load settings, fields, and offices from separate endpoints
        const [settingsRes, fieldsRes, officesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/contact/settings`),
          fetch(`${API_BASE_URL}/api/contact/fields`),
          fetch(`${API_BASE_URL}/api/contact/offices`)
        ]);

        if (settingsRes && settingsRes.ok) {
          const settings = await settingsRes.json();
          setFormSettings(prev => ({ ...prev, ...settings }));
        }

        if (fieldsRes && fieldsRes.ok) {
          const fields = await fieldsRes.json();
          const mapped = fields.map((f: any) => ({
            id: f._id || f.id || Date.now().toString(),
            label: f.label || '',
            fieldType: f.fieldType || 'text',
            required: !!f.required,
            enabled: f.enabled !== undefined ? !!f.enabled : true,
            order: f.order || 0,
            placeholder: f.placeholder || ''
          }));
          setFormFields(mapped);
        }

        if (officesRes && officesRes.ok) {
          const ofs = await officesRes.json();
          setOffices(ofs.map((o: any) => ({
            id: o._id || o.id || Date.now(),
            cityName: o.cityName || '',
            officeName: o.officeName || '',
            address: o.address || '',
            phone: o.phone || '',
            email: o.email || '',
            mapEmbed: o.mapEmbed || '',
            enabled: typeof o.enabled === 'boolean' ? o.enabled : true,
            order: typeof o.order === 'number' ? o.order : 0
          })));
        }
      } catch (err) {
        console.error('Failed to load contact form settings', err);
      }
    };

    fetchContactForm();
  }, []);

  const handleSaveSettings = async () => {
    // Basic validation
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone: string) => /^\+?[0-9\s\-()]{7,}$/.test(phone);

    if (!formSettings.callNow || !validatePhone(formSettings.callNow)) {
      setToast('Please enter a valid phone number for "Call Now"');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    if (!formSettings.emailUs || !validateEmail(formSettings.emailUs)) {
      setToast('Please enter a valid email address for "Email Us"');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formSettings)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save settings');

      setFormSettings(prev => ({ ...prev, ...data }));
      setToast('Settings saved successfully!');
      setHasUnsavedChanges(false);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error('Error saving settings', err);
      setToast(err instanceof Error ? err.message : 'Error saving settings');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleSaveFields = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/fields`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formFields)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save fields');

      const mapped = data.map((f: any) => ({
        id: f._id || f.id || Date.now().toString(),
        label: f.label || '',
        fieldType: f.fieldType || 'text',
        required: !!f.required,
        enabled: f.enabled !== undefined ? !!f.enabled : true,
        order: f.order || 0,
        placeholder: f.placeholder || ''
      }));
      setFormFields(mapped);
      setToast('Form fields saved successfully!');
      setHasUnsavedChanges(false);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error('Error saving fields', err);
      setToast(err instanceof Error ? err.message : 'Error saving fields');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleSaveOffices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/offices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(offices)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save offices');

      setOffices(data.map((o: any) => ({
        id: o._id || o.id || Date.now(),
        cityName: o.cityName,
        officeName: o.officeName,
        address: o.address,
        phone: o.phone,
        email: o.email,
        mapEmbed: o.mapEmbed,
        enabled: typeof o.enabled === 'boolean' ? o.enabled : true,
        order: o.order
      })));
      setToast('Office locations saved successfully!');
      setHasUnsavedChanges(false);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error('Error saving offices', err);
      setToast(err instanceof Error ? err.message : 'Error saving offices');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleSaveAll = async () => {
    // Basic validation for settings
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone: string) => /^\+?[0-9\s\-()]{7,}$/.test(phone);

    if (!formSettings.callNow || !validatePhone(formSettings.callNow)) {
      setToast('Please enter a valid phone number for "Call Now"');
      return;
    }
    if (!formSettings.emailUs || !validateEmail(formSettings.emailUs)) {
      setToast('Please enter a valid email address for "Email Us"');
      return;
    }

    try {
      setToast('Saving all changes...');
      await Promise.all([
        fetch(`${API_BASE_URL}/api/contact/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formSettings)
        }),
        fetch(`${API_BASE_URL}/api/contact/fields`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formFields)
        }),
        fetch(`${API_BASE_URL}/api/contact/offices`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(offices)
        })
      ]);
      setToast('All changes saved successfully!');
      setHasUnsavedChanges(false);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error('Error saving all changes', err);
      setToast('Error saving all changes');
    }
  };

  const handleDeleteOffice = (id: number) => {
  setDeleteConfig({ type: 'office', id });
};


  const handleAddOffice = () => {
    const newOffice = {
      id: Math.max(...offices.map(o => o.id)) + 1,
      cityName: 'New City',
      officeName: 'New Office',
      address: '',
      phone: '',
      email: '',
      mapEmbed: '',
      enabled: true,
      order: offices.length + 1
    };
    setOffices([...offices, newOffice]);
    setEditingOfficeId(newOffice.id);
    setToast('New office added!');
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddField = () => {
    const nextId = Date.now();
    const newField = {
      id: nextId,
      label: 'New Field',
      fieldType: 'text',
      required: false,
      enabled: true,
      order: formFields.length + 1,
      placeholder: 'Enter value'
    };
    setFormFields([...formFields, newField]);
    setEditingFieldId(nextId);
    setHasUnsavedChanges(true);
    setToast('New field added!');
    setTimeout(() => setToast(''), 3000);
  };

  const handleFieldChange = (id: any, field: string, value: any) => {
    setFormFields(formFields.map(f => f.id === id ? { ...f, [field]: value } : f));
    setHasUnsavedChanges(true);
  };

  const toggleFieldEnabled = (id: any) => {
    setFormFields(formFields.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    setHasUnsavedChanges(true);
  };

 const handleDeleteField = (id: any) => {
  setDeleteConfig({ type: 'field', id });
};
const confirmDelete = () => {
  if (!deleteConfig) return;

  if (deleteConfig.type === 'office') {
    setOffices(offices.filter(o => o.id !== deleteConfig.id));
    setToast('Office location deleted!');
  }

  if (deleteConfig.type === 'field') {
    setFormFields(formFields.filter(f => f.id !== deleteConfig.id));
    setHasUnsavedChanges(true);
    setToast('Field deleted!');
  }

  setDeleteConfig(null);
  setTimeout(() => setToast(''), 3000);
};


  const toggleOfficeEnabled = (id: any) => {
    setOffices(offices.map(o => o.id === id ? { ...o, enabled: !o.enabled } : o));
    setHasUnsavedChanges(true);
  };

  const handleOfficeChange = (id: any, field: string, value: any) => {
    setOffices(offices.map(o => o.id === id ? { ...o, [field]: value } : o));
    setHasUnsavedChanges(true);
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-screen">
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Contact Page Management</h1>
          <p className="text-[#888888]">Manage contact form, fields, and office locations</p>
        </div>
        {hasUnsavedChanges && (
          <div className="px-4 py-2 bg-yellow-900/20 text-yellow-500 rounded-lg text-sm border border-yellow-900/30 flex items-center gap-2">
            ⚠️ You have unsaved changes
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-[rgba(136,136,136,0.25)] animate-fade-in">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-3 border-b-2 transition-colors ${activeTab === 'form'
              ? 'border-[#022683] text-[#022683] font-medium'
              : 'border-transparent text-[#888888] hover:text-[#E6E6E6]'
              }`}
          >
            Contact Page Settings
          </button>
          <button
            onClick={() => setActiveTab('fields')}
            className={`px-4 py-3 border-b-2 transition-colors ${activeTab === 'fields'
              ? 'border-[#022683] text-[#022683] font-medium'
              : 'border-transparent text-[#888888] hover:text-[#E6E6E6]'
              }`}
          >
            Form Fields
          </button>
          <button
            onClick={() => setActiveTab('offices')}
            className={`px-4 py-3 border-b-2 transition-colors ${activeTab === 'offices'
              ? 'border-[#022683] text-[#022683] font-medium'
              : 'border-transparent text-[#888888] hover:text-[#E6E6E6]'
              }`}
          >
            Office Locations
          </button>
        </div>
      </div>

      {/* Contact Form Settings Tab */}
      {activeTab === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          <div className="lg:col-span-2 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#E6E6E6]">Contact Page Settings</h2>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formSettings.enabled}
                  onChange={(e) => {
                    setFormSettings({ ...formSettings, enabled: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full ${formSettings.enabled ? 'bg-green-500' : 'bg-gray-600'} transition-colors`}>
                  <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${formSettings.enabled ? 'translate-x-5' : ''}`}></div>
                </div>
                <span className="text-sm text-[#888888] group-hover:text-[#E6E6E6] transition-colors">{formSettings.enabled ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Form Heading
                </label>
                <input
                  type="text"
                  value={formSettings.heading}
                  onChange={(e) => {
                    setFormSettings({ ...formSettings, heading: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Subheading / Description
                </label>
                <textarea
                  value={formSettings.subheading}
                  onChange={(e) => {
                    setFormSettings({ ...formSettings, subheading: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  rows={2}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">Call Now (phone)</label>
                  <input
                    type="text"
                    value={formSettings.callNow}
                    onChange={(e) => { setFormSettings({ ...formSettings, callNow: e.target.value }); setHasUnsavedChanges(true); }}
                    placeholder="+91 40 2331 6023"
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">Email Us</label>
                  <input
                    type="email"
                    value={formSettings.emailUs}
                    onChange={(e) => { setFormSettings({ ...formSettings, emailUs: e.target.value }); setHasUnsavedChanges(true); }}
                    placeholder="info@rajuprasad.com"
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                  />
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-200">
                  <strong>💡 Tip:</strong> Customize the form heading and description to match your brand voice. Add multiple email recipients to ensure inquiries reach the right team.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 sticky top-8 border border-[rgba(136,136,136,0.25)] hover-card-lift max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              <h3 className="font-bold text-[#E6E6E6] mb-4 flex items-center gap-2 sticky top-0 bg-[#16181D] py-2 z-10 border-b border-[rgba(136,136,136,0.1)]">
                <Eye className="w-5 h-5 text-[#888888]" />
                Page Preview
              </h3>

              {formSettings.enabled && (
                <div className="p-4 bg-gradient-to-r from-[#888888] to-[#022683] rounded-lg shadow-lg mb-4 animate-fade-in">
                  <h4 className="font-bold text-white mb-2">{formSettings.heading}</h4>
                  <p className="text-xs text-white/80 mb-4">{formSettings.subheading}</p>

                  <div className="space-y-2">
                    {formFields.filter(f => f.enabled).map((field) => (
                      <div key={field.id}>
                        <label className="text-xs text-white font-medium block mb-1">
                          {field.label} {field.required && <span className="text-red-300">*</span>}
                        </label>
                        {field.fieldType === 'textarea' ? (
                          <textarea
                            className="w-full px-2 py-2 border border-white/20 rounded text-xs bg-white/10 text-white placeholder-white/50 resize-none focus:bg-white/20 focus:outline-none transition-colors"
                            rows={2}
                            placeholder={field.placeholder}
                            disabled
                          />
                        ) : (
                          <input
                            type={field.fieldType}
                            className="w-full px-2 py-2 border border-white/20 rounded text-xs bg-white/10 text-white placeholder-white/50 focus:bg-white/20 focus:outline-none transition-colors"
                            placeholder={field.placeholder}
                            disabled
                          />
                        )}
                      </div>
                    ))}
                    <button className="w-full px-3 py-2 bg-white text-[#022683] rounded text-xs mt-3 font-bold shadow-md hover:bg-gray-100 transition-colors opacity-90 cursor-not-allowed">
                      Send Message
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="p-3 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.15)]">
                  <p className="text-xs text-[#E6E6E6] mb-2"><strong>Contact Details:</strong></p>
                  <div className="space-y-1">
                    <p className="text-xs text-[#888888] flex items-center gap-2">
                      <Phone className="w-3 h-3 text-[#022683]" /> {formSettings.callNow}
                    </p>
                    <p className="text-xs text-[#888888] flex items-center gap-2">
                      <Mail className="w-3 h-3 text-[#022683]" /> {formSettings.emailUs}
                    </p>
                  </div>
                </div>

                {offices.filter(o => o.enabled).length > 0 && (
                  <div className="p-3 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.15)]">
                    <p className="text-xs text-[#E6E6E6] mb-2 font-bold flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-[#022683]" /> Our Locations:
                    </p>
                    <div className="space-y-3">
                      {offices.filter(o => o.enabled).map(office => (
                        <div key={office.id} className="border-l-2 border-[#022683] pl-2 relative">
                          <p className="text-xs font-bold text-[#E6E6E6]">{office.cityName}</p>
                          <p className="text-[10px] text-[#888888]">{office.officeName}</p>
                          <p className="text-[10px] text-[#888888] line-clamp-2 mt-0.5">{office.address}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields Tab */}
      {activeTab === 'fields' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          <div className="lg:col-span-2 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#E6E6E6]">Manage Form Fields</h2>
              <button
                onClick={handleAddField}
                className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-colors shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>

            <div className="space-y-3">
              {formFields.map((field) => (
                <div key={field.id} className="border border-[rgba(136,136,136,0.25)] rounded-lg p-4 bg-[#0F1115] hover:border-[#888888] transition-colors">
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-5 h-5 text-[#888888] cursor-move mt-2" />

                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[#888888] mb-1">
                            Field Label
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleFieldChange(field.id, 'label', e.target.value)}
                            className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-sm text-[#E6E6E6] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#888888] mb-1">
                            Field Type
                          </label>
                          <select
                            value={field.fieldType}
                            onChange={(e) => handleFieldChange(field.id, 'fieldType', e.target.value)}
                            className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-sm text-[#E6E6E6] transition-all"
                          >
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="tel">Phone</option>
                            <option value="number">Number</option>
                            <option value="textarea">Textarea</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#888888] mb-1">
                          Placeholder Text
                        </label>
                        <input
                          type="text"
                          value={field.placeholder}
                          onChange={(e) => handleFieldChange(field.id, 'placeholder', e.target.value)}
                          className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-sm text-[#E6E6E6] transition-all"
                          placeholder="Enter placeholder text"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleFieldChange(field.id, 'required', e.target.checked)}
                            className="w-4 h-4 text-[#022683] border-gray-300 rounded focus:ring-[#022683]"
                          />
                          <span className="text-sm text-[#888888] group-hover:text-[#E6E6E6] transition-colors">Required Field</span>
                        </label>
                        <span className="text-xs text-[#888888]">Order: {field.order}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={field.enabled} onChange={() => toggleFieldEnabled(field.id)} className="sr-only" />
                        <div className={`w-10 h-5 rounded-full ${field.enabled ? 'bg-green-500' : 'bg-gray-600'} transition-colors`}>
                          <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${field.enabled ? 'translate-x-5' : ''}`}></div>
                        </div>
                      </label>
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
              <p className="text-sm text-yellow-500">
                <strong>⚠️ Note:</strong> Drag fields to reorder them in the form. Mark important fields as "Required" to ensure users provide necessary information.
              </p>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSaveFields}
                className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-colors shadow-md active:scale-95"
              >
                <Save className="w-4 h-4" />
                Save All Fields
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 sticky top-8 border border-[rgba(136,136,136,0.25)] hover-card-lift">
              <h3 className="font-bold text-[#E6E6E6] mb-4">Field Statistics</h3>

              <div className="space-y-3">
                <div className="p-4 bg-blue-900/20 border border-blue-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{formFields.length}</div>
                  <div className="text-sm text-[#888888]">Total Fields</div>
                </div>

                <div className="p-4 bg-green-900/20 border border-green-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{formFields.filter(f => f.enabled).length}</div>
                  <div className="text-sm text-[#888888]">Active Fields</div>
                </div>

                <div className="p-4 bg-red-900/20 border border-red-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-red-500">{formFields.filter(f => f.required).length}</div>
                  <div className="text-sm text-[#888888]">Required Fields</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Office Locations Tab */}
      {activeTab === 'offices' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleAddOffice}
                className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-colors shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Office Location
              </button>
            </div>

            {offices.map((office) => (
              <div key={office.id} className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift">
                {editingOfficeId === office.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-[#E6E6E6]">Edit Office Location</h3>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={office.enabled} onChange={() => toggleOfficeEnabled(office.id)} className="sr-only" />
                        <div className={`w-10 h-5 rounded-full ${office.enabled ? 'bg-green-500' : 'bg-gray-600'} transition-colors`}>
                          <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${office.enabled ? 'translate-x-5' : ''}`}></div>
                        </div>
                        <span className="text-sm text-[#888888] group-hover:text-[#E6E6E6] transition-colors">{office.enabled ? 'Enabled' : 'Disabled'}</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#888888] mb-2">
                          City Name
                        </label>
                        <input
                          type="text"
                          value={office.cityName}
                          onChange={(e) => handleOfficeChange(office.id, 'cityName', e.target.value)}
                          className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#888888] mb-2">
                          Office Name
                        </label>
                        <input
                          type="text"
                          value={office.officeName}
                          onChange={(e) => handleOfficeChange(office.id, 'officeName', e.target.value)}
                          className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#888888] mb-2">
                        Full Address
                      </label>
                      <textarea
                        value={office.address}
                        onChange={(e) => handleOfficeChange(office.id, 'address', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#888888] mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={office.phone}
                          onChange={(e) => handleOfficeChange(office.id, 'phone', e.target.value)}
                          className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#888888] mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={office.email}
                          onChange={(e) => handleOfficeChange(office.id, 'email', e.target.value)}
                          className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#888888] mb-2">
                        Google Maps Embed URL
                      </label>
                      <input
                        type="text"
                        value={office.mapEmbed}
                        onChange={(e) => handleOfficeChange(office.id, 'mapEmbed', e.target.value)}
                        className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                        placeholder="Paste Google Maps embed URL"
                      />
                      <p className="text-xs text-[#888888] mt-1">
                        Get embed URL from Google Maps → Share → Embed a map
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setEditingOfficeId(null)}
                        className="flex-1 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-colors"
                      >
                        <Check className="w-4 h-4 inline mr-2" />
                        Done Editing
                      </button>
                      <button
                        onClick={() => handleDeleteOffice(office.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <MapPin className="w-5 h-5 text-[#022683] mt-1" />
                        <div>
                          <h4 className="font-bold text-[#E6E6E6] text-lg">{office.cityName}</h4>
                          <p className="text-sm text-[#888888]">{office.officeName}</p>
                          <p className="text-sm text-[#E6E6E6] mt-2 mb-2">{office.address}</p>
                          <div className="flex gap-4 text-xs text-[#888888]">
                            <span className="flex items-center gap-1 group-hover:text-[#022683] transition-colors"><Phone className="w-3 h-3" /> {office.phone}</span>
                            <span className="flex items-center gap-1 group-hover:text-[#022683] transition-colors"><Mail className="w-3 h-3" /> {office.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingOfficeId(office.id)}
                          className="p-2 text-[#888888] hover:text-[#022683] hover:bg-[#022683]/10 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 sticky top-8 border border-[rgba(136,136,136,0.25)] hover-card-lift">
              <h3 className="font-bold text-[#E6E6E6] mb-4">Location Stats</h3>
              <div className="space-y-3">
                <div className="p-4 bg-purple-900/20 border border-purple-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{offices.length}</div>
                  <div className="text-sm text-[#888888]">Total Offices</div>
                </div>
                <div className="p-4 bg-green-900/20 border border-green-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{offices.filter(o => o.enabled).length}</div>
                  <div className="text-sm text-[#888888]">Active Locations</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-bold text-[#E6E6E6] mb-2 text-sm">Quick Tips</h4>
                <ul className="text-xs text-[#888888] space-y-2 list-disc pl-4">
                  <li>Embed maps help users find your office easily.</li>
                  <li>Ensure phone numbers are clickable on mobile.</li>
                  <li>Keep addresses updated for SEO.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 right-8 bg-[#1a1d24] text-[#E6E6E6] px-6 py-3 rounded-lg shadow-2xl border border-[#022683]/50 flex items-center gap-3 z-50 animate-fade-in">
          <div className="w-2 h-2 bg-[#022683] rounded-full animate-ping"></div>
          {toast}
        </div>
      )}
      {deleteConfig && (
  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
    <div className="bg-[#16181D] border border-red-500/30 shadow-2xl rounded-lg p-6 w-96 animate-fade-in pointer-events-auto">

      <h3 className="text-base font-semibold text-white mb-2">
        {deleteConfig.type === 'office'
          ? 'Delete this office location?'
          : 'Delete this form field?'}
      </h3>

      <p className="text-sm text-[#888888] mb-5">
        This action cannot be undone.
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setDeleteConfig(null)}
          className="px-4 py-2 text-sm rounded bg-[rgba(136,136,136,0.2)] text-white hover:bg-[rgba(136,136,136,0.3)] transition"
        >
          Cancel
        </button>

        <button
          onClick={confirmDelete}
          className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600 transition"
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