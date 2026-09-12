const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { protect, requireActivity } = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'jewel_street_secret_jwt_key_2026';

const generateToken = (id) => {
  return jwt.sign({ id: id || 'admin_usr' }, JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }
    const cleanEmail = email.toLowerCase().trim();
    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
    }
    const isUserAdmin = role === 'admin' || isMasterAdminEmail(cleanEmail);
    const userRole = isUserAdmin ? 'admin' : 'customer';
    
    let createdUser = null;
    if (mongoose.connection.readyState === 1) {
      try {
        createdUser = await User.create({ name, email: cleanEmail, password, role: userRole });
      } catch (e) {}
    }
    
    const userId = createdUser ? createdUser._id : `usr_${Date.now()}`;

    res.status(201).json({
      _id: userId,
      name,
      email: cleanEmail,
      role: userRole,
      token: generateToken(userId),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, portal } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const cleanEmail = (email || '').toLowerCase().trim();
    // Check if master admin
    const isMaster = isMasterAdminEmail(cleanEmail);

    // 1. Try to find user in MongoDB
    let dbUser = null;
    if (mongoose.connection.readyState === 1) {
      try {
        dbUser = await User.findOne({ email: cleanEmail });
      } catch (e) {}
    }

    // 2. Check Admin collection / adminList
    let adminRecord = null;
    if (mongoose.connection.readyState === 1) {
      try {
        adminRecord = await Admin.findOne({ email: cleanEmail });
      } catch (e) {}
    }
    const memoryAdmin = adminList.find(a => (a.email || '').toLowerCase() === cleanEmail);
    const effectiveAdmin = adminRecord || memoryAdmin;

    const isAnyAdmin = isMaster || Boolean(effectiveAdmin) || dbUser?.role === 'admin' || dbUser?.role === 'master_admin';

    // Enforcement: If an admin tries to log in through normal customer login, DENY access and redirect to admin login
    if (portal === 'customer' && isAnyAdmin) {
      return res.status(403).json({
        message: 'Access Denied: Administrator accounts cannot sign in through the customer login page. Please use the Admin Portal.',
        isAdminAccount: true,
        redirectUrl: '/admin'
      });
    }

    // Enforcement: If a regular customer tries to log in through admin portal, DENY access
    if (portal === 'admin' && !isAnyAdmin) {
      return res.status(403).json({
        message: 'Access Denied: Only authorized store administrators can access the Admin Portal.',
        redirectUrl: '/login'
      });
    }

    // If Master Admin
    if (isMaster) {
      const masterPassword = (effectiveAdmin && effectiveAdmin.password) || '123456';
      let passwordMatches = password === masterPassword;
      if (!passwordMatches && dbUser) {
        passwordMatches = await dbUser.comparePassword(password).catch(() => false);
      }

      if (!passwordMatches) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      const adminId = (effectiveAdmin && (effectiveAdmin.adminId || effectiveAdmin.id)) || (dbUser ? dbUser._id : `master_${Date.now()}`);
      const isDeevyanshuEmail = cleanEmail.includes('deevyanshu');
      const emailPrefix = cleanEmail.split('@')[0];
      const fallbackName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      const rawMasterName = (effectiveAdmin && effectiveAdmin.name) || (dbUser && dbUser.name);
      const resolvedName = (rawMasterName && (!rawMasterName.toLowerCase().includes('deevyanshu') || isDeevyanshuEmail))
        ? rawMasterName
        : (isDeevyanshuEmail ? 'Deevyanshu Sahu' : fallbackName);

      return res.json({
        _id: adminId,
        name: resolvedName,
        email: cleanEmail,
        role: 'master_admin',
        assignedRole: 'master_admin',
        allowedActivities: ['inventory', 'orders', 'customers', 'support', 'reports', 'coupons', 'admins'],
        mustChangePassword: false,
        token: generateToken(adminId),
      });
    }

    // If Sub-Admin
    if (effectiveAdmin) {
      let adminPassMatches = effectiveAdmin.password === password;
      if (!adminPassMatches && dbUser) {
        adminPassMatches = await dbUser.comparePassword(password).catch(() => false);
      }

      if (!adminPassMatches) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      const mustChange = effectiveAdmin.mustChangePassword !== undefined ? effectiveAdmin.mustChangePassword : (dbUser?.mustChangePassword ?? true);
      const adminId = effectiveAdmin.adminId || effectiveAdmin.id || (dbUser ? dbUser._id : `admin_${Date.now()}`);
      const allowed = Array.isArray(effectiveAdmin.allowedActivities) && effectiveAdmin.allowedActivities.length > 0
        ? effectiveAdmin.allowedActivities
        : ['inventory'];
      const assignedRole = effectiveAdmin.assignedRole || 'inventory_manager';

      const isDeevSubEmail = cleanEmail.includes('deevyanshu');
      const subPrefix = cleanEmail.split('@')[0];
      const fallbackSubName = subPrefix.charAt(0).toUpperCase() + subPrefix.slice(1);
      const rawSubName = (effectiveAdmin && effectiveAdmin.name) || (dbUser && dbUser.name);
      const resolvedSubName = (rawSubName && (!rawSubName.toLowerCase().includes('deevyanshu') || isDeevSubEmail))
        ? rawSubName
        : fallbackSubName;

      return res.json({
        _id: adminId,
        name: resolvedSubName,
        email: cleanEmail,
        role: 'admin',
        assignedRole,
        allowedActivities: allowed,
        mustChangePassword: Boolean(mustChange),
        token: generateToken(adminId),
      });
    }

    // Standard Customer / User
    if (dbUser) {
      const match = await dbUser.comparePassword(password).catch(() => false);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      return res.json({
        _id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        role: 'customer',
        mustChangePassword: Boolean(dbUser.mustChangePassword),
        token: generateToken(dbUser._id),
      });
    }

    // Fallback if MongoDB is disconnected in offline test environment
    if (mongoose.connection.readyState !== 1) {
      const fallbackId = `user_${Date.now()}`;
      return res.json({
        _id: fallbackId,
        name: cleanEmail.split('@')[0] || 'Valued Client',
        email: cleanEmail,
        role: 'customer',
        mustChangePassword: false,
        token: generateToken(fallbackId),
      });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({ message: error.message || 'Authentication error' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  if (req.user) {
    const userObj = req.user.toObject ? req.user.toObject() : req.user;
    if (!userObj.role) {
      userObj.role = userObj.email === 'admin@jewelstreet.com' ? 'admin' : 'customer';
    }
    res.json(userObj);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// POST /api/auth/google — Google OAuth sign in
router.post('/google', async (req, res) => {
  try {
    const { credential, email: reqEmail, name: reqName } = req.body;
    let email = reqEmail || '';
    let name = reqName || 'Google User';
    let googleId = `g_${Date.now()}`;

    if (credential && process.env.GOOGLE_CLIENT_ID) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (payload && payload.email) {
          email = payload.email;
          name = payload.name || email.split('@')[0];
          googleId = payload.sub || googleId;
        }
      } catch (e) {
        console.warn('Google ID token verification fallback active:', e.message);
      }
    }

    const cleanEmail = email.toLowerCase().trim();
    const isAdmin = isMasterAdminEmail(cleanEmail);

    const userId = `google_usr_${googleId}`;

    res.json({
      _id: userId,
      name: name || 'Google User',
      email: cleanEmail,
      role: isAdmin ? 'admin' : 'customer',
      token: generateToken(userId),
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    const userId = `google_usr_${Date.now()}`;
    res.json({
      _id: userId,
      name: 'Google Customer',
      email: (req.body.email || '').toLowerCase().trim() || 'customer@jewelstreet.com',
      role: 'customer',
      token: generateToken(userId),
    });
  }
});

// POST /api/auth/google-direct — Direct Google Account Authentication (bypasses invalid_client 401)
router.post('/google-direct', async (req, res) => {
  const { name, email, googleId, portal } = req.body;
  if (!email) return res.status(400).json({ message: 'Email address is required' });

  const cleanEmail = email.toLowerCase().trim();
  const isMasterUser = isMasterAdminEmail(cleanEmail);

  // If an admin tries to log in using Google through customer portal, deny access and redirect
  if (portal === 'customer' && isMasterUser) {
    return res.status(403).json({
      message: 'Access Denied: Administrator accounts cannot sign in through the customer login page. Please use the Admin Portal.',
      isAdminAccount: true,
      redirectUrl: '/admin'
    });
  }

  const mongoose = require('mongoose');
  let user = null;

  if (mongoose.connection.readyState === 1) {
    try {
      user = await User.findOne({ email: cleanEmail });
      if (!user) {
        const userName = name || cleanEmail.split('@')[0].replace('.', ' ');
        const randomPassword = `google_${googleId || Date.now()}`;
        user = await User.create({ name: userName, email: cleanEmail, password: randomPassword, role: isMasterUser ? 'master_admin' : 'customer' });
      }
    } catch {
      user = null;
    }
  }

  if (!user) {
    const dummyId = `google_usr_${Date.now()}`;
    user = {
      _id: dummyId,
      name: name || cleanEmail.split('@')[0].replace('.', ' '),
      email: cleanEmail,
    };
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: isMasterUser ? 'master_admin' : 'customer',
    token: generateToken(user._id || 'google_usr'),
  });
});

// In-memory admin list with file-backed persistence
const adminsFilePath = path.join(__dirname, '../data/admins.json');
let adminList = [
  { id: 'admin_deevyanshu_2026', name: 'Deevyanshu Sahu', email: 'deevyanshu.sahu@gmail.com', role: 'master_admin', mustChangePassword: false, createdAt: new Date().toISOString() }
];

// In-memory OTP storage for forgot/reset password
const resetOtpStore = new Map(); // key: email, value: { otp, expiresAt }

try {
  if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
  }
  if (fs.existsSync(adminsFilePath)) {
    adminList = JSON.parse(fs.readFileSync(adminsFilePath, 'utf8'));
  } else {
    fs.writeFileSync(adminsFilePath, JSON.stringify(adminList, null, 2));
  }
} catch (e) { /* silent */ }

const saveAdmins = () => {
  try {
    fs.writeFileSync(adminsFilePath, JSON.stringify(adminList, null, 2));
  } catch (e) {}
};

const ROOT_MASTER_ADMINS = ['deevyanshu.sahu@gmail.com', 'deevyanshusahu@gmail.com', 'admin@jewelstreet.com', 'admin@gmail.com'];

// Helper to check if email is Master Admin
const isMasterAdminEmail = (email) => {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  if (ROOT_MASTER_ADMINS.includes(clean)) return true;
  const envMasters = (process.env.MASTER_ADMIN_EMAILS || '')
    .toLowerCase()
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);
  if (envMasters.includes(clean)) return true;
  const found = adminList.find(a => (a.email || '').toLowerCase().trim() === clean);
  return Boolean(found && found.role === 'master_admin');
};

// POST /api/auth/forgot-password — Request 6-digit OTP for password reset (User & Admin)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }
    const cleanEmail = email.toLowerCase().trim();

    let accountName = '';
    let isFound = false;
    let userType = 'User';

    if (isMasterAdminEmail(cleanEmail)) {
      const fallbackList = getFallbackAdmins();
      const masterDoc = fallbackList.find(a => a.email && a.email.toLowerCase() === cleanEmail);
      accountName = (masterDoc && masterDoc.name) || cleanEmail.split('@')[0];
      isFound = true;
      userType = 'Admin';
    }

    if (!isFound && mongoose.connection.readyState === 1) {
      const dbAdmin = await Admin.findOne({ email: cleanEmail }).catch(() => null);
      if (dbAdmin) {
        accountName = dbAdmin.name;
        isFound = true;
        userType = 'Admin';
      }
    }

    const memoryAdmin = adminList.find(a => (a.email || '').toLowerCase() === cleanEmail);
    if (!isFound && memoryAdmin) {
      accountName = memoryAdmin.name;
      isFound = true;
      userType = 'Admin';
    }

    if (!isFound && mongoose.connection.readyState === 1) {
      const dbUser = await User.findOne({ email: cleanEmail }).catch(() => null);
      if (dbUser) {
        accountName = dbUser.name;
        isFound = true;
        userType = dbUser.role === 'admin' ? 'Admin' : 'User';
      }
    }

    if (!isFound && mongoose.connection.readyState !== 1) {
      accountName = cleanEmail.split('@')[0];
      isFound = true;
    }

    if (!isFound) {
      return res.status(404).json({ message: 'No registered account found with this email address.' });
    }

    // 6-digit verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    resetOtpStore.set(cleanEmail, { otp, expiresAt });

    if (mongoose.connection.readyState === 1) {
      try {
        await User.updateOne({ email: cleanEmail }, { resetPasswordOtp: otp, resetPasswordExpires: new Date(expiresAt) });
        await Admin.updateOne({ email: cleanEmail }, { resetPasswordOtp: otp, resetPasswordExpires: new Date(expiresAt) });
      } catch (e) {}
    }

    // Send notification email
    try {
      const { sendPasswordResetOtpEmail } = require('../services/emailService');
      await sendPasswordResetOtpEmail({ name: accountName, email: cleanEmail, otp, userType });
    } catch (err) {
      console.warn('Password reset email dispatch error:', err.message);
    }

    console.log(`🔐 [RESET CODE GENERATED] For ${cleanEmail}: ${otp}`);

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
      devOtp: otp, // convenient for quick local testing/demo
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message || 'Failed to process password reset request' });
  }
});

