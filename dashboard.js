
const apiUrl = "http://localhost:3000/incidents";

let incidents = [];

async function fetchIncidents() {
  const response = await fetch(apiUrl);
  incidents = await response.json();
  renderTable(incidents);
  updateStats(incidents);
}

function renderTable(data) {
  const table = document.getElementById("incidentTable");
  table.innerHTML = "";

  data.forEach(incident => {
    const row = `
      <tr>
        <td>${incident.id}</td>
        <td class="${incident.severity.toLowerCase()}">${incident.severity}</td>
        <td>${incident.attackType}</td>
        <td>${incident.sourceIP}</td>
        <td>${incident.status}</td>
      </tr>
    `;
    table.innerHTML += row;
  });
}

function updateStats(data) {
  document.getElementById("totalIncidents").innerText = data.length;

  const critical = data.filter(i => i.severity === "Critical").length;
  document.getElementById("criticalIncidents").innerText = critical;
}

document.getElementById("severityFilter").addEventListener("change", (e) => {
  const value = e.target.value;

  if (value === "All") {
    renderTable(incidents);
  } else {
    renderTable(incidents.filter(i => i.severity === value));
  }
});

document.getElementById("searchInput").addEventListener("input", (e) => {
  const search = e.target.value.toLowerCase();

  const filtered = incidents.filter(i =>
    i.attackType.toLowerCase().includes(search) ||
    i.sourceIP.includes(search)
  );

  renderTable(filtered);
});

fetchIncidents();
