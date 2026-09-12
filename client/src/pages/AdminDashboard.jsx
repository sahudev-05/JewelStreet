import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmailReportModal from '../components/EmailReportModal';
import {
  CategoryDonutChart,
  CategoryStockBarChart,
  MonthlyRevenueBarChart,
  OrderStatusPieChart,
  TopSellingBarChart,
  InventoryReportGraphs,
  SalesReportGraphs
} from '../components/ReportCharts';
import {
  exportInventoryCSV,
  exportSalesCSV,
  exportOrdersCSV,
  exportReportPrintablePDF,
} from '../services/reportExporter';
import './AdminDashboard.css';

const CATS = [
  { value: 'rings', label: 'Rings' },
  { value: 'necklace', label: 'Necklace' },
  { value: 'earrings', label: 'Earrings' },
  { value: 'chain', label: 'Gold Chain' },
  { value: 'bangles', label: 'Bangles' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'kada', label: 'Kada' },
  { value: 'men', label: "Men's Collection" },
  { value: 'kids', label: 'Kids Collection' },
  { value: 'coin', label: 'Gold Coins (24K)' },
  { value: 'anklet', label: 'Anklets' },
  { value: 'pendent', label: 'Pendants' },
  { value: 'mangalsutra', label: 'Mangalsutra' },
  { value: 'nosepin', label: 'Nose Pins' },
  { value: 'accessories', label: 'Accessories' }
];

const emptyProd = {
  name: '',
  description: '',
  price: '',
  category: 'rings',
  stock: '',
  material: '22K Gold',
  weight: '',
  makingChargePercent: 18,
  image: '',
};

const MASTER_ADMINS = ['deevyanshu.sahu@gmail.com', 'deevyanshusahu@gmail.com', 'admin@jewelstreet.com'];

const ROLE_PRESETS = [
  {
    value: 'master_admin',
    label: '👑 Master Administrator (Full Access)',
    activities: ['inventory', 'orders', 'customers', 'support', 'reports', 'coupons', 'admins'],
    desc: 'Unrestricted master access across all store operations, role assignments, security and administrators.'
  },
  {
    value: 'inventory_manager',
    label: '💎 Catalog & Inventory Manager',
    activities: ['inventory'],
    desc: 'Manages fine jewelry catalog, stocks, pricing, and making charges.'
  },
  {
    value: 'order_manager',
    label: '📦 Order Fulfillment Specialist',
    activities: ['orders'],
    desc: 'Manages customer orders, armored transit tracking, delivery statuses, and returns.'
  },
  {
    value: 'support_specialist',
    label: '🎧 Customer Support Executive',
    activities: ['support'],
    desc: 'Handles customer problem-solver tickets and resolution inquiries.'
  },
  {
    value: 'customer_manager',
    label: '👥 Customer Relations Manager',
    activities: ['customers'],
    desc: 'Views client profiles, purchasing metrics, contact numbers, and delivery addresses.'
  },
  {
    value: 'reports_analyst',
    label: '📊 Business & Financial Analyst',
    activities: ['reports'],
    desc: 'Accesses store analytics, revenue reports, CSV/PDF exports, and executive email reports.'
  },
  {
    value: 'promotions_manager',
    label: '🏷️ Promotions & Marketing Lead',
    activities: ['coupons'],
    desc: 'Creates and controls promotional discount codes, sales vouchers, and special offers.'
  },
  {
    value: 'store_operations',
    label: '🏬 Store Operations Supervisor',
    activities: ['inventory', 'orders', 'customers', 'support'],
    desc: 'Supervises store operations across inventory, orders, customers & support.'
  },
  {
    value: 'custom',
    label: '⚙️ Custom Privileges (Select Activities)',
    activities: ['inventory'],
    desc: 'Individually select customized operational activities.'
  },
];

