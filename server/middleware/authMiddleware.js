const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'jewel_street_secret_jwt_key_2026';
const MASTER_ADMIN_LIST = ['deevyanshu.sahu@gmail.com', 'deevyanshusahu@gmail.com', 'admin@jewelstreet.com'];

const ALL_ACTIVITIES = ['inventory', 'orders', 'customers', 'support', 'reports', 'coupons', 'admins'];

const isMasterAdminEmail = (email) => {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  const envMasters = (process.env.MASTER_ADMIN_EMAILS || '').toLowerCase().split(',').map(e => e.trim());
  return MASTER_ADMIN_LIST.includes(clean) || envMasters.includes(clean);
};

const getFallbackAdmins = () => {
  try {
    const p = path.join(__dirname, '../data/admins.json');
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch (e) {}
  return [];
};

const resolveAdminPrivileges = async (emailOrId) => {
  if (!emailOrId) return null;
  const clean = String(emailOrId).toLowerCase().trim();

  // 1. Try MongoDB Admin collection
  let adminDoc = null;
  if (mongoose.connection.readyState === 1) {
    try {
      adminDoc = await Admin.findOne({
        $or: [{ email: clean }, { adminId: clean }]
      }).lean();
    } catch (e) {}
  }

  // 2. Try in-memory / JSON fallback
  if (!adminDoc) {
    const fallbackList = getFallbackAdmins();
    adminDoc = fallbackList.find(a => (a.email && a.email.toLowerCase() === clean) || a.id === clean || a.adminId === clean);
  }

  const isMaster = isMasterAdminEmail(clean) || (adminDoc && adminDoc.role === 'master_admin') || clean === 'admin_deevyanshu_2026';

  if (isMaster) {
    const masterName = (adminDoc && adminDoc.name) || (clean.split('@')[0]) || 'Master Administrator';
    return {
      _id: (adminDoc && (adminDoc.adminId || adminDoc.id)) || 'admin_master_root',
      name: masterName,
      email: (adminDoc && adminDoc.email) || clean,
      role: 'master_admin',
      assignedRole: 'master_admin',
      allowedActivities: ALL_ACTIVITIES,
      isMaster: true,
    };
  }

  if (adminDoc) {
    const allowed = Array.isArray(adminDoc.allowedActivities) && adminDoc.allowedActivities.length > 0
      ? adminDoc.allowedActivities
      : ['inventory'];
    return {
      _id: adminDoc.adminId || adminDoc.id,
      name: adminDoc.name || 'Store Administrator',
      email: adminDoc.email,
      role: 'admin',
      assignedRole: adminDoc.assignedRole || 'inventory_manager',
      allowedActivities: allowed,
      isMaster: false,
    };
  }

  return null;
};

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // If no token but x-admin-email header is present, populate req.user for internal admin checks
    const headerEmail = req.headers['x-admin-email'];
    if (headerEmail) {
      const adminPrivs = await resolveAdminPrivileges(headerEmail);
      if (adminPrivs) {
        req.user = adminPrivs;
        return next();
      }
    }
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if admin token
    if (decoded.id && (String(decoded.id).includes('admin') || decoded.id === 'admin_deevyanshu_2026')) {
      const adminPrivs = await resolveAdminPrivileges(decoded.id);
      if (adminPrivs) {
        req.user = adminPrivs;
        return next();
      }
    }

    // Try MongoDB User
    if (mongoose.connection.readyState === 1) {
      const dbUser = await User.findById(decoded.id).select('-password').catch(() => null);
      if (dbUser) {
        const adminPrivs = await resolveAdminPrivileges(dbUser.email);
        if (adminPrivs) {
          req.user = { ...dbUser.toObject(), ...adminPrivs };
        } else {
          req.user = dbUser;
        }
        return next();
      }
    }

    // Check fallback by decoded id as email or id
    const adminPrivs = await resolveAdminPrivileges(decoded.id);
    if (adminPrivs) {
      req.user = adminPrivs;
      return next();
    }

    req.user = {
      _id: decoded.id,
      name: 'Valued Client',
      email: 'customer@jewelstreet.com',
      role: 'customer',
      allowedActivities: []
    };
    next();
  } catch (error) {
    // Check if x-admin-email fallback can authenticate
    const headerEmail = req.headers['x-admin-email'];
    if (headerEmail) {
      const adminPrivs = await resolveAdminPrivileges(headerEmail);
      if (adminPrivs) {
        req.user = adminPrivs;
        return next();
      }
    }
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

const adminOnly = async (req, res, next) => {
  const email = (req.user && req.user.email) || req.headers['x-admin-email'] || req.body.requesterEmail || '';
  const adminPrivs = await resolveAdminPrivileges(email);
  if (adminPrivs) {
    req.user = { ...req.user, ...adminPrivs };
    return next();
  }
  if (req.user && (req.user.role === 'admin' || req.user.role === 'master_admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Admin privileges required' });
};

// Activity-specific authorization middleware
const requireActivity = (activityName) => {
  return async (req, res, next) => {
    const email = (req.user && req.user.email) || req.headers['x-admin-email'] || req.body.requesterEmail || req.query.requesterEmail || '';
    let adminPrivs = await resolveAdminPrivileges(email);

    if (!adminPrivs && req.user && (req.user.role === 'admin' || req.user.role === 'master_admin')) {
      adminPrivs = req.user;
    }

    if (!adminPrivs) {
      return res.status(403).json({
        message: `Access Denied: Administrator privileges required for "${activityName}".`
      });
    }

    req.user = { ...req.user, ...adminPrivs };

    // Master Admin always has complete access to everything
    if (adminPrivs.isMaster || adminPrivs.role === 'master_admin') {
      return next();
    }

    // Sub-admins must have the specific activity in their allowedActivities list
    if (Array.isArray(adminPrivs.allowedActivities) && adminPrivs.allowedActivities.includes(activityName)) {
      return next();
    }

    return res.status(403).json({
      message: `Access Denied: Your administrator role (${adminPrivs.assignedRole || 'Store Admin'}) is not authorized to perform "${activityName}" activities. Please contact the Master Administrator.`,
      requiredActivity: activityName,
      allowedActivities: adminPrivs.allowedActivities || []
    });
  };
};

module.exports = {
  protect,
  adminOnly,
  requireActivity,
  resolveAdminPrivileges,
  isMasterAdminEmail,
  ALL_ACTIVITIES
};