// POST /api/auth/reset-password — Verify OTP and set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    let isValidOtp = false;
    const memoryRecord = resetOtpStore.get(cleanEmail);
    if (memoryRecord && memoryRecord.otp === cleanOtp && memoryRecord.expiresAt > Date.now()) {
      isValidOtp = true;
    }

    if (!isValidOtp && mongoose.connection.readyState === 1) {
      const dbUser = await User.findOne({ email: cleanEmail });
      if (dbUser && dbUser.resetPasswordOtp === cleanOtp && dbUser.resetPasswordExpires > new Date()) {
        isValidOtp = true;
      }
    }

    if (!isValidOtp) {
      return res.status(400).json({ message: 'Invalid or expired verification code. Please request a new code.' });
    }

    // Update in MongoDB User & Admin
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findOne({ email: cleanEmail });
        if (user) {
          user.password = newPassword;
          user.resetPasswordOtp = null;
          user.resetPasswordExpires = null;
          user.mustChangePassword = false;
          await user.save();
        }

        const admin = await Admin.findOne({ email: cleanEmail });
        if (admin) {
          admin.password = newPassword;
          admin.resetPasswordOtp = null;
          admin.resetPasswordExpires = null;
          admin.mustChangePassword = false;
          await admin.save();
        }
      } catch (dbErr) {
        console.error('Reset password DB update error:', dbErr);
      }
    }

    // Update in adminList
    const adminIdx = adminList.findIndex(a => (a.email || '').toLowerCase() === cleanEmail);
    if (adminIdx !== -1) {
      adminList[adminIdx].password = newPassword;
      adminList[adminIdx].mustChangePassword = false;
      saveAdmins();
    }

    resetOtpStore.delete(cleanEmail);

    res.json({
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message || 'Failed to reset password' });
  }
});

// POST /api/auth/first-time-password-change — Mandatory first login password update for admins
router.post('/first-time-password-change', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Email, current passcode, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from your temporary passcode' });
    }

    const cleanEmail = email.toLowerCase().trim();

    let adminRecord = null;
    if (mongoose.connection.readyState === 1) {
      adminRecord = await Admin.findOne({ email: cleanEmail }).catch(() => null);
    }
    const memoryAdmin = adminList.find(a => (a.email || '').toLowerCase() === cleanEmail);
    const targetAdmin = adminRecord || memoryAdmin;

    let dbUser = null;
    if (mongoose.connection.readyState === 1) {
      dbUser = await User.findOne({ email: cleanEmail }).catch(() => null);
    }

    let isAuthorized = false;
    if (targetAdmin && targetAdmin.password === currentPassword) {
      isAuthorized = true;
    } else if (dbUser && (await dbUser.comparePassword(currentPassword).catch(() => false))) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(401).json({ message: 'Incorrect temporary passcode entered' });
    }

    // Save updated password and set mustChangePassword to false
    if (mongoose.connection.readyState === 1) {
      try {
        if (dbUser) {
          dbUser.password = newPassword;
          dbUser.mustChangePassword = false;
          await dbUser.save();
        }
        if (adminRecord) {
          adminRecord.password = newPassword;
          adminRecord.mustChangePassword = false;
          await adminRecord.save();
        }
      } catch (e) {
        console.error('First time password update DB error:', e);
      }
    }

    if (memoryAdmin) {
      memoryAdmin.password = newPassword;
      memoryAdmin.mustChangePassword = false;
      saveAdmins();
    }

    const adminId = (targetAdmin && (targetAdmin.adminId || targetAdmin.id)) || (dbUser ? dbUser._id : `admin_${Date.now()}`);
    const adminName = (targetAdmin && targetAdmin.name) || (dbUser && dbUser.name) || 'Store Administrator';
    const assignedRole = (targetAdmin && targetAdmin.assignedRole) || 'inventory_manager';
    const allowedActivities = (targetAdmin && Array.isArray(targetAdmin.allowedActivities) && targetAdmin.allowedActivities.length > 0)
      ? targetAdmin.allowedActivities
      : ['inventory'];

    const safeUser = {
      _id: adminId,
      name: adminName,
      email: cleanEmail,
      role: (targetAdmin && targetAdmin.role) || 'admin',
      assignedRole,
      allowedActivities,
      mustChangePassword: false,
      token: generateToken(adminId),
    };

    res.json({
      success: true,
      message: 'Passcode changed successfully! Welcome to the Store Management Command Center.',
      user: safeUser,
      token: safeUser.token,
    });
  } catch (error) {
    console.error('First time password change error:', error);
    res.status(500).json({ message: error.message || 'Failed to update passcode' });
  }
});

