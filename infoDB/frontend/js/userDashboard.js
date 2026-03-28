const API_BASE = API_BASE_URL;

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: "Bearer " + token } : {}),
    ...extra,
  };
}

/* ── SIDEBAR ── */
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
sidebar.querySelectorAll("a").forEach((l) =>
  l.addEventListener("click", () => {
    if (window.innerWidth <= 768) closeSidebar();
  }),
);
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) closeSidebar();
});

/* ── MODAL HELPERS ── */
function openModal(id) {
  document.getElementById(id).classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  document.body.style.overflow = "";
}

// Close modal on backdrop click
document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal(backdrop.id);
  });
});

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document
      .querySelectorAll(".modal-backdrop.open")
      .forEach((m) => closeModal(m.id));
  }
});

/* ── VALIDATION ── */
const rules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    msg: "Enter a valid email address.",
  },
  name: {
    required: true,
    minLen: 2,
    msg: "Name must be at least 2 characters.",
  },
  dob: { required: true, msg: "Please select your date of birth." },
  gender: { required: true, msg: "Please select your gender." },
  maritialStatus: { required: true, msg: "Please select your marital status." },
  phoneNo: {
    required: true,
    pattern: /^[+]?[\d\s\-()]{7,15}$/,
    msg: "Enter a valid phone number.",
  },
  whatsAPPNo: {
    required: true,
    pattern: /^[+]?[\d\s\-()]{7,15}$/,
    msg: "Enter a valid WhatsApp number.",
  },
  address: {
    required: true,
    minLen: 5,
    msg: "Address must be at least 5 characters.",
  },
  city: { required: true, minLen: 2, msg: "Enter a valid city name." },
  state: { required: true, minLen: 2, msg: "Enter a valid state name." },
  country: { required: true, minLen: 2, msg: "Enter a valid country name." },
  pincode: {
    required: true,
    pattern: /^\d{4,10}$/,
    msg: "Enter a valid pincode (4–10 digits).",
  },
  education: { required: true, msg: "Please select your education level." },
  occupation: {
    required: true,
    minLen: 2,
    msg: "Occupation must be at least 2 characters.",
  },
  income: { required: true, msg: "Please select your income range." },
  bio: {
    required: true,
    minLen: 10,
    msg: "Bio must be at least 10 characters.",
  },
};

const fieldIds = ["role", ...Object.keys(rules)];

function validateField(id) {
  const rule = rules[id];
  const el = document.getElementById(id);
  const wrap = document.getElementById("f-" + id);
  const msg = document.getElementById("msg-" + id);
  if (!rule || !el || !wrap || el.disabled) return true;

  const val = el.value.trim();
  let err = "";
  if (rule.required && !val) err = rule.msg;
  else if (val) {
    if (rule.pattern && !rule.pattern.test(val)) err = rule.msg;
    else if (rule.minLen && val.length < rule.minLen) err = rule.msg;
  }
  wrap.classList.toggle("error", !!err);
  wrap.classList.toggle("success", !err && !!val);
  msg.textContent = err;
  return !err;
}

fieldIds.forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const evt =
    el.tagName === "SELECT" || el.type === "date" ? "change" : "input";
  el.addEventListener(evt, () => validateField(id));
  el.addEventListener("blur", () => validateField(id));
});

/* ── UI STATES ── */
const skeletonUI = document.getElementById("skeletonUI");
const errorUI = document.getElementById("errorUI");
const profileForm = document.getElementById("profileForm");

function showSkeleton() {
  if (skeletonUI && profileForm && errorUI) {
    skeletonUI.style.display = "block";
    profileForm.style.display = "none";
    errorUI.style.display = "none";
  }
}

function showForm() {
  if (skeletonUI && profileForm && errorUI) {
    skeletonUI.style.display = "none";
    profileForm.style.display = "block";
    errorUI.style.display = "none";
  }
}

function showError(msg) {
  if (skeletonUI && profileForm && errorUI) {
    skeletonUI.style.display = "none";
    profileForm.style.display = "none";
    errorUI.style.display = "block";
    const statusP = document.getElementById("errorMsg");
    if (statusP && msg) statusP.textContent = msg;
  }
}

