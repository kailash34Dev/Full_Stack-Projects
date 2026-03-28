function showToast(toast, toastMessage, message, duration = 3000) {
  toastMessage.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}