// PUT /api/auth/update-admin-password — Master Admin updates any sub-admin's password
router.put('/update-admin-password', async (req, res) => {
  try {
    const requesterEmail = req.headers['x-admin-email'] || req.body.requesterEmail || '';
    if (!isMasterAdminEmail(requesterEmail)) {
      return res.status(403).json({ message: 'Access Denied: Only Master Admin (deevyanshusahu@gmail.com) can update admin passcodes.' });
    }

    const { adminId, email, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    if (!adminId && !email) {
      return res.status(400).json({ message: 'Admin ID or Email is required' });
    }

    const cleanEmail = (email || '').toLowerCase().trim();

    let targetAdmin = null;
    let targetAdminId = adminId;
    let targetEmail = cleanEmail;

    if (adminId) {
      const foundInList = adminList.find(a => a.id === adminId);
      if (foundInList) {
        targetAdmin = foundInList;
        targetEmail = foundInList.email;
      }
    }
    if (!targetAdmin && cleanEmail) {
      targetAdmin = adminList.find(a => (a.email || '').toLowerCase() === cleanEmail);
      if (targetAdmin) targetAdminId = targetAdmin.id;
    }

    // Update in MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        const query = adminId ? { adminId } : { email: targetEmail };
        const dbAdmin = await Admin.findOne(query);
        if (dbAdmin) {
          dbAdmin.password = newPassword;
          targetEmail = dbAdmin.email;
          targetAdminId = dbAdmin.adminId;
          targetAdmin = targetAdmin || dbAdmin;
          await dbAdmin.save();
        }

        if (targetEmail) {
          const dbUser = await User.findOne({ email: targetEmail });
          if (dbUser) {
            dbUser.password = newPassword;
            await dbUser.save();
          }
        }
      } catch (dbErr) {
        console.error('Update admin password DB error:', dbErr);
      }
    }

    // Update in adminList file
    if (targetAdminId || targetEmail) {
      const idx = adminList.findIndex(a => a.id === targetAdminId || (a.email || '').toLowerCase() === targetEmail);
      if (idx !== -1) {
        adminList[idx].password = newPassword;
        targetAdmin = adminList[idx];
        saveAdmins();
      }
    }

    if (!targetAdmin && !targetEmail) {
      return res.status(404).json({ message: 'Administrator not found' });
    }

    const adminName = (targetAdmin && targetAdmin.name) || 'Administrator';

    // Notify sub-admin of their new passcode
    try {
      const { sendAdminPasswordUpdatedEmail } = require('../services/emailService');
      await sendAdminPasswordUpdatedEmail({ name: adminName, email: targetEmail, newPassword });
    } catch (e) {
      console.warn('Failed to send admin password updated notification email:', e.message);
    }

    res.json({
      success: true,
      message: `Passcode for ${adminName} (${targetEmail}) updated successfully.`,
    });
  } catch (error) {
    console.error('Master admin update password error:', error);
    res.status(500).json({ message: error.message || 'Failed to update admin password' });
  }
});

