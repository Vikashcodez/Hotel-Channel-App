import React, { useState, useEffect } from 'react';
import { 
  BuildingOffice2Icon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ServerStackIcon
} from '@heroicons/react/24/outline';

const BaseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

const AdminDashboard = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Helper function to get full logo URL
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    if (logoPath.startsWith('/')) return `${BASE_URL}${logoPath}`;
    return `${BASE_URL}/${logoPath}`;
  };

  // --- REAL API CALL: Fetch Tenants ---
  useEffect(() => {
    const loadTenants = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BaseURL}/tenants`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch tenants');
        
        const data = await response.json();
        setTenants(data);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTenants();
  }, []);

  // --- REAL API CALL: Toggle Tenant Status using PUT ---
  const handleToggleStatus = async (tenant) => {
    setUpdatingId(tenant.id);
    const newStatus = tenant.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BaseURL}/tenants/${tenant.id}`, {
        method: 'PUT', // Changed from PATCH to PUT
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          tenant_name: tenant.tenant_name,
          tenant_code: tenant.tenant_code,
          email: tenant.email,
          phone: tenant.phone,
          logo: tenant.logo
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update status');
      }

      const updatedTenant = await response.json();
      
      // Update the tenant in the list
      setTenants(tenants.map(t => 
        t.id === tenant.id ? updatedTenant : t
      ));
    } catch (error) {
      console.error("Error updating tenant status:", error);
      alert(error.message || "Failed to update tenant status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // --- Data Calculations for Stats & Charts ---
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === 'ACTIVE').length;
  const inactiveTenants = totalTenants - activeTenants;
  
  // Donut Chart Math
  const activePercentage = totalTenants > 0 ? (activeTenants / totalTenants) * 100 : 0;
  const circumference = 2 * Math.PI * 40; // Radius of 40
  const strokeDashoffset = circumference - (activePercentage / 100) * circumference;

  // Mock data for Area Chart (e.g., Last 6 months growth)
  const growthData = [25, 40, 35, 60, 75, 90]; 
  const maxGrowth = Math.max(...growthData);

  return (
    <div className="p-8 lg:p-12 bg-stone-100 min-h-screen font-sans">
      
      {/* Page Header & System Status */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 border-b border-stone-300 pb-6">
        <div>
          <p className="text-[10px] text-stone-500 uppercase tracking-[0.3em] mb-2">Super Admin</p>
          <h1 className="font-serif text-4xl text-stone-900 tracking-tight">System Overview</h1>
          <p className="text-stone-500 mt-2 text-sm">Monitor and manage all registered tenants across the platform.</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <span className="flex items-center text-xs text-stone-600 bg-white border border-stone-200 px-4 py-2.5 uppercase tracking-widest font-medium shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2.5 animate-pulse"></span>
            System Operational
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Total Tenants */}
        <div className="bg-white border border-stone-200 p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em]">Total Tenants</p>
            <div className="p-2 bg-stone-100 rounded-full">
              <BuildingOffice2Icon className="h-5 w-5 text-stone-700" />
            </div>
          </div>
          <div>
            <h2 className="font-serif text-5xl text-stone-900">{loading ? '...' : totalTenants}</h2>
            <p className="text-xs text-stone-500 mt-2 flex items-center">
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1 text-emerald-500" />
              All registered hotel groups
            </p>
          </div>
        </div>

        {/* Active Tenants */}
        <div className="bg-white border border-stone-200 p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em]">Active Properties</p>
            <div className="p-2 bg-emerald-50 rounded-full">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div>
            <h2 className="font-serif text-5xl text-stone-900">{loading ? '...' : activeTenants}</h2>
            <p className="text-xs text-stone-500 mt-2">Currently operational</p>
          </div>
        </div>

        {/* Inactive Tenants */}
        <div className="bg-white border border-stone-200 p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em]">Inactive Properties</p>
            <div className="p-2 bg-stone-100 rounded-full">
              <XCircleIcon className="h-5 w-5 text-stone-500" />
            </div>
          </div>
          <div>
            <h2 className="font-serif text-5xl text-stone-900">{loading ? '...' : inactiveTenants}</h2>
            <p className="text-xs text-stone-500 mt-2">Suspended or disabled</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Area Line Chart (Platform Growth) */}
        <div className="lg:col-span-2 bg-white border border-stone-200 p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-serif text-xl text-stone-900">Platform Growth</h3>
              <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest">Monthly Tenant Registrations</p>
            </div>
            <div className="flex items-center text-xs text-stone-600 bg-stone-100 px-3 py-1.5 rounded-full font-medium">
              <ServerStackIcon className="h-4 w-4 mr-2 text-amber-500" />
              Last 6 Months
            </div>
          </div>
          
          {/* SVG Chart */}
          <div className="relative h-48 w-full">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border-t border-stone-100 w-full"></div>
              ))}
            </div>
            
            {/* Data Line & Area */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
              {(() => {
                const points = growthData.map((val, index) => {
                  const x = (index / (growthData.length - 1)) * 100;
                  const y = 45 - (val / maxGrowth) * 35;
                  return `${x},${y}`;
                }).join(' ');
                
                const areaPoints = `0,50 ${points} 100,50`;

                return (
                  <>
                    <polyline points={points} fill="none" stroke="#f59e0b" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                    <polygon points={areaPoints} fill="url(#areaGradient)" />
                  </>
                );
              })()}
            </svg>
            
            {/* X-Axis Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-stone-400 px-1">
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>
          </div>
        </div>

        {/* Donut Chart (Status Distribution) */}
        <div className="bg-white border border-stone-200 p-6 flex flex-col">
          <h3 className="font-serif text-xl text-stone-900 mb-1">Status Distribution</h3>
          <p className="text-xs text-stone-500 mb-8 uppercase tracking-widest">Active vs Inactive</p>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e7e5e4" strokeWidth="12" />
                {/* Active Circle (Amber) */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="12" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-in-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif text-3xl text-stone-900">{Math.round(activePercentage)}%</span>
                <span className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">Active</span>
              </div>
            </div>
            
            <div className="w-full flex justify-center space-x-6 text-xs">
              <div className="flex items-center">
                <span className="h-2 w-2 bg-amber-500 rounded-full mr-2"></span>
                <span className="text-stone-700 font-medium">{activeTenants} Active</span>
              </div>
              <div className="flex items-center">
                <span className="h-2 w-2 bg-stone-300 rounded-full mr-2"></span>
                <span className="text-stone-700 font-medium">{inactiveTenants} Inactive</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Management Table */}
      <div className="bg-white border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex justify-between items-center">
          <div>
            <h3 className="font-serif text-2xl text-stone-900">Tenant Management</h3>
            <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest">Activate or suspend tenants</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="text-stone-500 hover:text-amber-500 transition-colors text-xs uppercase tracking-widest flex items-center border border-stone-200 px-3 py-2 rounded-sm hover:border-amber-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-8 py-4 text-left text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em]">Tenant Details</th>
              <th className="px-6 py-4 text-left text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em] hidden md:table-cell">Code</th>
              <th className="px-6 py-4 text-left text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em] hidden lg:table-cell">Contact</th>
              <th className="px-6 py-4 text-center text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-center text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-16 text-stone-500 text-sm">Loading tenants...</td>
              </tr>
            ) : tenants.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-16 text-stone-500 text-sm">No tenants found.</td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-stone-50 transition-colors duration-150">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {tenant.logo ? (
                          <img 
                            src={getLogoUrl(tenant.logo)} 
                            alt={tenant.tenant_name} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<svg class="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 21v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4"/></svg>`;
                            }}
                          />
                        ) : (
                          <BuildingOffice2Icon className="h-5 w-5 text-stone-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-stone-900">{tenant.tenant_name}</div>
                        <div className="text-xs text-stone-500 md:hidden mt-1">{tenant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap hidden md:table-cell">
                    <span className="text-sm text-stone-600 font-mono tracking-wider bg-stone-100 px-2 py-1 rounded border border-stone-200">
                      {tenant.tenant_code}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap hidden lg:table-cell">
                    <div className="text-sm text-stone-700">{tenant.email}</div>
                    <div className="text-xs text-stone-500 mt-1">{tenant.phone}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-3 py-1 text-[10px] font-medium uppercase tracking-wider rounded-sm ${
                      tenant.status === 'ACTIVE' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-stone-100 text-stone-500 border border-stone-200'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleToggleStatus(tenant)}
                      disabled={updatingId === tenant.id}
                      className={`inline-flex items-center px-5 py-2.5 text-xs uppercase tracking-widest border transition-all duration-300 disabled:opacity-50 disabled:cursor-wait ${
                        tenant.status === 'ACTIVE' 
                          ? 'border-stone-300 text-stone-600 hover:bg-stone-100 hover:border-stone-400' 
                          : 'border-amber-500 bg-amber-500 text-stone-900 hover:bg-amber-400 hover:border-amber-400'
                      }`}
                    >
                      {updatingId === tenant.id ? (
                        'Updating...'
                      ) : tenant.status === 'ACTIVE' ? (
                        'Deactivate'
                      ) : (
                        'Activate'
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminDashboard;