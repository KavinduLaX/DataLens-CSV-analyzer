const $ = id => document.getElementById(id);

$("uploadBtn").addEventListener("click", async () => {
  const file = $("file").files[0];
  if (!file) { $("status").textContent = "Pick a CSV first"; return; }
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json();
  $("status").textContent = `Loaded ${data.rows} rows, ${data.columns.length} columns`;
});