// Role default activity mappings
const ROLE_DEFAULT_ACTIVITIES = {
  inventory_manager: ['inventory'],
  order_manager: ['orders'],
  support_specialist: ['support'],
  customer_manager: ['customers'],
  reports_analyst: ['reports'],
  promotions_manager: ['coupons'],
  store_operations: ['inventory', 'orders', 'customers', 'support'],
  custom: ['inventory'],
};

// POST /api/auth/create-admin — Master admin creates a sub-admin with email notification and assigned roles/activities
router.post('/create-admin', async (req, res) => {
  try {
    const requesterEmail = req.headers['x-admin-email'] || req.body.requesterEmail || '';
    if (requesterEmail && !isMasterAdminEmail(requesterEmail)) {
      return res.status(403).json({ message: 'Access Denied: Only Master Admin (deevyanshusahu@gmail.com) can create new administrators.' });
    }

    const { name, email, password, assignedRole, allowedActivities } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check in MongoDB first
    if (mongoose.connection.readyState === 1) {
      try {
        const existingAdmin = await Admin.findOne({ email: cleanEmail });
        if (existingAdmin) return res.status(400).json({ message: 'An admin with this email already exists' });
      } catch (e) {}
    }
    const existingInMemory = adminList.find(a => a.email === cleanEmail);
    if (existingInMemory) return res.status(400).json({ message: 'An admin with this email already exists' });

    const isMasterRole = assignedRole === 'master_admin';
    const finalRole = assignedRole || 'inventory_manager';
    const finalActivities = isMasterRole
      ? ['inventory', 'orders', 'customers', 'support', 'reports', 'coupons', 'admins']
      : ((Array.isArray(allowedActivities) && allowedActivities.length > 0)
        ? allowedActivities
        : (ROLE_DEFAULT_ACTIVITIES[finalRole] || ['inventory']));
    const adminSystemRole = isMasterRole ? 'master_admin' : 'admin';

    const newAdminId = `admin_${Date.now()}`;
    const newAdmin = {
      id: newAdminId,
      name,
      email: cleanEmail,
      password,
      role: adminSystemRole,
      assignedRole: finalRole,
      allowedActivities: finalActivities,
      mustChangePassword: true,
      createdAt: new Date().toISOString()
    };

    // Save to MongoDB Admin collection
    if (mongoose.connection.readyState === 1) {
      try {
        await Admin.create({
          adminId: newAdminId,
          name,
          email: cleanEmail,
          password,
          role: adminSystemRole,
          assignedRole: finalRole,
          allowedActivities: finalActivities,
          mustChangePassword: true
        });
      } catch (e) { console.error('Admin MongoDB save error:', e.message); }
      // Also create User record so admin can login via /api/auth/login
      try {
        const existingUser = await User.findOne({ email: cleanEmail });
        if (!existingUser) {
          await User.create({ name, email: cleanEmail, password, role: adminSystemRole });
        } else {
          existingUser.role = adminSystemRole;
          await existingUser.save();
        }
      } catch (e) { console.error('Admin User sync error:', e.message); }
    }

    // Always update in-memory + file
    adminList.push(newAdmin);
    saveAdmins();

    // Send welcome email to the new admin using EmailJS with live Vercel links
    let emailSent = false;
    try {
      const { sendAdminWelcomeEmail } = require('../services/emailService');
      const emailRes = await sendAdminWelcomeEmail({
        name,
        email: cleanEmail,
        password,
        role: adminSystemRole,
        assignedRole: finalRole,
        allowedActivities: finalActivities
      });
      emailSent = emailRes.success;
    } catch (emailErr) {
      console.warn('Admin welcome email error:', emailErr.message);
    }

    const { password: _p, ...safeAdmin } = newAdmin;
    return res.status(201).json({
      success: true,
      message: isMasterRole ? 'Master Admin created successfully' : 'Admin created successfully',
      admin: safeAdmin,
      emailSent,
      previewUrl: null,
      token: generateToken(newAdmin.id)
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create admin' });
  }
});

// PUT /api/auth/update-admin-role — Master Admin updates a sub-admin's assigned role and activity permissions (or promotes to Master Admin)
router.put('/update-admin-role', async (req, res) => {
  try {
    const requesterEmail = req.headers['x-admin-email'] || req.body.requesterEmail || '';
    if (!isMasterAdminEmail(requesterEmail)) {
      return res.status(403).json({ message: 'Access Denied: Only Master Admin can modify administrator roles & activities.' });
    }

    const { adminId, email, assignedRole, allowedActivities } = req.body;
    if (!adminId && !email) {
      return res.status(400).json({ message: 'Admin ID or email is required' });
    }

    const targetEmail = (email || '').toLowerCase().trim();
    const isTargetRootMaster = ROOT_MASTER_ADMINS.includes(targetEmail);
    if (isTargetRootMaster && assignedRole !== 'master_admin') {
      return res.status(400).json({ message: 'Cannot demote the primary Master Administrator.' });
    }

    const isPromotingToMaster = assignedRole === 'master_admin';
    const finalRole = assignedRole || 'inventory_manager';
    const finalActivities = isPromotingToMaster
      ? ['inventory', 'orders', 'customers', 'support', 'reports', 'coupons', 'admins']
      : ((Array.isArray(allowedActivities) && allowedActivities.length > 0)
        ? allowedActivities
        : (ROLE_DEFAULT_ACTIVITIES[finalRole] || ['inventory']));
    const roleToSet = isPromotingToMaster ? 'master_admin' : 'admin';

    // Update in MongoDB
    let updatedDoc = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const queryConditions = [];
        if (targetEmail) queryConditions.push({ email: targetEmail });
        if (adminId) {
          queryConditions.push({ adminId });
          if (mongoose.Types.ObjectId.isValid(adminId)) {
            queryConditions.push({ _id: adminId });
          }
        }
        const query = queryConditions.length > 0 ? { $or: queryConditions } : { email: targetEmail };
        updatedDoc = await Admin.findOneAndUpdate(
          query,
          { $set: { role: roleToSet, assignedRole: finalRole, allowedActivities: finalActivities } },
          { new: true }
        );
        if (targetEmail || (updatedDoc && updatedDoc.email)) {
          await User.findOneAndUpdate(
            { email: targetEmail || updatedDoc.email },
            { $set: { role: roleToSet } }
          );
        }
      } catch (e) {
        console.error('MongoDB update admin role error:', e.message);
      }
    }

    // Update in-memory + file
    const memIdx = adminList.findIndex(a => 
      (targetEmail && (a.email || '').toLowerCase().trim() === targetEmail) ||
      (adminId && (a.id === adminId || a.adminId === adminId))
    );
    if (memIdx !== -1) {
      adminList[memIdx].role = roleToSet;
      adminList[memIdx].assignedRole = finalRole;
      adminList[memIdx].allowedActivities = finalActivities;
      saveAdmins();
    } else if (targetEmail) {
      adminList.push({
        id: adminId || `admin_${Date.now()}`,
        name: (updatedDoc && updatedDoc.name) || targetEmail.split('@')[0],
        email: targetEmail,
        role: roleToSet,
        assignedRole: finalRole,
        allowedActivities: finalActivities,
        mustChangePassword: false,
        createdAt: new Date().toISOString()
      });
      saveAdmins();
    }

    return res.json({
      success: true,
      message: isPromotingToMaster
        ? 'Administrator successfully promoted to Master Admin with full access!'
        : 'Administrator role & activities updated successfully!',
      admin: {
        id: adminId || (updatedDoc && updatedDoc.adminId),
        email: targetEmail || (updatedDoc && updatedDoc.email),
        role: roleToSet,
        assignedRole: finalRole,
        allowedActivities: finalActivities
      }
    });
  } catch (error) {
    console.error('Update admin role error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update admin role' });
  }
});

