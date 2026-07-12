import React, { useState, useEffect } from 'react';
import { 
  HomeModernIcon, 
  PlusIcon, 
  XMarkIcon, 
  ArrowRightIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingLibraryIcon,
  IdentificationIcon,
  HashtagIcon,
  CheckCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';


const BaseURL = import.meta.env.VITE_API_URL;

const Properties = () => {
  const {user} = useAuth();
  const tenantId = user?.tenant_id; 
  console.log(tenantId);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    tenant_id: tenantId,
    property_name: '',
    property_code: '',
    is_main_branch: false,
    gst_number: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    total_floors: 0,
    status: 'ACTIVE'
  });
  const [submitting, setSubmitting] = useState(false);

  // --- REAL API CALL: Fetch Properties & Tenants ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Fetch Properties
        const propRes = await fetch(`${BaseURL}/properties/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!propRes.ok) throw new Error('Failed to fetch properties');
        const propData = await propRes.json();
        setProperties(propData);

        // Fetch Tenants (for the dropdown selector in the form)
        const tenantRes = await fetch(`${BaseURL}/tenants/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (tenantRes.ok) {
          const tenantData = await tenantRes.json();
          setTenants(tenantData);
          if (tenantData.length > 0) {
            setFormData(prev => ({ ...prev, tenant_id: tenantData[0].id }));
          }
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : (name === 'total_floors' ? parseInt(value) || 0 : value) 
    });
  };

  // --- REAL API CALL: Create Property ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BaseURL}/api/properties/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create property');
      }

      const newProperty = await response.json();
      setProperties([newProperty, ...properties]);
      
      setIsModalOpen(false);
      // Reset form
      setFormData({
        tenant_id: tenants[0]?.id || '', property_name: '', property_code: '', is_main_branch: false,
        gst_number: '', email: '', phone: '', address: '', city: '', state: '', country: '',
        pincode: '', total_floors: 0, status: 'ACTIVE'
      });
      
    } catch (error) {
      console.error("Error creating property:", error);
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
          <p className="text-[10px] text-stone-500 uppercase tracking-[0.3em] mb-2">Operations</p>
          <h1 className="font-serif text-4xl text-stone-900 tracking-tight">Property Management</h1>
          <p className="text-stone-500 mt-2 text-sm">Register and manage physical hotel locations and branches.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 sm:mt-0 group inline-flex items-center px-6 py-3 bg-stone-900 text-stone-100 text-xs uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-stone-900 transition-all duration-300"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Register Property
        </button>
      </div>

      {/* Properties Table */}
      <div className="bg-white border border-stone-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-8 py-4 text-left text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em]">Property Details</th>
              <th className="px-6 py-4 text-left text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em] hidden md:table-cell">Location</th>
              <th className="px-6 py-4 text-left text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em] hidden lg:table-cell">Contact</th>
              <th className="px-6 py-4 text-left text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em] hidden sm:table-cell">Floors</th>
              <th className="px-6 py-4 text-left text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-right text-[10px] font-medium text-stone-500 uppercase tracking-[0.2em]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-16 text-stone-500 text-sm">Loading properties...</td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-16 text-stone-500 text-sm">No properties found. Register your first property.</td>
              </tr>
            ) : (
              properties.map((prop) => (
                <tr key={prop.id} className="hover:bg-stone-50 transition-colors duration-150 group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0">
                        <HomeModernIcon className="h-5 w-5 text-stone-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-stone-900 flex items-center">
                          {prop.property_name}
                          {prop.is_main_branch && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-medium uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                              Main Branch
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-500 mt-1 font-mono">{prop.property_code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-stone-700">{prop.city}, {prop.state}</div>
                    <div className="text-xs text-stone-500 mt-1">{prop.country}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap hidden lg:table-cell">
                    <div className="text-sm text-stone-700">{prop.email}</div>
                    <div className="text-xs text-stone-500 mt-1">{prop.phone}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap hidden sm:table-cell">
                    <span className="text-sm text-stone-600 bg-stone-100 px-2 py-1 rounded border border-stone-200 font-mono">
                      {prop.total_floors}F
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 text-[10px] font-medium uppercase tracking-wider rounded-sm ${
                      prop.status === 'ACTIVE' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-stone-100 text-stone-500 border border-stone-200'
                    }`}>
                      {prop.status}
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

      {/* CREATE PROPERTY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-stone-200 sticky top-0 bg-white z-10">
              <div>
                <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em]">Operations</p>
                <h3 className="font-serif text-2xl text-stone-900 mt-1">New Property Registration</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="px-8 py-8 max-h-[70vh] overflow-y-auto">
              
              {/* Section: Assignment & Status */}
              <div className="mb-8">
                <h4 className="text-xs font-medium text-amber-600 uppercase tracking-widest mb-4">Assignment & Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Tenant Owner *</label>
                    <div className="relative">
                      <select
                        name="tenant_id"
                        required
                        value={formData.tenant_id}
                        onChange={handleInputChange}
                        className="block w-full pl-4 pr-10 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm appearance-none cursor-pointer"
                      >
                        {tenants.map(t => <option key={t.id} value={t.id}>{t.tenant_name}</option>)}
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Status</label>
                    <div className="relative">
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="block w-full pl-4 pr-10 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm appearance-none cursor-pointer"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Property Details */}
              <div className="mb-8 pt-6 border-t border-stone-100">
                <h4 className="text-xs font-medium text-amber-600 uppercase tracking-widest mb-4">Property Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Property Name *</label>
                    <div className="relative">
                      <BuildingLibraryIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                      <input type="text" name="property_name" required value={formData.property_name} onChange={handleInputChange} className="block w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm" placeholder="Aurora Grand Downtown" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Property Code *</label>
                    <div className="relative">
                      <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                      <input type="text" name="property_code" required value={formData.property_code} onChange={handleInputChange} className="block w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm font-mono uppercase tracking-wider" placeholder="AG-DTW" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">GST Number</label>
                    <div className="relative">
                      <HashtagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                      <input type="text" name="gst_number" value={formData.gst_number} onChange={handleInputChange} className="block w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm font-mono uppercase" placeholder="22AAAAA0000A1Z5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Total Floors</label>
                    <div className="relative">
                      <input type="number" name="total_floors" min="0" value={formData.total_floors} onChange={handleInputChange} className="block w-full pl-4 pr-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm" placeholder="10" />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center">
                  <input type="checkbox" name="is_main_branch" id="is_main_branch" checked={formData.is_main_branch} onChange={handleInputChange} className="h-4 w-4 text-amber-500 border-stone-300 rounded focus:ring-amber-500 cursor-pointer" />
                  <label htmlFor="is_main_branch" className="ml-3 block text-sm text-stone-700 cursor-pointer">Designate as Main Branch / Headquarters</label>
                </div>
              </div>

              {/* Section: Location & Contact */}
              <div className="pt-6 border-t border-stone-100">
                <h4 className="text-xs font-medium text-amber-600 uppercase tracking-widest mb-4">Location & Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="block w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm" placeholder="downtown@aurora.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Phone Number</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="block w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm" placeholder="+1 212-555-0198" />
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Street Address</label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-4 h-5 w-5 text-stone-400" />
                    <textarea name="address" rows="2" value={formData.address} onChange={handleInputChange} className="block w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm" placeholder="123 Luxury Ave, Times Square"></textarea>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="block w-full px-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm" placeholder="New York" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="block w-full px-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm" placeholder="NY" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Pincode</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="block w-full px-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm" placeholder="10001" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-widest">Country</label>
                    <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="block w-full px-4 py-3 text-stone-900 bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-sm" placeholder="USA" />
                  </div>
                </div>
              </div>

            </form>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-stone-200 bg-stone-50 flex items-center justify-end space-x-4 sticky bottom-0">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-6 py-3 text-xs uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="group inline-flex items-center px-8 py-3 bg-amber-500 text-stone-900 text-xs uppercase tracking-widest hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {submitting ? 'Registering...' : 'Register Property'}
                {!submitting && <ArrowRightIcon className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </button>
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
};

export default Properties;