/* ── DATA FETCHING & POPULATION ── */
async function fetchDashboard() {
  showSkeleton();
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/user/dashboard`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login.html";
      return;
    }

    if (!res.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    const data = await res.json();
    const reqUser = data.reqUser || data;
    if (!reqUser || (!reqUser.name && !reqUser.user))
      throw new Error("No valid user data found.");

    const userCreds = reqUser.user || {};
    const loc = reqUser.location || {};

    const flatProfile = {
      role: userCreds.role || reqUser.role,
      email: userCreds.email || reqUser.email,
      name: reqUser.name,
      dob: reqUser.dob,
      gender: reqUser.gender,
      maritialStatus: reqUser.maritalStatus || reqUser.maritialStatus,
      phoneNo: reqUser.phoneNo,
      whatsAPPNo: reqUser.whatsAPPNo,
      address: loc.address,
      city: loc.city,
      state: loc.state,
      country: loc.country,
      pincode: loc.pinCode || loc.pincode,
      education: reqUser.education,
      occupation: reqUser.occupation,
      income: reqUser.income,
      bio: reqUser.bio,
    };

    populateFields(flatProfile);

    // Update navbar name
    const navName = document.querySelector(".nav-greeting strong");
    const profileName = document.querySelector(".profile-name");

    if (navName) navName.textContent = data.currUserName || flatProfile.name;
    if (profileName)
      profileName.textContent = (data.currUserName || flatProfile.name)
        .charAt(0)
        .toUpperCase();

    // Dynamically update the Navbar Badge and Delete Button Text based on role
    const badgeEl = document.querySelector(".profile-icon .badge");
    if (badgeEl && flatProfile.role) {
      badgeEl.textContent =
        flatProfile.role.toLowerCase() === "admin" ? "Admin" : "User";
    }

    const delBtn = document.getElementById("deleteBtn");
    if (
      delBtn &&
      flatProfile.role &&
      flatProfile.role.toLowerCase() === "admin"
    ) {
      delBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4h6v2" />
        </svg>
        Delete Profile
      `;
    }

    // Account Status Badge
    const accountStatus = reqUser.accountStatus || reqUser.status || "active";
    const statusBadge = document.getElementById("accountStatusBadge");
    if (statusBadge) {
      statusBadge.textContent = accountStatus;
      statusBadge.className =
        "status-pill " +
        (accountStatus.toLowerCase() === "active" ? "s-active" : "s-pending");
      statusBadge.style.display = "inline-flex";
      // Additional safety fallbacks for background/color if classes missing
      if (accountStatus.toLowerCase() === "active") {
        statusBadge.style.backgroundColor = "rgba(58, 158, 110, 0.1)";
        statusBadge.style.color = "var(--success, #3a9e6e)";
        statusBadge.style.border = "1px solid rgba(58, 158, 110, 0.2)";
      } else {
        statusBadge.style.backgroundColor = "rgba(255, 107, 71, 0.1)";
        statusBadge.style.color = "var(--error, #ff6b47)";
        statusBadge.style.border = "1px solid rgba(255, 107, 71, 0.2)";
      }
    }

    showForm();
  } catch (err) {
    console.error(err);
    showError(err.message || "Failed to load your profile.");
  }
}

function populateFields(profile) {
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const val = profile[id];
    if (val === undefined || val === null) return;

    if (el.tagName === "SELECT") {
      const valStr = String(val).trim().toLowerCase();

      let opt = [...el.options].find((o) => {
        const oVal = o.value.toLowerCase();
        const oText = o.text.toLowerCase();
        return oVal === valStr || oText === valStr;
      });

      if (!opt) {
        opt = [...el.options].find((o) => {
          const oVal = o.value.toLowerCase();
          return (oVal && valStr.includes(oVal)) || (valStr && oVal.includes(valStr));
        });
      }

      if (opt) {
        el.value = opt.value;
      } else {
        const fallbackOpt = new Option(val, val);
        el.add(fallbackOpt);
        el.value = val;
      }
    } else if (el.type === "date") {
      el.value = String(val).slice(0, 10);
    } else {
      el.value = val;
    }
  });
}

document.addEventListener("DOMContentLoaded", fetchDashboard);

/* ── SNAPSHOT & EDIT / VIEW MODE ── */
let snapshot = {};
function takeSnapshot() {
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) snapshot[id] = el.value;
  });
}
function restoreSnapshot() {
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = snapshot[id];
  });
}

const profileCard = document.getElementById("profileCard");
const editBtn = document.getElementById("editBtn");
const actionsEdit = document.getElementById("actionsEdit");

