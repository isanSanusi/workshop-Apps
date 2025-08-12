const users = [
   { username: "lapangan1", password: "123", role: "lapangan" },
   { username: "admin1", password: "admin", role: "admin" },
];

document.getElementById("btn-signups").addEventListener("click", () => {
   flashAlert("error", "Please contact admin for registration");
});

document.getElementById("forgot-password").addEventListener("click", () => {
   flashAlert("error", "Kasiiaaannn deh loe..");
});
// const users = JSON.parse(localStorage.getItem("users")) || [];

function handleLogin(event) {
   event.preventDefault();
   const username = document.getElementById("username").value.trim();
   const password = document.getElementById("password").value.trim();

   console.log(username, password);
   const user = users.find(
      (u) => u.username === username && u.password === password
   );

   if (!user) {
      flashAlert("error", "Username or Password not found!");
      return false;
   }

   localStorage.setItem("loggedInUser", JSON.stringify(user));

   // Redirect sesuai role
   if (user.role === "lapangan") {
      location.href = "input.html";
   } else if (user.role === "admin") {
      location.href = "admin.html";
   }

   if (username === "admin" && password === "admin") {
      location.href = "admin.html";
   }

   return false;
}

// Pastikan user yang akses input.html memang role: lapangan
if (location.pathname.endsWith("/input.html")) {
   const user = JSON.parse(localStorage.getItem("loggedInUser"));
   if (!user || user.role !== "lapangan") {
      location.href = "./login.html";
   }
}

// Pastikan user yang akses admin.html memang role: admin
if (location.pathname.endsWith("/admin.html")) {
   const user = JSON.parse(localStorage.getItem("loggedInUser"));
   if (!user || user.role !== "admin") {
      location.href = "./login.html";
   }
}

// Logout
function logout() {
   localStorage.removeItem("loggedInUser");
   location.href = "./login.html";
}