const ALL_OPERATIONAL_ACTIVITIES = [
  { key: 'inventory', label: 'Inventory & Catalog', icon: 'fa-gem', desc: 'Add, edit, delete items, stock & making charges' },
  { key: 'orders', label: 'Orders & Fulfillment', icon: 'fa-truck-loading', desc: 'Order tracking, armored transit, invoices & returns' },
  { key: 'customers', label: 'Customer Directory', icon: 'fa-users', desc: 'View customer accounts, addresses & order counts' },
  { key: 'support', label: 'Problem Solver & Support', icon: 'fa-headset', desc: 'Resolve client complaints & support tickets' },
  { key: 'reports', label: 'Reports & Analytics', icon: 'fa-chart-bar', desc: 'Inventory reports, revenue analytics & CSV/PDF export' },
  { key: 'coupons', label: 'Offers & Coupons', icon: 'fa-tags', desc: 'Create and toggle promotional discount codes' },
  { key: 'admins', label: 'Admin Access Control', icon: 'fa-user-shield', desc: 'Create, modify and manage store administrators' },
];

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Customer Management state
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Support & Problem Solver state
  const [supportTickets, setSupportTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketFilterStatus, setTicketFilterStatus] = useState('all');
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [selectedTicketForResolve, setSelectedTicketForResolve] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('Resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [ticketStatusUpdating, setTicketStatusUpdating] = useState(false);
  const [ticketResolveMsg, setTicketResolveMsg] = useState(null);

  // Admin Forgot Password state
  const [showAdminForgotModal, setShowAdminForgotModal] = useState(false);
  const [adminForgotStep, setAdminForgotStep] = useState('request'); // 'request' | 'verify'
  const [adminForgotEmail, setAdminForgotEmail] = useState('');
  const [adminForgotOtp, setAdminForgotOtp] = useState('');
  const [adminForgotNewPass, setAdminForgotNewPass] = useState('');
  const [adminForgotConfirmPass, setAdminForgotConfirmPass] = useState('');
  const [adminForgotLoading, setAdminForgotLoading] = useState(false);
  const [adminForgotMsg, setAdminForgotMsg] = useState(null);
  const [showAdminPassToggle, setShowAdminPassToggle] = useState(false);

  // First-time Admin Password Change state
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [firstTimeEmail, setFirstTimeEmail] = useState('');
  const [firstTimeCurrentPass, setFirstTimeCurrentPass] = useState('');
  const [firstTimeNewPass, setFirstTimeNewPass] = useState('');
  const [firstTimeConfirmPass, setFirstTimeConfirmPass] = useState('');
  const [firstTimeLoading, setFirstTimeLoading] = useState(false);
  const [firstTimeMsg, setFirstTimeMsg] = useState(null);

  // Master Admin Change Sub-Admin Passcode state
  const [showMasterChangePassModal, setShowMasterChangePassModal] = useState(false);
  const [selectedAdminForPass, setSelectedAdminForPass] = useState(null);
  const [masterNewAdminPass, setMasterNewAdminPass] = useState('');
  const [masterChangePassLoading, setMasterChangePassLoading] = useState(false);
  const [masterChangePassMsg, setMasterChangePassMsg] = useState(null);

  // Master Admin Role Assignment state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedAdminForRole, setSelectedAdminForRole] = useState(null);
  const [editAdminRole, setEditAdminRole] = useState('inventory_manager');
  const [editAdminActivities, setEditAdminActivities] = useState(['inventory']);
  const [roleUpdateLoading, setRoleUpdateLoading] = useState(false);
  const [roleUpdateMsg, setRoleUpdateMsg] = useState(null);

  // activeTab: 'inventory' | 'orders' | 'reports' | 'admins' | 'customers' | 'support' | 'coupons'
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);

  // Order Segregation & Filter state
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Bulk Making Charges state
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [showMakingChargeModal, setShowMakingChargeModal] = useState(false);
  const [makingChargeScope, setMakingChargeScope] = useState('all'); // 'all' | 'category' | 'selected'
  const [makingChargeCategory, setMakingChargeCategory] = useState('rings');
  const [newMakingChargePercent, setNewMakingChargePercent] = useState(18);
  const [makingChargeSubmitting, setMakingChargeSubmitting] = useState(false);
  const [makingChargeMsg, setMakingChargeMsg] = useState(null);

  // Reports state
  const [inventoryReport, setInventoryReport] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [activeReport, setActiveReport] = useState('inventory');

  // Email Report Modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailReportType, setEmailReportType] = useState('inventory');
  const [emailReportData, setEmailReportData] = useState(null);

  // Admin Management state
  const [adminList, setAdminList] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    assignedRole: 'inventory_manager',
    allowedActivities: ['inventory']
  });
  const [adminCreating, setAdminCreating] = useState(false);
  const [adminMsg, setAdminMsg] = useState(null);

  // Coupon / Offer management state
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [newCouponForm, setNewCouponForm] = useState({
    code: '', discountType: 'percentage', discountValue: '', minPurchase: '', description: ''
  });
  const [couponCreating, setCouponCreating] = useState(false);
  const [couponMsg, setCouponMsg] = useState(null);

  // Product modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [newProd, setNewProd] = useState({ ...emptyProd });

  const uEmail = (user?.email || '').toLowerCase().trim();
  const isMaster = MASTER_ADMINS.includes(uEmail) || user?.role === 'master_admin' || user?.assignedRole === 'master_admin' || user?.isMaster === true;
  const effectiveActivities = isMaster
    ? ['inventory', 'orders', 'customers', 'support', 'reports', 'admins', 'coupons']
    : (Array.isArray(user?.allowedActivities) && user?.allowedActivities.length > 0
        ? user.allowedActivities
        : ['inventory']);

  useEffect(() => {
    if (isAdmin && effectiveActivities.length > 0 && !effectiveActivities.includes(activeTab)) {
      setActiveTab(effectiveActivities[0]);
    }
  }, [isAdmin, effectiveActivities, activeTab]);

  useEffect(() => {
    checkAdminRole();

    // Auto sync admin role and permitted activities periodically and on window focus
    const syncLiveRole = () => {
      const savedUser = localStorage.getItem('jewel_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          const email = (parsed.email || '').toLowerCase().trim();
          if (email) {
            axios.get(`/api/auth/my-role?email=${encodeURIComponent(email)}`)
              .then(res => {
                if (res.data && res.data.role) {
                  setUser(prev => {
                    const fresh = {
                      ...prev,
                      ...parsed,
                      role: res.data.role,
                      assignedRole: res.data.assignedRole,
                      allowedActivities: res.data.allowedActivities,
                      mustChangePassword: res.data.mustChangePassword,
                      isMaster: res.data.isMaster
                    };
                    localStorage.setItem('jewel_user', JSON.stringify(fresh));
                    return fresh;
                  });
                }
              })
              .catch(() => {});
          }
        } catch (e) {}
      }
    };

    window.addEventListener('focus', syncLiveRole);
    const pollTimer = setInterval(syncLiveRole, 12000);
    return () => {
      window.removeEventListener('focus', syncLiveRole);
      clearInterval(pollTimer);
    };
  }, []);

  const loadDataForAdmin = (u) => {
    const uEmail = (u?.email || '').toLowerCase().trim();
    const isMasterUser = MASTER_ADMINS.includes(uEmail) || u?.role === 'master_admin' || u?.isMaster === true;
    const activities = isMasterUser
      ? ['inventory', 'orders', 'customers', 'support', 'reports', 'admins', 'coupons']
      : (Array.isArray(u?.allowedActivities) && u?.allowedActivities.length > 0 ? u.allowedActivities : ['inventory']);

    if (activities.includes('inventory')) fetchInventory();
    if (activities.includes('orders')) fetchOrders();
    if (activities.includes('customers')) fetchCustomers();
    if (activities.includes('support')) fetchTickets();
    if (activities.includes('coupons')) fetchCoupons();
    if (isMasterUser) fetchAdmins();

    // Default active tab to first permitted tab
    setActiveTab(prevTab => activities.includes(prevTab) ? prevTab : (activities[0] || 'inventory'));
  };

  const checkAdminRole = () => {
    const savedUser = localStorage.getItem('jewel_user');
    if (savedUser) {
      try {
        let u = JSON.parse(savedUser);
        const uEmail = (u?.email || '').toLowerCase().trim();
        const isDeev = uEmail.includes('deevyanshu');
        if (!isDeev && u.name && u.name.toLowerCase().includes('deevyanshu')) {
          const prefix = uEmail ? uEmail.split('@')[0] : 'Admin';
          u.name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
          localStorage.setItem('jewel_user', JSON.stringify(u));
        }
        setUser(u);
        axios.defaults.headers.common['x-admin-email'] = u.email;
        if (u.mustChangePassword) {
          setShowFirstTimeModal(true);
          setFirstTimeEmail(u.email);
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        if (u.role === 'admin' || u.role === 'master_admin' || MASTER_ADMINS.includes((u.email || '').toLowerCase())) {
          setIsAdmin(true);
          loadDataForAdmin(u);

          // Verify live role from server to immediately reflect any Master Admin role updates
          axios.get(`/api/auth/my-role?email=${encodeURIComponent(uEmail)}`)
            .then(res => {
              if (res.data && res.data.role) {
                const fresh = {
                  ...u,
                  role: res.data.role,
                  assignedRole: res.data.assignedRole,
                  allowedActivities: res.data.allowedActivities,
                  mustChangePassword: res.data.mustChangePassword,
                  isMaster: res.data.isMaster
                };
                setUser(fresh);
                localStorage.setItem('jewel_user', JSON.stringify(fresh));
                if (fresh.mustChangePassword) {
                  setShowFirstTimeModal(true);
                  setFirstTimeEmail(fresh.email);
                  setIsAdmin(false);
                } else {
                  loadDataForAdmin(fresh);
                }
              }
            })
            .catch(() => {});
          return;
        }
      } catch (e) {
        console.error('Error checking admin role:', e);
      }
    }
    setIsAdmin(false);
    setLoading(false);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSubmitting(true);
    try {
      const res = await axios.post('/api/auth/login', { email: loginEmail, password: loginPass, portal: 'admin' });
      if (res.data?.token) {
        let userData = res.data;
        const uEmail = (userData.email || '').toLowerCase().trim();
        const isDeev = uEmail.includes('deevyanshu');
        if (!isDeev && userData.name && userData.name.toLowerCase().includes('deevyanshu')) {
          const prefix = uEmail ? uEmail.split('@')[0] : 'Admin';
          userData.name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }
        localStorage.setItem('jewel_user', JSON.stringify(userData));
        localStorage.setItem('jewel_token', userData.token);
        setUser(userData);
        if (userData.mustChangePassword) {
          setShowFirstTimeModal(true);
          setFirstTimeEmail(userData.email);
          setFirstTimeCurrentPass(loginPass);
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
          axios.defaults.headers.common['x-admin-email'] = userData.email;
          loadDataForAdmin(userData);
        }
        return;
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Authentication failed. Please verify your admin credentials.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleAdminRequestOtp = async (e) => {
    e.preventDefault();
    setAdminForgotLoading(true);
    setAdminForgotMsg(null);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email: adminForgotEmail });
      setAdminForgotMsg({ type: 'success', text: res.data.message });
      setAdminForgotStep('verify');
      if (res.data.devOtp) {
        setAdminForgotOtp(res.data.devOtp);
      }
    } catch (err) {
      setAdminForgotMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send verification code' });
    } finally {
      setAdminForgotLoading(false);
    }
  };

  const handleAdminResetPassword = async (e) => {
    e.preventDefault();
    if (adminForgotNewPass.length < 6) {
      setAdminForgotMsg({ type: 'error', text: 'Passcode must be at least 6 characters long' });
      return;
    }
    if (adminForgotNewPass !== adminForgotConfirmPass) {
      setAdminForgotMsg({ type: 'error', text: 'Passcodes do not match' });
      return;
    }

    setAdminForgotLoading(true);
    setAdminForgotMsg(null);
    try {
      const res = await axios.post('/api/auth/reset-password', {
        email: adminForgotEmail,
        otp: adminForgotOtp,
        newPassword: adminForgotNewPass,
      });
      setAdminForgotMsg({ type: 'success', text: res.data.message });
      setTimeout(() => {
        setLoginEmail(adminForgotEmail);
        setLoginPass(adminForgotNewPass);
        setShowAdminForgotModal(false);
        setAdminForgotStep('request');
        setAdminForgotMsg(null);
      }, 1600);
    } catch (err) {
      setAdminForgotMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reset passcode' });
    } finally {
      setAdminForgotLoading(false);
    }
  };

  const handleFirstTimePasswordSubmit = async (e) => {
    e.preventDefault();
    if (firstTimeNewPass.length < 6) {
      setFirstTimeMsg({ type: 'error', text: 'New passcode must be at least 6 characters long' });
      return;
    }
    if (firstTimeNewPass !== firstTimeConfirmPass) {
      setFirstTimeMsg({ type: 'error', text: 'New passcode and confirm passcode do not match' });
      return;
    }

    setFirstTimeLoading(true);
    setFirstTimeMsg(null);
    try {
      const token = localStorage.getItem('jewel_token') || localStorage.getItem('token') || '';
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post('/api/auth/first-time-password-change', {
        email: firstTimeEmail,
        currentPassword: firstTimeCurrentPass,
        newPassword: firstTimeNewPass,
      }, { headers });
      setFirstTimeMsg({ type: 'success', text: res.data.message });
      const updatedUser = res.data?.user;
      if (updatedUser) {
        localStorage.setItem('jewel_user', JSON.stringify(updatedUser));
        if (res.data.token) {
          localStorage.setItem('jewel_token', res.data.token);
        }
        setUser(updatedUser);
        axios.defaults.headers.common['x-admin-email'] = updatedUser.email;
      }
      setTimeout(() => {
        setShowFirstTimeModal(false);
        setIsAdmin(true);
        if (updatedUser) {
          loadDataForAdmin(updatedUser);
        } else {
          loadDataForAdmin(user);
        }
      }, 1000);
    } catch (err) {
      setFirstTimeMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update passcode' });
    } finally {
      setFirstTimeLoading(false);
    }
  };

  const openChangeAdminPassModal = (admin) => {
    setSelectedAdminForPass(admin);
    setMasterNewAdminPass('');
    setMasterChangePassMsg(null);
    setShowMasterChangePassModal(true);
  };

  const handleMasterUpdateAdminPass = async (e) => {
    e.preventDefault();
    if (masterNewAdminPass.length < 6) {
      setMasterChangePassMsg({ type: 'error', text: 'Passcode must be at least 6 characters long' });
      return;
    }

    setMasterChangePassLoading(true);
    setMasterChangePassMsg(null);
    try {
      const reqEmail = user?.email || 'deevyanshusahu@gmail.com';
      const res = await axios.put('/api/auth/update-admin-password', {
        adminId: selectedAdminForPass?.id,
        email: selectedAdminForPass?.email,
        newPassword: masterNewAdminPass,
      }, {
        headers: { 'x-admin-email': reqEmail }
      });
      setMasterChangePassMsg({ type: 'success', text: res.data.message });
      setTimeout(() => {
        setShowMasterChangePassModal(false);
        fetchAdmins();
      }, 1500);
    } catch (err) {
      setMasterChangePassMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update passcode' });
    } finally {
      setMasterChangePassLoading(false);
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try { const res = await axios.get('/api/products/inventory/all'); setProducts(res.data || []); }
    catch (err) { console.error('Inventory fetch error:', err); }
    finally { setLoading(false); }
  };

  const fetchOrders = async () => {
    try { const res = await axios.get('/api/orders/all-orders'); setOrders(res.data || []); }
    catch (err) {}
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const [invRes, salesRes] = await Promise.all([
        axios.get('/api/products/reports/inventory'),
        axios.get('/api/products/reports/sales'),
      ]);
      setInventoryReport(invRes.data); setSalesReport(salesRes.data);
    } catch (err) { console.error('Reports fetch error:', err); }
    finally { setReportsLoading(false); }
  };

  const fetchAdmins = async () => {
    setAdminsLoading(true);
    try { const res = await axios.get('/api/auth/list-admins'); setAdminList(res.data || []); }
    catch (err) {}
    setAdminsLoading(false);
  };

  const fetchCoupons = async () => {
    setCouponsLoading(true);
    try {
      const res = await axios.get('/api/coupons/all');
      setCoupons(res.data || []);
    } catch (err) {}
    setCouponsLoading(false);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setCouponCreating(true); setCouponMsg(null);
    try {
      const reqEmail = user?.email || 'deevyanshusahu@gmail.com';
      const res = await axios.post('/api/coupons/add', newCouponForm, {
        headers: { 'x-admin-email': reqEmail }
      });
      setCouponMsg({ type: 'success', text: res.data.message });
      setNewCouponForm({ code: '', discountType: 'percentage', discountValue: '', minPurchase: '', description: '' });
      fetchCoupons();
    } catch (err) {
      setCouponMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create coupon' });
    }
    setCouponCreating(false);
  };

  const handleToggleCoupon = async (id, code, currentStatus) => {
    try {
      const reqEmail = user?.email || 'deevyanshusahu@gmail.com';
      await axios.put(`/api/coupons/${id}/toggle`, {}, {
        headers: { 'x-admin-email': reqEmail }
      });
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle coupon status');
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Permanently delete offer coupon "${code}"?`)) return;
    try {
      const reqEmail = user?.email || 'deevyanshusahu@gmail.com';
      await axios.delete(`/api/coupons/${id}`, {
        headers: { 'x-admin-email': reqEmail }
      });
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const res = await axios.get('/api/auth/customers');
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setCustomersLoading(false);
    }
  };

  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const res = await axios.get('/api/support/tickets');
      setSupportTickets(res.data || []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  const openResolveModal = (ticket) => {
    setSelectedTicketForResolve(ticket);
    setResolutionStatus(ticket.status === 'Resolved' ? 'Resolved' : 'Resolved');
    setResolutionNotes(ticket.resolutionNotes || '');
    setTicketResolveMsg(null);
  };

  const handleUpdateTicketStatus = async (e) => {
    e.preventDefault();
    if (!selectedTicketForResolve) return;
    setTicketStatusUpdating(true);
    setTicketResolveMsg(null);
    try {
      const adminName = user?.name || user?.email || 'Store Operations';
      const ticketId = selectedTicketForResolve.ticketId || selectedTicketForResolve.id;
      const res = await axios.put(`/api/support/tickets/${ticketId}/resolve`, {
        status: resolutionStatus,
        resolutionNotes,
        resolvedBy: adminName,
      });
      setSupportTickets(prev => prev.map(t => (t.id === ticketId || t.ticketId === ticketId) ? res.data.ticket : t));
      setTicketResolveMsg({ type: 'success', text: `Support ticket ${ticketId} updated to "${resolutionStatus}"!` });
      setTimeout(() => {
        setSelectedTicketForResolve(null);
        setTicketResolveMsg(null);
      }, 1100);
    } catch (err) {
      setTicketResolveMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update ticket' });
    } finally {
      setTicketStatusUpdating(false);
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'reports' && !inventoryReport) fetchReports();
    if (tab === 'admins' && adminList.length === 0) fetchAdmins();
    if (tab === 'coupons' && coupons.length === 0) fetchCoupons();
    if (tab === 'customers') fetchCustomers();
    if (tab === 'support') fetchTickets();
  };

  const openAddModal = () => { setEditProd(null); setNewProd({ ...emptyProd }); setShowAddModal(true); };

  const openEditModal = (prod) => {
    setEditProd(prod);
    setNewProd({ name: prod.name || '', category: prod.category || 'rings', weight: String(prod.weight || '6.0'), purity: prod.purity || '91.6%', price: prod.price || '\u20b945,000', stock: prod.stock !== undefined ? prod.stock : 12, image: prod.image || '/photos/product1.jpg', description: prod.description || '' });
    setShowAddModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editProd) { await axios.put(`/api/products/inventory/${editProd.id}`, newProd); alert(`\u2705 "${newProd.name}" updated!`); }
      else { await axios.post('/api/products/inventory/add', newProd); alert('\u2705 Product Added!'); }
      setShowAddModal(false); fetchInventory();
    } catch (err) { alert('Failed: ' + (err.response?.data?.message || err.message)); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Remove this item from store inventory?')) return;
    try { await axios.delete(`/api/products/inventory/${id}`); fetchInventory(); }
    catch (err) { alert('Delete failed'); }
  };

  const handleUpdateStock = async (id, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await axios.put(`/api/products/inventory/${id}`, { stock: newStock });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    } catch (err) {}
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      if (newStatus === 'Cancelled') {
        await axios.post(`/api/orders/${orderId}/cancel`, { reason: 'Cancelled by Store Admin' });
      } else {
        await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      }
      setOrders(prev => prev.map(o => (o._id === orderId || o.invoiceNo === orderId) ? { ...o, status: newStatus } : o));
      try {
        const lsOrders = JSON.parse(localStorage.getItem('jewel_orders') || '[]');
        const updated = lsOrders.map(o => (o._id === orderId || o.invoiceNo === orderId) ? { ...o, status: newStatus } : o);
        localStorage.setItem('jewel_orders', JSON.stringify(updated));
      } catch (e) {}
      alert(`\u2705 Order status updated to: ${newStatus}`);
    } catch (err) { alert('Status update failed'); }
  };

  const handleProcessReturn = async (orderId, action) => {
    const note = window.prompt(`Admin note for ${action} Return/Exchange:`, action === 'Approved' ? 'Approved by Store Manager' : 'Request verification failed');
    if (note === null) return;

    try {
      const res = await axios.put(`/api/orders/${orderId}/process-return`, { action, note });
      alert(`\u2705 ${res.data.message}`);
      fetchOrders();
    } catch (err) {
      alert('Failed to process return request: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleSelectProduct = (prodId) => {
    setSelectedProductIds(prev =>
      prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]
    );
  };

  const toggleSelectAllProducts = (filteredProds) => {
    const allFilteredIds = filteredProds.map(p => p.id);
    const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedProductIds.includes(id));
    if (allSelected) {
      setSelectedProductIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedProductIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleApplyMakingCharges = async (e) => {
    e.preventDefault();
    setMakingChargeSubmitting(true);
    setMakingChargeMsg(null);
    try {
      const res = await axios.post('/api/products/inventory/update-making-charges', {
        scope: makingChargeScope,
        categoryKey: makingChargeCategory,
        productIds: selectedProductIds,
        makingChargePercent: newMakingChargePercent
      });
      setMakingChargeMsg({ type: 'success', text: res.data.message });
      fetchInventory();
    } catch (err) {
      setMakingChargeMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update making charges'
      });
    } finally {
      setMakingChargeSubmitting(false);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProd(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleNewAdminRoleChange = (roleValue) => {
    const preset = ROLE_PRESETS.find(r => r.value === roleValue);
    setNewAdminForm(prev => ({
      ...prev,
      assignedRole: roleValue,
      allowedActivities: preset && roleValue !== 'custom' ? [...preset.activities] : prev.allowedActivities
    }));
  };

  const toggleNewAdminActivity = (actKey) => {
    setNewAdminForm(prev => {
      const current = prev.allowedActivities || [];
      const updated = current.includes(actKey)
        ? current.filter(k => k !== actKey)
        : [...current, actKey];
      return {
        ...prev,
        assignedRole: 'custom',
        allowedActivities: updated
      };
    });
  };

  const openEditRoleModal = (admin) => {
    setSelectedAdminForRole(admin);
    const roleKey = admin.assignedRole || 'inventory_manager';
    setEditAdminRole(roleKey);
    const actList = Array.isArray(admin.allowedActivities) && admin.allowedActivities.length > 0
      ? [...admin.allowedActivities]
      : (ROLE_PRESETS.find(r => r.value === roleKey)?.activities || ['inventory']);
    setEditAdminActivities(actList);
    setRoleUpdateMsg(null);
    setShowRoleModal(true);
  };

  const handleEditRoleChange = (roleValue) => {
    setEditAdminRole(roleValue);
    const preset = ROLE_PRESETS.find(r => r.value === roleValue);
    if (preset && roleValue !== 'custom') {
      setEditAdminActivities([...preset.activities]);
    }
  };

  const toggleEditAdminActivity = (actKey) => {
    setEditAdminActivities(prev => {
      const updated = prev.includes(actKey) ? prev.filter(k => k !== actKey) : [...prev, actKey];
      return updated;
    });
    setEditAdminRole('custom');
  };

  const handleUpdateAdminRoleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAdminForRole) return;
    if (editAdminActivities.length === 0) {
      setRoleUpdateMsg({ type: 'error', text: 'Please select at least one activity permission for this administrator.' });
      return;
    }

    setRoleUpdateLoading(true);
    setRoleUpdateMsg(null);
    try {
      const reqEmail = user?.email || 'deevyanshusahu@gmail.com';
      const res = await axios.put('/api/auth/update-admin-role', {
        adminId: selectedAdminForRole.id || selectedAdminForRole.adminId,
        email: selectedAdminForRole.email,
        assignedRole: editAdminRole,
        allowedActivities: editAdminActivities
      }, {
        headers: { 'x-admin-email': reqEmail }
      });
      setRoleUpdateMsg({ type: 'success', text: res.data.message });
      fetchAdmins();
      setTimeout(() => {
        setShowRoleModal(false);
        setRoleUpdateMsg(null);
      }, 1400);
    } catch (err) {
      setRoleUpdateMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update administrator role' });
    } finally {
      setRoleUpdateLoading(false);
    }
  };

  const handleMakeMasterAdmin = async (admin) => {
    const confirmMsg = `Are you sure you want to promote ${admin.name} (${admin.email}) to Master Administrator?\n\nThey will receive full, unrestricted access across all 7 operational modules and admin management privileges.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const adminEmail = (user?.email || '').toLowerCase().trim();
      const res = await axios.put('/api/auth/update-admin-role', {
        adminId: admin.id || admin.adminId,
        email: admin.email,
        assignedRole: 'master_admin',
        allowedActivities: ['inventory', 'orders', 'customers', 'support', 'reports', 'coupons', 'admins'],
        requesterEmail: adminEmail
      }, {
        headers: { 'x-admin-email': adminEmail }
      });

      if (res.data.success) {
        alert(`👑 ${admin.name} is now a Master Administrator!`);
        fetchAdmins();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to promote administrator to Master Admin');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminCreating(true); setAdminMsg(null);
    try {
      const reqEmail = user?.email || 'deevyanshusahu@gmail.com';
      const res = await axios.post('/api/auth/create-admin', newAdminForm, {
        headers: { 'x-admin-email': reqEmail }
      });
      const assignedLabel = ROLE_PRESETS.find(r => r.value === newAdminForm.assignedRole)?.label || newAdminForm.assignedRole;
      setAdminMsg({ type: 'success', text: `✅ Admin "${newAdminForm.name}" created with role "${assignedLabel}"! ${res.data.emailSent ? 'Credentials email sent.' : ''}`, previewUrl: res.data.previewUrl });
      setNewAdminForm({
        name: '',
        email: '',
        password: '',
        assignedRole: 'inventory_manager',
        allowedActivities: ['inventory']
      });
      fetchAdmins();
    } catch (err) { setAdminMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create admin' }); }
    setAdminCreating(false);
  };

  const handleRemoveAdmin = async (id, name) => {
    if (!window.confirm(`Remove admin "${name}"?`)) return;
    try {
      const reqEmail = user?.email || 'deevyanshusahu@gmail.com';
      await axios.delete(`/api/auth/remove-admin/${id}`, {
        headers: { 'x-admin-email': reqEmail }
      });
      fetchAdmins();
    } catch (err) { alert(err.response?.data?.message || 'Failed to remove admin'); }
  };

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-login-card">
          <div className="admin-crest"><i className="fas fa-crown" style={{ color: '#e6b97e' }}></i></div>
          <h2>Jewel Street Royal Admin Portal</h2>
          <p>Restricted Access: Authorized Store Administrators Only.</p>

          {loginError && (
            <div style={{
              margin: '14px 0',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(186, 75, 95, 0.14)',
              border: '1px solid rgba(186, 75, 95, 0.35)',
              color: '#e89da9',
              fontSize: '0.86rem',
              textAlign: 'center'
            }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }}></i>
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="admin-form">
            <div className="form-group">
              <label>Admin Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@jewelstreet.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0 }}>Admin Secret Passcode</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminForgotModal(true);
                    setAdminForgotEmail(loginEmail || '');
                    setAdminForgotStep('request');
                    setAdminForgotMsg(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e6b97e',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    fontFamily: 'inherit'
                  }}
                >
                  Forgot Passcode?
                </button>
              </div>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Enter secret passcode"
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="admin-submit-btn" disabled={loginSubmitting}>
              <i className="fas fa-lock"></i> {loginSubmitting ? 'Authenticating...' : 'Authenticate Admin Session'}
            </button>
          </form>
        </div>

        {/* Admin Forgot Password Modal */}
        {showAdminForgotModal && (
          <div className="admin-modal-overlay" onClick={() => setShowAdminForgotModal(false)}>
            <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', background: 'linear-gradient(145deg, #0d0033 0%, #06001a 100%)', border: '1px solid rgba(230, 185, 126, 0.4)', borderRadius: '16px', padding: '28px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(230, 185, 126, 0.15)', border: '1px solid #e6b97e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#e6b97e', fontSize: '1.3rem' }}>
                  <i className="fas fa-user-shield"></i>
                </div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', margin: '0 0 6px', fontFamily: "'Georgia', serif" }}>
                  {adminForgotStep === 'request' ? 'Reset Admin Passcode' : 'Set New Admin Passcode'}
                </h3>
                <p style={{ color: '#a599c2', fontSize: '0.85rem', margin: 0 }}>
                  {adminForgotStep === 'request'
                    ? 'Enter your registered administrator email to receive a 6-digit verification code.'
                    : `Enter the code sent to ${adminForgotEmail} and set your new secret passcode.`}
                </p>
              </div>

              {adminForgotMsg && (
                <div style={{
                  marginBottom: '18px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  background: adminForgotMsg.type === 'success' ? 'rgba(198, 217, 190, 0.14)' : 'rgba(186, 75, 95, 0.14)',
                  border: `1px solid ${adminForgotMsg.type === 'success' ? '#c6d9be' : '#e89da9'}`,
                  color: adminForgotMsg.type === 'success' ? '#c6d9be' : '#e89da9',
                }}>
                  {adminForgotMsg.text}
                </div>
              )}

              {adminForgotStep === 'request' ? (
                <form onSubmit={handleAdminRequestOtp}>
                  <div className="form-group" style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', color: '#e6b97e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      Administrator Email *
                    </label>
                    <input
                      type="email"
                      value={adminForgotEmail}
                      onChange={e => setAdminForgotEmail(e.target.value)}
                      placeholder="admin@jewelstreet.com"
                      required
                      style={{ width: '100%', padding: '11px', background: '#090029', border: '1px solid rgba(230, 185, 126, 0.3)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={adminForgotLoading}
                    style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #e6b97e, #d4a060)', border: 'none', borderRadius: '8px', color: '#0d0028', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer' }}
                  >
                    {adminForgotLoading ? 'Sending Verification Code...' : 'Send Verification Code →'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAdminResetPassword}>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', color: '#e6b97e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      6-Digit Verification Code *
                    </label>
                    <input
                      type="text"
                      value={adminForgotOtp}
                      onChange={e => setAdminForgotOtp(e.target.value)}
                      placeholder="123456"
                      required
                      maxLength={6}
                      style={{ width: '100%', padding: '11px', background: '#090029', border: '1px solid rgba(230, 185, 126, 0.3)', borderRadius: '8px', color: '#e6b97e', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '5px', fontWeight: 'bold' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', color: '#e6b97e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      New Secret Passcode * (min 6 chars)
                    </label>
                    <input
                      type="password"
                      value={adminForgotNewPass}
                      onChange={e => setAdminForgotNewPass(e.target.value)}
                      placeholder="Enter new passcode"
                      required
                      minLength={6}
                      style={{ width: '100%', padding: '11px', background: '#090029', border: '1px solid rgba(230, 185, 126, 0.3)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', color: '#e6b97e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      Confirm New Passcode *
                    </label>
                    <input
                      type="password"
                      value={adminForgotConfirmPass}
                      onChange={e => setAdminForgotConfirmPass(e.target.value)}
                      placeholder="Confirm new passcode"
                      required
                      minLength={6}
                      style={{ width: '100%', padding: '11px', background: '#090029', border: '1px solid rgba(230, 185, 126, 0.3)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={adminForgotLoading}
                    style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #e6b97e, #d4a060)', border: 'none', borderRadius: '8px', color: '#0d0028', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer' }}
                  >
                    {adminForgotLoading ? 'Updating Passcode...' : '🔒 Update Passcode & Login'}
                  </button>
                  <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => { setAdminForgotStep('request'); setAdminForgotMsg(null); }}
                      style={{ background: 'none', border: 'none', color: '#a599c2', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      ← Back: Request another code
                    </button>
                  </div>
                </form>
              )}

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowAdminForgotModal(false)}
                  style={{ background: 'none', border: 'none', color: '#a599c2', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* First-Time Admin Mandatory Passcode Change Modal */}
        {showFirstTimeModal && (
          <div className="admin-modal-overlay" style={{ zIndex: 999999 }}>
            <div className="admin-modal-content" style={{ maxWidth: '460px', background: 'linear-gradient(145deg, #0d0033 0%, #06001a 100%)', border: '2px solid #e6b97e', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.9)' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(230, 185, 126, 0.18)', border: '1.5px solid #e6b97e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#e6b97e', fontSize: '1.5rem' }}>
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3 style={{ color: '#fff', fontSize: '1.3rem', margin: '0 0 6px', fontFamily: "'Georgia', serif" }}>
                  First-Time Admin Setup
                </h3>
                <p style={{ color: '#e6b97e', fontSize: '0.86rem', margin: 0, fontWeight: 'bold' }}>
                  Security Policy: You must set a permanent passcode before accessing the store management dashboard.
                </p>
              </div>

              {firstTimeMsg && (
                <div style={{
                  marginBottom: '18px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  background: firstTimeMsg.type === 'success' ? 'rgba(198, 217, 190, 0.14)' : 'rgba(186, 75, 95, 0.14)',
                  border: `1px solid ${firstTimeMsg.type === 'success' ? '#c6d9be' : '#e89da9'}`,
                  color: firstTimeMsg.type === 'success' ? '#c6d9be' : '#e89da9',
                }}>
                  {firstTimeMsg.text}
                </div>
              )}

              <form onSubmit={handleFirstTimePasswordSubmit}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#a599c2', fontSize: '0.82rem' }}>
                    Current Temporary Passcode *
                  </label>
                  <input
                    type="password"
                    value={firstTimeCurrentPass}
                    onChange={e => setFirstTimeCurrentPass(e.target.value)}
                    placeholder="Enter current temporary passcode"
                    required
                    style={{ width: '100%', padding: '11px', background: '#090029', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#e6b97e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    New Personal Passcode * (min 6 chars)
                  </label>
                  <input
                    type="password"
                    value={firstTimeNewPass}
                    onChange={e => setFirstTimeNewPass(e.target.value)}
                    placeholder="Create a strong passcode"
                    required
                    minLength={6}
                    style={{ width: '100%', padding: '11px', background: '#090029', border: '1px solid rgba(230, 185, 126, 0.4)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#e6b97e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    Confirm New Passcode *
                  </label>
                  <input
                    type="password"
                    value={firstTimeConfirmPass}
                    onChange={e => setFirstTimeConfirmPass(e.target.value)}
                    placeholder="Confirm your new passcode"
                    required
                    minLength={6}
                    style={{ width: '100%', padding: '11px', background: '#090029', border: '1px solid rgba(230, 185, 126, 0.4)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={firstTimeLoading}
                  style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #e6b97e, #d4a060)', border: 'none', borderRadius: '8px', color: '#0d0028', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(230, 185, 126, 0.3)' }}
                >
                  {firstTimeLoading ? 'Updating...' : '🔐 Set Passcode & Enter Dashboard'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const outOfStockCount = products.filter(p => (p.stock || 0) <= 0).length;

  return (
    <div className="admin-page">
      <div className="admin-container">
        
        {/* Admin Header */}
        {(() => {
          const uEmail = (user?.email || '').toLowerCase().trim();
          const isMaster = MASTER_ADMINS.includes(uEmail) || user?.role === 'master_admin' || user?.isMaster === true;
          const effectiveActivities = isMaster
            ? ['inventory', 'orders', 'customers', 'support', 'reports', 'admins', 'coupons']
            : (Array.isArray(user?.allowedActivities) && user?.allowedActivities.length > 0
                ? user.allowedActivities
                : ['inventory']);

          const assignedPreset = ROLE_PRESETS.find(r => r.value === user?.assignedRole);
          const roleTitle = isMaster
            ? '👑 Master Administrator (Full Access)'
            : (assignedPreset?.label || '💎 Store Administrator');

          const allAvailableTabs = [
            { key: 'inventory', icon: 'fa-gem', label: `Inventory (${products.length})` },
            { key: 'orders', icon: 'fa-truck-loading', label: `Orders (${orders.length})` },
            { key: 'customers', icon: 'fa-users', label: `Customers (${customers.length})` },
            { key: 'support', icon: 'fa-headset', label: `Problem Solver (${supportTickets.filter(t => t.status !== 'Resolved').length} Active)` },
            { key: 'reports', icon: 'fa-chart-bar', label: 'Reports & Analytics' },
            ...(isMaster ? [{ key: 'admins', icon: 'fa-user-shield', label: `Admin Management (${adminList.length})` }] : []),
            { key: 'coupons', icon: 'fa-tags', label: `Offers & Coupons (${coupons.length})` },
          ];

          const visibleTabs = allAvailableTabs.filter(t => effectiveActivities.includes(t.key));

          return (
            <>
              <div className="admin-dashboard-header">
                <div>
                  <span className="royal-pill"><i className="fas fa-shield-alt" style={{ marginRight: '6px' }}></i> Jewel Street HQ</span>
                  <h1>Inventory & Operations Command Center</h1>
                  <p style={{ color: '#a599c2', margin: '6px 0 0', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {(() => {
                      const uEmail = (user?.email || '').toLowerCase().trim();
                      const isDeev = uEmail.includes('deevyanshu');
                      const emailPrefix = uEmail ? uEmail.split('@')[0] : 'Admin';
                      const adminDisplayName = (user?.name && (!user.name.toLowerCase().includes('deevyanshu') || isDeev))
                        ? user.name
                        : (emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1));
                      return (
                        <span>Logged in as <strong style={{ color: '#e6b97e' }}>{adminDisplayName}</strong></span>
                      );
                    })()}
                    <span style={{
                      fontSize: '0.76rem',
                      padding: '2px 10px',
                      borderRadius: '16px',
                      background: isMaster ? 'rgba(230,185,126,0.18)' : 'rgba(78,205,196,0.15)',
                      color: isMaster ? '#e6b97e' : '#4ecdc4',
                      border: `1px solid ${isMaster ? 'rgba(230,185,126,0.45)' : 'rgba(78,205,196,0.4)'}`,
                      fontWeight: '600'
                    }}>
                      {roleTitle}
                    </span>
                  </p>
                </div>
                {effectiveActivities.includes('inventory') && (
                  <button className="add-prod-btn" onClick={openAddModal}>
                    <i className="fas fa-plus-circle"></i> Add New Jewellery Item
                  </button>
                )}
              </div>

              {/* Stats Row: filtered by activity */}
              <div className="admin-stats-grid">
                {(isMaster || effectiveActivities.includes('reports') || effectiveActivities.includes('orders')) && (
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-coins" style={{ color: '#e6b97e' }}></i></div>
                    <div>
                      <span className="stat-label">Total Store Revenue</span>
                      <h3>₹{totalRevenue.toLocaleString('en-IN')}</h3>
                    </div>
                  </div>
                )}
                {effectiveActivities.includes('inventory') && (
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-box" style={{ color: '#e6b97e' }}></i></div>
                    <div>
                      <span className="stat-label">Active Catalog Items</span>
                      <h3>{products.length} Products</h3>
                    </div>
                  </div>
                )}
                {effectiveActivities.includes('orders') && (
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-file-invoice" style={{ color: '#e6b97e' }}></i></div>
                    <div>
                      <span className="stat-label">Total Orders Handled</span>
                      <h3>{orders.length} Purchases</h3>
                    </div>
                  </div>
                )}
                {effectiveActivities.includes('customers') && (
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-users" style={{ color: '#e6b97e' }}></i></div>
                    <div>
                      <span className="stat-label">Registered Clients</span>
                      <h3>{customers.length} Clients</h3>
                    </div>
                  </div>
                )}
                {effectiveActivities.includes('support') && (
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-headset" style={{ color: '#e6b97e' }}></i></div>
                    <div>
                      <span className="stat-label">Active Support Tickets</span>
                      <h3>{supportTickets.filter(t => t.status !== 'Resolved').length} Unresolved</h3>
                    </div>
                  </div>
                )}
                {effectiveActivities.includes('inventory') && (
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-exclamation-triangle" style={{ color: '#e6b97e' }}></i></div>
                    <div>
                      <span className="stat-label">Low Stock Alerts</span>
                      <h3 style={{ color: outOfStockCount > 0 ? '#e6b97e' : '#e6b97e' }}>
                        {outOfStockCount} Out of Stock
                      </h3>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Tabs: only show permitted activities */}
              <div className="admin-tabs">
                {visibleTabs.map(tab => (
                  <button key={tab.key} className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => handleTabSwitch(tab.key)}>
                    <i className={`fas ${tab.icon}`}></i> {tab.label}
                  </button>
                ))}
              </div>
            </>
          );
        })()}

        {/* Tab 1: Inventory Table */}
        {effectiveActivities.includes('inventory') && activeTab === 'inventory' && (
          <div className="admin-tab-content">
            <div className="inventory-controls" style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search inventory by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="inv-search-input"
                style={{ flex: 1, minWidth: '220px' }}
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: '10px 14px',
                  background: '#090029',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--accent-primary)',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                <option value="all">💎 All Categories ({products.length})</option>
                <option value="rings">Rings</option>
                <option value="necklace">Necklace</option>
                <option value="earrings">Earrings</option>
                <option value="chain">Gold Chain</option>
                <option value="bangles">Bangles</option>
                <option value="bracelets">Bracelets</option>
                <option value="kada">Kada</option>
                <option value="men">Men's Collection</option>
                <option value="kids">Kids Collection</option>
                <option value="coin">Gold Coins (24K)</option>
                <option value="anklet">Anklets</option>
                <option value="pendent">Pendants</option>
                <option value="mangalsutra">Mangalsutra</option>
                <option value="nosepin">Nose Pin</option>
                <option value="hair">Hair Accessories</option>
                <option value="watch">Luxury Watches</option>
              </select>

              {/* Bulk Making Charges Update Trigger */}
              <button
                onClick={() => {
                  if (selectedProductIds.length > 0) setMakingChargeScope('selected');
                  setShowMakingChargeModal(true);
                }}
                style={{
                  padding: '10px 16px',
                  background: selectedProductIds.length > 0 ? 'linear-gradient(135deg, #e6b97e, #d4a060)' : 'rgba(230, 185, 126, 0.15)',
                  border: '1px solid #e6b97e',
                  borderRadius: '8px',
                  color: selectedProductIds.length > 0 ? '#0d0028' : '#e6b97e',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fas fa-hammer"></i> Change Making Charges (%)
                {selectedProductIds.length > 0 && (
                  <span style={{ padding: '2px 8px', borderRadius: '12px', background: '#0d0028', color: '#e6b97e', fontSize: '0.75rem' }}>
                    {selectedProductIds.length} Selected
                  </span>
                )}
              </button>

              <span className="inv-count-text">Showing {filteredProducts.length} items</span>
            </div>

            {loading ? (
              <div className="admin-loading"><i className="fas fa-spinner fa-spin"></i> Loading store inventory...</div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={filteredProducts.length > 0 && filteredProducts.every(p => selectedProductIds.includes(p.id))}
                          onChange={() => toggleSelectAllProducts(filteredProducts)}
                          title="Select All Filtered Products"
                          style={{ cursor: 'pointer', accentColor: '#e6b97e', width: '16px', height: '16px' }}
                        />
                      </th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Purity</th>
                      <th>Weight</th>
                      <th>Unit Price</th>
                      <th>Stock Quantity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} style={{ background: selectedProductIds.includes(prod.id) ? 'rgba(230,185,126,0.06)' : 'transparent' }}>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(prod.id)}
                            onChange={() => toggleSelectProduct(prod.id)}
                            style={{ cursor: 'pointer', accentColor: '#e6b97e', width: '16px', height: '16px' }}
                          />
                        </td>
                        <td>
                          <div className="table-product-cell">
                            <img src={prod.image} alt={prod.name} onError={e => { e.target.src = '/photos/product1.jpg'; }} />
                            <span>{prod.name}</span>
                          </div>
                        </td>
                        <td><span className="cat-tag">{prod.category}</span></td>
                        <td><span className="purity-tag">{prod.purity}</span></td>
                        <td>{prod.weight}g</td>
                        <td className="price-cell">
                          {prod.price}
                          <span style={{ fontSize: '0.7rem', color: '#e6b97e', display: 'block', fontWeight: 'normal' }}>
                            ({prod.makingChargePercent || 18}% MC)
                          </span>
                        </td>
                        <td>
                          <div className="stock-control">
                            <button onClick={() => handleUpdateStock(prod.id, prod.stock !== undefined ? prod.stock : 12, -1)}>-</button>
                            <span className={`stock-val ${(prod.stock !== undefined ? prod.stock : 12) === 0 ? 'zero' : ''}`}>{prod.stock !== undefined ? prod.stock : 12}</span>
                            <button onClick={() => handleUpdateStock(prod.id, prod.stock !== undefined ? prod.stock : 12, 1)}>+</button>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => openEditModal(prod)}
                              style={{ padding: '6px 12px', background: 'rgba(230,185,126,0.12)', border: '1px solid #e6b97e', borderRadius: '6px', color: '#e6b97e', cursor: 'pointer', fontSize: '0.78rem' }}
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button className="del-btn" onClick={() => handleDeleteProduct(prod.id)}>
                              <i className="fas fa-trash-alt"></i> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Orders Fulfillment & Segregation */}
        {effectiveActivities.includes('orders') && activeTab === 'orders' && (() => {
          const filteredOrders = orders.filter(o => {
            const q = orderSearchQuery.toLowerCase().trim();
            const matchesSearch = !q || (
              (o.invoiceNo || '').toLowerCase().includes(q) ||
              (o.customerName || '').toLowerCase().includes(q) ||
              (o.customerEmail || '').toLowerCase().includes(q) ||
              (o.phone || '').toLowerCase().includes(q) ||
              (o.deliveryAddress || '').toLowerCase().includes(q)
            );

            let matchesStatus = true;
            if (orderStatusFilter === 'returns') {
              matchesStatus = !!o.returnRequested;
            } else if (orderStatusFilter !== 'all') {
              matchesStatus = o.status === orderStatusFilter;
            }

            return matchesSearch && matchesStatus;
          });

          return (
            <div className="admin-tab-content">
              {/* Order Segregation & Filter Control Bar */}
              <div style={{ marginBottom: '22px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search orders by invoice no, customer name, email, phone or address..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '260px',
                      padding: '10px 16px',
                      background: '#090029',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.88rem'
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#a599c2', fontWeight: 'bold' }}>
                    Showing {filteredOrders.length} of {orders.length} orders
                  </span>
                  <button
                    onClick={() => exportOrdersCSV(filteredOrders)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e6b97e',
                      background: 'rgba(230,185,126,0.12)',
                      color: '#e6b97e',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginLeft: 'auto'
                    }}
                  >
                    <i className="fas fa-file-csv"></i> Export Orders CSV
                  </button>
                </div>

                {/* Status Segregation Pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'all', label: `All Orders (${orders.length})` },
                    { key: 'Processing', label: `Processing (${orders.filter(o => o.status === 'Processing').length})` },
                    { key: 'In Armored Transit', label: `In Transit (${orders.filter(o => o.status === 'In Armored Transit').length})` },
                    { key: 'Delivered', label: `Delivered (${orders.filter(o => o.status === 'Delivered').length})` },
                    { key: 'Cancelled', label: `Cancelled (${orders.filter(o => o.status === 'Cancelled').length})` },
                    { key: 'returns', label: `Returns / Exchange (${orders.filter(o => o.returnRequested).length})` },
                  ].map(pill => (
                    <button
                      key={pill.key}
                      onClick={() => setOrderStatusFilter(pill.key)}
                      style={{
                        padding: '7px 15px',
                        borderRadius: '20px',
                        border: orderStatusFilter === pill.key ? '1px solid #e6b97e' : '1px solid rgba(255,255,255,0.1)',
                        background: orderStatusFilter === pill.key ? 'linear-gradient(135deg, #e6b97e, #d4a060)' : 'rgba(255,255,255,0.04)',
                        color: orderStatusFilter === pill.key ? '#0d0028' : '#d5ccf0',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Customer Contact</th>
                      <th>Delivery Address</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Invoice & Status Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#a599c2' }}>
                          No customer orders match the selected filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord._id || ord.invoiceNo}>
                          <td className="invoice-cell">{ord.invoiceNo}</td>
                          <td>
                            <strong>{ord.customerName}</strong><br/>
                            <span style={{ fontSize: '0.78rem', color: '#a599c2' }}>{ord.customerEmail} | {ord.phone}</span>
                          </td>
                          <td style={{ fontSize: '0.82rem' }}>{ord.deliveryAddress}, {ord.pincode}</td>
                          <td className="price-cell">₹{(ord.totalAmount || 0).toLocaleString('en-IN')}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                              <span className={`status-pill ${ord.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                {ord.status === 'Cancelled' ? 'Cancelled (Refund Initiated)' : ord.status}
                              </span>
                              {ord.returnRequested && (
                                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(230,185,126,0.2)', border: '1px solid #e6b97e', color: '#e6b97e', fontWeight: 'bold' }}>
                                  <i className="fas fa-exchange-alt" style={{ marginRight: '4px' }}></i> 7-Day {ord.returnType || 'Return'}: {ord.returnStatus || 'Pending Inspection'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                  onClick={() => setSelectedOrderForInvoice(ord)}
                                  style={{
                                    padding: '6px 10px',
                                    background: 'rgba(230, 185, 126, 0.15)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    color: '#e6b97e',
                                    fontSize: '0.78rem',
                                    cursor: 'pointer'
                                  }}
                                  title="View Duplicate Tax Invoice"
                                >
                                  <i className="fas fa-file-invoice" style={{ marginRight: '4px' }}></i> Duplicate Invoice
                                </button>
                                <select
                                  value={ord.status}
                                  onChange={(e) => handleOrderStatusChange(ord._id || ord.invoiceNo, e.target.value)}
                                  className="status-select"
                                >
                                  <option value="Processing">Processing</option>
                                  <option value="In Armored Transit">In Armored Transit</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled (Triggers Refund Email)</option>
                                </select>
                              </div>

                              {ord.returnRequested && (!ord.returnStatus || ord.returnStatus === 'Pending Inspection') && (
                                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                  <button
                                    onClick={() => handleProcessReturn(ord._id || ord.invoiceNo, 'Approved')}
                                    style={{ padding: '4px 10px', background: 'rgba(230,185,126,0.2)', border: '1px solid #e6b97e', borderRadius: '4px', color: '#e6b97e', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                                  >
                                    <i className="fas fa-check" style={{ marginRight: '4px' }}></i> Approve {ord.returnType === 'Exchange' ? 'Exchange' : 'Refund'}
                                  </button>
                                  <button
                                    onClick={() => handleProcessReturn(ord._id || ord.invoiceNo, 'Rejected')}
                                    style={{ padding: '4px 10px', background: 'rgba(186,75,95,0.14)', border: '1px solid rgba(186,75,95,0.35)', borderRadius: '4px', color: '#e89da9', cursor: 'pointer', fontSize: '0.75rem' }}
                                  >
                                    <i className="fas fa-times" style={{ marginRight: '4px' }}></i> Reject Request
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* Tab 3: Reports & Analytics */}
        {effectiveActivities.includes('reports') && activeTab === 'reports' && (
          <div className="admin-tab-content">
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              {[{k:'inventory',label:'📦 Inventory Report',color:'#e6b97e'},{k:'sales',label:'📊 Sales Report',color:'#f0dbbf'}].map(r => (
                <button key={r.k} onClick={() => setActiveReport(r.k)} style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', background: activeReport === r.k ? (r.k==='inventory'?'linear-gradient(135deg,#e6b97e,#d4a060)':'linear-gradient(135deg,#f0dbbf,#d4a060)') : `rgba(${r.k==='inventory'?'230,185,126':'240,219,191'},0.12)`, color: activeReport === r.k ? '#0d0028' : r.color }}>
                  {r.label}
                </button>
              ))}
              <button onClick={fetchReports} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: '#a599c2', cursor: 'pointer', fontSize: '0.85rem' }}>🔄 Refresh</button>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    if (activeReport === 'inventory') exportInventoryCSV(inventoryReport);
                    else exportSalesCSV(salesReport);
                  }}
                  disabled={activeReport === 'inventory' ? !inventoryReport : !salesReport}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e6b97e', background: 'rgba(230,185,126,0.12)', color: '#e6b97e', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fas fa-file-csv"></i> Download CSV
                </button>
                <button
                  onClick={() => {
                    if (activeReport === 'inventory') exportReportPrintablePDF('inventory', inventoryReport);
                    else exportReportPrintablePDF('sales', salesReport);
                  }}
                  disabled={activeReport === 'inventory' ? !inventoryReport : !salesReport}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d4a060', background: 'rgba(212,160,96,0.12)', color: '#e6b97e', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fas fa-file-pdf"></i> Download PDF Report
                </button>
                <button
                  onClick={() => {
                    setEmailReportType(activeReport);
                    setEmailReportData(activeReport === 'inventory' ? inventoryReport : salesReport);
                    setEmailModalOpen(true);
                  }}
                  disabled={activeReport === 'inventory' ? !inventoryReport : !salesReport}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#e6b97e,#d4a060)', color: '#0d0028', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fas fa-paper-plane"></i> Send via EmailJS
                </button>
              </div>
            </div>
            {reportsLoading ? (
              <div className="admin-loading"><i className="fas fa-spinner fa-spin"></i> Generating reports...</div>
            ) : (
              <>
                {activeReport === 'inventory' && inventoryReport && (
                  <div>
                    <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
                      {[{icon:'📦',label:'Total Products',val:inventoryReport.summary.totalProducts},{icon:'🗃️',label:'Stock Units',val:inventoryReport.summary.totalStockUnits},{icon:'💰',label:'Inventory Value',val:`₹${(inventoryReport.summary.totalInventoryValue||0).toLocaleString('en-IN')}`},{icon:'⚠️',label:'Low Stock',val:inventoryReport.summary.lowStockItems,col:'#eac288'},{icon:'🚫',label:'Out of Stock',val:inventoryReport.summary.outOfStockItems,col:'#e89da9'}].map(s=>
                        <div key={s.label} className="stat-card"><div className="stat-icon">{s.icon}</div><div><span className="stat-label">{s.label}</span><h3 style={s.col?{color:s.val>0?s.col:'#c6d9be'}:{}}>{s.val}</h3></div></div>
                      )}
                    </div>

                    {/* Interactive Graphs with Deep Filters for Inventory */}
                    <InventoryReportGraphs categoryStats={inventoryReport.categoryStats} />

                    <h3 style={{ color: '#e6b97e', margin: '24px 0 12px' }}>📊 Category-wise Breakdown</h3>
                    <div className="table-responsive"><table className="admin-table"><thead><tr><th>Category</th><th>Products</th><th>Stock Units</th><th>Inventory Value</th></tr></thead><tbody>
                      {Object.entries(inventoryReport.categoryStats).map(([cat,stats])=>(<tr key={cat}><td><span className="cat-tag">{cat}</span></td><td>{stats.products}</td><td>{stats.count}</td><td className="price-cell">₹{(stats.value||0).toLocaleString('en-IN')}</td></tr>))}
                    </tbody></table></div>
                    <h3 style={{ color: '#e6b97e', margin: '24px 0 12px' }}>🔴 Low / Out of Stock Items</h3>
                    <div className="table-responsive"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Status</th></tr></thead><tbody>
                      {inventoryReport.items.filter(it=>it.status!=='In Stock').map(it=>(<tr key={it.id}><td>{it.name}</td><td><span className="cat-tag">{it.category}</span></td><td>{it.stock}</td><td><span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:'bold',background:it.status==='Out of Stock'?'rgba(186,75,95,0.18)':'rgba(234,194,136,0.18)',color:it.status==='Out of Stock'?'#e89da9':'#eac288',border:`1px solid ${it.status==='Out of Stock'?'#e89da9':'#eac288'}`}}>{it.status}</span></td></tr>))}
                      {inventoryReport.items.filter(it=>it.status!=='In Stock').length===0 && <tr><td colSpan="4" style={{textAlign:'center',color:'#c6d9be',padding:'20px'}}>✅ All items well-stocked!</td></tr>}
                    </tbody></table></div>
                  </div>
                )}
                {activeReport === 'sales' && salesReport && (
                  <div>
                    <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
                      {[{icon:'💰',label:'Total Revenue',val:`₹${(salesReport.summary.totalRevenue||0).toLocaleString('en-IN')}`},{icon:'📜',label:'Total Orders',val:salesReport.summary.totalOrders},{icon:'📊',label:'Avg. Order Value',val:`₹${(salesReport.summary.avgOrderValue||0).toLocaleString('en-IN')}`}].map(s=>
                        <div key={s.label} className="stat-card"><div className="stat-icon">{s.icon}</div><div><span className="stat-label">{s.label}</span><h3>{s.val}</h3></div></div>
                      )}
                    </div>

                    {/* Interactive Graphs with Multi-Metric Filters for Sales */}
                    <SalesReportGraphs salesReport={salesReport} />

                    {salesReport.monthly.length>0 && (<><h3 style={{color:'#e6b97e',margin:'24px 0 12px'}}>📅 Monthly Revenue Table</h3><div className="table-responsive"><table className="admin-table"><thead><tr><th>Month</th><th>Orders</th><th>Revenue</th></tr></thead><tbody>{salesReport.monthly.map(m=>(<tr key={m.month}><td>{m.month}</td><td>{m.orders}</td><td className="price-cell">₹{(m.revenue||0).toLocaleString('en-IN')}</td></tr>))}</tbody></table></div></>)}
                  </div>
                )}
                {!inventoryReport && !salesReport && !reportsLoading && (
                  <div style={{textAlign:'center',padding:'40px',color:'#a599c2'}}>
                    <p>No report data available.</p>
                    <button onClick={fetchReports} style={{padding:'12px 24px',marginTop:'16px',background:'linear-gradient(135deg,#e6b97e,#d4a060)',border:'none',borderRadius:'8px',color:'#0d0028',fontWeight:'bold',cursor:'pointer'}}>Generate Reports</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 4: Admin Management */}
        {isMaster && activeTab === 'admins' && (
          <div className="admin-tab-content">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '28px', alignItems: 'start' }}>
                {isMaster && (
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ color: '#e6b97e', marginBottom: '18px' }}><i className="fas fa-user-plus"></i> Create New Admin</h3>
                    <form onSubmit={handleCreateAdmin}>
                      {[{field:'name',label:'Full Name',type:'text',ph:'Admin Full Name'},{field:'email',label:'Email Address',type:'email',ph:'admin@example.com'},{field:'password',label:'Temporary Password',type:'text',ph:'Set admin password'}].map(f=>(
                        <div key={f.field} className="form-row" style={{ marginBottom: '14px' }}>
                          <label>{f.label} *</label>
                          <input type={f.type} value={newAdminForm[f.field]} onChange={e=>setNewAdminForm(p=>({...p,[f.field]:e.target.value}))} placeholder={f.ph} required style={{width:'100%',padding:'10px',background:'#090029',border:'1px solid var(--border-color)',borderRadius:'8px',color:'#fff',boxSizing:'border-box'}} />
                        </div>
                      ))}

                      {/* Role Preset Selector */}
                      <div className="form-row" style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#e6b97e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          Assigned Role & Designation *
                        </label>
                        <select
                          value={newAdminForm.assignedRole}
                          onChange={e => handleNewAdminRoleChange(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#090029', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}
                        >
                          {ROLE_PRESETS.map(preset => (
                            <option key={preset.value} value={preset.value}>
                              {preset.label}
                            </option>
                          ))}
                        </select>
                        <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#a599c2', fontStyle: 'italic' }}>
                          {ROLE_PRESETS.find(p => p.value === newAdminForm.assignedRole)?.desc}
                        </div>
                      </div>

                      {/* Activity Permissions Checkboxes */}
                      <div className="admin-field-block" style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#e6b97e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          Permitted Dashboard Activities ({newAdminForm.allowedActivities?.length || 0} active)
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                          {ALL_OPERATIONAL_ACTIVITIES.map(act => {
                            const isChecked = (newAdminForm.allowedActivities || []).includes(act.key);
                            return (
                              <div
                                key={act.key}
                                onClick={() => toggleNewAdminActivity(act.key)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '10px 12px',
                                  borderRadius: '8px',
                                  background: isChecked ? 'rgba(230, 185, 126, 0.18)' : 'rgba(255,255,255,0.03)',
                                  border: `1.5px solid ${isChecked ? '#e6b97e' : 'rgba(255,255,255,0.1)'}`,
                                  color: isChecked ? '#fff' : '#a599c2',
                                  cursor: 'pointer',
                                  fontSize: '0.82rem',
                                  userSelect: 'none',
                                  boxSizing: 'border-box',
                                  minWidth: 0,
                                  overflow: 'hidden',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <div
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    minWidth: '18px',
                                    maxWidth: '18px',
                                    borderRadius: '4px',
                                    border: `2px solid ${isChecked ? '#e6b97e' : 'rgba(255,255,255,0.35)'}`,
                                    background: isChecked ? '#e6b97e' : 'rgba(0,0,0,0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#0d0028',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    flexShrink: 0,
                                    boxSizing: 'border-box',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {isChecked && <i className="fas fa-check" style={{ fontSize: '10px', color: '#0d0028' }}></i>}
                                </div>
                                <i className={`fas ${act.icon}`} style={{ color: isChecked ? '#e6b97e' : '#a599c2', fontSize: '0.85rem', flexShrink: 0 }}></i>
                                <span style={{ fontWeight: isChecked ? '600' : 'normal', lineHeight: '1.25', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <button type="submit" disabled={adminCreating} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#e6b97e,#d4a060)',border:'none',borderRadius:'8px',color:'#0d0028',fontWeight:'bold',cursor:'pointer',fontSize:'0.95rem',marginTop:'4px'}}>
                        {adminCreating ? '⏳ Creating...' : '👑 Create Admin & Send Email'}
                      </button>
                    </form>
                    {adminMsg && (<div style={{marginTop:'16px',padding:'12px 16px',borderRadius:'8px',background:adminMsg.type==='success'?'rgba(198,217,190,0.14)':'rgba(186,75,95,0.14)',border:`1px solid ${adminMsg.type==='success'?'#c6d9be':'#e89da9'}`,color:adminMsg.type==='success'?'#c6d9be':'#e89da9',fontSize:'0.88rem'}}>
                      {adminMsg.text}
                      {adminMsg.previewUrl && (
                        <div style={{ marginTop: '8px' }}>
                          <a href={adminMsg.previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#e6b97e', textDecoration: 'underline' }}>
                            View Ethereal Preview Email ↗
                          </a>
                        </div>
                      )}
                    </div>)}
                  </div>
                )}
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <h3 style={{ color: '#e6b97e', margin: 0 }}><i className="fas fa-users-cog"></i> Active Administrator Accounts ({adminList.length})</h3>
                    <button onClick={fetchAdmins} style={{padding:'8px 14px',background:'transparent',border:'1px solid var(--border-color)',borderRadius:'6px',color:'#a599c2',cursor:'pointer',fontSize:'0.82rem'}}>🔄 Refresh</button>
                  </div>
                  {adminsLoading ? (
                    <div className="admin-loading"><i className="fas fa-spinner fa-spin"></i> Loading admins...</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {adminList.map(admin => {
                        const adminPreset = ROLE_PRESETS.find(p => p.value === admin.assignedRole);
                        const roleTitle = admin.role === 'master_admin' ? '👑 Master Admin (Full Control)' : (adminPreset?.label || admin.assignedRole || 'Store Administrator');
                        const adminActs = admin.role === 'master_admin'
                          ? ['inventory', 'orders', 'customers', 'support', 'reports', 'coupons', 'admins']
                          : (admin.allowedActivities || ['inventory']);

                        return (
                          <div key={admin.id} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            background: 'rgba(255,255,255,0.04)',
                            borderRadius: '12px',
                            padding: '16px 20px',
                            border: `1px solid ${admin.role === 'master_admin' ? 'rgba(230,185,126,0.45)' : 'rgba(255,255,255,0.08)'}`,
                            boxShadow: admin.role === 'master_admin' ? '0 4px 18px rgba(230,185,126,0.08)' : 'none'
                          }}>
                            {/* Top Info Row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '50%',
                                  background: admin.role === 'master_admin' ? 'linear-gradient(135deg,#e6b97e,#d4a060)' : 'linear-gradient(135deg,#c4b8e2,#8e82a8)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#0d0028',
                                  fontWeight: 'bold',
                                  fontSize: admin.role === 'master_admin' ? '1.05rem' : '0.95rem',
                                  flexShrink: 0
                                }}>
                                  {(admin.name || 'A')[0].toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span>{admin.name}</span>
                                    <span style={{
                                      fontSize: '0.72rem',
                                      padding: '2px 9px',
                                      background: admin.role === 'master_admin' ? 'rgba(230,185,126,0.2)' : 'rgba(78,205,196,0.15)',
                                      color: admin.role === 'master_admin' ? '#e6b97e' : '#4ecdc4',
                                      borderRadius: '14px',
                                      border: `1px solid ${admin.role === 'master_admin' ? 'rgba(230,185,126,0.4)' : 'rgba(78,205,196,0.4)'}`,
                                      fontWeight: '600'
                                    }}>
                                      {roleTitle}
                                    </span>
                                    {admin.mustChangePassword ? (
                                      <span style={{ fontSize: '0.68rem', padding: '2px 8px', background: 'rgba(234,194,136,0.18)', color: '#eac288', borderRadius: '12px', border: '1px solid rgba(234,194,136,0.4)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <span>⚠️</span> First Login Pending
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: '0.68rem', padding: '2px 8px', background: 'rgba(78,205,196,0.18)', color: '#4ecdc4', borderRadius: '12px', border: '1px solid rgba(78,205,196,0.4)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <i className="fas fa-check-circle" style={{ fontSize: '0.72rem' }}></i> Active &amp; Verified
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.82rem', color: '#a599c2', marginTop: '2px' }}>{admin.email}</div>
                                </div>
                              </div>

                              <div style={{ fontSize: '0.75rem', color: '#746596' }}>
                                Added: {new Date(admin.createdAt).toLocaleDateString('en-IN')}
                              </div>
                            </div>

                            {/* Middle Row: Permitted Activity Badges */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.72rem', color: '#a599c2', marginRight: '4px' }}>Permissions:</span>
                              {admin.role === 'master_admin' ? (
                                <span style={{ fontSize: '0.7rem', padding: '2px 9px', background: 'rgba(230,185,126,0.12)', color: '#e6b97e', borderRadius: '4px', border: '1px solid rgba(230,185,126,0.3)', fontWeight: 'bold' }}>
                                  ⚡ Complete Master Access (All 7 Operations)
                                </span>
                              ) : (
                                adminActs.map(actKey => {
                                  const actDef = ALL_OPERATIONAL_ACTIVITIES.find(a => a.key === actKey);
                                  return (
                                    <span key={actKey} style={{ fontSize: '0.68rem', padding: '2px 8px', background: 'rgba(78,205,196,0.1)', color: '#4ecdc4', borderRadius: '4px', border: '1px solid rgba(78,205,196,0.25)' }}>
                                      <i className={`fas ${actDef?.icon || 'fa-check'}`} style={{ marginRight: '4px' }}></i>
                                      {actDef?.label || actKey}
                                    </span>
                                  );
                                })
                              )}
                            </div>

                            {/* Bottom Action Buttons Row */}
                            {admin.role !== 'master_admin' && isMaster && (
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <button
                                  onClick={() => handleMakeMasterAdmin(admin)}
                                  style={{ padding: '7px 14px', background: 'rgba(230,185,126,0.18)', border: '1px solid #e6b97e', borderRadius: '6px', color: '#e6b97e', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                                  title="Promote this administrator to Master Administrator with full access"
                                >
                                  <span>👑</span> Make Master Admin
                                </button>
                                <button
                                  onClick={() => openEditRoleModal(admin)}
                                  style={{ padding: '7px 14px', background: 'rgba(78,205,196,0.15)', border: '1px solid #4ecdc4', borderRadius: '6px', color: '#4ecdc4', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
                                  title="Assign roles and customize operational permissions"
                                >
                                  <i className="fas fa-user-tag"></i> Assign Role
                                </button>
                                <button
                                  onClick={() => openChangeAdminPassModal(admin)}
                                  style={{ padding: '7px 14px', background: 'rgba(230,185,126,0.15)', border: '1px solid #e6b97e', borderRadius: '6px', color: '#e6b97e', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
                                  title="Change or reset this administrator's password"
                                >
                                  <i className="fas fa-key"></i> Change Pass
                                </button>
                                <button
                                  onClick={() => handleRemoveAdmin(admin.id, admin.name)}
                                  style={{ padding: '7px 14px', background: 'rgba(186,75,95,0.14)', border: '1px solid rgba(186,75,95,0.35)', borderRadius: '6px', color: '#e89da9', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                  <i className="fas fa-user-times"></i> Remove
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {adminList.length===0&&<p style={{color:'#a599c2',textAlign:'center',padding:'20px'}}>No admins found.</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* Tab 5: Offers & Coupons Management */}
        {effectiveActivities.includes('coupons') && activeTab === 'coupons' && (
            <div className="admin-tab-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '28px', alignItems: 'start' }}>
                
                {/* Coupon Creation Form */}
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-color)', opacity: hasCouponsAccess ? 1 : 0.6 }}>
                  <h3 style={{ color: '#e6b97e', marginBottom: '18px' }}><i className="fas fa-tag"></i> Create Promotional Offer</h3>
                  <form onSubmit={handleCreateCoupon}>
                    <div className="form-row" style={{ marginBottom: '14px' }}>
                      <label>Coupon Code * (e.g. ROYAL25)</label>
                      <input
                        type="text"
                        disabled={!isMaster}
                        value={newCouponForm.code}
                        onChange={e => setNewCouponForm(p => ({ ...p, code: e.target.value }))}
                        placeholder="e.g. FESTIVE20"
                        required
                        style={{ width: '100%', padding: '10px', background: '#090029', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', textTransform: 'uppercase' }}
                      />
                    </div>
                    
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                      <div className="form-row">
                        <label>Discount Type *</label>
                        <select
                          disabled={!isMaster}
                          value={newCouponForm.discountType}
                          onChange={e => setNewCouponForm(p => ({ ...p, discountType: e.target.value }))}
                          style={{ width: '100%', padding: '10px', background: '#090029', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#e6b97e', fontWeight: 'bold' }}
                        >
                          <option value="percentage">% Percentage Off</option>
                          <option value="flat">₹ Flat Discount</option>
                        </select>
                      </div>
                      <div className="form-row">
                        <label>Value * ({newCouponForm.discountType === 'percentage' ? '%' : '₹'})</label>
                        <input
                          type="number"
                          step="0.01"
                          disabled={!isMaster}
                          value={newCouponForm.discountValue}
                          onChange={e => setNewCouponForm(p => ({ ...p, discountValue: e.target.value }))}
                          placeholder={newCouponForm.discountType === 'percentage' ? '15' : '2000'}
                          required
                          style={{ width: '100%', padding: '10px', background: '#090029', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div className="form-row" style={{ marginBottom: '14px' }}>
                      <label>Min. Cart Value Required (₹)</label>
                      <input
                        type="number"
                        disabled={!isMaster}
                        value={newCouponForm.minPurchase}
                        onChange={e => setNewCouponForm(p => ({ ...p, minPurchase: e.target.value }))}
                        placeholder="e.g. 25000 (0 for no min limit)"
                        style={{ width: '100%', padding: '10px', background: '#090029', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div className="form-row" style={{ marginBottom: '14px' }}>
                      <label>Offer Description / Terms</label>
                      <input
                        type="text"
                        disabled={!isMaster}
                        value={newCouponForm.description}
                        onChange={e => setNewCouponForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="e.g. 15% Off on all Diamond Ornaments above ₹25,000"
                        style={{ width: '100%', padding: '10px', background: '#090029', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!isMaster || couponCreating}
                      style={{ width: '100%', padding: '12px', background: isMaster ? 'linear-gradient(135deg,#e6b97e,#d4a060)' : '#444', border: 'none', borderRadius: '8px', color: isMaster ? '#0d0028' : '#888', fontWeight: 'bold', cursor: isMaster ? 'pointer' : 'not-allowed', fontSize: '0.95rem', marginTop: '4px' }}
                    >
                      {!isMaster ? '🔒 Master Admin Only' : couponCreating ? '⏳ Creating Offer...' : '🏷️ Create & Publish Offer'}
                    </button>
                  </form>
                  {couponMsg && (
                    <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', background: couponMsg.type === 'success' ? 'rgba(198,217,190,0.14)' : 'rgba(186,75,95,0.14)', border: `1px solid ${couponMsg.type === 'success' ? '#c6d9be' : '#e89da9'}`, color: couponMsg.type === 'success' ? '#c6d9be' : '#e89da9', fontSize: '0.88rem' }}>
                      {couponMsg.text}
                    </div>
                  )}
                </div>

                {/* Coupon List Table */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ color: '#e6b97e', margin: 0 }}><i className="fas fa-percent"></i> Active Store Offers ({coupons.length})</h3>
                    <button onClick={fetchCoupons} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#a599c2', cursor: 'pointer', fontSize: '0.82rem' }}>🔄 Refresh</button>
                  </div>
                  {couponsLoading ? (
                    <div className="admin-loading"><i className="fas fa-spinner fa-spin"></i> Loading offers...</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {coupons.map(cpn => (
                        <div key={cpn.id || cpn.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px 18px', border: `1px solid ${cpn.isActive ? 'rgba(230,185,126,0.4)' : 'rgba(255,255,255,0.1)'}`, opacity: cpn.isActive ? 1 : 0.6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: cpn.isActive ? 'linear-gradient(135deg,#e6b97e,#d4a060)' : '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d0028', fontWeight: 'bold', fontSize: '1.1rem', flexShrink: 0 }}>🏷️</div>
                            <div>
                              <div style={{ fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: '#e6b97e', background: '#090029', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(230,185,126,0.3)' }}>{cpn.code}</span>
                                <span style={{ fontSize: '0.78rem', padding: '2px 8px', borderRadius: '12px', background: cpn.isActive ? 'rgba(198,217,190,0.18)' : 'rgba(186,75,95,0.18)', color: cpn.isActive ? '#c6d9be' : '#e89da9', border: `1px solid ${cpn.isActive ? '#c6d9be' : '#e89da9'}` }}>
                                  {cpn.isActive ? 'Active' : 'Disabled'}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.85rem', color: '#e6b97e', marginTop: '4px' }}>
                                Discount: {cpn.discountType === 'percentage' ? `${cpn.discountValue}% Off` : `₹${cpn.discountValue.toLocaleString('en-IN')} Flat Off`}
                                {cpn.minPurchase > 0 ? ` (Min. Cart: ₹${cpn.minPurchase.toLocaleString('en-IN')})` : ''}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#a599c2' }}>{cpn.description}</div>
                            </div>
                          </div>
                          {isMaster && (
                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                              <button
                                onClick={() => handleToggleCoupon(cpn.id, cpn.code, cpn.isActive)}
                                style={{ padding: '6px 12px', background: cpn.isActive ? 'rgba(234,194,136,0.14)' : 'rgba(198,217,190,0.14)', border: `1px solid ${cpn.isActive ? '#eac288' : '#c6d9be'}`, borderRadius: '6px', color: cpn.isActive ? '#eac288' : '#c6d9be', cursor: 'pointer', fontSize: '0.78rem' }}
                              >
                                {cpn.isActive ? '⏸️ Disable' : '▶️ Enable'}
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(cpn.id, cpn.code)}
                                style={{ padding: '6px 12px', background: 'rgba(186,75,95,0.14)', border: '1px solid rgba(186,75,95,0.35)', borderRadius: '6px', color: '#e89da9', cursor: 'pointer', fontSize: '0.78rem' }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      {coupons.length === 0 && <p style={{ color: '#a599c2', textAlign: 'center', padding: '20px' }}>No promotional coupons configured yet.</p>}
                    </div>
                  )}
                </div>

              </div>
            </div>
        )}

        {/* Tab 6: Customers Directory */}
        {effectiveActivities.includes('customers') && activeTab === 'customers' && (() => {
          const filteredCustomers = customers.filter(c => {
            const q = customerSearchQuery.toLowerCase();
            return (
              (c.name || '').toLowerCase().includes(q) ||
              (c.email || '').toLowerCase().includes(q) ||
              (c.phone || '').toLowerCase().includes(q) ||
              (c.address || '').toLowerCase().includes(q)
            );
          });

          const totalCustOrders = customers.reduce((sum, c) => sum + (c.ordersCount || 0), 0);
          const totalCustSpend = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
          const activeBuyers = customers.filter(c => (c.ordersCount || 0) > 0).length;

          return (
            <div className="admin-tab-content">
              {/* Customer Stats Cards */}
              <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
                <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-users" style={{ color: '#e6b97e' }}></i></div>
                  <div>
                    <span className="stat-label">Registered Clients</span>
                    <h3>{customers.length} Customers</h3>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-shopping-bag" style={{ color: '#f0dbbf' }}></i></div>
                  <div>
                    <span className="stat-label">Active Buyers</span>
                    <h3>{activeBuyers} Clients</h3>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-boxes" style={{ color: '#e6b97e' }}></i></div>
                  <div>
                    <span className="stat-label">Total Customer Orders</span>
                    <h3>{totalCustOrders} Purchases</h3>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-coins" style={{ color: '#e6b97e' }}></i></div>
                  <div>
                    <span className="stat-label">Customer Lifetime Value</span>
                    <h3>₹{totalCustSpend.toLocaleString('en-IN')}</h3>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Search customer by name, email, phone, city..."
                  value={customerSearchQuery}
                  onChange={e => setCustomerSearchQuery(e.target.value)}
                  className="inv-search-input"
                  style={{ flex: 1, minWidth: '260px' }}
                />
                <button
                  onClick={fetchCustomers}
                  style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#e6b97e', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fas fa-sync-alt"></i> Refresh Directory
                </button>
              </div>

              {/* Table */}
              {customersLoading ? (
                <div className="admin-loading"><i className="fas fa-spinner fa-spin"></i> Loading registered customers...</div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Contact Information</th>
                        <th>Delivery Location</th>
                        <th>Orders Placed</th>
                        <th>Lifetime Spend</th>
                        <th>Last Order / Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map(cust => (
                        <tr key={cust.id || cust.email}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #e6b97e, #d4a060)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d0028', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>
                                {(cust.name || 'C')[0].toUpperCase()}
                              </div>
                              <div>
                                <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{cust.name}</strong>
                                <div style={{ fontSize: '0.75rem', color: '#a599c2' }}>Client ID: {(cust.id || '').substring(0, 10)}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.85rem' }}>
                              <a href={`mailto:${cust.email}`} style={{ color: '#e6b97e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="fas fa-envelope" style={{ fontSize: '0.75rem' }}></i> {cust.email}
                              </a>
                              {cust.phone ? (
                                <a href={`tel:${cust.phone}`} style={{ color: '#a599c2', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <i className="fas fa-phone" style={{ fontSize: '0.75rem' }}></i> {cust.phone}
                                </a>
                              ) : (
                                <span style={{ color: '#6a5e8a', fontSize: '0.78rem' }}>No phone recorded</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem', color: cust.address ? '#fdfbf7' : '#6a5e8a' }}>
                              {cust.address || 'Location on Order File'}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              background: (cust.ordersCount || 0) > 0 ? 'rgba(230, 185, 126, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              color: (cust.ordersCount || 0) > 0 ? '#e6b97e' : '#a599c2',
                              border: `1px solid ${(cust.ordersCount || 0) > 0 ? 'rgba(230, 185, 126, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`
                            }}>
                              {(cust.ordersCount || 0)} {(cust.ordersCount || 0) === 1 ? 'Order' : 'Orders'}
                            </span>
                          </td>
                          <td className="price-cell" style={{ fontWeight: 'bold', color: '#e6b97e' }}>
                            ₹{(cust.totalSpent || 0).toLocaleString('en-IN')}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#a599c2' }}>
                            {cust.lastOrderDate
                              ? `Last order: ${new Date(cust.lastOrderDate).toLocaleDateString('en-IN')}`
                              : cust.createdAt
                              ? `Joined: ${new Date(cust.createdAt).toLocaleDateString('en-IN')}`
                              : 'Recent'}
                          </td>
                        </tr>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#a599c2' }}>
                            <i className="fas fa-users-slash" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px', color: 'rgba(230, 185, 126, 0.3)' }}></i>
                            No matching customers found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}

        {/* Tab 7: Problem Solver (Customer Support Helpdesk) */}
        {effectiveActivities.includes('support') && activeTab === 'support' && (() => {
          const filteredTickets = supportTickets.filter(t => {
            const matchesStatus = ticketFilterStatus === 'all' || t.status === ticketFilterStatus;
            const q = ticketSearchQuery.toLowerCase();
            const matchesSearch =
              (t.ticketId || '').toLowerCase().includes(q) ||
              (t.customerName || '').toLowerCase().includes(q) ||
              (t.customerEmail || '').toLowerCase().includes(q) ||
              (t.subject || '').toLowerCase().includes(q) ||
              (t.orderNo || '').toLowerCase().includes(q) ||
              (t.category || '').toLowerCase().includes(q);
            return matchesStatus && matchesSearch;
          });

          const pendingCount = supportTickets.filter(t => t.status === 'Pending').length;
          const progressCount = supportTickets.filter(t => t.status === 'In Progress').length;
          const resolvedCount = supportTickets.filter(t => t.status === 'Resolved').length;

          return (
            <div className="admin-tab-content">
              {/* Problem Solver Summary Metrics */}
              <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
                <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-exclamation-circle" style={{ color: '#eac288' }}></i></div>
                  <div>
                    <span className="stat-label">Pending Resolution</span>
                    <h3 style={{ color: '#eac288' }}>{pendingCount} Inquiries</h3>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-tools" style={{ color: '#f0dbbf' }}></i></div>
                  <div>
                    <span className="stat-label">Under Investigation</span>
                    <h3 style={{ color: '#f0dbbf' }}>{progressCount} Tickets</h3>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-check-circle" style={{ color: '#c6d9be' }}></i></div>
                  <div>
                    <span className="stat-label">Resolved Issues</span>
                    <h3 style={{ color: '#c6d9be' }}>{resolvedCount} Solved</h3>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-headset" style={{ color: '#e6b97e' }}></i></div>
                  <div>
                    <span className="stat-label">Total Customer Cases</span>
                    <h3>{supportTickets.length} Inquiries</h3>
                  </div>
                </div>
              </div>

              {/* Status Filter Tabs & Search Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'all', label: `All Queries (${supportTickets.length})` },
                    { key: 'Pending', label: `⏳ Pending (${pendingCount})`, color: '#eac288' },
                    { key: 'In Progress', label: `🔄 In Progress (${progressCount})`, color: '#f0dbbf' },
                    { key: 'Resolved', label: `✅ Resolved (${resolvedCount})`, color: '#c6d9be' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setTicketFilterStatus(tab.key)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: ticketFilterStatus === tab.key ? `1px solid ${tab.color || '#e6b97e'}` : '1px solid rgba(255,255,255,0.1)',
                        background: ticketFilterStatus === tab.key ? (tab.color ? `${tab.color}22` : 'rgba(230, 185, 126, 0.2)') : 'rgba(255,255,255,0.04)',
                        color: ticketFilterStatus === tab.key ? (tab.color || '#e6b97e') : '#a599c2',
                        fontWeight: 'bold',
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '260px', justifyContent: 'flex-end' }}>
                  <input
                    type="text"
                    placeholder="Search tickets by ID, customer, order #, subject..."
                    value={ticketSearchQuery}
                    onChange={e => setTicketSearchQuery(e.target.value)}
                    className="inv-search-input"
                    style={{ maxWidth: '380px' }}
                  />
                  <button
                    onClick={fetchTickets}
                    style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#e6b97e', cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              {/* Tickets List */}
              {ticketsLoading ? (
                <div className="admin-loading"><i className="fas fa-spinner fa-spin"></i> Loading support tickets...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredTickets.map(ticket => (
                    <div
                      key={ticket.ticketId || ticket.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '12px',
                        border: `1px solid ${ticket.status === 'Resolved' ? 'rgba(198, 217, 190, 0.3)' : ticket.priority === 'High' ? 'rgba(186, 75, 95, 0.35)' : 'rgba(230, 185, 126, 0.3)'}`,
                        padding: '20px',
                        position: 'relative'
                      }}
                    >
                      {/* Top Header Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 'bold', color: '#e6b97e', background: '#090029', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(230,185,126,0.3)' }}>
                            {ticket.ticketId}
                          </span>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            background: ticket.priority === 'High' ? 'rgba(186, 75, 95, 0.16)' : ticket.priority === 'Medium' ? 'rgba(234, 194, 136, 0.16)' : 'rgba(198, 217, 190, 0.16)',
                            color: ticket.priority === 'High' ? '#e89da9' : ticket.priority === 'Medium' ? '#eac288' : '#c6d9be',
                            border: `1px solid ${ticket.priority === 'High' ? 'rgba(186, 75, 95, 0.4)' : ticket.priority === 'Medium' ? 'rgba(234, 194, 136, 0.4)' : 'rgba(198, 217, 190, 0.4)'}`
                          }}>
                            {ticket.priority === 'High' ? '🔴 High Priority' : ticket.priority === 'Medium' ? '🟡 Medium Priority' : '🟢 Low Priority'}
                          </span>
                          <span style={{ fontSize: '0.78rem', background: 'rgba(230, 185, 126, 0.1)', color: '#e6b97e', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(230, 185, 126, 0.3)' }}>
                            🏷️ {ticket.category}
                          </span>
                          {ticket.orderNo && (
                            <span style={{ fontSize: '0.78rem', background: 'rgba(230, 185, 126, 0.12)', color: '#e6b97e', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(230, 185, 126, 0.3)' }}>
                              📦 Order: {ticket.orderNo}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            fontSize: '0.78rem',
                            fontWeight: 'bold',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            background: ticket.status === 'Resolved' ? 'rgba(198, 217, 190, 0.14)' : ticket.status === 'In Progress' ? 'rgba(240, 219, 191, 0.14)' : 'rgba(234, 194, 136, 0.14)',
                            color: ticket.status === 'Resolved' ? '#c6d9be' : ticket.status === 'In Progress' ? '#f0dbbf' : '#eac288',
                            border: `1px solid ${ticket.status === 'Resolved' ? 'rgba(198, 217, 190, 0.35)' : ticket.status === 'In Progress' ? 'rgba(240, 219, 191, 0.35)' : 'rgba(234, 194, 136, 0.35)'}`
                          }}>
                            {ticket.status === 'Resolved' ? '✅ Resolved' : ticket.status === 'In Progress' ? '🔄 In Progress' : '⏳ Pending Resolution'}
                          </span>
                          <span style={{ fontSize: '0.76rem', color: '#a599c2' }}>
                            {new Date(ticket.createdAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Customer Inquiry Details */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <strong style={{ color: '#fff', fontSize: '1.05rem', fontFamily: 'serif' }}>{ticket.subject}</strong>
                        </div>
                        <div style={{ background: '#090029', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', color: '#e0d8f0', fontSize: '0.9rem', lineHeight: '1.5' }}>
                          "{ticket.message}"
                        </div>
                      </div>

                      {/* Customer Contact Bar & Resolution Footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem' }}>
                          <span style={{ color: '#fff' }}><i className="fas fa-user" style={{ color: '#e6b97e', marginRight: '5px' }}></i> {ticket.customerName}</span>
                          <a href={`mailto:${ticket.customerEmail}?subject=Jewel%20Street%20Support%20Ticket%20${ticket.ticketId}`} style={{ color: '#e6b97e', textDecoration: 'none' }}>
                            <i className="fas fa-envelope" style={{ marginRight: '5px' }}></i> {ticket.customerEmail}
                          </a>
                          {ticket.customerPhone && (
                            <a href={`tel:${ticket.customerPhone}`} style={{ color: '#a599c2', textDecoration: 'none' }}>
                              <i className="fas fa-phone" style={{ marginRight: '5px' }}></i> {ticket.customerPhone}
                            </a>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => openResolveModal(ticket)}
                            style={{
                              padding: '8px 16px',
                              background: ticket.status === 'Resolved' ? 'rgba(198, 217, 190, 0.12)' : 'linear-gradient(135deg, #e6b97e, #d4a060)',
                              border: ticket.status === 'Resolved' ? '1px solid rgba(198, 217, 190, 0.35)' : 'none',
                              borderRadius: '8px',
                              color: ticket.status === 'Resolved' ? '#c6d9be' : '#0d0028',
                              fontWeight: 'bold',
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <i className="fas fa-clipboard-check"></i> {ticket.status === 'Resolved' ? 'View / Edit Resolution' : 'Resolve & Update Status'}
                          </button>
                        </div>
                      </div>

                      {/* Resolution Audit Trail */}
                      {ticket.resolutionNotes && (
                        <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(198, 217, 190, 0.1)', border: '1px solid rgba(198, 217, 190, 0.25)', fontSize: '0.82rem', color: '#c6d9be' }}>
                          <strong>Resolution Record:</strong> {ticket.resolutionNotes}
                          {ticket.resolvedBy && <span style={{ color: '#a599c2', marginLeft: '8px' }}>— Resolved by {ticket.resolvedBy} {ticket.resolvedAt ? `on ${new Date(ticket.resolvedAt).toLocaleDateString('en-IN')}` : ''}</span>}
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredTickets.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#a599c2', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                      <i className="fas fa-clipboard-check" style={{ fontSize: '2.5rem', color: '#c6d9be', marginBottom: '12px', display: 'block' }}></i>
                      <h4 style={{ color: '#fff', margin: '0 0 6px' }}>All Clear in Problem Solver!</h4>
                      <p style={{ margin: 0, fontSize: '0.88rem' }}>No customer tickets match the selected status or search term.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowAddModal(false)}>✕</button>
            <h3><i className={`fas fa-${editProd ? 'edit' : 'plus-circle'}`}></i> {editProd ? `Edit: ${editProd.name}` : 'Add New Fine Jewellery Product'}</h3>
            
            <form onSubmit={handleSaveProduct} className="add-prod-form">
              <div className="form-row">
                <label>Product Title *</label>
                <input
                  type="text"
                  value={newProd.name}
                  onChange={e => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. Royal Emerald Pendant Necklace"
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-row">
                  <label>Category *</label>
                  <select value={newProd.category} onChange={e => setNewProd({ ...newProd, category: e.target.value })}>
                    {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                <div className="form-row">
                  <label>Gold Purity *</label>
                  <select
                    value={newProd.purity}
                    onChange={e => setNewProd({ ...newProd, purity: e.target.value })}
                  >
                    <option value="91.6%">🏆 22K (91.6% BIS Hallmarked)</option>
                    <option value="75.0%">✨ 18K (75.0% BIS Hallmarked)</option>
                    <option value="99.9%">🪙 24K (99.9% Pure Gold Coin)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-row">
                  <label>Weight (g) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProd.weight}
                    onChange={e => setNewProd({ ...newProd, weight: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <label>Display Price *</label>
                  <input
                    type="text"
                    value={newProd.price}
                    onChange={e => setNewProd({ ...newProd, price: e.target.value })}
                    placeholder="₹55,000"
                    required
                  />
                </div>

                <div className="form-row">
                  <label>Stock Count *</label>
                  <input
                    type="number"
                    value={newProd.stock}
                    onChange={e => setNewProd({ ...newProd, stock: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              {/* Image Upload Function & URL */}
              <div className="form-row">
                <label>Product Image (Upload File or Enter URL) *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{
                      padding: '8px',
                      background: '#090029',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-main)'
                    }}
                  />
                  <input
                    type="text"
                    value={newProd.image}
                    onChange={e => setNewProd({ ...newProd, image: e.target.value })}
                    placeholder="/photos/product1.jpg or base64 image string"
                    required
                  />
                </div>
                {newProd.image && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={newProd.image}
                      alt="Preview"
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--accent-primary)' }}
                      onError={e => { e.target.src = '/photos/product1.jpg'; }}
                    />
                    <span style={{ fontSize: '0.78rem', color: '#e6b97e' }}>✓ Image Preview Loaded</span>
                  </div>
                )}
              </div>

              <div className="form-row">
                <label>Description</label>
                <textarea
                  value={newProd.description}
                  onChange={e => setNewProd({ ...newProd, description: e.target.value })}
                  rows="3"
                ></textarea>
              </div>

              <button type="submit" className="save-prod-btn">
                <i className={`fas fa-${editProd ? 'save' : 'check'}`}></i> {editProd ? 'Save Changes to Live Store' : 'Add Product to Live Store Catalog'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Duplicate Tax Invoice Modal */}
      {selectedOrderForInvoice && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrderForInvoice(null)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <button className="close-modal-btn" onClick={() => setSelectedOrderForInvoice(null)}>✕</button>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <span style={{ color: '#e6b97e', fontSize: '0.8rem', fontWeight: 'bold' }}>👑 JEWEL STREET OFFICIAL TAX INVOICE COPY</span>
              <h2 style={{ fontFamily: 'serif', color: '#fff', margin: '4px 0' }}>{selectedOrderForInvoice.invoiceNo}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Date: {new Date(selectedOrderForInvoice.createdAt).toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', marginBottom: '16px' }}>
              <div>
                <strong style={{ color: '#e6b97e' }}>Customer Details:</strong><br/>
                Name: {selectedOrderForInvoice.customerName}<br/>
                Email: {selectedOrderForInvoice.customerEmail}<br/>
                Phone: {selectedOrderForInvoice.phone}
              </div>
              <div>
                <strong style={{ color: '#e6b97e' }}>Delivery Details:</strong><br/>
                Address: {selectedOrderForInvoice.deliveryAddress}<br/>
                Pincode: {selectedOrderForInvoice.pincode}<br/>
                Status: <strong style={{ color: '#e6b97e' }}>{selectedOrderForInvoice.status}</strong>
              </div>
            </div>

            <h4 style={{ color: '#e6b97e', margin: '12px 0 6px', fontSize: '0.95rem' }}>Purchased Items</h4>
            <div style={{ background: '#090029', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '10px', marginBottom: '16px' }}>
              {(selectedOrderForInvoice.items || []).map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: idx < selectedOrderForInvoice.items.length - 1 ? '1px dashed rgba(255,255,255,0.1)' : 'none', fontSize: '0.85rem' }}>
                  <div>
                    <strong>{it.name}</strong> ({it.purity || '22K'})<br/>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{it.weight || 'Standard Weight'}</span>
                  </div>
                  <span style={{ fontWeight: 'bold', color: '#e6b97e' }}>{it.price}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(230, 185, 126, 0.12)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(230, 185, 126, 0.4)' }}>
              <span style={{ fontWeight: 'bold', color: '#fff' }}>Grand Total Paid:</span>
              <span style={{ fontFamily: 'serif', fontSize: '1.4rem', fontWeight: 'bold', color: '#e6b97e' }}>
                ₹{(selectedOrderForInvoice.totalAmount || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}
      {showMakingChargeModal && (
        <div className="admin-modal-overlay" onClick={() => setShowMakingChargeModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2><i className="fas fa-hammer" style={{ color: '#e6b97e', marginRight: '8px' }}></i> Change Making Charges (%)</h2>
              <button className="close-modal-btn" onClick={() => setShowMakingChargeModal(false)}>×</button>
            </div>

            <form onSubmit={handleApplyMakingCharges} style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#e6b97e', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  1. Select Application Scope:
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'all', label: 'All Products in Store' },
                    { key: 'category', label: 'Specific Category' },
                    { key: 'selected', label: `Selected Items (${selectedProductIds.length})` },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setMakingChargeScope(opt.key)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: makingChargeScope === opt.key ? '1px solid #e6b97e' : '1px solid rgba(255,255,255,0.1)',
                        background: makingChargeScope === opt.key ? 'rgba(230, 185, 126, 0.2)' : 'rgba(255,255,255,0.04)',
                        color: makingChargeScope === opt.key ? '#e6b97e' : '#a599c2',
                        fontWeight: 'bold',
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {makingChargeScope === 'category' && (
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#fff', fontSize: '0.88rem' }}>
                    Target Category:
                  </label>
                  <select
                    value={makingChargeCategory}
                    onChange={(e) => setMakingChargeCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#090029',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  >
                    {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              )}

              {makingChargeScope === 'selected' && selectedProductIds.length === 0 && (
                <div style={{ padding: '10px 14px', background: 'rgba(230, 185, 126, 0.12)', border: '1px solid rgba(230, 185, 126, 0.35)', borderRadius: '8px', color: '#e6b97e', fontSize: '0.82rem', marginBottom: '16px' }}>
                  <i className="fas fa-exclamation-triangle" style={{ marginRight: '6px' }}></i> No products selected! Please check items in the inventory table first.
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#e6b97e', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  2. New Making Charge Percentage (%):
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {[10, 12, 15, 18, 20, 25, 30].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNewMakingChargePercent(val)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: newMakingChargePercent === val ? '1px solid #e6b97e' : '1px solid rgba(255,255,255,0.1)',
                        background: newMakingChargePercent === val ? 'rgba(230, 185, 126, 0.2)' : 'rgba(255,255,255,0.04)',
                        color: newMakingChargePercent === val ? '#e6b97e' : '#d5ccf0',
                        fontWeight: 'bold',
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={newMakingChargePercent}
                  onChange={(e) => setNewMakingChargePercent(parseFloat(e.target.value) || 0)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#090029',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: '#a599c2', marginTop: '4px', display: 'block' }}>
                  Product prices will be recalculated using current daily gold rate, item weight, purity factor, and {newMakingChargePercent}% making charges + 3% GST.
                </span>
              </div>

              {makingChargeMsg && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: makingChargeMsg.type === 'success' ? 'rgba(230, 185, 126, 0.15)' : 'rgba(186, 75, 95, 0.14)',
                  border: `1px solid ${makingChargeMsg.type === 'success' ? '#e6b97e' : '#e89da9'}`,
                  color: makingChargeMsg.type === 'success' ? '#e6b97e' : '#e89da9',
                  fontSize: '0.88rem'
                }}>
                  {makingChargeMsg.text}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowMakingChargeModal(false)}
                  style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#a599c2', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={makingChargeSubmitting || (makingChargeScope === 'selected' && selectedProductIds.length === 0)}
                  style={{
                    padding: '10px 22px',
                    background: 'linear-gradient(135deg, #e6b97e, #d4a060)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#0d0028',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {makingChargeSubmitting ? 'Updating Prices...' : 'Recalculate & Apply Prices'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <EmailReportModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        reportType={emailReportType}
        reportData={emailReportData}
        defaultEmail={user?.email || 'deevyanshusahu@gmail.com'}
      />

      {/* Master Admin: Change Sub-Admin Passcode Modal */}
      {showMasterChangePassModal && (
        <div className="admin-modal-overlay" onClick={() => setShowMasterChangePassModal(false)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', background: 'linear-gradient(145deg, #0d0033 0%, #06001a 100%)', border: '1px solid rgba(230, 185, 126, 0.4)', borderRadius: '16px', padding: '28px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(230, 185, 126, 0.15)', border: '1px solid #e6b97e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#e6b97e', fontSize: '1.2rem' }}>
                <i className="fas fa-key"></i>
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', margin: '0 0 6px', fontFamily: "'Georgia', serif" }}>
                Update Administrator Passcode
              </h3>
              <p style={{ color: '#a599c2', fontSize: '0.85rem', margin: 0 }}>
                Updating credentials for <strong style={{ color: '#e6b97e' }}>{selectedAdminForPass?.name}</strong> ({selectedAdminForPass?.email})
              </p>
            </div>

            {masterChangePassMsg && (
              <div style={{
                marginBottom: '18px',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                background: masterChangePassMsg.type === 'success' ? 'rgba(198, 217, 190, 0.14)' : 'rgba(186, 75, 95, 0.14)',
                border: `1px solid ${masterChangePassMsg.type === 'success' ? '#c6d9be' : '#e89da9'}`,
                color: masterChangePassMsg.type === 'success' ? '#c6d9be' : '#e89da9',
              }}>
                {masterChangePassMsg.text}
              </div>
            )}

            <form onSubmit={handleMasterUpdateAdminPass}>
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#e6b97e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  New Passcode * (min 6 characters)
                </label>
                <input
                  type="text"
                  value={masterNewAdminPass}
                  onChange={e => setMasterNewAdminPass(e.target.value)}
                  placeholder="Set new administrator passcode"
                  required
                  minLength={6}
                  style={{ width: '100%', padding: '11px', background: '#090029', border: '1px solid rgba(230, 185, 126, 0.3)', borderRadius: '8px', color: '#fff', fontSize: '0.95rem' }}
                />
                <span style={{ fontSize: '0.78rem', color: '#a599c2', marginTop: '6px', display: 'block' }}>
                  An automated notification email with the updated passcode will be dispatched to this administrator.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowMasterChangePassModal(false)}
                  style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#a599c2', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={masterChangePassLoading}
                  style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #e6b97e, #d4a060)', border: 'none', borderRadius: '8px', color: '#0d0028', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {masterChangePassLoading ? 'Updating Passcode...' : 'Save & Send Update Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Problem Solver Resolution Modal */}
      {selectedTicketForResolve && (
        <div className="admin-modal-overlay" onClick={() => setSelectedTicketForResolve(null)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px', background: 'linear-gradient(145deg, #0d0033 0%, #06001a 100%)', border: '1px solid rgba(230, 185, 126, 0.4)', borderRadius: '16px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#e6b97e', fontWeight: 'bold' }}>CUSTOMER SUPPORT HELPDESK</span>
                <h3 style={{ margin: '4px 0 0', color: '#fff', fontFamily: 'serif' }}>Resolve Ticket {selectedTicketForResolve.ticketId}</h3>
              </div>
              <button className="close-modal-btn" onClick={() => setSelectedTicketForResolve(null)}>✕</button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px 16px', marginBottom: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.85rem', color: '#e6b97e', fontWeight: 'bold', marginBottom: '4px' }}>
                {selectedTicketForResolve.customerName} ({selectedTicketForResolve.customerEmail})
              </div>
              <div style={{ fontSize: '0.88rem', color: '#fff', fontWeight: '600' }}>
                Subject: {selectedTicketForResolve.subject}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#c4b8e2', marginTop: '6px', fontStyle: 'italic' }}>
                "{selectedTicketForResolve.message}"
              </div>
            </div>

            {ticketResolveMsg && (
              <div style={{
                marginBottom: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                background: ticketResolveMsg.type === 'success' ? 'rgba(198, 217, 190, 0.14)' : 'rgba(186, 75, 95, 0.14)',
                border: `1px solid ${ticketResolveMsg.type === 'success' ? '#c6d9be' : '#e89da9'}`,
                color: ticketResolveMsg.type === 'success' ? '#c6d9be' : '#e89da9'
              }}>
                {ticketResolveMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateTicketStatus}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#e6b97e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  Update Case Status *
                </label>
                <select
                  value={resolutionStatus}
                  onChange={e => setResolutionStatus(e.target.value)}
                  style={{ width: '100%', padding: '11px', background: '#090029', border: '1px solid rgba(230, 185, 126, 0.4)', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', fontWeight: 'bold' }}
                >
                  <option value="Resolved">✅ Resolved (Customer satisfied / solution delivered)</option>
                  <option value="In Progress">🔄 In Progress (Under investigation / warehouse contact)</option>
                  <option value="Pending">⏳ Pending (Waiting for customer reply or supplier update)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#e6b97e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  Resolution Notes / Action Taken *
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  rows="4"
                  placeholder="Record what was done to solve this customer problem (e.g. Sent replacement hallmark certificate, processed refund, confirmed courier tracking)..."
                  required
                  style={{ width: '100%', padding: '11px', background: '#090029', border: '1px solid rgba(230, 185, 126, 0.4)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedTicketForResolve(null)}
                  style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#a599c2', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ticketStatusUpdating}
                  style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #e6b97e, #d4a060)', border: 'none', borderRadius: '8px', color: '#0d0028', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {ticketStatusUpdating ? 'Updating Record...' : '💾 Save & Update Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Master Admin Role & Permissions Assignment Modal */}
      {showRoleModal && selectedAdminForRole && (
        <div className="admin-modal-overlay" onClick={() => setShowRoleModal(false)} style={{ zIndex: 999999 }}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px', background: 'linear-gradient(145deg, #0d0033 0%, #06001a 100%)', border: '2px solid #e6b97e', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.9)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(230,185,126,0.3)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.6rem' }}>👑</span>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontFamily: "'Georgia', serif" }}>
                    Assign Role &amp; Permissions
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#e6b97e' }}>Master Administrator Access Control</span>
                </div>
              </div>
              <button className="close-modal-btn" onClick={() => setShowRoleModal(false)}>✕</button>
            </div>

            {/* Target Admin Card */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px 18px', marginBottom: '18px', border: '1px solid rgba(230,185,126,0.2)' }}>
              <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.95rem' }}>{selectedAdminForRole.name}</div>
              <div style={{ fontSize: '0.82rem', color: '#a599c2', marginTop: '2px' }}>{selectedAdminForRole.email}</div>
            </div>

            {roleUpdateMsg && (
              <div style={{
                marginBottom: '18px',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                background: roleUpdateMsg.type === 'success' ? 'rgba(198, 217, 190, 0.14)' : 'rgba(186, 75, 95, 0.14)',
                border: `1px solid ${roleUpdateMsg.type === 'success' ? '#c6d9be' : '#e89da9'}`,
                color: roleUpdateMsg.type === 'success' ? '#c6d9be' : '#e89da9',
              }}>
                {roleUpdateMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateAdminRoleSubmit}>
              {/* Role Preset Selector */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#e6b97e', fontSize: '0.88rem', fontWeight: 'bold' }}>
                  Select Designation / Role Preset *
                </label>
                <select
                  value={editAdminRole}
                  onChange={e => handleEditRoleChange(e.target.value)}
                  style={{ width: '100%', padding: '11px', background: '#090029', border: '1px solid rgba(230, 185, 126, 0.4)', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {ROLE_PRESETS.map(preset => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#a599c2', fontStyle: 'italic' }}>
                  {ROLE_PRESETS.find(p => p.value === editAdminRole)?.desc}
                </div>
                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleEditRoleChange('master_admin')}
                    style={{
                      padding: '7px 14px',
                      background: editAdminRole === 'master_admin' ? 'linear-gradient(135deg,#e6b97e,#d4a060)' : 'rgba(230,185,126,0.12)',
                      border: '1px solid #e6b97e',
                      borderRadius: '6px',
                      color: editAdminRole === 'master_admin' ? '#0d0028' : '#e6b97e',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    👑 Quick: Grant Master Admin (Full Access)
                  </button>
                </div>
              </div>

              {/* Granular Activity Checkboxes */}
              <div className="admin-field-block" style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#e6b97e', fontSize: '0.88rem', fontWeight: 'bold' }}>
                  Permitted Dashboard Activities ({editAdminActivities.length} granted)
                </label>
                <span style={{ display: 'block', fontSize: '0.78rem', color: '#a599c2', marginBottom: '10px' }}>
                  This administrator will strictly see and perform ONLY the checked activities. All other dashboard tabs will remain completely hidden.
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                  {ALL_OPERATIONAL_ACTIVITIES.map(act => {
                    const isChecked = editAdminActivities.includes(act.key);
                    return (
                      <div
                        key={act.key}
                        onClick={() => toggleEditAdminActivity(act.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: isChecked ? 'rgba(230, 185, 126, 0.18)' : 'rgba(255,255,255,0.03)',
                          border: `1.5px solid ${isChecked ? '#e6b97e' : 'rgba(255,255,255,0.08)'}`,
                          color: isChecked ? '#fff' : '#a599c2',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          userSelect: 'none',
                          boxSizing: 'border-box',
                          minWidth: 0,
                          overflow: 'hidden',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            minWidth: '18px',
                            maxWidth: '18px',
                            borderRadius: '4px',
                            border: `2px solid ${isChecked ? '#e6b97e' : 'rgba(255,255,255,0.35)'}`,
                            background: isChecked ? '#e6b97e' : 'rgba(0,0,0,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0d0028',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            flexShrink: 0,
                            boxSizing: 'border-box',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isChecked && <i className="fas fa-check" style={{ fontSize: '10px', color: '#0d0028' }}></i>}
                        </div>
                        <i className={`fas ${act.icon}`} style={{ color: isChecked ? '#e6b97e' : '#a599c2', fontSize: '0.82rem', flexShrink: 0 }}></i>
                        <span style={{ fontWeight: isChecked ? '600' : 'normal', lineHeight: '1.25', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#a599c2', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={roleUpdateLoading}
                  style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #e6b97e, #d4a060)', border: 'none', borderRadius: '8px', color: '#0d0028', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.92rem' }}
                >
                  {roleUpdateLoading ? 'Updating Permissions...' : '👑 Save Role & Privileges'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;

