import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BuildingOffice2Icon, 
  PlusIcon, 
  XMarkIcon, 
  ArrowRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  PhotoIcon,
  IdentificationIcon,
  BuildingLibraryIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

const Tenants = () => {
  const { user } = useAuth();
  
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    tenant_name: '',
    tenant_code: '',
    email: '',
    phone: '',
    password: '',
    status: 'ACTIVE',
    logo: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get token helper
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Helper function to get full logo URL
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    // If logoPath already starts with http, return as is
    if (logoPath.startsWith('http')) return logoPath;
    // If logoPath starts with /, prepend BASE_URL
    if (logoPath.startsWith('/')) return `${BASE_URL}${logoPath}`;
    // Otherwise, prepend BASE_URL with /
    return `${BASE_URL}/${logoPath}`;
  };

  // Fetch Tenants
  useEffect(() => {
    const loadTenants = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_URL}/tenants`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized - Please login again');
          }
          throw new Error(`Failed to fetch tenants: ${response.status}`);
        }
        
        const data = await response.json();
        setTenants(data);
      } catch (error) {
        console.error("Error fetching tenants:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadTenants();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logo') {
      setFormData({ ...formData, logo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Create Tenant
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Construct FormData for file upload
      const payload = new FormData();
      payload.append('tenant_name', formData.tenant_name);
      payload.append('tenant_code', formData.tenant_code);
      payload.append('email', formData.email || '');
      payload.append('phone', formData.phone || '');
      payload.append('password', formData.password || '');
      payload.append('status', formData.status);
      if (formData.logo) {
        payload.append('logo', formData.logo);
      }

      const response = await fetch(`${API_URL}/tenants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Do NOT set Content-Type - browser handles it for FormData
        },
        body: payload
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create tenant';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          // If response is not JSON
          errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const newTenant = await response.json();
      
      // Add new tenant to list
      setTenants([newTenant, ...tenants]);
      
      // Close modal and reset form
      setIsModalOpen(false);
      setFormData({ 
        tenant_name: '', 
        tenant_code: '', 
        email: '', 
        phone: '', 
        password: '', 
        status: 'ACTIVE', 
        logo: null 
      });
      
    } catch (error) {
      console.error("Error creating tenant:", error);
      setError(error.message);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 bg-stone-100 min-h-screen font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 border-b border-stone-300 pb-6">
        <div>
          <p className="text-[10px] text-stone-500 uppercase tracking-[0.3em] mb-2">Administration</p>
          <h1 className="font-serif text-4xl text-stone-900 tracking-tight">Tenant Management</h1>
          <p className="text-stone-500 mt-2 text-sm">Create and manage hotel groups and corporate tenants.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 sm:mt-0 group inline-flex items-center px-6 py-3 bg-stone-900 text-stone-100 text-xs uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-stone-900 transition-all duration-300"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Tenant
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Tenants Table */}
      <div className="bg-white border border-stone-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-8 py-4 text-left text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em]">Tenant Details</th>
              <th className="px-6 py-4 text-left text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em] hidden md:table-cell">Contact</th>
              <th className="px-6 py-4 text-left text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em] hidden lg:table-cell">Code</th>
              <th className="px-6 py-4 text-left text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-right text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-16 text-stone-500 text-sm">Loading tenants...</td>
              </tr>
            ) : tenants.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-16 text-stone-500 text-sm">No tenants found. Create your first tenant.</td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-stone-50 transition-colors duration-150 group">
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
                              e.target.parentElement.innerHTML = `<svg class="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 21v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4"/></svg>`;
                            }}
                          />
                        ) : (
                          <BuildingLibraryIcon className="h-5 w-5 text-stone-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-stone-900">{tenant.tenant_name}</div>
                        <div className="text-xs text-stone-500 md:hidden mt-1">{tenant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-stone-700">{tenant.email}</div>
                    <div className="text-xs text-stone-500 mt-1">{tenant.phone}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap hidden lg:table-cell">
                    <span className="text-sm text-stone-600 font-mono tracking-wider bg-stone-100 px-2 py-1 rounded border border-stone-200">
                      {tenant.tenant_code}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 text-[10px] font-medium uppercase tracking-wider rounded-sm ${
                      tenant.status === 'ACTIVE' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-stone-100 text-stone-500 border border-stone-200'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <button className="text-stone-400 group-hover:text-amber-500 transition-colors opacity-0 group-hover:opacity-100">
                      <ArrowRightIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE TENANT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-stone-200">
              <div>
                <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em]">Operations</p>
                <h3 className="font-serif text-2xl text-stone-900 mt-1">New Tenant Registration</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="px-8 py-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                
                {/* Tenant Name */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Tenant Name *</label>
                  <div className="relative">
                    <BuildingLibraryIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                    <input
                      type="text"
                      name="tenant_name"
                      required
                      value={formData.tenant_name}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm"
                      placeholder="Aurora Grand Hotel"
                    />
                  </div>
                </div>

                {/* Tenant Code */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Tenant Code *</label>
                  <div className="relative">
                    <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                    <input
                      type="text"
                      name="tenant_code"
                      required
                      value={formData.tenant_code}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm font-mono uppercase tracking-wider"
                      placeholder="AG-NYC"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm"
                      placeholder="admin@aurora.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Phone Number</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm"
                      placeholder="+1 212-555-0198"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Initial Password</label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-10 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full pl-4 pr-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm appearance-none cursor-pointer"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                {/* Logo Upload */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Tenant Logo</label>
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden rounded-full flex-shrink-0">
                      {formData.logo ? (
                        <img src={URL.createObjectURL(formData.logo)} alt="Logo Preview" className="h-full w-full object-cover" />
                      ) : (
                        <PhotoIcon className="h-8 w-8 text-stone-400" />
                      )}
                    </div>
                    <label className="cursor-pointer bg-white border border-stone-300 px-4 py-2 text-xs text-stone-700 uppercase tracking-widest hover:bg-stone-50 transition-colors">
                      Upload File
                      <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-stone-500 truncate max-w-[150px]">
                      {formData.logo ? formData.logo.name : 'No file chosen'}
                    </span>
                  </div>
                </div>

              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-stone-200 bg-stone-50 flex items-center justify-end space-x-4">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-6 py-3 text-xs uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="group inline-flex items-center px-8 py-3 bg-amber-500 text-stone-900 text-xs uppercase tracking-widest hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {submitting ? 'Registering...' : 'Register Tenant'}
                {!submitting && <ArrowRightIcon className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </button>
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
};

export default Tenants;