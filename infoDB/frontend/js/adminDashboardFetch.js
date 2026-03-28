/* ─────────────────────────────────────────────
   Constants & Pure Helpers
───────────────────────────────────────────── */
const AVATAR_COLORS = [
  "#ff6b47",
  "#7c5cbf",
  "#3a9e6e",
  "#b05a2f",
  "#c04060",
  "#2a7a9e",
  "#7a9e2a",
  "#9e2a7a",
];

function colorForName(name) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function statusClass(status = "") {
  const map = { active: "s-active", pending: "s-pending" };
  return map[status.toLowerCase()] || "s-pending";
}

function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function todayString() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ─────────────────────────────────────────────
   DOM Ready
───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dashboardDate").innerHTML =
    `${todayString()} &nbsp;·&nbsp; Everything looks good today 🎯`;

  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const hamburger = document.getElementById("hamburger");

  function openSidebar() {
    sidebar.classList.add("open");
    hamburger.classList.add("open");
    overlay.classList.add("visible");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    hamburger.classList.remove("open");
    overlay.classList.remove("visible");
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", () =>
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar(),
  );
  overlay.addEventListener("click", closeSidebar);
  sidebar.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) closeSidebar();
    }),
  );
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeSidebar();
  });

  fetchDashboard();
});

/* ─────────────────────────────────────────────
   Render a single user row
───────────────────────────────────────────── */
function createUserRow(profile) {
  const name = profile.name || "Unknown";
  const occupation = profile.occupation || "—";
  const status = (
    profile.accountStatus ||
    profile.status ||
    "active"
  ).toLowerCase();
  const profileId = profile._id || profile.id;

  const loc = profile.location || {};
  const locationParts = [loc.city, loc.state, loc.country].filter(Boolean);
  const location = locationParts.length ? locationParts.join(", ") : null;

  const row = document.createElement("div");
  row.className = "user-row";
  row.dataset.status = status;
  row.dataset.name = name.toLowerCase();
  row.dataset.occupation = occupation.toLowerCase();

  row.innerHTML = `
    <div class="user-av" style="background:${colorForName(name)}">${initials(name)}</div>
    <div class="user-info">
      <strong>${escHtml(name)}</strong>
      <span>${escHtml(capitalize(occupation))}</span>
    </div>
    <div class="user-meta">
      ${location ? `<span class="user-location">📍 ${escHtml(location)}</span>` : ""}
      <span class="status-pill ${statusClass(status)}">${capitalize(status)}</span>
    </div>
    <span class="user-row-arrow">›</span>
  `;

  /* ── Click → fetch profile then navigate ── */
  if (profileId) {
    row.addEventListener("click", () => {
      window.location.href = `/admin/profile.html?id=${profileId}`;
    });
  }

  return row;
}

/* ─────────────────────────────────────────────
   Render stats
   API: { totalUser, totalDeleteRequest }
───────────────────────────────────────────── */
function renderStats(data = {}) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = val !== undefined && val !== null ? val : "—";
    el.classList.remove("loading");
  };
  set("statTotalUsers", data.totalUser);
  set("statPending", data.totalDeleteRequest);
}

/* ─────────────────────────────────────────────
   Render user list
───────────────────────────────────────────── */
function renderUsers(users = []) {
  const list = document.getElementById("userList");
  if (!list) return;
  list.innerHTML = "";

  const countEl = document.getElementById("userCount");
  if (countEl) {
    countEl.textContent =
      users.length === 1 ? "1 user" : `${users.length} users`;
  }

  if (!users.length) {
    list.innerHTML = `<div style="color:var(--muted);font-size:.82rem;text-align:center;padding:18px 0">No users yet.</div>`;
    return;
  }

  users.forEach((profile) => list.appendChild(createUserRow(profile)));
}

/* ─────────────────────────────────────────────
   Render admin name in navbar
───────────────────────────────────────────── */
function renderAdminInfo(data = {}) {
  const name = data.currUserName || data.admin?.name || null;
  if (!name) return;

  const nameEl = document.getElementById("adminName");
  const initialEl = document.getElementById("adminInitial");
  if (nameEl) nameEl.textContent = name;
  if (initialEl) initialEl.textContent = name.trim()[0].toUpperCase();
}

