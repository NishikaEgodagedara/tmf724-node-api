// TMF724-compliant mock server using Express
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;
app.use(bodyParser.json());

let incidents = [];
let diagnoseIncidents = [];
let resolveIncidents = [];

// Helper to format incident response
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

// List all incidents
app.get('/tmf-api/Incident/v4', (req, res) => {
  res.json(incidents);
});

// Get incident by ID
app.get('/tmf-api/Incident/v4/incident/:id', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  res.json(incident);
});

// Create a new incident
app.post('/tmf-api/Incident/v4/incident', (req, res) => {
  const incident = formatIncident(req.body);
  incidents.push(incident);
  res.status(201).json(incident);
});

// DiagnoseIncident endpoints
app.post('/tmf-api/Incident/v4/diagnoseIncident', (req, res) => {
  const id = uuidv4();
  const diagnose = {
    id,
    href: `/tmf-api/Incident/v4/diagnoseIncident/${id}`,
    incident: req.body.incident || { id: "unknown-incident-id" }
  };
  diagnoseIncidents.push(diagnose);
  res.status(201).json(diagnose);
});

app.get('/tmf-api/Incident/v4/diagnoseIncident', (req, res) => {
  res.json(diagnoseIncidents);
});

app.get('/tmf-api/Incident/v4/diagnoseIncident/:id', (req, res) => {
  const item = diagnoseIncidents.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// ResolveIncident endpoints
app.post('/tmf-api/Incident/v4/resolveIncident', (req, res) => {
  const id = uuidv4();
  const resolve = {
    id,
    href: `/tmf-api/Incident/v4/resolveIncident/${id}`,
    incident: req.body.incident || { id: "unknown-incident-id" }
  };
  resolveIncidents.push(resolve);
  res.status(201).json(resolve);
});

app.get('/tmf-api/Incident/v4/resolveIncident', (req, res) => {
  res.json(resolveIncidents);
});

app.get('/tmf-api/Incident/v4/resolveIncident/:id', (req, res) => {
  const item = resolveIncidents.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.listen(port, () => {
  console.log(`TMF724 API server running at http://localhost:${port}`);
});
