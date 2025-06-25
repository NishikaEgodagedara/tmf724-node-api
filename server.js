// TMF724-compliant server with MongoDB connection using .env
require('dotenv').config(); // 🔐 Load variables from .env

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;
app.use(bodyParser.json());

// ✅ MongoDB Atlas connection using .env
const uri = `mongodb+srv://${encodeURIComponent(process.env.MONGO_USER)}:${encodeURIComponent(process.env.MONGO_PW)}@cluster0.mr1gaxu.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(uri)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Mongoose models
const incidentSchema = new mongoose.Schema({
  id: String,
  name: String,
  category: String,
  domain: String,
  priority: String,
  state: String,
  ackState: String,
  occurTime: String,
  sourceObject: Array,
  href: String
});

const diagnoseIncidentSchema = new mongoose.Schema({
  id: String,
  href: String,
  incident: Object
});

const resolveIncidentSchema = new mongoose.Schema({
  id: String,
  href: String,
  incident: Object
});

const Incident = mongoose.model('Incident', incidentSchema);
const DiagnoseIncident = mongoose.model('DiagnoseIncident', diagnoseIncidentSchema);
const ResolveIncident = mongoose.model('ResolveIncident', resolveIncidentSchema);

// Format helper
function formatIncident(data) {
  const id = data.id || uuidv4();
  return {
    id,
    ackState: data.ackState || 'acknowledged',
    category: data.category,
    domain: data.domain,
    href: `/tmf-api/Incident/v4/incident/${id}`,
    name: data.name,
    occurTime: data.occurTime,
    priority: data.priority,
    state: data.state,
    sourceObject: Array.isArray(data.sourceObject) ? data.sourceObject : [data.sourceObject || {}]
  };
}

// ✅ Routes

// Home route
app.get('/', (req, res) => {
  res.send('TMF724 Incident API is running');
});

// Incident endpoints
app.get('/tmf-api/Incident/v4/incident', async (req, res) => {
  const incidents = await Incident.find();
  res.json(incidents);
});

app.get('/tmf-api/Incident/v4/incident/:id', async (req, res) => {
  const incident = await Incident.findOne({ id: req.params.id });
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  res.json(incident);
});

app.post('/tmf-api/Incident/v4/incident', async (req, res) => {
  const data = formatIncident(req.body);
  const newIncident = new Incident(data);
  await newIncident.save();
  res.status(201).json(newIncident);
});

// DiagnoseIncident endpoints
app.post('/tmf-api/Incident/v4/diagnoseIncident', async (req, res) => {
  const id = uuidv4();
  const diagnose = new DiagnoseIncident({
    id,
    href: `/tmf-api/Incident/v4/diagnoseIncident/${id}`,
    incident: req.body.incident || { id: "unknown-incident-id" }
  });
  await diagnose.save();
  res.status(201).json(diagnose);
});

app.get('/tmf-api/Incident/v4/diagnoseIncident', async (req, res) => {
  const list = await DiagnoseIncident.find();
  res.json(list);
});

app.get('/tmf-api/Incident/v4/diagnoseIncident/:id', async (req, res) => {
  const item = await DiagnoseIncident.findOne({ id: req.params.id });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// ResolveIncident endpoints
app.post('/tmf-api/Incident/v4/resolveIncident', async (req, res) => {
  const id = uuidv4();
  const resolve = new ResolveIncident({
    id,
    href: `/tmf-api/Incident/v4/resolveIncident/${id}`,
    incident: req.body.incident || { id: "unknown-incident-id" }
  });
  await resolve.save();
  res.status(201).json(resolve);
});

app.get('/tmf-api/Incident/v4/resolveIncident', async (req, res) => {
  const list = await ResolveIncident.find();
  res.json(list);
});

app.get('/tmf-api/Incident/v4/resolveIncident/:id', async (req, res) => {
  const item = await ResolveIncident.findOne({ id: req.params.id });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 TMF724 API server running at http://localhost:${port}`);
});
