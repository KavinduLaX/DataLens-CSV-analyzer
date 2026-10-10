const $ = id => document.getElementById(id);

$("uploadBtn").addEventListener("click", async () => {
  const file = $("file").files[0];
  if (!file) { $("status").textContent = "Pick a CSV first"; return; }
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) {
    $("status").textContent = data.error;
    return;
  }
  $("status").textContent = `Loaded ${data.rows} rows, ${data.columns.length} columns`;
  loadSummary();
  loadMissing();
  loadCorr();
});

function nestedTable(obj) {
  const keys = Object.keys(obj);
  if (!keys.length) return "<p>No numeric data</p>";
  const inner = Object.keys(obj[keys[0]]);
  let h = "<table><tr><th></th>" + inner.map(i => `<th>${i}</th>`).join("") + "</tr>";
  keys.forEach(k => {
    h += `<tr><th>${k}</th>` + inner.map(i => `<td>${obj[k][i]}</td>`).join("") + "</tr>";
  });
  return h + "</table>";
}

async function loadSummary() {
  const data = await (await fetch("/api/summary")).json();
  $("summary").innerHTML = nestedTable(data);
  const cols = Object.keys(data);
  $("colSelect").innerHTML = cols.map(c => `<option>${c}</option>`).join("");
  if (cols.length) loadHistogram(cols[0]);
}

async function loadMissing() {
  const data = await (await fetch("/api/missing")).json();
  $("missing").innerHTML = "<table>" +
    Object.entries(data).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("") +
    "</table>";
}

let chart;

async function loadHistogram(col) {
  const d = await (await fetch("/api/histogram/" + encodeURIComponent(col))).json();
  const labels = d.counts.map((_, i) => `${d.edges[i]} to ${d.edges[i + 1]}`);
  if (chart) chart.destroy();
  chart = new Chart($("chart"), {
    type: "bar",
    data: { labels, datasets: [{ label: col, data: d.counts, backgroundColor: "#2b5797" }] }
  });
}

$("colSelect").addEventListener("change", e => loadHistogram(e.target.value));

async function loadCorr() {
  const data = await (await fetch("/api/correlation")).json();
  $("corr").innerHTML = nestedTable(data);
}