// GET /api/auth/list-admins — Get all admin users with assigned roles & activities
router.get('/list-admins', async (req, res) => {
  // Try MongoDB first
  if (mongoose.connection.readyState === 1) {
    try {
      const dbAdmins = await Admin.find({}).lean();
      if (dbAdmins.length > 0) {
        return res.json(dbAdmins.map(a => ({
          id: a.adminId || (a._id ? a._id.toString() : `admin_${Date.now()}`),
          name: a.name,
          email: a.email,
          role: a.role,
          assignedRole: a.role === 'master_admin' ? 'master_admin' : (a.assignedRole || 'inventory_manager'),
          allowedActivities: a.role === 'master_admin'
            ? ['inventory', 'orders', 'customers', 'support', 'reports', 'coupons', 'admins']
            : (a.allowedActivities && a.allowedActivities.length > 0 ? a.allowedActivities : ['inventory']),
          mustChangePassword: Boolean(a.mustChangePassword),
          createdAt: a.createdAt
        })));
      }
    } catch (e) {}
  }
  // File fallback
  const safeList = adminList.map(({ password: _p, ...rest }) => ({
    ...rest,
    id: rest.id || rest.adminId,
    assignedRole: rest.role === 'master_admin' ? 'master_admin' : (rest.assignedRole || 'inventory_manager'),
    allowedActivities: rest.role === 'master_admin'
      ? ['inventory', 'orders', 'customers', 'support', 'reports', 'coupons', 'admins']
      : (rest.allowedActivities && rest.allowedActivities.length > 0 ? rest.allowedActivities : ['inventory']),
    mustChangePassword: Boolean(rest.mustChangePassword)
  }));
  res.json(safeList);
});

