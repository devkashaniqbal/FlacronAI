const { getFirestore, FieldValue } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

// ── CLIENTS ────────────────────────────────────────────────────────────────

const getClients = async (userId, { page = 1, limit = 20, search = '' } = {}) => {
  const db = getFirestore();
  const snapshot = await db.collection('crmClients').where('userId', '==', userId).get();
  let clients = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  clients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (search) {
    const s = search.toLowerCase();
    clients = clients.filter(c =>
      (c.name || '').toLowerCase().includes(s) ||
      (c.email || '').toLowerCase().includes(s) ||
      (c.company || '').toLowerCase().includes(s)
    );
  }

  const total = clients.length;
  const offset = (page - 1) * limit;
  return { data: clients.slice(offset, offset + limit), total, page, limit, hasMore: offset + limit < total };
};

const createClient = async (userId, data) => {
  const db = getFirestore();
  const clientId = uuidv4();
  const client = {
    id: clientId,
    userId,
    name: data.name,
    email: data.email || '',
    phone: data.phone || '',
    company: data.company || '',
    address: data.address || '',
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalReports: 0,
  };
  await db.collection('crmClients').doc(clientId).set(client);
  return client;
};

const getClient = async (userId, clientId) => {
  const db = getFirestore();
  const doc = await db.collection('crmClients').doc(clientId).get();
  if (!doc.exists || doc.data().userId !== userId) throw new Error('Client not found');
  return { id: doc.id, ...doc.data() };
};

const updateClient = async (userId, clientId, data) => {
  const db = getFirestore();
  const ref = db.collection('crmClients').doc(clientId);
  const doc = await ref.get();
  if (!doc.exists || doc.data().userId !== userId) throw new Error('Client not found');
  const updates = { ...data, updatedAt: new Date().toISOString() };
  delete updates.userId; delete updates.id;
  await ref.update(updates);
  return { id: clientId, ...doc.data(), ...updates };
};

const deleteClient = async (userId, clientId) => {
  const db = getFirestore();
  const ref = db.collection('crmClients').doc(clientId);
  const doc = await ref.get();
  if (!doc.exists || doc.data().userId !== userId) throw new Error('Client not found');
  await ref.delete();
};

const getClientReports = async (userId, clientId) => {
  const db = getFirestore();
  const snap = await db.collection('reports')
    .where('userId', '==', userId)
    .where('clientId', '==', clientId)
    .get();
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// ── APPOINTMENTS ──────────────────────────────────────────────────────────

const getAppointments = async (userId, { startDate, endDate, status } = {}) => {
  const db = getFirestore();
  let query = db.collection('crmAppointments').where('userId', '==', userId);
  if (status) query = query.where('status', '==', status);
  const snap = await query.get();

  let appts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  appts.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (startDate) appts = appts.filter(a => a.date >= startDate);
  if (endDate) appts = appts.filter(a => a.date <= endDate);
  return appts;
};

const createAppointment = async (userId, data) => {
  const db = getFirestore();
  const id = uuidv4();
  const appt = {
    id, userId,
    title: data.title,
    clientId: data.clientId || null,
    date: data.date,
    time: data.time || '',
    location: data.location || '',
    notes: data.notes || '',
    status: data.status || 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.collection('crmAppointments').doc(id).set(appt);
  return appt;
};

const updateAppointment = async (userId, apptId, data) => {
  const db = getFirestore();
  const ref = db.collection('crmAppointments').doc(apptId);
  const doc = await ref.get();
  if (!doc.exists || doc.data().userId !== userId) throw new Error('Appointment not found');
  const updates = { ...data, updatedAt: new Date().toISOString() };
  delete updates.userId; delete updates.id;
  await ref.update(updates);
  return { id: apptId, ...doc.data(), ...updates };
};

const deleteAppointment = async (userId, apptId) => {
  const db = getFirestore();
  const ref = db.collection('crmAppointments').doc(apptId);
  const doc = await ref.get();
  if (!doc.exists || doc.data().userId !== userId) throw new Error('Not found');
  await ref.delete();
};

// ── CLAIMS ────────────────────────────────────────────────────────────────

const getClaims = async (userId, { page = 1, limit = 20, status } = {}) => {
  const db = getFirestore();
  let query = db.collection('crmClaims').where('userId', '==', userId);
  if (status) query = query.where('status', '==', status);
  const snap = await query.get();

  let claims = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  claims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = claims.length;
  const offset = (page - 1) * limit;
  return { data: claims.slice(offset, offset + limit), total, page, limit, hasMore: offset + limit < total };
};

const createClaim = async (userId, data) => {
  const db = getFirestore();
  const id = uuidv4();
  const claim = {
    id, userId,
    claimNumber: data.claimNumber || `CLM-${Date.now()}`,
    clientId: data.clientId || null,
    lossType: data.lossType || 'Other',
    lossDate: data.lossDate || '',
    status: data.status || 'Open',
    description: data.description || '',
    linkedReports: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.collection('crmClaims').doc(id).set(claim);
  return claim;
};

const getClaim = async (userId, claimId) => {
  const db = getFirestore();
  const doc = await db.collection('crmClaims').doc(claimId).get();
  if (!doc.exists || doc.data().userId !== userId) throw new Error('Claim not found');
  return { id: doc.id, ...doc.data() };
};

const updateClaim = async (userId, claimId, data) => {
  const db = getFirestore();
  const ref = db.collection('crmClaims').doc(claimId);
  const doc = await ref.get();
  if (!doc.exists || doc.data().userId !== userId) throw new Error('Claim not found');
  const updates = { ...data, updatedAt: new Date().toISOString() };
  delete updates.userId; delete updates.id;
  await ref.update(updates);
  return { id: claimId, ...doc.data(), ...updates };
};

const deleteClaim = async (userId, claimId) => {
  const db = getFirestore();
  const ref = db.collection('crmClaims').doc(claimId);
  const doc = await ref.get();
  if (!doc.exists || doc.data().userId !== userId) throw new Error('Not found');
  await ref.delete();
};

module.exports = {
  getClients, createClient, getClient, updateClient, deleteClient, getClientReports,
  getAppointments, createAppointment, updateAppointment, deleteAppointment,
  getClaims, createClaim, getClaim, updateClaim, deleteClaim,
};
