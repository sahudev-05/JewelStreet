import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import EmailReportModal from '../components/EmailReportModal';
import { exportInvoicePrintablePDF } from '../services/reportExporter';
import './Profile.css';

const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'details'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedEmailOrder, setSelectedEmailOrder] = useState(null);

  // Edit Profile Details State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('jewel_user');
    let currentUser = null;
    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
        const email = (currentUser.email || '').toLowerCase().trim();
        const isDeev = email.includes('deevyanshu');
        if (!isDeev && currentUser.name && currentUser.name.toLowerCase().includes('deevyanshu')) {
          const prefix = email ? email.split('@')[0] : 'Valued Client';
          currentUser.name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
          localStorage.setItem('jewel_user', JSON.stringify(currentUser));
        }
        setUser(currentUser);
      } catch (e) {
        console.error('Error parsing user', e);
      }
    }

    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditEmail(currentUser.email || '');
      setEditPhone(currentUser.phone || '');
      setEditAddress(currentUser.address || '');
      setEditPincode(currentUser.pincode || '');
      fetchOrders(currentUser.email);
      const email = (currentUser.email || '').toLowerCase().trim();
      const ROOT_MASTER_ADMINS = ['deevyanshu.sahu@gmail.com', 'deevyanshusahu@gmail.com', 'admin@jewelstreet.com'];
      const isM = ROOT_MASTER_ADMINS.includes(email) || currentUser.role === 'master_admin';
      const isA = isM || currentUser.role === 'admin';
      if (isA) {
        setActiveTab('admin');
      }

      // Fetch live role & permissions to reflect any Master Admin updates dynamically
      axios.get(`/api/auth/my-role?email=${encodeURIComponent(email)}`)
        .then(res => {
          if (res.data && res.data.role) {
            const freshUser = {
              ...currentUser,
              role: res.data.role,
              assignedRole: res.data.assignedRole,
              allowedActivities: res.data.allowedActivities,
              isMaster: res.data.isMaster
            };
            setUser(freshUser);
            localStorage.setItem('jewel_user', JSON.stringify(freshUser));
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      name: editName,
      email: editEmail,
      phone: editPhone,
      address: editAddress,
      pincode: editPincode,
    };
    setUser(updatedUser);
    localStorage.setItem('jewel_user', JSON.stringify(updatedUser));
    setIsEditing(false);
    setSaveSuccess('✅ Profile & Delivery Details updated successfully!');
    setTimeout(() => setSaveSuccess(''), 4000);
  };

  const fetchOrders = async (email) => {
    setLoading(true);
    let apiOrders = [];
    try {
      const res = await axios.get(`/api/orders/my-orders?email=${encodeURIComponent(email)}`);
      apiOrders = res.data || [];
    } catch (err) {
      console.error('Error fetching orders:', err);
    }

    let localOrders = [];
    try {
      localOrders = JSON.parse(localStorage.getItem('jewel_orders') || '[]');
    } catch (e) {}

    // Merge backend API orders and local orders, prioritizing fresh status from server
    const mergedMap = new Map();

    localOrders.forEach(ord => {
      if (ord.customerEmail && ord.customerEmail.toLowerCase() === (email || '').toLowerCase()) {
        mergedMap.set(ord.invoiceNo, ord);
      }
    });

    apiOrders.forEach(ord => {
      mergedMap.set(ord.invoiceNo, ord);
    });

    const finalOrders = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    setOrders(finalOrders);
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('jewel_token');
    localStorage.removeItem('jewel_user');
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="status-badge status-delivered"><i className="fas fa-check-circle" style={{ marginRight: '4px' }}></i> Delivered</span>;
      case 'In Armored Transit':
        return <span className="status-badge status-transit"><i className="fas fa-truck" style={{ marginRight: '4px' }}></i> In Armored Transit</span>;
      case 'Processing':
      default:
        return <span className="status-badge status-processing"><i className="fas fa-cog" style={{ marginRight: '4px' }}></i> Processing</span>;
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to CANCEL order #${order.invoiceNo}? A 100% full refund will be credited to your original payment method.`)) return;
    const reason = window.prompt('Reason for cancellation (optional):', 'Changed my mind / Placed by mistake');
    if (reason === null) return;

    try {
      const res = await axios.post(`/api/orders/${order._id || order.invoiceNo}/cancel`, { reason });
      alert(`${res.data.message}`);
      fetchOrders(user?.email || '');
    } catch (err) {
      alert('Failed to cancel order: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReturnRequest = async (order, forcedType) => {
    const typeChoice = forcedType ? (forcedType === 'Return') : window.confirm(
      `Jewel Street 7-Day Royal Privilege Policy\n\nOrder #${order.invoiceNo}\n\nClick OK for FULL REFUND RETURN or CANCEL for EXCHANGE.`
    );
    const type = typeChoice ? 'Return' : 'Exchange';
    const reason = window.prompt(`Reason for 7-Day ${type} Request (optional):`, 'Size adjustment / Style preference');
    if (reason === null) return;

    try {
      const res = await axios.post(`/api/orders/${order._id || order.invoiceNo}/return-request`, { type, reason });
      alert(`${res.data.message}`);
      fetchOrders(user?.email || '');
    } catch (err) {
      alert(`Failed to submit ${type} request: ` + (err.response?.data?.message || err.message));
    }
  };

  const userEmail = (user?.email || '').toLowerCase().trim();
  const isDeev = userEmail.includes('deevyanshu');
  const emailPrefix = userEmail ? userEmail.split('@')[0] : 'User';
  const fallbackDisplayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  const displayName = (user?.name && (!user.name.toLowerCase().includes('deevyanshu') || isDeev))
    ? user.name
    : fallbackDisplayName;

  const ROOT_MASTER_ADMINS = ['deevyanshu.sahu@gmail.com', 'deevyanshusahu@gmail.com', 'admin@jewelstreet.com'];
  const isMasterAdmin = ROOT_MASTER_ADMINS.includes(userEmail) || user?.role === 'master_admin' || user?.assignedRole === 'master_admin' || user?.isMaster === true;
  const isAdmin = isMasterAdmin || user?.role === 'admin';

  const ROLE_DEFINITIONS = {
    master_admin: {
      title: 'Master Administrator Executive Profile',
      designation: 'Master Administrator & Systems Director',
      authority: 'Tier-1 Root Governance (Full Authority)',
      tag: 'Master Admin',
      badgeIcon: 'fa-crown',
      division: 'Jewel Street Haute Joaillerie Flagship Atelier HQ'
    },
    inventory_manager: {
      title: 'Catalog & Inventory Manager Profile',
      designation: 'Catalog & Inventory Manager',
      authority: 'Tier-2 Inventory Governance (Restricted Scope)',
      tag: 'Inventory Manager',
      badgeIcon: 'fa-gem',
      division: 'Jewel Street Atelier & Catalog Operations'
    },
    order_manager: {
      title: 'Order Fulfillment Specialist Profile',
      designation: 'Order Fulfillment & Logistics Specialist',
      authority: 'Tier-2 Order Operations (Restricted Scope)',
      tag: 'Order Specialist',
      badgeIcon: 'fa-truck-loading',
      division: 'Jewel Street Armored Dispatch & Logistics'
    },
    support_specialist: {
      title: 'Customer Support Executive Profile',
      designation: 'Customer Support Executive',
      authority: 'Tier-2 Customer Helpdesk (Restricted Scope)',
      tag: 'Support Executive',
      badgeIcon: 'fa-headset',
      division: 'Jewel Street Client Relations & Concierge'
    },
    customer_manager: {
      title: 'Customer Relations Manager Profile',
      designation: 'Customer Relations Manager',
      authority: 'Tier-2 Client Directory (Restricted Scope)',
      tag: 'Client Relations',
      badgeIcon: 'fa-users',
      division: 'Jewel Street Patron Accounts & Advisory'
    },
    reports_analyst: {
      title: 'Business & Financial Analyst Profile',
      designation: 'Business & Financial Analyst',
      authority: 'Tier-2 Intelligence & Reports (Restricted Scope)',
      tag: 'Financial Analyst',
      badgeIcon: 'fa-chart-bar',
      division: 'Jewel Street Financial Audit & Analytics'
    },
    promotions_manager: {
      title: 'Promotions & Marketing Lead Profile',
      designation: 'Promotions & Marketing Lead',
      authority: 'Tier-2 Promotions Governance (Restricted Scope)',
      tag: 'Promotions Lead',
      badgeIcon: 'fa-tags',
      division: 'Jewel Street Campaign & Marketing Bureau'
    },
    store_operations: {
      title: 'Store Operations Supervisor Profile',
      designation: 'Store Operations Supervisor',
      authority: 'Tier-2 Store Operations (Multi-Scope)',
      tag: 'Operations Supervisor',
      badgeIcon: 'fa-user-shield',
      division: 'Jewel Street Haute Joaillerie Store Operations'
    },
    custom: {
      title: 'Custom Operations Administrator Profile',
      designation: 'Custom Operations Administrator',
      authority: 'Tier-2 Restricted Operational Access',
      tag: 'Operations Admin',
      badgeIcon: 'fa-user-shield',
      division: 'Jewel Street Haute Joaillerie Store Operations'
    }
  };

  const activeRoleKey = isMasterAdmin ? 'master_admin' : (user?.assignedRole || 'inventory_manager');
  const roleMeta = ROLE_DEFINITIONS[activeRoleKey] || ROLE_DEFINITIONS.custom;

  const effectiveActivities = isMasterAdmin
    ? ['inventory', 'orders', 'customers', 'support', 'reports', 'coupons', 'admins']
    : (Array.isArray(user?.allowedActivities) && user?.allowedActivities.length > 0
        ? user.allowedActivities
        : ['inventory']);

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        {/* Header Profile Summary */}
        <div className="profile-header">
          <div className="avatar-wrap">
            <div className="avatar-circle">
              {displayName.charAt(0).toUpperCase()}
            </div>
            {isMasterAdmin ? (
              <span className="admin-crown-tag" title="Master Administrator" style={{ background: 'linear-gradient(135deg, #e6b97e, #d4a060)', color: '#0d0028', fontWeight: 'bold' }}>
                <i className="fas fa-crown"></i> Master Admin
              </span>
            ) : isAdmin ? (
              <span className="admin-crown-tag" title={roleMeta.designation} style={{ background: 'linear-gradient(135deg, #f0dbbf, #d4a060)', color: '#0d0028', fontWeight: 'bold' }}>
                <i className={`fas ${roleMeta.badgeIcon}`}></i> {roleMeta.tag}
              </span>
            ) : null}
          </div>
          
          <div className="profile-header-info">
            <h2>{displayName}</h2>
            <p className="user-email">{user?.email || 'admin@jewelstreet.com'}</p>
            <div className="role-pill-wrap">
              <span className={`role-badge ${isMasterAdmin ? 'master-badge' : isAdmin ? 'admin-badge' : 'member-badge'}`} style={{
                background: isMasterAdmin ? 'rgba(230, 185, 126, 0.25)' : isAdmin ? 'rgba(240, 219, 191, 0.15)' : 'rgba(230, 185, 126, 0.15)',
                border: `1px solid ${isMasterAdmin ? '#e6b97e' : isAdmin ? '#f0dbbf' : 'rgba(230, 185, 126, 0.4)'}`,
                color: isMasterAdmin ? '#e6b97e' : isAdmin ? '#f0dbbf' : '#e6b97e',
                fontWeight: 'bold'
              }}>
                {isMasterAdmin ? (
                  <><i className="fas fa-crown" style={{ marginRight: '6px' }}></i> Master Administrator & Systems Director</>
                ) : isAdmin ? (
                  <><i className={`fas ${roleMeta.badgeIcon}`} style={{ marginRight: '6px' }}></i> {roleMeta.designation}</>
                ) : (
                  <><i className="fas fa-gem" style={{ marginRight: '6px' }}></i> Royal Privilege Member</>
                )}
              </span>
              {isAdmin && (
                <Link to="/admin" className="admin-portal-btn">
                  <i className="fas fa-tools"></i> Open Admin Command Center
                </Link>
              )}
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout} title="Sign Out of Account">
            <i className="fas fa-sign-out-alt"></i> Sign Out
          </button>
        </div>

        {/* Admin Designation & Official Credentials Card */}
        {isAdmin && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(230, 185, 126, 0.12) 0%, rgba(9, 0, 41, 0.8) 100%)',
            border: '1px solid rgba(230, 185, 126, 0.4)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '28px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#e6b97e', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {isMasterAdmin ? '👑 Official Administration Credentials' : '🛡️ Official Staff Credentials'}
                </span>
                <h3 style={{ margin: '4px 0 0', color: '#fff', fontFamily: 'serif', fontSize: '1.35rem' }}>
                  {roleMeta.title}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link
                  to="/admin"
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #e6b97e, #d4a060)',
                    color: '#0d0028',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-crown"></i> Launch Admin Console
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(186, 75, 95, 0.14)',
                    border: '1px solid rgba(186, 75, 95, 0.35)',
                    color: '#e89da9',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-power-off"></i> Sign Out
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#090029', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#a599c2', display: 'block', marginBottom: '4px' }}>Official Designation</span>
                <strong style={{ color: '#e6b97e', fontSize: '0.95rem' }}>
                  {roleMeta.designation}
                </strong>
              </div>
              <div style={{ background: '#090029', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#a599c2', display: 'block', marginBottom: '4px' }}>Governance Authority Level</span>
                <strong style={{ color: isMasterAdmin ? '#e6b97e' : '#f0dbbf', fontSize: '0.95rem' }}>
                  {roleMeta.authority}
                </strong>
              </div>
              <div style={{ background: '#090029', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#a599c2', display: 'block', marginBottom: '4px' }}>Assigned Division</span>
                <strong style={{ color: '#fff', fontSize: '0.95rem' }}>
                  {roleMeta.division}
                </strong>
              </div>
              <div style={{ background: '#090029', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#a599c2', display: 'block', marginBottom: '4px' }}>Session Security</span>
                <strong style={{ color: '#c6d9be', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fas fa-shield-alt"></i> 256-Bit Encrypted Session Active
                </strong>
              </div>
            </div>

            {/* Quick module links: ONLY display permitted modules */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: '#a599c2', display: 'block', marginBottom: '8px' }}>
                Authorized Administrative Access ({effectiveActivities.length} Modules):
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {effectiveActivities.includes('inventory') && (
                  <Link to="/admin" style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#e6b97e', textDecoration: 'none', fontSize: '0.8rem', border: '1px solid rgba(230,185,126,0.3)' }}>💎 Inventory Catalog</Link>
                )}
                {effectiveActivities.includes('orders') && (
                  <Link to="/admin" style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#e6b97e', textDecoration: 'none', fontSize: '0.8rem', border: '1px solid rgba(230,185,126,0.3)' }}>📦 Orders & Dispatch</Link>
                )}
                {effectiveActivities.includes('customers') && (
                  <Link to="/admin" style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#e6b97e', textDecoration: 'none', fontSize: '0.8rem', border: '1px solid rgba(230,185,126,0.3)' }}>👥 Customers Directory</Link>
                )}
                {effectiveActivities.includes('support') && (
                  <Link to="/admin" style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#e6b97e', textDecoration: 'none', fontSize: '0.8rem', border: '1px solid rgba(230,185,126,0.3)' }}>🎧 Problem Solver Helpdesk</Link>
                )}
                {effectiveActivities.includes('reports') && (
                  <Link to="/admin" style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#e6b97e', textDecoration: 'none', fontSize: '0.8rem', border: '1px solid rgba(230,185,126,0.3)' }}>📊 Sales & Reports</Link>
                )}
                {effectiveActivities.includes('coupons') && (
                  <Link to="/admin" style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#e6b97e', textDecoration: 'none', fontSize: '0.8rem', border: '1px solid rgba(230,185,126,0.3)' }}>🏷️ Store Offers</Link>
                )}
                {isMasterAdmin && (
                  <Link to="/admin" style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(230,185,126,0.15)', color: '#e6b97e', textDecoration: 'none', fontSize: '0.8rem', border: '1px solid #e6b97e', fontWeight: 'bold' }}>👑 Admin Staff Management</Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs navigation */}
        <div className="profile-tabs">
          {isAdmin && (
            <button
              className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <i className="fas fa-user-shield"></i> Administration Privileges
            </button>
          )}
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="fas fa-box-open"></i> {isAdmin ? 'Personal Purchases' : 'Order History'} ({orders.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <i className="fas fa-id-card"></i> Account Details
          </button>
        </div>

        {/* Tab 0: Admin Privileges Tab */}
        {activeTab === 'admin' && isAdmin && (
          <div className="tab-content" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '28px', border: '1px solid rgba(230,185,126,0.3)' }}>
            <h3 style={{ color: '#e6b97e', margin: '0 0 8px', fontFamily: 'serif', fontSize: '1.3rem' }}>
              <i className={`fas ${roleMeta.badgeIcon}`} style={{ marginRight: '8px' }}></i>
              {isMasterAdmin ? 'Master Administrator Privileges' : `${roleMeta.designation} Privileges`}
            </h3>
            <p style={{ color: '#c4b8e2', fontSize: '0.9rem', marginBottom: '20px' }}>
              {isMasterAdmin
                ? 'Your Master Administrator credentials have full governance authority across all catalog, orders, analytics, and administrator permissions.'
                : `Your administrator account is verified with operational scope granted for: ${effectiveActivities.join(', ')}.`}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {effectiveActivities.includes('inventory') && (
                <div style={{ background: '#090029', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: '#fff', margin: '0 0 6px', fontSize: '0.95rem' }}><i className="fas fa-gem" style={{ color: '#e6b97e', marginRight: '6px' }}></i> Inventory Management</h4>
                  <p style={{ color: '#a599c2', fontSize: '0.82rem', margin: 0 }}>Add, edit, remove products, modify gold purity and live stock levels.</p>
                </div>
              )}
              {effectiveActivities.includes('orders') && (
                <div style={{ background: '#090029', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: '#fff', margin: '0 0 6px', fontSize: '0.95rem' }}><i className="fas fa-truck-loading" style={{ color: '#e6b97e', marginRight: '6px' }}></i> Order Operations</h4>
                  <p style={{ color: '#a599c2', fontSize: '0.82rem', margin: 0 }}>Update order statuses to In Armored Transit, Delivered, or Cancelled with refund tracking.</p>
                </div>
              )}
              {effectiveActivities.includes('customers') && (
                <div style={{ background: '#090029', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: '#fff', margin: '0 0 6px', fontSize: '0.95rem' }}><i className="fas fa-users" style={{ color: '#e6b97e', marginRight: '6px' }}></i> Customer Directory</h4>
                  <p style={{ color: '#a599c2', fontSize: '0.82rem', margin: 0 }}>View all registered clients, contact information, lifetime purchase amounts, and locations.</p>
                </div>
              )}
              {effectiveActivities.includes('support') && (
                <div style={{ background: '#090029', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: '#fff', margin: '0 0 6px', fontSize: '0.95rem' }}><i className="fas fa-headset" style={{ color: '#e6b97e', marginRight: '6px' }}></i> Problem Solver Helpdesk</h4>
                  <p style={{ color: '#a599c2', fontSize: '0.82rem', margin: 0 }}>Review customer inquiries, record resolution notes, and update ticket progress.</p>
                </div>
              )}
              {effectiveActivities.includes('reports') && (
                <div style={{ background: '#090029', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: '#fff', margin: '0 0 6px', fontSize: '0.95rem' }}><i className="fas fa-chart-line" style={{ color: '#e6b97e', marginRight: '6px' }}></i> Financial & Sales Analytics</h4>
                  <p style={{ color: '#a599c2', fontSize: '0.82rem', margin: 0 }}>Export CSV/PDF audits and review monthly revenue breakdowns.</p>
                </div>
              )}
              {effectiveActivities.includes('coupons') && (
                <div style={{ background: '#090029', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: '#fff', margin: '0 0 6px', fontSize: '0.95rem' }}><i className="fas fa-tags" style={{ color: '#e6b97e', marginRight: '6px' }}></i> Promotions & Coupons</h4>
                  <p style={{ color: '#a599c2', fontSize: '0.82rem', margin: 0 }}>Manage store discounts, promo codes, and special sales offers.</p>
                </div>
              )}
              {isMasterAdmin && (
                <div style={{ background: 'rgba(230, 185, 126, 0.08)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(230, 185, 126, 0.3)' }}>
                  <h4 style={{ color: '#e6b97e', margin: '0 0 6px', fontSize: '0.95rem' }}><i className="fas fa-user-shield" style={{ color: '#e6b97e', marginRight: '6px' }}></i> Administrator Management</h4>
                  <p style={{ color: '#c4b8e2', fontSize: '0.82rem', margin: 0 }}>Create new sub-administrators, override passcodes, and revoke personnel access.</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link
                to="/admin"
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #e6b97e, #d4a060)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0d0028',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="fas fa-crown"></i> Launch Admin Command Center
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(186, 75, 95, 0.14)',
                  border: '1px solid rgba(186, 75, 95, 0.35)',
                  borderRadius: '8px',
                  color: '#e89da9',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="fas fa-power-off"></i> Sign Out of Admin Account
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Order History */}
        {activeTab === 'orders' && (
          <div className="tab-content">
            {loading ? (
              <div className="profile-loading">
                <i className="fas fa-spinner fa-spin"></i> Loading order history...
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-orders">
                <div className="empty-icon"><i className="fas fa-box-open" style={{ color: '#e6b97e' }}></i></div>
                <h3>No Purchases Yet</h3>
                <p>Explore our royal fine jewellery collection and place your first order.</p>
                <Link to="/" className="shop-now-btn">Explore Collections</Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order, i) => (
                  <div key={order._id || i} className="order-card">
                    <div className="order-card-header">
                      <div>
                        <span className="invoice-label">Invoice Number</span>
                        <h4 className="invoice-no">{order.invoiceNo}</h4>
                        <span className="order-date">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="order-header-right">
                        {getStatusBadge(order.status)}
                        <span className="order-total-price">
                          ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Cancelled 7-Day Refund Notice */}
                    {order.status === 'Cancelled' && (
                      <div style={{ margin: '12px 0 6px', padding: '10px 14px', background: 'rgba(230, 185, 126, 0.12)', border: '1px solid rgba(230, 185, 126, 0.35)', borderRadius: '8px', color: '#e6b97e', fontSize: '0.85rem' }}>
                        <i className="fas fa-undo" style={{ marginRight: '6px' }}></i> <strong>Order Cancelled — 100% Full Refund Initiated:</strong> ₹{(order.totalAmount || 0).toLocaleString('en-IN')} will be credited to your original payment source within <strong>7 business days</strong>.
                      </div>
                    )}

                    {/* Delivered 7-Day Return / Replacement Request Status */}
                    {order.status === 'Delivered' && order.returnRequested && (
                      <div style={{ margin: '12px 0 6px', padding: '10px 14px', background: 'rgba(230, 185, 126, 0.12)', border: '1px solid rgba(230, 185, 126, 0.35)', borderRadius: '8px', color: '#e6b97e', fontSize: '0.85rem' }}>
                        <i className="fas fa-exchange-alt" style={{ marginRight: '6px' }}></i> <strong>7-Day {order.returnType || 'Return'} Request Registered:</strong> Status: <strong>{order.returnStatus || 'Pending Inspection'}</strong>. Armored courier pickup scheduled.
                      </div>
                    )}

                    <div className="order-items-preview">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          <img
                            src={item.image || '/photos/product1.jpg'}
                            alt={item.name}
                            onError={(e) => { e.target.src = '/photos/product1.jpg'; }}
                          />
                          <div className="order-item-details">
                            <h5>{item.name}</h5>
                            <p className="item-spec">{item.purity || 'Certified Gold'} | {item.weight || 'Standard Weight'}</p>
                            <p className="item-price">{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-footer">
                      <div className="delivery-addr-summary">
                        <i className="fas fa-map-marker-alt"></i> Delivery Address: <strong>{order.deliveryAddress}, {order.pincode}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            style={{ padding: '7px 12px', background: 'rgba(230,185,126,0.12)', border: '1px solid #e6b97e', borderRadius: '6px', color: '#e6b97e', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            <i className="fas fa-times" style={{ marginRight: '4px' }}></i> Cancel Order
                          </button>
                        )}

                        {order.status === 'Delivered' && !order.returnRequested && (
                          <>
                            <button
                              onClick={() => handleReturnRequest(order, 'Return')}
                              style={{ padding: '7px 12px', background: 'rgba(230,185,126,0.15)', border: '1px solid #e6b97e', borderRadius: '6px', color: '#e6b97e', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              <i className="fas fa-undo" style={{ marginRight: '4px' }}></i> Return & Refund
                            </button>
                            <button
                              onClick={() => handleReturnRequest(order, 'Exchange')}
                              style={{ padding: '7px 12px', background: 'rgba(230,185,126,0.15)', border: '1px solid #e6b97e', borderRadius: '6px', color: '#e6b97e', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              <i className="fas fa-exchange-alt" style={{ marginRight: '4px' }}></i> Request Exchange
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => exportInvoicePrintablePDF(order)}
                          style={{ padding: '7px 12px', background: 'rgba(230,185,126,0.12)', border: '1px solid #e6b97e', borderRadius: '6px', color: '#e6b97e', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          <i className="fas fa-file-pdf" style={{ marginRight: '4px' }}></i> Invoice PDF
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEmailOrder(order);
                            setEmailModalOpen(true);
                          }}
                          style={{ padding: '7px 12px', background: 'rgba(230,185,126,0.15)', border: '1px solid #e6b97e', borderRadius: '6px', color: '#e6b97e', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          <i className="fas fa-paper-plane" style={{ marginRight: '4px' }}></i> Email Receipt
                        </button>

                        <button className="view-inv-btn" onClick={() => setSelectedOrder(order)}>
                          <i className="fas fa-file-invoice"></i> View Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Account Details */}
        {activeTab === 'details' && (
          <div className="tab-content">
            <div className="account-details-card">
              <div className="card-header-with-edit">
                <h3><i className="fas fa-user-shield"></i> Royal Membership Profile</h3>
                <button className="edit-details-btn" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? <><i className="fas fa-times" style={{ marginRight: '4px' }}></i> Cancel</> : <><i className="fas fa-edit" style={{ marginRight: '4px' }}></i> Edit Profile Details</>}
                </button>
              </div>

              {saveSuccess && (
                <div className="profile-save-success">
                  {saveSuccess}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="edit-profile-form">
                  <div className="edit-form-grid">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Pincode *</label>
                      <input
                        type="text"
                        value={editPincode}
                        onChange={(e) => setEditPincode(e.target.value)}
                        maxLength={6}
                        required
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Insured Delivery Address *</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="save-profile-btn">
                    <i className="fas fa-save"></i> Save Profile Details
                  </button>
                </form>
              ) : (
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Full Name</label>
                    <p>{user?.name || editName || 'Not Set'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Primary Email</label>
                    <p>{user?.email || editEmail || 'Not Set'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Phone Contact</label>
                    <p>{user?.phone || editPhone || 'Not Set'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Account Role</label>
                    <p className="role-text">{user?.role === 'admin' ? 'Store Administrator' : 'Privilege Member'}</p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Insured Shipping Address</label>
                    <p>{user?.address || editAddress || 'No address saved yet'}{ (user?.pincode || editPincode) ? `, Pincode: ${user?.pincode || editPincode}` : ''}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Invoice Detail Modal */}
      {selectedOrder && (
        <div className="profile-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedOrder(null)}>✕</button>
            <div className="modal-inv-header">
              <h3>Jewel Street Certified Invoice</h3>
              <p>{selectedOrder.invoiceNo}</p>
            </div>

            <div className="modal-inv-body">
              <p><strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerEmail})</p>
              <p><strong>Shipping To:</strong> {selectedOrder.deliveryAddress}, {selectedOrder.pincode}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>

              <h4 style={{ color: '#e6b97e', marginTop: '16px' }}>Purchased Items</h4>
              <div className="modal-items-list">
                {(selectedOrder.items || []).map((it, idx) => (
                  <div key={idx} className="modal-item-row">
                    <span>{it.name} ({it.purity || '22K'})</span>
                    <span style={{ color: '#e6b97e' }}>{it.price}</span>
                  </div>
                ))}
              </div>

              <div className="modal-inv-total">
                <span>Grand Total Paid:</span>
                <span className="total-val">₹{(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <EmailReportModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        reportType="order"
        reportData={selectedEmailOrder}
        defaultEmail={user?.email || selectedEmailOrder?.customerEmail || ''}
      />

    </div>
  );
};

export default Profile;
