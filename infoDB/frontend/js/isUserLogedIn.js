document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/is-user-logedin`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const result = await response.json();
    if (response.ok && result.role === "admin") {
      window.location.href = "/admin/dashboard.html";
    } else if (response.ok && result.role === "user") {
      window.location.href = "/user/dashboard.html";
    }
  } catch (error) {
    console.error(error.message);
  }
});
