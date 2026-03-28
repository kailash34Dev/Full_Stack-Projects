document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/fetch-data-onboarding`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );

    const result = await response.json();
    if (response.ok) {
      const emailInput = document.getElementById("email");
      emailInput.value = result.email;
    } else {
      const submitBtn = document.getElementById("submitBtn");
      submitBtn.disabled = true;
      showServerError(
        result.message || "Something went wrong, Please try again.",
      );
      setTimeout(() => {
        if (response.status === 403) {
          if (result.role === "admin") {
            window.location.href = "/admin/dashboard.html";
          } else {
            window.location.href = "/user/dashboard.html";
          }
        } else {
          window.location.href = "/login.html";
        }
      }, 3000);
    }
  } catch (error) {
    showServerError("Something went wrong, Please try again.");
    console.error(error);
    setTimeout(() => {
      window.location.href = "/login.html";
    }, 3000);
  }
});