/* ─────────────────────────────────────────────
   renderError
───────────────────────────────────────────── */
function renderError(message, redirectUrl = null, delayMs = 5000) {
  ["statTotalUsers", "statPending"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = "–";
    el.classList.remove("loading");
  });

  const countEl = document.getElementById("userCount");
  if (countEl) countEl.textContent = "–";

  const list = document.getElementById("userList");
  if (!list) return;

  const countdownHtml = redirectUrl
    ? `<p class="error-redirect-msg" id="errorCountdown">
         Redirecting in <strong>${Math.ceil(delayMs / 1000)}s</strong>…
       </p>`
    : "";

  list.innerHTML = `
    <div class="error-state">
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8"  x2="12"    y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>${escHtml(message)}</p>
      ${countdownHtml}
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
        <button class="retry-btn" onclick="fetchDashboard()">Retry</button>
        ${
          redirectUrl
            ? `<button class="retry-btn primary"
               onclick="window.location.replace('${redirectUrl}')">Go now</button>`
            : ""
        }
      </div>
    </div>
  `;

  if (redirectUrl) {
    let remaining = Math.ceil(delayMs / 1000);
    const tick = setInterval(() => {
      remaining -= 1;
      const el = document.getElementById("errorCountdown");
      if (!el) {
        clearInterval(tick);
        return;
      }
      if (remaining <= 0) {
        clearInterval(tick);
        window.location.replace(redirectUrl);
      } else {
        el.innerHTML = `Redirecting in <strong>${remaining}s</strong>…`;
      }
    }, 1000);
  }
}

/* ─────────────────────────────────────────────
   Skeleton helper
───────────────────────────────────────────── */
function skeletonRow() {
  return `
    <div class="skeleton-row">
      <div class="skeleton-av"></div>
      <div class="skeleton-info">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────────
   Fetch /admin/dashboard  (no ?profile param)
   Response: { users, totalUser, totalDeleteRequest, currUserName }
───────────────────────────────────────────── */
async function fetchDashboard() {
  ["statTotalUsers", "statPending"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add("loading");
  });
  const list = document.getElementById("userList");
  if (list) list.innerHTML = skeletonRow() + skeletonRow() + skeletonRow();

  const token = localStorage.getItem("token");
  if (!token) {
    renderError(
      "No active session found. Please log in to continue.",
      "/login.html",
      5000,
    );
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      renderError(
        "Your session has expired. Please log in again.",
        "/login.html",
        5000,
      );
      return;
    }
    if (res.status === 403) {
      renderError(
        "This page is restricted to admins only.",
        "/user/dashboard.html",
        5000,
      );
      return;
    }
    if (!res.ok) {
      renderError(
        `Server error (${res.status}). Please try again later.`,
        null,
      );
      return;
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      renderStats({});
      renderUsers(data);
    } else {
      renderAdminInfo(data);
      renderStats(data);
      renderUsers(data.users || []);
    }
  } catch (err) {
    console.error("[Dashboard] Fetch error:", err);
    renderError(
      "Could not reach the server. Check your connection and try again.",
      null,
    );
  }
}

/* ─────────────────────────────────────────────
   Filter — name, occupation & status
───────────────────────────────────────────── */
function filterUsers() {
  const q =
    document.getElementById("userSearch")?.value.toLowerCase().trim() ?? "";
  const s = document.getElementById("statusFilter")?.value.toLowerCase() ?? "";
  const rows = document.querySelectorAll("#userList .user-row");
  let visible = 0;

  rows.forEach((r) => {
    const nameMatch = r.dataset.name.includes(q);
    const occupationMatch = r.dataset.occupation.includes(q);
    const statusMatch = !s || r.dataset.status === s || (s === "pending" && r.dataset.status === "marked for delete");
    const show = (nameMatch || occupationMatch) && statusMatch;
    r.style.display = show ? "flex" : "none";
    if (show) visible++;
  });

  const noResults = document.querySelector(".no-results");
  if (noResults) {
    noResults.style.display =
      rows.length > 0 && visible === 0 ? "block" : "none";
  }
}
