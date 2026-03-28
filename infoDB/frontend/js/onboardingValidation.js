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
  maritalStatus: { required: true, msg: "Please select your marital status." },
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
  pinCode: {
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
  const rule = rules[id];
  const el = document.getElementById(id);
  const wrap = document.getElementById("f-" + id);
  const msg = document.getElementById("msg-" + id);
  if (!rule || !el || !wrap) return true;

  const val = el.value.trim();
  let err = "";

  if (rule.required && !val) {
    err = rule.msg || "This field is required.";
  } else if (val) {
    if (rule.pattern && !rule.pattern.test(val)) err = rule.msg;
    else if (rule.minLen && val.length < rule.minLen) err = rule.msg;
  }

  wrap.classList.toggle("error", !!err);
  wrap.classList.toggle("success", !err && !!val);
  msg.textContent = err;
  return !err;
}

Object.keys(rules).forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const evt =
    el.tagName === "SELECT" || el.type === "date" ? "change" : "input";
  el.addEventListener(evt, () => validateField(id));
  el.addEventListener("blur", () => validateField(id));
});

function showSuccess(payload) {
  document.getElementById("server-error").style.display = "none";
  document.querySelector(".card").style.display = "none";

  document.getElementById("success-name").textContent = payload.name || "—";
  document.getElementById("success-email").textContent = payload.email || "—";
  document.getElementById("success-location").textContent =
    [payload.city, payload.state].filter(Boolean).join(", ") || "—";

  const successEl = document.getElementById("successState");
  successEl.classList.add("show");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("submitBtn").addEventListener("click", async () => {
  const allValid = Object.keys(rules)
    .map((id) => validateField(id))
    .every(Boolean);

  if (!allValid) {
    const firstErr = document.querySelector(".field.error");
    if (firstErr)
      firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const payload = {};
  Object.keys(rules).forEach((id) => {
    const el = document.getElementById(id);
    payload[id] = el ? el.value.trim() : "";
  });

  const submitBtn = document.getElementById("submitBtn");
  const originalHTML = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg viewBox="0 0 24 24" style="animation:spin 1s linear infinite">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity=".3"/>
      <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" stroke-width="2" fill="none"/>
    </svg>
    Saving...
  `;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE_URL}/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      showServerError(
        data.message || "Something went wrong, Please try again.",
      );
    } else {
      const successBtn = document.getElementById("onboard-success-btn");
      if (data.role === "admin") {
        successBtn.href = "/admin/dashboard.html";
        showSuccess(payload);
        setTimeout(() => {
          window.location.href = "/admin/dashboard.html";
        }, 5000);
      } else {
        successBtn.href = "/user/dashboard.html";
        showSuccess(payload);
        setTimeout(() => {
          window.location.href = "/user/dashboard.html";
        }, 5000);
      }
    }
  } catch (error) {
    console.error(error);
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHTML;
    showServerError("Something went wrong. Please try again.");
  }
});

/* ── RESET ── */
document.getElementById("resetBtn").addEventListener("click", () => {
  Object.keys(rules).forEach((id) => {
    const el = document.getElementById(id);
    const wrap = document.getElementById("f-" + id);
    const msg = document.getElementById("msg-" + id);
    if (el) el.value = "";
    if (wrap) wrap.classList.remove("error", "success");
    if (msg) msg.textContent = "";
  });

  document.getElementById("server-error").style.display = "none";
});
