const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const CustomerQuery = require('../models/CustomerQuery');

const router = express.Router();

const supportFilePath = path.join(__dirname, '../data/support_tickets.json');

const initialSampleTickets = [
  {
    ticketId: 'TKT-108291',
    customerName: 'Ananya Sharma',
    customerEmail: 'ananya.sharma@example.com',
    customerPhone: '+91 98450 12345',
    subject: 'Request for custom engraving on Solitaire Royal Ring',
    category: 'Custom Design Request',
    message: 'Hello, I ordered the 18K Diamond Solitaire ring. Could you please add laser engraving initials "A & K" inside the band before armored transit dispatch?',
    orderNo: 'INV-JS-2026-8812',
    priority: 'medium',
    status: 'Pending',
    resolutionNotes: '',
    resolvedBy: '',
    resolvedAt: null,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    ticketId: 'TKT-108284',
    customerName: 'Rohan Mehra',
    customerEmail: 'rohan.mehra@example.com',
    customerPhone: '+91 99201 54321',
    subject: 'BIS Hallmark Certificate verification enquiry',
    category: 'Purity & BIS Hallmark',
    message: 'Can you please confirm if the 22K Gold Temple Necklace includes the official BIS Hallmark card with HUID code in the velvet case?',
    orderNo: 'INV-JS-2026-7734',
    priority: 'high',
    status: 'In Progress',
    resolutionNotes: 'Concierge contacted customer on call confirming 100% BIS 916 Hallmark certificate with laser-etched HUID is included.',
    resolvedBy: 'Deevyanshu Sahu',
    resolvedAt: null,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    ticketId: 'TKT-108260',
    customerName: 'Pooja Hegde',
    customerEmail: 'pooja.h@example.com',
    customerPhone: '+91 97112 89012',
    subject: 'Bangle size exchange to 2.6 size',
    category: 'Return & Exchange',
    message: 'The 2.4 size bangle feels slightly tight. Would like to exchange it under the 7-Day Royal Privilege for size 2.6.',
    orderNo: 'INV-JS-2026-6641',
    priority: 'medium',
    status: 'Resolved',
    resolutionNotes: 'Armored courier pickup scheduled and 2.6 size reserved at atelier. Dispatched on priority.',
    resolvedBy: 'Deevyanshu Sahu',
    resolvedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  }
];

let ticketsList = [];
try {
  if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
  }
  if (fs.existsSync(supportFilePath)) {
    ticketsList = JSON.parse(fs.readFileSync(supportFilePath, 'utf8'));
  } else {
    ticketsList = initialSampleTickets;
    fs.writeFileSync(supportFilePath, JSON.stringify(ticketsList, null, 2));
  }
} catch (e) {
  ticketsList = initialSampleTickets;
}

const saveTickets = () => {
  try {
    fs.writeFileSync(supportFilePath, JSON.stringify(ticketsList, null, 2));
  } catch (e) {}
};

// GET /api/support/tickets — Retrieve all tickets with optional filter
router.get('/tickets', async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      try {
        let query = {};
        if (status && status !== 'all') query.status = status;
        if (category && category !== 'all') query.category = category;
        if (priority && priority !== 'all') query.priority = priority;
        if (search) {
          query.$or = [
            { ticketId: new RegExp(search, 'i') },
            { customerName: new RegExp(search, 'i') },
            { customerEmail: new RegExp(search, 'i') },
            { subject: new RegExp(search, 'i') },
            { message: new RegExp(search, 'i') },
            { orderNo: new RegExp(search, 'i') }
          ];
        }

        const dbTickets = await CustomerQuery.find(query).sort({ createdAt: -1 });
        if (dbTickets.length > 0) {
          return res.json(dbTickets);
        }
        // If DB collection is empty, seed from ticketsList
        if ((await CustomerQuery.countDocuments()) === 0) {
          await CustomerQuery.insertMany(ticketsList);
          const seeded = await CustomerQuery.find(query).sort({ createdAt: -1 });
          return res.json(seeded);
        }
      } catch (dbErr) {
        console.warn('Support tickets DB query fallback:', dbErr.message);
      }
    }

    // In-memory fallback
    let filtered = [...ticketsList];
    if (status && status !== 'all') filtered = filtered.filter(t => t.status === status);
    if (category && category !== 'all') filtered = filtered.filter(t => t.category === category);
    if (priority && priority !== 'all') filtered = filtered.filter(t => t.priority === priority);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(t =>
        (t.ticketId || '').toLowerCase().includes(q) ||
        (t.customerName || '').toLowerCase().includes(q) ||
        (t.customerEmail || '').toLowerCase().includes(q) ||
        (t.subject || '').toLowerCase().includes(q) ||
        (t.message || '').toLowerCase().includes(q) ||
        (t.orderNo || '').toLowerCase().includes(q)
      );
    }
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch tickets' });
  }
});

// POST /api/support/tickets/create — Customer creates ticket
router.post('/tickets/create', async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, subject, category, message, orderNo, priority } = req.body;
    if (!customerName || !customerEmail || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject and message are required' });
    }

    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTicketData = {
      ticketId,
      customerName,
      customerEmail: customerEmail.toLowerCase().trim(),
      customerPhone: customerPhone || '',
      subject,
      category: category || 'General Concierge',
      message,
      orderNo: orderNo || '',
      priority: priority || 'medium',
      status: 'Pending',
      resolutionNotes: '',
      resolvedBy: '',
      resolvedAt: null,
      createdAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await CustomerQuery.create(newTicketData);
      } catch (e) {}
    }

    ticketsList.unshift(newTicketData);
    saveTickets();

    res.status(201).json({
      success: true,
      ticketId,
      message: `Your support request has been logged under ${ticketId}. Our Royal Concierge will respond within 2-4 hours.`,
      ticket: newTicketData
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create support ticket' });
  }
});

// PUT /api/support/tickets/:id/resolve — Admin solves/updates problem
router.put('/tickets/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'Resolved', resolutionNotes, resolvedBy } = req.body;

    let updatedTicket = null;

    if (mongoose.connection.readyState === 1) {
      try {
        updatedTicket = await CustomerQuery.findOneAndUpdate(
          { $or: [{ ticketId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
          {
            status,
            resolutionNotes: resolutionNotes || '',
            resolvedBy: resolvedBy || 'Store Admin',
            resolvedAt: status === 'Resolved' ? new Date() : null
          },
          { new: true }
        );
      } catch (e) {}
    }

    // Also update in-memory / file cache
    const idx = ticketsList.findIndex(t => t.ticketId === id || t._id === id);
    if (idx !== -1) {
      ticketsList[idx] = {
        ...ticketsList[idx],
        status,
        resolutionNotes: resolutionNotes || ticketsList[idx].resolutionNotes || '',
        resolvedBy: resolvedBy || 'Store Admin',
        resolvedAt: status === 'Resolved' ? new Date().toISOString() : null
      };
      saveTickets();
      if (!updatedTicket) updatedTicket = ticketsList[idx];
    }

    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({
      success: true,
      message: `Ticket ${id} status updated to "${status}".`,
      ticket: updatedTicket
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to resolve ticket' });
  }
});

// DELETE /api/support/tickets/:id — Delete/Archive ticket
router.delete('/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      try {
        await CustomerQuery.findOneAndDelete({
          $or: [{ ticketId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
        });
      } catch (e) {}
    }

    ticketsList = ticketsList.filter(t => t.ticketId !== id && t._id !== id);
    saveTickets();

    res.json({ success: true, message: `Ticket ${id} removed.` });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete ticket' });
  }
});

module.exports = router;
