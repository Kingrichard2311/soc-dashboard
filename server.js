const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, './data/incidents.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Helper to read data
function readData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}

// Helper to write data
function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// GET all incidents with optional filtering
app.get('/api/incidents', (req, res) => {
  try {
    let incidents = readData();

    const { severity, status, search } = req.query;

    if (severity && severity !== 'All') {
      incidents = incidents.filter(i => i.severity === severity);
    }
    if (status && status !== 'All') {
      incidents = incidents.filter(i => i.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      incidents = incidents.filter(i =>
        i.attackType.toLowerCase().includes(q) ||
        i.sourceIP.includes(q) ||
        i.targetHost.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q)
      );
    }

    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read incidents' });
  }
});

// GET single incident
app.get('/api/incidents/:id', (req, res) => {
  try {
    const incidents = readData();
    const incident = incidents.find(i => i.id === req.params.id);
    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    res.json(incident);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read incident' });
  }
});

// POST create incident
app.post('/api/incidents', (req, res) => {
  try {
    const incidents = readData();
    const { severity, attackType, sourceIP, targetHost, status, analyst, description, mitreTactic, mitreTechnique } = req.body;

    if (!severity || !attackType || !sourceIP || !status) {
      return res.status(400).json({ error: 'Missing required fields: severity, attackType, sourceIP, status' });
    }

    const nextNum = incidents.length + 1;
    const newIncident = {
      id: `INC-${String(nextNum).padStart(3, '0')}`,
      severity,
      attackType,
      sourceIP,
      targetHost: targetHost || 'Unknown',
      status,
      timestamp: new Date().toISOString(),
      analyst: analyst || 'Unassigned',
      description: description || '',
      mitreTactic: mitreTactic || '',
      mitreTechnique: mitreTechnique || ''
    };

    incidents.push(newIncident);
    writeData(incidents);

    res.status(201).json(newIncident);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// PATCH update incident status
app.patch('/api/incidents/:id', (req, res) => {
  try {
    const incidents = readData();
    const idx = incidents.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Incident not found' });

    incidents[idx] = { ...incidents[idx], ...req.body };
    writeData(incidents);

    res.json(incidents[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

// GET stats summary
app.get('/api/stats', (req, res) => {
  try {
    const incidents = readData();

    const stats = {
      total: incidents.length,
      bySeverity: {
        Critical: incidents.filter(i => i.severity === 'Critical').length,
        High: incidents.filter(i => i.severity === 'High').length,
        Medium: incidents.filter(i => i.severity === 'Medium').length,
        Low: incidents.filter(i => i.severity === 'Low').length,
      },
      byStatus: {
        Open: incidents.filter(i => i.status === 'Open').length,
        Investigating: incidents.filter(i => i.status === 'Investigating').length,
        Escalated: incidents.filter(i => i.status === 'Escalated').length,
        Resolved: incidents.filter(i => i.status === 'Resolved').length,
        Closed: incidents.filter(i => i.status === 'Closed').length,
      },
      activeCount: incidents.filter(i => !['Resolved', 'Closed'].includes(i.status)).length,
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

app.listen(PORT, () => {
  console.log(`SOC Dashboard API running at http://localhost:${PORT}`);
  console.log(`Frontend served at http://localhost:${PORT}`);
});
