import React, { useState ,useEffect} from 'react';
import { Eye, Save, Edit, Image as ImageIcon } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function HomePageManager() {
  const [heroData, setHeroData] = useState({
    highlightNumber: "",
    highlightText: "",
    title: "",
    subtitle: "",
    description: "",
    ctaText: "",
    ctaLink: "",
    enabled: false,
  });

  const [aboutData, setAboutData] = useState({
    title: "",
    description: "",
    stats: [
      { number: "", label: "" },
      { number: "", label: "" },
      { number: "", label: "" },
      { number: "", label: "" },
    ],
    enabled: false,
  });


  const [toast, setToast] = useState('');

  const saveHero = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hero`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      
      body: JSON.stringify(heroData),
    });

    if (!res.ok) throw new Error();

    setToast("Hero Section saved successfully!");
  } catch {
    setToast("Failed to save Hero Section");
  }

  setTimeout(() => setToast(""), 3000);
};

useEffect(() => {
  fetch(`${API_BASE_URL}/api/about`, {
      headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
  })
    .then(res => res.json())
    .then(data => {
      if (data) {
        setAboutData({
          title: data.title ?? "",
          description: data.description ?? "",
          stats: data.stats?.length
            ? data.stats
            : [
                { number: "", label: "" },
                { number: "", label: "" },
                { number: "", label: "" },
                { number: "", label: "" },
              ],
          enabled: data.enabled ?? false,
        });
      }
    });
}, []);



  useEffect(() => {
  const fetchHero = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hero`, {
         headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
        
      });

      if (!res.ok) return;

      const data = await res.json();

      setHeroData({
        highlightNumber: data.highlightNumber ?? "",
        highlightText: data.highlightText ?? "",
        title: data.title ?? "",
        subtitle: data.subtitle ?? "",
        description: data.description ?? "",
        ctaText: data.ctaText ?? "",
        ctaLink: data.ctaLink ?? "",
        enabled: data.enabled ?? false,
      });
    } catch (err) {
      console.error("Hero load failed");
    }
  };

  fetchHero();
}, []);


