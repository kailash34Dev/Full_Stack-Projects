const form = document.getElementById("form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberMeCheckbox = document.getElementById("remember");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailError = validateEmail(emailInput.value);
  const passwordError = validatePassword(passwordInput.value);

  if (emailError) {
    const emailErrorElement = document.getElementById("email-error");
    setError(emailInput.parentElement, emailErrorElement, emailError);
  } else {
    const emailErrorElement = document.getElementById("email-error");
    clearError(emailInput.parentElement, emailErrorElement);
  }

  if (passwordError) {
    const passwordErrorElement = document.getElementById("password-error");
    setError(passwordInput.parentElement, passwordErrorElement, passwordError);
  } else {
    const passwordErrorElement = document.getElementById("password-error");
    clearError(passwordInput.parentElement, passwordErrorElement);
  }

  const errorInputs = document.querySelectorAll(".error-input");
  if (errorInputs.length > 0) {
    errorInputs[0].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    errorInputs[0].focus();
  }

  if (!emailError && !passwordError) {
    showSpinner(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailInput.value,
          password: passwordInput.value,
          remember: rememberMeCheckbox.checked,
        }),
      });

      const result = await response.json();
      if (response.ok && result.role === "admin") {
        form.reset();
        localStorage.setItem("token", result.token);
        showToast(toast, toastMessage, "Login Successful", 1000);
        setTimeout(() => {
          showSpinner(false);
          window.location.href = "/admin/dashboard.html";
        }, 3000);
      } else if (response.ok && result.role === "user") {
        form.reset();
        localStorage.setItem("token", result.token);
        showToast(toast, toastMessage, "Login Successful", 1000);
        setTimeout(() => {
          showSpinner(false);
          window.location.href = "/user/dashboard.html";
        }, 3000);
      } else {
        showServerError(result.message || "Invalid email or password");
        showSpinner(false);
      }
    } catch (error) {
      showServerError(
        "An error occurred during login. Please try again later.",
      );
      console.error(error);
      showSpinner(false);
    }
  }
});

const togglePassword = document.getElementById("toggle-password");
togglePassword.addEventListener("click", () => {
  togglePasswordVisibility(passwordInput, togglePassword);
});