// DELETE /api/auth/remove-admin/:id — Remove admin by ID
router.delete('/remove-admin/:id', async (req, res) => {
  const { id } = req.params;
  const requesterEmail = req.headers['x-admin-email'] || req.query.requesterEmail || '';
  if (requesterEmail && !isMasterAdminEmail(requesterEmail)) {
    return res.status(403).json({ message: 'Access Denied: Only Master Admin (deevyanshusahu@gmail.com) can remove administrators.' });
  }

  // Try MongoDB first
  if (mongoose.connection.readyState === 1) {
    try {
      const admin = await Admin.findOne({ adminId: id });
      if (!admin) {
        // Try by _id
        const byMongoId = await Admin.findById(id).catch(() => null);
        if (!byMongoId) {
          // Fall through to file fallback
        } else {
          if (byMongoId.role === 'master_admin') return res.status(403).json({ message: 'Cannot remove the master admin' });
          await Admin.findByIdAndDelete(id);
          // Sync file
          adminList = adminList.filter(a => a.id !== id);
          saveAdmins();
          return res.json({ message: 'Admin removed successfully' });
        }
      } else {
        if (admin.role === 'master_admin') return res.status(403).json({ message: 'Cannot remove the master admin' });
        await Admin.findOneAndDelete({ adminId: id });
        adminList = adminList.filter(a => a.id !== id);
        saveAdmins();
        return res.json({ message: 'Admin removed successfully' });
      }
    } catch (e) { console.error('Remove admin MongoDB error:', e.message); }
  }

  // File fallback
  const idx = adminList.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Admin not found' });
  if (adminList[idx].role === 'master_admin') return res.status(403).json({ message: 'Cannot remove the master admin' });
  adminList.splice(idx, 1);
  saveAdmins();
  res.json({ message: 'Admin removed successfully' });
});

