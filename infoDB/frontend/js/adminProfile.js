/* ─────────────────────────────────────────────
   All Profile schema fields
───────────────────────────────────────────── */
const fieldIds = [
  "role",
  "email",
  "name",
  "dob",
  "age",
  "gender",
  "maritialStatus",
  "phoneNo",
  "whatsAPPNo",
  "address",
  "city",
  "state",
  "country",
  "pincode",
  "education",
  "occupation",
  "income",
  "bio",
];

// Fields excluded from validation (read-only / auto-calculated)
const skipValidation = new Set(["age", "role", "email"]);

let snapshot = {};

/* ─────────────────────────────────────────────
   Sidebar toggle
───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const hamburger = document.getElementById("hamburger");

  if (hamburger && sidebar && overlay) {
    const openSidebar = () => {
      sidebar.classList.add("open");
      hamburger.classList.add("open");
      overlay.classList.add("visible");
      document.body.style.overflow = "hidden";
    };
    const closeSidebar = () => {
      sidebar.classList.remove("open");
      hamburger.classList.remove("open");
      overlay.classList.remove("visible");
      document.body.style.overflow = "";
    };

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
  }

  // Initialize edit functionality logic
  initEditMode();
  // Initialize validation
  initValidation();
  // Initialize Modals
  initModals();

  // Boot — fetch profile on page load
  fetchProfile();
});

/* ─────────────────────────────────────────────
   Populate fields from Profile data
───────────────────────────────────────────── */
function populateFields(profile) {
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const val = profile[id];
    if (val === undefined || val === null) return;

    if (el.tagName === "SELECT") {
      const valStr = String(val).trim().toLowerCase();
      // Find matching option via exact value or inner text
      let opt = [...el.options].find((o) => {
        const oVal = o.value.toLowerCase();
        const oText = o.text.toLowerCase();
        return oVal === valStr || oText === valStr;
      });

      // Fallback: partial inclusions string similarity
      if (!opt) {
        opt = [...el.options].find((o) => {
          const oVal = o.value.toLowerCase();
          return (
            (oVal && valStr.includes(oVal)) || (valStr && oVal.includes(valStr))
          );
        });
      }

      if (opt) {
        el.value = opt.value;
      } else {
        // Fallback: If completely unseen value is received, inject it so it still shows!
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

/* ─────────────────────────────────────────────
   Update navbar with user name
───────────────────────────────────────────── */
function updateNavbar(name = "") {
  const navName = document.getElementById("navName");
  const navInitial = document.getElementById("navInitial");
  if (navName) navName.textContent = name || "—";
  if (navInitial)
    navInitial.textContent = name ? name.trim()[0].toUpperCase() : "?";
}

/* ─────────────────────────────────────────────
   Show / hide UI states
───────────────────────────────────────────── */
function showSkeleton() {
  document.getElementById("skeletonUI").style.display = "";
  document.getElementById("profileForm").style.display = "none";
  document.getElementById("errorUI").style.display = "none";
  document.getElementById("editBtn").style.display = "none";
  document.getElementById("deleteBtn").style.display = "none";
}

function showForm() {
  document.getElementById("skeletonUI").style.display = "none";
  document.getElementById("profileForm").style.display = "";
  document.getElementById("errorUI").style.display = "none";
  document.getElementById("editBtn").style.display = "flex";
  document.getElementById("deleteBtn").style.display = "flex";
}

function showError(msg) {
  document.getElementById("skeletonUI").style.display = "none";
  document.getElementById("profileForm").style.display = "none";
  document.getElementById("errorUI").style.display = "";
  document.getElementById("errorMsg").textContent = msg;
  document.getElementById("editBtn").style.display = "none";
  document.getElementById("deleteBtn").style.display = "none";
}

/* ─────────────────────────────────────────────
   Fetch profile from server
───────────────────────────────────────────── */
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

function getProfileEndpoint() {
  const userId = new URLSearchParams(window.location.search).get("id");
  return userId && userId !== "self"
    ? `${API_BASE}/profile?id=${userId}`
    : `${API_BASE}/profile?id=self`;
}

async function fetchProfile() {
  showSkeleton();

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  try {
    const res = await fetch(getProfileEndpoint(), {
      method: "GET",
      headers: authHeaders(),
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login.html";
      return;
    }

    if (res.status === 403) {
      window.location.href = "/user/dashboard.html";
      return;
    }

    if (!res.ok) {
      throw new Error(`Server error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    // Flatten the deeply nested backend response
    const reqUser = data.reqUser || data.user || data.profile || data;
    const userCreds = reqUser.user || {};
    const loc = reqUser.location || {};

    const flatProfile = {
      role: userCreds.role || reqUser.role,
      email: userCreds.email || reqUser.email,
      name: reqUser.name,
      dob: reqUser.dob,
      age: reqUser.age,
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
    updateNavbar(data.currUserName || flatProfile.name);

    // Dynamic Headline
    const isOtherUser =
      new URLSearchParams(window.location.search).get("id") &&
      new URLSearchParams(window.location.search).get("id") !== "self";
    const headline = document.getElementById("profileHeadline");
    if (headline) {
      headline.textContent = isOtherUser
        ? `${flatProfile.name}'s Profile`
        : "Your Profile";
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
    console.error("[Profile] Fetch error:", err);
    const isOtherUser =
      new URLSearchParams(window.location.search).get("id") &&
      new URLSearchParams(window.location.search).get("id") !== "self";
    showError(
      isOtherUser
        ? "Could not load user profile. Please try again."
        : "Could not load your profile. Please try again.",
    );
  }
}

/* ─────────────────────────────────────────────
   Edit / View mode
───────────────────────────────────────────── */
function initEditMode() {
  const profileCard = document.getElementById("profileCard");
  const editBtn = document.getElementById("editBtn");
  const actionsEdit = document.getElementById("actionsEdit");
  const cancelBtn = document.getElementById("cancelBtn");

  if (!editBtn) return;

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

  function enterEditMode() {
    takeSnapshot();
    fieldIds.forEach((id) => {
      const el = document.getElementById(id);
      const wrap = document.getElementById("f-" + id);
      if (el && id !== "age" && id !== "email" && id !== "role")
        el.disabled = false; // age, role & email read-only usually
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

  editBtn.addEventListener("click", enterEditMode);
  cancelBtn.addEventListener("click", () => {
    restoreSnapshot();
    enterViewMode();
  });

  /* Auto-calculate age from dob */
  const dobEl = document.getElementById("dob");
  if (dobEl) {
    dobEl.addEventListener("change", function () {
      const ageEl = document.getElementById("age");
      if (!this.value || !ageEl) return;
      const birth = new Date(this.value);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      ageEl.value = age > 0 ? age : "";
    });
  }
}

/* ─────────────────────────────────────────────
   Validation rules
───────────────────────────────────────────── */
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

function validateField(id) {
  if (skipValidation.has(id)) return true;
  const rule = rules[id];
  const el = document.getElementById(id);
  const wrap = document.getElementById("f-" + id);
  const msg = document.getElementById("msg-" + id);
  if (!rule || !el || !wrap || el.disabled) return true;

  const val = el.value.trim();
  let err = "";
  if (rule.required && !val) err = rule.msg;
  else if (val && rule.pattern && !rule.pattern.test(val)) err = rule.msg;
  else if (val && rule.minLen && val.length < rule.minLen) err = rule.msg;

  wrap.classList.toggle("error", !!err);
  wrap.classList.toggle("success", !err && !!val);
  if (msg) msg.textContent = err;
  return !err;
}

function initValidation() {
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el || skipValidation.has(id)) return;
    const evt =
      el.tagName === "SELECT" || el.type === "date" ? "change" : "input";
    el.addEventListener(evt, () => validateField(id));
    el.addEventListener("blur", () => validateField(id));
  });

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
}

/* ─────────────────────────────────────────────
   Modal helpers & Actions
───────────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove("open");
    document.body.style.overflow = "";
  }
}

function initModals() {
  document.querySelectorAll(".modal-backdrop").forEach((b) =>
    b.addEventListener("click", (e) => {
      if (e.target === b) closeModal(b.id);
    }),
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape")
      document
        .querySelectorAll(".modal-backdrop.open")
        .forEach((m) => closeModal(m.id));
  });

  const deleteBtn = document.getElementById("deleteBtn");
  const deleteCancelBtn = document.getElementById("deleteCancelBtn");
  const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");

  if (deleteBtn)
    deleteBtn.addEventListener("click", () => openModal("deleteModalBackdrop"));
  if (deleteCancelBtn)
    deleteCancelBtn.addEventListener("click", () =>
      closeModal("deleteModalBackdrop"),
    );

  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener("click", async () => {
      closeModal("deleteModalBackdrop");
      try {
        const userId = new URLSearchParams(window.location.search).get("id");
        const deleteEndpoint =
          userId && userId !== "self"
            ? `${API_BASE}/profile/delete?id=${userId}`
            : `${API_BASE}/profile/delete?id=self`;

        const res = await fetch(deleteEndpoint, {
          method: "DELETE",
          headers: authHeaders(),
        });
        if (res.ok) {
          showToast("delete");
          const isSelfDelete = !userId || userId === "self";
          setTimeout(() => {
            if (isSelfDelete) {
              // Admin deleted their own profile — log out
              localStorage.removeItem("token");
              window.location.href = "/login.html";
            } else {
              // Admin deleted another user — go back to dashboard
              window.location.href = "/admin/dashboard.html";
            }
          }, 1500);
        } else {
          console.error("[Profile] Delete failed:", res.status);
          showToast("error");
        }
      } catch (err) {
        console.error("[Profile] Delete error:", err);
        showToast("error");
      }
    });
  }

  const editCancelBtn = document.getElementById("editCancelBtn");
  const editConfirmBtn = document.getElementById("editConfirmBtn");

  if (editCancelBtn)
    editCancelBtn.addEventListener("click", () =>
      closeModal("editModalBackdrop"),
    );

  if (editConfirmBtn) {
    editConfirmBtn.addEventListener("click", async () => {
      // Build nested payload matching backend expectations
      const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
      };

      const payload = {
        name: getVal("name"),
        dob: getVal("dob"),
        gender: getVal("gender"),
        maritalStatus: getVal("maritialStatus"),
        phoneNo: getVal("phoneNo"),
        whatsAPPNo: getVal("whatsAPPNo"),
        education: getVal("education"),
        occupation: getVal("occupation"),
        income: getVal("income"),
        bio: getVal("bio"),
        address: getVal("address"),
        city: getVal("city"),
        state: getVal("state"),
        country: getVal("country"),
        pinCode: getVal("pincode"),
      };

      try {
        const userId = new URLSearchParams(window.location.search).get("id");
        const editEndpoint =
          userId && userId !== "self"
            ? `${API_BASE}/profile/edit?id=${userId}`
            : `${API_BASE}/profile/edit?id=self`;

        const res = await fetch(editEndpoint, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`Save failed: ${res.status}`);

        if (payload.name) updateNavbar(payload.name);

        closeModal("editModalBackdrop");

        // Switch back to view mode manually
        fieldIds.forEach((id) => {
          const el = document.getElementById(id);
          const wrap = document.getElementById("f-" + id);
          if (el) el.disabled = true;
          if (wrap) {
            wrap.classList.add("view-mode");
            wrap.classList.remove("error", "success");
          }
        });
        document.getElementById("profileCard").classList.remove("editing");
        document.getElementById("editBtn").style.display = "flex";
        document.getElementById("actionsEdit").style.display = "none";

        showToast("save");
      } catch (err) {
        console.error("[Profile] Save error:", err);
        closeModal("editModalBackdrop");
        showToast("error");
      }
    });
  }
}

/* ─────────────────────────────────────────────
   Toast
───────────────────────────────────────────── */
function showToast(type = "save") {
  const t = document.getElementById("toast");
  if (!t) return;
  const span = t.querySelector("span");
  const icon = t.querySelector("svg");

  const configs = {
    save: {
      border: "var(--success)",
      stroke: "var(--success)",
      text: "Profile updated successfully!",
    },
    delete: {
      border: "var(--error)",
      stroke: "var(--error)",
      text: "Profile deleted successfully!",
    },
    error: {
      border: "var(--error)",
      stroke: "var(--error)",
      text: "Something went wrong. Please try again.",
    },
  };

  const cfg = configs[type] || configs.save;
  t.style.borderColor = cfg.border;
  if (icon) icon.style.stroke = cfg.stroke;
  if (span) span.textContent = cfg.text;

  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3500);
}