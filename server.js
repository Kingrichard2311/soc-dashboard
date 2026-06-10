
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_PATH = './data/incidents.json';

app.get('/incidents', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_PATH));
  res.json(data);
});

app.post('/incidents', (req, res) => {
  const incidents = JSON.parse(fs.readFileSync(DATA_PATH));

  const newIncident = {
    id: incidents.length + 1,
    ...req.body
  };

  incidents.push(newIncident);

  fs.writeFileSync(DATA_PATH, JSON.stringify(incidents, null, 2));

  res.status(201).json(newIncident);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
