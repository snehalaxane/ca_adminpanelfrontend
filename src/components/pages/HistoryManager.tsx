import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, Upload, Building2, Calendar, MapPin, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function HistoryManager() {
  const [journeyData, setJourneyData] = useState({
    sinceYear: '1979',
    title: 'Our Journey Since 1979',
    description: '',
    yearsOfService: '46+',
    activeLocations: '7'
  });

  const [timeline, setTimeline] = useState<any[]>([]);

  const [mission, setMission] = useState({
    title: 'Our Mission',
    content: 'To provide world-class financial and accounting services with integrity, professionalism, and commitment to our clients\' success.',
    enabled: true
  });

  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchJourney();
    fetchTimeline();
    fetchMission();
  }, []);

  const fetchJourney = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/history-journey`);
      if (res.data) setJourneyData(res.data);
    } catch (err) {
      console.error("Error fetching journey details:", err);
    }
  };

  const fetchTimeline = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/history-timeline`);
      setTimeline(res.data);
    } catch (err) {
      console.error("Error fetching timeline:", err);
    }
  };

  const fetchMission = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/history-mission`);
      if (res.data) setMission(res.data);
    } catch (err) {
      console.error("Error fetching mission:", err);
    }
  };

  const handleSaveJourney = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/history-journey`, journeyData);
      setToast('Journey details saved successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast('Error saving journey details');
    }
  };

  const handleSaveTimeline = async () => {
    // Current approach: we'll handle each change or have a bulk save if needed.
    // However, the user asked for separate buttons.
    // For timeline, we'll save the whole list or individual items.
    // Let's implement a bulk update or save each item on change for better UX.
    // For now, let's stick to the user's request of "button separately".
    try {
      // Simplification: delete all and re-save or individual updates.
      // Better: assume the user wants to save the current state of the timeline.
      // We'll need a backend endpoint for bulk update or just use individual ones.
      // Given the requirement, a "Save Timeline" button will suffice.
      // We can iterate and save or add a bulk endpoint.
      // Let's assume we save the whole state.
      setToast('Timeline saving not fully implemented for bulk yet, please add/edit items.');
    } catch (err) {
      setToast('Error saving timeline');
    }
  };

  const handleSaveMission = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/history-mission`, mission);
      setToast('Mission statement saved successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast('Error saving mission statement');
    }
  };

  const handleAddTimelineEvent = async () => {
    const newEvent = {
      title: 'New Location',
      subtitle: 'New Branch/Operation',
      year: new Date().getFullYear().toString(),
      tag: 'Active',
      order: timeline.length > 0 ? Math.max(...timeline.map(t => t.order || 0)) + 1 : 0
    };
    try {
      const res = await axios.post(`${API_BASE_URL}/api/history-timeline`, newEvent);
      setTimeline([...timeline, res.data]);
    } catch (err) {
      setToast('Error adding event');
    }
  };

  const handleDeleteTimelineEvent = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/history-timeline/${id}`);
      setTimeline(timeline.filter(t => t._id !== id));
    } catch (err) {
      setToast('Error deleting event');
    }
  };

  const updateTimelineEvent = async (id: string, field: string, value: string) => {
    const updatedItem = timeline.find(t => t._id === id);
    if (!updatedItem) return;

    const newItem = { ...updatedItem, [field]: value };
    setTimeline(timeline.map(t => t._id === id ? newItem : t));

    try {
      await axios.put(`${API_BASE_URL}/api/history-timeline/${id}`, newItem);
    } catch (err) {
      console.error("Error updating timeline event:", err);
    }
  };

  const getTagStyles = (tag: string) => {
    switch (tag?.toLowerCase()) {
      case 'founded':
        return 'bg-[#022683] text-white';
      case 'active':
        return 'bg-[#dcfce7] text-[#166534]';
      case 'closed':
        return 'bg-[#f3f4f6] text-[#374151]';
      default:
        return 'bg-[#374151] text-[#d1d5db]';
    }
  };

  return (
    <div className="p-8 bg-[#0F1115] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">History Page Management</h1>
        <p className="text-[#888888]">Manage founding details, timeline, mission, and vision</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Journey Details */}
          <div className="bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[#888888]" />
                <h2 className="text-xl font-bold text-[#E6E6E6]">Journey Settings</h2>
              </div>
              <button
                onClick={handleSaveJourney}
                className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Journey
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={journeyData.title}
                    onChange={(e) => setJourneyData({ ...journeyData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] placeholder-[#888888]"
                    placeholder="e.g., Our Journey Since 1979"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Since Year
                  </label>
                  <input
                    type="text"
                    value={journeyData.sinceYear}
                    onChange={(e) => setJourneyData({ ...journeyData, sinceYear: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] placeholder-[#888888]"
                    placeholder="e.g., 1979"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Journey Description
                </label>
                <textarea
                  value={journeyData.description}
                  onChange={(e) => setJourneyData({ ...journeyData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2.5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] placeholder-[#888888]"
                  placeholder="Enter the firm's history/journey details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Years of Service
                  </label>
                  <input
                    type="text"
                    value={journeyData.yearsOfService}
                    onChange={(e) => setJourneyData({ ...journeyData, yearsOfService: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6]"
                    placeholder="e.g., 46+"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Active Locations
                  </label>
                  <input
                    type="text"
                    value={journeyData.activeLocations}
                    onChange={(e) => setJourneyData({ ...journeyData, activeLocations: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6]"
                    placeholder="e.g., 7"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-[#888888]" />
                <h2 className="text-xl font-bold text-[#E6E6E6]">Company Timeline</h2>
              </div>
              <button
                onClick={handleAddTimelineEvent}
                className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            </div>

            <div className="space-y-3">
              {timeline.map((item) => (
                <div key={item._id} className="p-4 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg hover:border-[#888888] transition-colors">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateTimelineEvent(item._id, 'title', e.target.value)}
                      className="px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] font-bold"
                      placeholder="Title (e.g. Hyderabad)"
                    />
                    <input
                      type="text"
                      value={item.tag}
                      onChange={(e) => updateTimelineEvent(item._id, 'tag', e.target.value)}
                      className="px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6]"
                      placeholder="Tag (e.g. Active)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={item.subtitle}
                      onChange={(e) => updateTimelineEvent(item._id, 'subtitle', e.target.value)}
                      className="px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#888888]"
                      placeholder="Subtitle (e.g. Branch Operations)"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={item.year}
                        onChange={(e) => updateTimelineEvent(item._id, 'year', e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#888888]"
                        placeholder="Year (e.g. 1979)"
                      />
                      <button
                        onClick={() => handleDeleteTimelineEvent(item._id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission */}
          <div className="bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-[#888888]" />
                <h2 className="text-xl font-bold text-[#E6E6E6]">Mission Statement</h2>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mission.enabled}
                    onChange={(e) => setMission({ ...mission, enabled: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${mission.enabled ? 'bg-green-500' : 'bg-[rgba(136,136,136,0.25)]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${mission.enabled ? 'translate-x-5' : ''}`}></div>
                  </div>
                </label>
                <button
                  onClick={handleSaveMission}
                  className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Mission
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={mission.title}
                  onChange={(e) => setMission({ ...mission, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Content
                </label>
                <textarea
                  value={mission.content}
                  onChange={(e) => setMission({ ...mission, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] sticky top-8 hover-card-lift animate-fade-in">
            <h3 className="font-bold text-[#E6E6E6] mb-4 flex items-center gap-2">
              <span className="text-[#888888]">●</span> Page Preview
            </h3>

            {/* Journey Preview */}
            <div className="mb-8">
              <span className="inline-block px-4 py-1.5 bg-[rgba(2,38,131,0.2)] text-[#3b82f6] rounded-full text-sm font-bold mb-4">
                Since {journeyData.sinceYear}
              </span>
              <h1 className="text-4xl font-bold text-[#E6E6E6] mb-8">
                {journeyData.title.split(journeyData.sinceYear)[0]}
                <span className="text-[#3b82f6]">{journeyData.sinceYear}</span>
              </h1>

              <div className="bg-[#0F1115] rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-[rgba(136,136,136,0.1)] p-10 mb-8 relative">
                <div className="absolute left-10 top-10 bottom-10 w-1 bg-[#022683] rounded-full opacity-60"></div>
                <div className="pl-8">
                  {journeyData.description.split('\n').map((para, i) => (
                    <p key={i} className="text-[#888888] leading-relaxed mb-4 text-lg">
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#0F1115] rounded-2xl shadow-md border border-[rgba(136,136,136,0.1)] p-6 text-center">
                  <div className="text-3xl font-bold text-[#3b82f6] mb-1">{journeyData.yearsOfService}</div>
                  <div className="text-sm font-medium text-[#888888]">Years of Service</div>
                </div>
                <div className="bg-[#0F1115] rounded-2xl shadow-md border border-[rgba(136,136,136,0.1)] p-6 text-center">
                  <div className="text-3xl font-bold text-[#3b82f6] mb-1">{journeyData.activeLocations}</div>
                  <div className="text-sm font-medium text-[#888888]">Active Locations</div>
                </div>
              </div>
            </div>

            {/* Timeline Preview */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-[#888888] mb-4 uppercase tracking-wide">Company Timeline</h4>
              <div className="space-y-4">
                {timeline.map((item) => (
                  <div key={item._id} className="bg-[#0F1115] rounded-xl shadow-sm border border-[rgba(136,136,136,0.1)] p-5 relative overflow-hidden group hover:border-[#888888] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-[#E6E6E6]">{item.title}</h4>
                      {item.tag && (
                        <span className={`px-4 py-1 rounded-full text-xs font-bold ${getTagStyles(item.tag)}`}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[#888888] mb-4">{item.subtitle}</p>
                    <div className="flex items-center gap-2 text-[#3b82f6]">
                      <Calendar className="w-4 h-4" />
                      <span className="font-bold text-sm tracking-tight">{item.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission Preview */}
            {mission.enabled && (
              <div className="mb-4 p-4 bg-gradient-to-br from-[rgba(2,38,131,0.1)] to-transparent rounded-lg border border-[rgba(136,136,136,0.15)]">
                <h4 className="text-sm font-bold text-[#888888] mb-2">{mission.title}</h4>
                <p className="text-xs text-[#E6E6E6] leading-relaxed">{mission.content}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 right-8 bg-[#888888] text-white px-6 py-3 rounded-lg shadow-lg border border-[rgba(255,255,255,0.2)]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#022683] rounded-full"></div>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}