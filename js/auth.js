const users = [
  { username: "lapangan1", password: "123", role: "lapangan" },
  { username: "admin1", password: "admin", role: "admin" },
];

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl = document.getElementById("loginError");

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    if (errorEl) errorEl.textContent = "Maneh saha ? naha aweuh di database.";
    return false;
  }

  localStorage.setItem("loggedInUser", JSON.stringify(user));

  // Redirect sesuai role
  if (user.role === "lapangan") {
    location.href = "route/input.html";
  } else if (user.role === "admin") {
    location.href = "route/admin.html";
  }

  return false;
}

// Pastikan user yang akses input.html memang role: lapangan
if (location.pathname.endsWith("/input.html")) {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || user.role !== "lapangan") {
    location.href = "../login.html";
  }
}

// Pastikan user yang akses admin.html memang role: admin
if (location.pathname.endsWith("/admin.html")) {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || user.role !== "admin") {
    location.href = "../login.html";
  }
}

// Logout
function logout() {
  localStorage.removeItem("loggedInUser");
  location.href = "../login.html";
}