function enterEditMode() {
  takeSnapshot();
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    const wrap = document.getElementById("f-" + id);
    if (el && id !== "email" && id !== "role") el.disabled = false; // keep email and role read-only
    if (wrap) wrap.classList.remove("view-mode");
  });
  profileCard.classList.add("editing");
  editBtn.style.display = "none";
  actionsEdit.style.display = "flex";
}

function enterViewMode() {
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    const wrap = document.getElementById("f-" + id);
    const msg = document.getElementById("msg-" + id);
    if (el) el.disabled = true;
    if (wrap) {
      wrap.classList.add("view-mode");
      wrap.classList.remove("error", "success");
    }
    if (msg) msg.textContent = "";
  });
  profileCard.classList.remove("editing");
  editBtn.style.display = "flex";
  actionsEdit.style.display = "none";
}

if (editBtn) editBtn.addEventListener("click", enterEditMode);
const cancelBtn = document.getElementById("cancelBtn");
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    restoreSnapshot();
    enterViewMode();
  });
}

/* ── SAVE (triggers edit confirmation modal) ── */
const saveBtn = document.getElementById("saveBtn");
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    const allValid = fieldIds.map((id) => validateField(id)).every(Boolean);
    if (!allValid) {
      const firstErr = document.querySelector(".field.error");
      if (firstErr)
        firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    openModal("editModalBackdrop");
  });
}

/* ── EDIT CONFIRMATION ── */
const editCancelBtn = document.getElementById("editCancelBtn");
if (editCancelBtn) {
  editCancelBtn.addEventListener("click", () =>
    closeModal("editModalBackdrop"),
  );
}

const editConfirmBtn = document.getElementById("editConfirmBtn");
if (editConfirmBtn) {
  editConfirmBtn.addEventListener("click", async () => {
    const payload = {};
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : "";
    };

    payload.name = getVal("name");
    payload.dob = getVal("dob");
    payload.gender = getVal("gender");
    payload.maritalStatus = getVal("maritialStatus");
    payload.phoneNo = getVal("phoneNo");
    payload.whatsAPPNo = getVal("whatsAPPNo");
    payload.education = getVal("education");
    payload.occupation = getVal("occupation");
    payload.income = getVal("income");
    payload.bio = getVal("bio");
    payload.address = getVal("address");
    payload.city = getVal("city");
    payload.state = getVal("state");
    payload.country = getVal("country");
    payload.pinCode = getVal("pincode");

    try {
      const res = await fetch(`${API_BASE}/profile/edit?id=self`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      if (payload.name) {
        const navName = document.querySelector(".nav-greeting strong");
        const profileName = document.querySelector(".profile-name");
        if (navName) navName.textContent = payload.name;
        if (profileName)
          profileName.textContent = payload.name.charAt(0).toUpperCase();
      }

      closeModal("editModalBackdrop");
      enterViewMode();
      showToast("save");
    } catch (err) {
      console.error(err);
      showToast("error");
    }
  });
}

/* ── DELETE MODAL ── */
const deleteBtnBtn = document.getElementById("deleteBtn");
if (deleteBtnBtn)
  deleteBtnBtn.addEventListener("click", () =>
    openModal("deleteModalBackdrop"),
  );

const deleteCancelBtn = document.getElementById("deleteCancelBtn");
if (deleteCancelBtn)
  deleteCancelBtn.addEventListener("click", () =>
    closeModal("deleteModalBackdrop"),
  );

const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");
if (deleteConfirmBtn) {
  deleteConfirmBtn.addEventListener("click", async () => {
    closeModal("deleteModalBackdrop");
    try {
      const res = await fetch(`${API_BASE}/profile/delete?id=self`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        showToast("delete");
        setTimeout(() => {
          localStorage.removeItem("token");
          window.location.href = "/login.html";
        }, 1500);
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error(err);
      showToast("error");
    }
  });
}

/* ── TOAST ── */
function showToast(type = "save") {
  const t = document.getElementById("toast");
  if (!t) return;
  const span = t.querySelector("span");
  const icon = t.querySelector("svg");

  if (type === "delete") {
    t.style.borderColor = "var(--error)";
    if (icon) icon.style.stroke = "var(--error)";
    if (span) span.textContent = "Profile deleted successfully!";
  } else if (type === "error") {
    t.style.borderColor = "var(--error)";
    if (icon) icon.style.stroke = "var(--error)";
    if (span) span.textContent = "Action failed. Please try again.";
  } else {
    t.style.borderColor = "var(--success)";
    if (icon) icon.style.stroke = "var(--success)";
    if (span) span.textContent = "Profile updated successfully!";
  }
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3500);
}
