import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Save, GripVertical, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SelectClientsManager() {
  const [sectors, setSectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [editingSectorId, setEditingSectorId] = useState<string | null>(null);

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/sectors`);
      setSectors(res.data);
    } catch (error) {
      showToast('Error fetching sectors');
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddSector = async () => {
    const newSector = {
      name: 'New Sector',
      enabled: true,
      industries: [],
      order: sectors.length
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/sectors`, newSector);
      setSectors([...sectors, res.data]);
      setExpandedSector(res.data._id);
      setEditingSectorId(res.data._id);
      showToast('New sector added!');
    } catch (error) {
      showToast('Error adding sector');
    }
  };

  const handleUpdateSector = async (sectorId: string, updates: any) => {
    try {
      setLoading(true);
      const res = await axios.put(`${API_BASE_URL}/api/sectors/${sectorId}`, updates);
      setSectors(sectors.map(s => s._id === sectorId ? res.data : s));
      showToast('Sector updated!');
    } catch (error) {
      showToast('Error updating sector');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSector = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sector? All industries within will be lost.')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/sectors/${id}`);
      setSectors(sectors.filter(s => s._id !== id));
      showToast('Sector deleted');
    } catch (error) {
      showToast('Error deleting sector');
    }
  };

  const handleAddIndustry = async (sector: any) => {
    const updatedIndustries = [...sector.industries, { name: 'New Industry', enabled: true }];
    handleUpdateSector(sector._id, { industries: updatedIndustries });
  };

  const handleUpdateIndustry = (sector: any, industryIndex: number, updates: any) => {
    const updatedIndustries = [...sector.industries];
    updatedIndustries[industryIndex] = { ...updatedIndustries[industryIndex], ...updates };
    setSectors(sectors.map(s => s._id === sector._id ? { ...s, industries: updatedIndustries } : s));
  };

  const handleRemoveIndustry = (sector: any, industryIndex: number) => {
    const updatedIndustries = sector.industries.filter((_: any, i: number) => i !== industryIndex);
    handleUpdateSector(sector._id, { industries: updatedIndustries });
  };

  const handleSectorChange = (id: string, value: string) => {
    setSectors(sectors.map(s => s._id === id ? { ...s, name: value } : s));
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-screen">
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Select Clients Management</h1>
          <p className="text-[#888888]">Manage sectors and industries served</p>
        </div>
        <button
          onClick={handleAddSector}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Sector
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sectors List */}
        <div className="lg:col-span-2 space-y-4">
          {sectors.map((sector, index) => (
            <div
              key={sector._id}
              className={`bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg border border-[rgba(136,136,136,0.25)] transition-all duration-300 ${expandedSector === sector._id ? 'ring-1 ring-[#022683]' : ''} animate-fade-in`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Sector Header */}
              <div
                onClick={() => setExpandedSector(expandedSector === sector._id ? null : sector._id)}
                className="p-6 border-b border-[rgba(136,136,136,0.15)] cursor-pointer hover:bg-[rgba(136,136,136,0.05)] transition-colors group/header"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical
                      className="w-5 h-5 text-[#888888] cursor-move opacity-50"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="p-1 rounded transition-colors group-hover/header:bg-[rgba(136,136,136,0.1)]">
                      {expandedSector === sector._id ? (
                        <ChevronDown className="w-5 h-5 text-[#888888]" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[#888888]" />
                      )}
                    </div>
                    <input
                      type="text"
                      value={sector.name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleSectorChange(sector._id, e.target.value)}
                      onBlur={() => handleUpdateSector(sector._id, { name: sector.name })}
                      className="flex-1 px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] outline-none text-[#E6E6E6] font-bold transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-4 ml-4" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-[#888888] font-medium hidden sm:inline">
                      {sector.industries.filter((i: any) => i.enabled).length} ACTIVE
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={sector.enabled}
                        onChange={() => handleUpdateSector(sector._id, { enabled: !sector.enabled })}
                        className="sr-only"
                      />
                      <div className={`w-10 h-5 rounded-full transition-all duration-300 ${sector.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-[rgba(136,136,136,0.3)]'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-all duration-300 shadow-md ${sector.enabled ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </label>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSector(sector._id);
                      }}
                      className="p-2 text-red-400 hover:bg-[rgba(255,0,0,0.1)] rounded transition-all hover:rotate-12"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Industries */}
              {expandedSector === sector._id && (
                <div className="p-6 bg-[#0F1115] rounded-b-lg border-t border-[rgba(2,38,131,0.1)] animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-[#E6E6E6] uppercase tracking-wider">Industries</h4>
                    <button
                      onClick={() => handleAddIndustry(sector)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-all shadow-lg active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                      Add Industry
                    </button>
                  </div>
                  <div className="space-y-2">
                    {sector.industries.map((industry: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#16181D] rounded-lg border border-[rgba(136,136,136,0.15)] hover:border-[rgba(2,38,131,0.3)] transition-all group">
                        <div className="flex items-center gap-2 flex-1">
                          <GripVertical className="w-4 h-4 text-[#888888] cursor-move opacity-30 group-hover:opacity-60 transition-opacity" />
                          <input
                            type="text"
                            value={industry.name}
                            onChange={(e) => handleUpdateIndustry(sector, idx, { name: e.target.value })}
                            onBlur={() => handleUpdateSector(sector._id, { industries: sector.industries })}
                            className="flex-1 px-3 py-1.5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded focus:ring-1 focus:ring-[#022683] outline-none text-sm text-[#E6E6E6] transition-all"
                          />
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={industry.enabled}
                              onChange={() => {
                                handleUpdateIndustry(sector, idx, { enabled: !industry.enabled });
                                // Manual update since we want instant toggle persistence
                                const newInds = [...sector.industries];
                                newInds[idx].enabled = !industry.enabled;
                                handleUpdateSector(sector._id, { industries: newInds });
                              }}
                              className="sr-only"
                            />
                            <div className={`w-8 h-4 rounded-full transition-all ${industry.enabled ? 'bg-green-500' : 'bg-[rgba(136,136,136,0.3)]'}`}>
                              <div className={`w-3 h-3 bg-white rounded-full m-0.5 transition-all ${industry.enabled ? 'translate-x-4' : ''}`}></div>
                            </div>
                          </label>
                          <button
                            onClick={() => handleRemoveIndustry(sector, idx)}
                            className="p-1.5 text-red-400 hover:bg-[rgba(255,0,0,0.1)] rounded transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {sector.industries.length === 0 && (
                      <p className="text-sm text-[#E6E6E6] italic text-center py-6 border border-dashed border-[rgba(136,136,136,0.3)] rounded-lg">
                        No industries added yet. Click 'Add Industry' to start.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-xl p-6 border border-[rgba(136,136,136,0.25)] sticky top-8 animate-fade-in hover-card-lift">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#022683] rounded-full"></span>
              Frontend Preview
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {sectors.filter(s => s.enabled).map((sector) => (
                <div key={sector._id} className="border border-[rgba(136,136,136,0.25)] rounded-xl overflow-hidden group">
                  <div className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-[#022683] to-[#033aa0] text-white transition-all group-hover:scale-[1.02]">
                    <span className="font-bold text-sm tracking-tight">{sector.name}</span>
                    <ChevronDown className="w-4 h-4 opacity-70" />
                  </div>
                  <div className="p-4 bg-[#0F1115] space-y-2">
                    {sector.industries.filter((i: any) => i.enabled).slice(0, 3).map((industry: any, idx: number) => (
                      <div key={idx} className="text-xs text-[#E6E6E6] flex items-center gap-2 font-medium">
                        <div className="w-1 h-1 bg-[#5b8fff] rounded-full"></div>
                        {industry.name}
                      </div>
                    ))}
                    {sector.industries.filter((i: any) => i.enabled).length > 3 && (
                      <div className="text-[10px] text-[#888888] italic px-3 pt-1 border-t border-[rgba(136,136,136,0.1)] mt-2">
                        +{sector.industries.filter((i: any) => i.enabled).length - 3} more sectors
                      </div>
                    )}
                    {sector.industries.filter((i: any) => i.enabled).length === 0 && (
                      <div className="text-[10px] text-[#555555] italic">No active industries</div>
                    )}
                  </div>
                </div>
              ))}
              {sectors.filter(s => s.enabled).length === 0 && (
                <div className="text-center py-10 opacity-30">
                  <p className="text-xs text-white italic tracking-widest">NO ACTIVE SECTORS</p>
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="p-4 bg-[rgba(2,38,131,0.15)] rounded-xl border border-[rgba(2,38,131,0.3)]">
                <div className="text-xs text-[#888888] mb-1 font-bold uppercase tracking-tighter">Sectors</div>
                <div className="text-3xl font-black text-[#5b8fff] font-mono tracking-tighter">
                  {sectors.filter(s => s.enabled).length}
                </div>
              </div>
              <div className="p-4 bg-[rgba(34,197,94,0.1)] rounded-xl border border-[rgba(34,197,94,0.2)]">
                <div className="text-xs text-[#888888] mb-1 font-bold uppercase tracking-tighter">Industries</div>
                <div className="text-3xl font-black text-green-400 font-mono tracking-tighter">
                  {sectors.reduce((acc, s) => acc + s.industries.filter((i: any) => i.enabled).length, 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-[#16181D] p-8 rounded-2xl border border-[rgba(136,136,136,0.25)] flex flex-col items-center gap-4 animate-in zoom-in-95">
            <Loader2 className="w-12 h-12 text-[#022683] animate-spin" />
            <p className="text-white font-bold tracking-widest">SYNCING DATABASE</p>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg shadow-2xl animate-fade-in z-50 flex items-center gap-3 border border-white/10">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          {toast}
        </div>
      )}
    </div>
  );
}