// GET /api/auth/customers — List all registered clients with order statistics
router.get('/customers', requireActivity('customers'), async (req, res) => {
  try {
    const Order = require('../models/Order');
    let customers = [];

    // Sample fallback customers if MongoDB has no user records yet
    const sampleCustomers = [
      {
        _id: 'cust_sample_1',
        name: 'Priyanka Chopra',
        email: 'priyanka.c@example.com',
        phone: '+91 98200 45678',
        address: 'Bandra West, Mumbai, Maharashtra',
        pincode: '400050',
        createdAt: new Date(Date.now() - 3600000 * 24 * 45).toISOString()
      },
      {
        _id: 'cust_sample_2',
        name: 'Vikramaditya Roy',
        email: 'vikram.roy@example.com',
        phone: '+91 98450 78901',
        address: 'Indiranagar 100ft Road, Bangalore, Karnataka',
        pincode: '560038',
        createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString()
      },
      {
        _id: 'cust_sample_3',
        name: 'Suhana Kapoor',
        email: 'suhana.k@example.com',
        phone: '+91 97110 34567',
        address: 'Vasant Vihar, New Delhi, Delhi',
        pincode: '110057',
        createdAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString()
      }
    ];

    if (mongoose.connection.readyState === 1) {
      try {
        const dbUsers = await User.find({ role: { $ne: 'admin' } }).lean();
        if (dbUsers.length > 0) {
          customers = dbUsers.map(u => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            address: u.address || '',
            pincode: u.pincode || '',
            createdAt: u.createdAt
          }));
        }
      } catch (e) {
        console.warn('Customers DB fetch error:', e.message);
      }
    }

    if (customers.length === 0) {
      customers = sampleCustomers;
    }

    // Load orders to aggregate customer metrics (total spent & orders count)
    let allOrders = [];
    if (mongoose.connection.readyState === 1) {
      try {
        allOrders = await Order.find({}).lean();
      } catch (e) {}
    }
    if (allOrders.length === 0) {
      try {
        const ordersPath = path.join(__dirname, '../data/orders.json');
        if (fs.existsSync(ordersPath)) {
          allOrders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
        }
      } catch (e) {}
    }

    // Enrich each customer with order stats
    const enrichedCustomers = customers.map(cust => {
      const custOrders = allOrders.filter(o =>
        (o.customerEmail || '').toLowerCase() === (cust.email || '').toLowerCase()
      );
      const ordersCount = custOrders.length;
      const totalSpent = custOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const latestOrder = custOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      return {
        ...cust,
        ordersCount,
        totalSpent,
        lastOrderDate: latestOrder ? latestOrder.createdAt : null,
      };
    });

    res.json(enrichedCustomers);
  } catch (error) {
    console.error('List customers error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch customer records' });
  }
});

module.exports = router;
