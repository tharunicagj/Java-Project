const records = {
  equipment: [],
  maintenance: [],
  technicians: []
};

const today = new Date();
today.setHours(0, 0, 0, 0);

function showNotice(message, type = "success") {
  const notice = document.querySelector("#notice");
  notice.textContent = message;
  notice.className = `notice ${type}`;
  notice.hidden = false;
}

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase().replaceAll("_", " ");
}

function getMaintenanceStatus(item) {
  const status = normalizeStatus(item.status);
  if (status === "completed") return "Completed";
  if (status === "overdue") return "Overdue";
  if (item.scheduledDate && new Date(`${item.scheduledDate}T00:00:00`) < today) return "Overdue";
  return item.status || "Scheduled";
}

function statusBadge(status) {
  const className = normalizeStatus(status).replaceAll(" ", ".");
  return `<span class="status ${className}">${escapeHtml(status || "Unknown")}</span>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return null;
  const body = await response.text();
  return body ? JSON.parse(body) : null;
}

function equipmentLabel(id) {
  const item = records.equipment.find((equipment) => Number(equipment.id) === Number(id));
  return item ? `${item.equipmentName} (${item.equipmentCode})` : `Equipment #${id}`;
}

function renderDashboard() {
  const completed = records.maintenance.filter((item) => getMaintenanceStatus(item) === "Completed");
  const overdue = records.maintenance.filter((item) => getMaintenanceStatus(item) === "Overdue");
  const upcoming = records.maintenance.filter((item) => {
    return getMaintenanceStatus(item) !== "Completed" && getMaintenanceStatus(item) !== "Overdue";
  });

  document.querySelector("#total-equipment").textContent = records.equipment.length;
  document.querySelector("#upcoming-maintenance").textContent = upcoming.length;
  document.querySelector("#overdue-maintenance").textContent = overdue.length;
  document.querySelector("#completed-maintenance").textContent = completed.length;

  const rows = [...upcoming]
    .sort((first, second) => String(first.scheduledDate).localeCompare(String(second.scheduledDate)))
    .slice(0, 6)
    .map((item) => `<tr>
      <td>${escapeHtml(equipmentLabel(item.equipmentId))}</td>
      <td>${escapeHtml(item.maintenanceType)}</td>
      <td>${escapeHtml(item.scheduledDate || "Not set")}</td>
      <td>${statusBadge(getMaintenanceStatus(item))}</td>
    </tr>`).join("");

  document.querySelector("#dashboard-maintenance").innerHTML = rows || emptyRow(4, "No upcoming maintenance scheduled.");
}

function emptyRow(columns, message) {
  return `<tr><td class="empty-cell" colspan="${columns}">${message}</td></tr>`;
}

function renderEquipment() {
  const rows = records.equipment.map((item) => `<tr>
    <td><strong>${escapeHtml(item.equipmentName)}</strong><br><small>${escapeHtml(item.equipmentCode)}</small></td>
    <td>${escapeHtml(item.category)}</td>
    <td>${escapeHtml(item.location)}</td>
    <td>${statusBadge(item.status)}</td>
  </tr>`).join("");

  document.querySelector("#equipment-table").innerHTML = rows || emptyRow(4, "No equipment added yet.");
  document.querySelector("#equipment-count").textContent = `${records.equipment.length} machine${records.equipment.length === 1 ? "" : "s"}`;

  const select = document.querySelector("#maintenance-equipment");
  const selectedValue = select.value;
  select.innerHTML = `<option value="">Select equipment</option>${records.equipment.map((item) => `<option value="${item.id}">${escapeHtml(item.equipmentName)} (${escapeHtml(item.equipmentCode)})</option>`).join("")}`;
  if (records.equipment.some((item) => String(item.id) === selectedValue)) select.value = selectedValue;
}

function renderMaintenance() {
  const rows = [...records.maintenance]
    .sort((first, second) => String(first.scheduledDate).localeCompare(String(second.scheduledDate)))
    .map((item) => `<tr>
      <td>${escapeHtml(equipmentLabel(item.equipmentId))}</td>
      <td>${escapeHtml(item.maintenanceType)}</td>
      <td>${escapeHtml(item.scheduledDate || "Not set")}</td>
      <td>${escapeHtml(item.frequency)}</td>
      <td>${statusBadge(getMaintenanceStatus(item))}</td>
    </tr>`).join("");

  document.querySelector("#maintenance-table").innerHTML = rows || emptyRow(5, "No maintenance schedules added yet.");
  document.querySelector("#maintenance-count").textContent = `${records.maintenance.length} task${records.maintenance.length === 1 ? "" : "s"}`;
}

function renderTechnicians() {
  const rows = records.technicians.map((item) => `<tr>
    <td>${escapeHtml(item.name)}</td>
    <td>${escapeHtml(item.email)}</td>
    <td>${escapeHtml(item.phone)}</td>
    <td>${escapeHtml(item.specialization)}</td>
  </tr>`).join("");

  document.querySelector("#technician-table").innerHTML = rows || emptyRow(4, "No technicians added yet.");
  document.querySelector("#technician-count").textContent = `${records.technicians.length} technician${records.technicians.length === 1 ? "" : "s"}`;
}

function renderAll() {
  renderDashboard();
  renderEquipment();
  renderMaintenance();
  renderTechnicians();
}

async function loadRecords() {
  const connection = document.querySelector("#connection");
  try {
    const [equipment, maintenance, technicians] = await Promise.all([
      request("/equipment"),
      request("/maintenance"),
      request("/technicians")
    ]);

    records.equipment = equipment;
    records.maintenance = maintenance;
    records.technicians = technicians;
    connection.className = "connection online";
    connection.lastElementChild.textContent = "API connected";
    renderAll();
  } catch (error) {
    connection.className = "connection offline";
    connection.lastElementChild.textContent = "API unavailable";
    showNotice("Cannot load data. Start the Spring Boot app and check its MySQL connection, then refresh.", "error");
  }
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    const active = page.id === pageId;
    page.hidden = !active;
    page.classList.toggle("active", active);
  });
  document.querySelectorAll(".nav-link").forEach((button) => {
    const active = button.dataset.page === pageId;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
  history.replaceState(null, "", `#${pageId}`);
}

async function submitForm(form, endpoint, resetAfterSave = true) {
  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  try {
    const values = Object.fromEntries(new FormData(form).entries());
    if (values.equipmentId) values.equipmentId = Number(values.equipmentId);
    await request(endpoint, { method: "POST", body: JSON.stringify(values) });
    if (resetAfterSave) form.reset();
    await loadRecords();
    showNotice("Record saved successfully.", "success");
  } catch (error) {
    showNotice(`Could not save record: ${error.message}`, "error");
  } finally {
    submitButton.disabled = false;
  }
}

document.querySelectorAll(".nav-link").forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.go));
});

document.querySelector("#equipment-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitForm(event.currentTarget, "/equipment");
});

document.querySelector("#maintenance-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitForm(event.currentTarget, "/maintenance");
});

document.querySelector("#technician-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitForm(event.currentTarget, "/technicians");
});

document.querySelector("#today").textContent = new Date().toLocaleDateString("en", {
  weekday: "short", month: "short", day: "numeric", year: "numeric"
});

const initialPage = location.hash.slice(1);
if (["dashboard", "equipment", "maintenance", "technicians"].includes(initialPage)) showPage(initialPage);
loadRecords();