const handleSave = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/about`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    
      
      body: JSON.stringify(aboutData),
    });

    if (!res.ok) throw new Error();

    setToast("About Section saved successfully!");
  } catch (error) {
    setToast("Failed to save About Section");
  }

  setTimeout(() => setToast(""), 3000);
};




  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-screen">
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Home Page Management</h1>
          <p className="text-[#888888]">Manage all sections of your home page</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#888888] to-[#022683] text-white rounded-lg hover:from-[#022683] hover:to-[#888888] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Eye className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:scale-110" />
          <span className="relative z-10">Preview Website</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full animate-pulse-slow"></span>
                Hero Section
              </h2>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={heroData.enabled}
                  onChange={(e) => setHeroData({ ...heroData, enabled: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-all duration-300 ${heroData.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-[rgba(136,136,136,0.3)]'} group-hover:shadow-lg`}>
                  <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-all duration-300 shadow-md ${heroData.enabled ? 'translate-x-5' : ''} group-hover:scale-110`}></div>
                </div>
                <span className="text-sm text-[#888888] transition-colors duration-300 group-hover:text-[#E6E6E6]">{heroData.enabled ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Highlight Number
                  </label>
                  <input
                    type="text"
                    value={heroData.highlightNumber}
                    onChange={(e) => setHeroData({ ...heroData, highlightNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Highlight Text
                  </label>
                  <input
                    type="text"
                    value={heroData.highlightText}
                    onChange={(e) => setHeroData({ ...heroData, highlightText: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Main Title
                </label>
                <input
                  type="text"
                  value={heroData.title}
                  onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={heroData.subtitle}
                  onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Description
                </label>
                <textarea
                  value={heroData.description}
                  onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={heroData.ctaText}
                    onChange={(e) => setHeroData({ ...heroData, ctaText: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    CTA Link
                  </label>
                  <input
                    type="text"
                    value={heroData.ctaLink}
                    onChange={(e) => setHeroData({ ...heroData, ctaLink: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.45s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Background Image
                </label>
                <button className="flex items-center gap-2 px-4 py-2 border border-[rgba(136,136,136,0.25)] bg-[#0F1115] rounded-lg hover:border-[#888888] text-[#E6E6E6] transition-all duration-300 hover:scale-105 active:scale-95 group">
                  <ImageIcon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                  Upload Image
                </button>
              </div>

              <button
                onClick={saveHero}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group animate-fade-in"
                style={{ animationDelay: '0.5s' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Save className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                <span className="relative z-10">Save Hero Section</span>
              </button>
            </div>
          </div>

          {/* About/Experience Section */}
          {<div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full animate-pulse-slow"></span>
                About / Experience Section
              </h2>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={aboutData.enabled}
                  onChange={(e) => setAboutData({ ...aboutData, enabled: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-all duration-300 ${aboutData.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-[rgba(136,136,136,0.3)]'} group-hover:shadow-lg`}>
                  <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-all duration-300 shadow-md ${aboutData.enabled ? 'translate-x-5' : ''} group-hover:scale-110`}></div>
                </div>
                <span className="text-sm text-[#888888] transition-colors duration-300 group-hover:text-[#E6E6E6]">{aboutData.enabled ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>

            <div className="space-y-4">
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={aboutData.title}
                  onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Description
                </label>
                <textarea
                  value={aboutData.description}
                  onChange={(e) => setAboutData({ ...aboutData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-4">
                  Statistics
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {aboutData.stats?.map((stat, index) => (

                    <div key={index} className="p-4 border border-[rgba(136,136,136,0.25)] bg-[#0F1115] rounded-lg transition-all duration-300 hover:border-[#888888] hover-card-lift animate-fade-in" style={{ animationDelay: `${0.25 + index * 0.05}s` }}>
                      <input
                        type="text"
                        value={stat.number}
                        onChange={(e) => {
                          const newStats = [...aboutData.stats];
                          newStats[index].number = e.target.value;
                          setAboutData({ ...aboutData, stats: newStats });
                        }}
                        className="w-full px-2 py-1 mb-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                        placeholder="Number"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...aboutData.stats];
                          newStats[index].label = e.target.value;
                          setAboutData({ ...aboutData, stats: newStats });
                        }}
                        className="w-full px-2 py-1 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                        placeholder="Label"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                 onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group animate-fade-in"
                style={{ animationDelay: '0.5s' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Save className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                <span className="relative z-10">Save About Section</span>
              </button>
            </div>
          </div> }
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] sticky top-8 hover-card-lift animate-fade-in">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#888888]" />
              Live Preview
            </h3>
            
            {/* Hero Preview */}
            {heroData.enabled && (
              <div className="mb-6 p-4 bg-gradient-to-r from-[#888888] to-[#022683] rounded-lg text-white shadow-lg animate-fade-in transition-all duration-300 hover:scale-105">
                <div className="text-2xl font-bold mb-2 animate-bounce-subtle">
                  {heroData.highlightNumber} {heroData.highlightText}
                </div>
                <h2 className="text-lg font-bold mb-1">{heroData.title}</h2>
                <p className="text-sm text-white/80 mb-2">{heroData.subtitle}</p>
                <p className="text-xs text-white/70 mb-3">{heroData.description}</p>
                <button className="px-3 py-1.5 bg-white text-[#022683] rounded text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  {heroData.ctaText}
                </button>
              </div>
            )}

            {/* About Preview */}
            {aboutData.enabled && (
              <div className="p-4 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.25)] animate-fade-in transition-all duration-300 hover:border-[#888888]">
                <h3 className="font-bold text-white mb-2">{aboutData.title}</h3>
                <p className="text-sm text-[#888888] mb-3">{aboutData.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {aboutData.stats?.map((stat, index) => (

                    <div key={index} className="text-center p-2 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded border border-[rgba(136,136,136,0.25)] transition-all duration-300 hover:scale-105 hover-card-lift">
                      <div className="font-bold text-[#888888] text-sm">{stat.number}</div>
                      <div className="text-xs text-[#888888]">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-[#888888] to-[#022683] text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in border border-[rgba(255,255,255,0.2)] animate-glow-pulse">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}