function validateEmail(email) {
  if (!email) {
    return "Email is required";
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return "Invalid email format";
  }
}

function validatePassword(password) {
  if (!password) {
    return "Password is required";
  }
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  if (!regex.test(password)) {
    return "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character";
  }
}

function validateRole(role) {
  if (!role) {
    return "Role is required";
  }
  const validRoles = ["admin", "user"];
  if (!validRoles.includes(role)) {
    return "Invalid role selected";
  }
}

function setError(inputBox, errorElement, message) {
  inputBox.classList.add("error-input");
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

function clearError(inputBox, errorElement) {
  inputBox.classList.remove("error-input");
  errorElement.textContent = "";
  errorElement.style.display = "none";
}

function showServerError(message) {
  const serverErrorContainer = document.getElementById("server-error");
  const serverErrorMsg = serverErrorContainer.querySelector(".error-message");
  const closeErrorBtn = document.getElementById("closeError");
  serverErrorMsg.textContent = message;
  serverErrorContainer.style.display = "flex";

  serverErrorContainer.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  closeErrorBtn.addEventListener("click", () => {
    serverErrorContainer.style.display = "none";
  });
}

function showSpinner(value) {
  const formBtn = document.querySelector(".form-btn");
  const btnText = formBtn.querySelector(".btn-txt");
  const spinner = formBtn.querySelector(".spinner");
  if (value) {
    btnText.style.display = "none";
    spinner.style.display = "inline-block";
  } else {
    spinner.style.display = "none";
    btnText.style.display = "inline-block";
  }
}

function togglePasswordVisibility(passwordInput, toggleIcon) {
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
  if (passwordInput.type === "text") {
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  } else {
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  }
}
