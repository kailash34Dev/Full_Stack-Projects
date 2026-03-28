const logoutBtn = document.getElementById("confirmLogout");
const cancelBtn = document.getElementById("cancelLogout");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");

  logoutBtn.innerHTML =
    '<svg viewBox="0 0 24 24" style="animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity=".3"/><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" stroke-width="2" fill="none"/></svg> Logging out...';
  logoutBtn.style.opacity = ".8";
  logoutBtn.disabled = true;

  showToast(toast, toastMessage, "You have been logged out");

  setTimeout(() => {
    window.location.href = "/index.html";
  }, 3000);
});

cancelBtn.addEventListener("click", () => {
  window.history.back();
});
