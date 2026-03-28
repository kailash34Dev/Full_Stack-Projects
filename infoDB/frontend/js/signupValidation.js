const form = document.getElementById("form");
const emailInput = document.getElementById("email");
const roleInput = document.getElementById("role");
const passwordInput = document.getElementById("password");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailError = validateEmail(emailInput.value);
  const roleError = validateRole(roleInput.value);
  const passwordError = validatePassword(passwordInput.value);

  if (emailError) {
    const emailErrorElement = document.getElementById("email-error");
    setError(emailInput.parentElement, emailErrorElement, emailError);
  } else {
    const emailErrorElement = document.getElementById("email-error");
    clearError(emailInput.parentElement, emailErrorElement);
  }

  if (roleError) {
    const roleErrorElement = document.getElementById("role-error");
    setError(roleInput.parentElement, roleErrorElement, roleError);
  } else {
    const roleErrorElement = document.getElementById("role-error");
    clearError(roleInput.parentElement, roleErrorElement);
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

  if (!emailError && !roleError && !passwordError) {
    showSpinner(true);
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailInput.value,
          role: roleInput.value,
          password: passwordInput.value,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        form.reset();
        localStorage.setItem("token", result.token);
        showToast(
          toast,
          toastMessage,
          "Account created successfully, Now setup your account",
        );
        setTimeout(() => {
          showSpinner(false);
          window.location.href = "/onboarding.html";
        }, 3000);
      } else {
        showServerError(result.message || "Something went wrong!");
        showSpinner(false);
      }
    } catch (error) {
      showServerError(
        "An error occurred during signup. Please try again later.",
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
