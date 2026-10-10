const $ = id => document.getElementById(id);
let chart;

// ---------- Theme ----------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  $("themeBtn").textContent = theme === "dark" ? "☀️" : "🌙";
  Chart.defaults.color = theme === "dark" ? "#e8ecf8" : "#12183a";
  Chart.defaults.borderColor = theme === "dark" ? "rgba(255,255,255,.1)" : "rgba(20,30,70,.1)";
  if (chart) chart.update();
  try { localStorage.setItem("theme", theme); } catch (e) {}
}
let saved = "dark";
try { saved = localStorage.getItem("theme") || "dark"; } catch (e) {}
applyTheme(saved);

$("themeBtn").addEventListener("click", () => {
  applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

// ---------- Count-up animation ----------
function countUp(el, target) {
  const start = performance.now(), dur = 1200;
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ---------- Dropzone ----------
const drop = $("drop");

function showFileName() {
  const f = $("file").files[0];
  if (f) {
    $("dropText").textContent = "📄 " + f.name;
    drop.classList.add("has-file");
  }
}
$("file").addEventListener("change", showFileName);

["dragenter", "dragover"].forEach(ev =>
  drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach(ev =>
  drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", e => {
  if (e.dataTransfer.files.length) {
    $("file").files = e.dataTransfer.files;
    showFileName();
  }
});

// ---------- Upload ----------
$("uploadBtn").addEventListener("click", async () => {
  const file = $("file").files[0];
  if (!file) { $("status").textContent = "Pick a CSV first"; return; }

  const btn = $("uploadBtn");
  btn.disabled = true;
  $("status").innerHTML = '<span class="spinner"></span>Analyzing...';

  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json();
  btn.disabled = false;

  if (!res.ok) { $("status").textContent = "❌ " + data.error; return; }

  $("status").textContent = "✅ Analysis complete";
  $("results").classList.remove("hidden");
  countUp($("sRows"), data.rows);
  countUp($("sCols"), data.columns.length);

  await Promise.all([loadSummary(), loadMissing(), loadCorr()]);
  $("results").scrollIntoView({ behavior: "smooth", block: "start" });
});

// ---------- Tables ----------
function nestedTable(obj, heat = false) {
  const keys = Object.keys(obj);
  if (!keys.length) return "<p>No numeric data</p>";
  const inner = Object.keys(obj[keys[0]]);
  let h = "<table><tr><th></th>" + inner.map(i => `<th>${i}</th>`).join("") + "</tr>";
  keys.forEach(k => {
    h += `<tr><th>${k}</th>` + inner.map(i => {
      const v = obj[k][i];
      let style = "";
      if (heat && v !== null) {
        const a = Math.abs(v).toFixed(2);
        const color = v >= 0 ? "124,92,255" : "255,78,205";
        style = ` style="background: rgba(${color}, ${a * 0.55})"`;
      }
      return `<td${style}>${v ?? "-"}</td>`;
    }).join("") + "</tr>";
  });
  return h + "</table>";
}

async function loadSummary() {
  const data = await (await fetch("/api/summary")).json();
  $("summary").innerHTML = nestedTable(data);
  const cols = Object.keys(data);
  countUp($("sNum"), cols.length);
  $("colSelect").innerHTML = cols.map(c => `<option>${c}</option>`).join("");
  if (cols.length) loadHistogram(cols[0]);
}

async function loadMissing() {
  const data = await (await fetch("/api/missing")).json();
  countUp($("sMiss"), Object.values(data).reduce((a, b) => a + b, 0));
  $("missing").innerHTML = "<table>" +
    Object.entries(data).map(([k, v]) =>
      `<tr><th>${k}</th><td style="${v > 0 ? 'color:#ff6b9d;font-weight:600' : ''}">${v}</td></tr>`
    ).join("") + "</table>";
}

async function loadCorr() {
  const data = await (await fetch("/api/correlation")).json();
  $("corr").innerHTML = nestedTable(data, true);
}

// ---------- Chart ----------
async function loadHistogram(col) {
  const d = await (await fetch("/api/histogram/" + encodeURIComponent(col))).json();
  const labels = d.counts.map((_, i) => `${d.edges[i]} - ${d.edges[i + 1]}`);
  const ctx = $("chart").getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, 300);
  grad.addColorStop(0, "#00d4ff");
  grad.addColorStop(1, "#7c5cff");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ label: col, data: d.counts, backgroundColor: grad, borderRadius: 8 }] },
    options: {
      animation: { duration: 1100, easing: "easeOutBack" },
      plugins: { legend: { display: false } }
    }
  });
}

$("colSelect").addEventListener("change", e => loadHistogram(e.target.value));