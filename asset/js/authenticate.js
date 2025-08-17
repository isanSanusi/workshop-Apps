// ================== UTIL HASH ==================
const toHex = (buf) =>
   [...new Uint8Array(buf)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
const hexToBuf = (hex) => {
   const arr = new Uint8Array(hex.length / 2);
   for (let i = 0; i < arr.length; i++)
      arr[i] = parseInt(hex.substr(i * 2, 2), 16);
   return arr.buffer;
};

function equalConstTime(a, b) {
   if (a.length !== b.length) return false;
   let diff = 0;
   for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
   return diff === 0;
}

async function hashPassword(
   password,
   {
      iterations = 100000,
      saltBytes = 16,
      hash = "SHA-256",
      keyLenBytes = 32,
   } = {}
) {
   const salt = new Uint8Array(saltBytes);
   crypto.getRandomValues(salt);
   const enc = new TextEncoder();
   const baseKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
   );
   const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash, salt, iterations },
      baseKey,
      keyLenBytes * 8
   );
   return {
      hash,
      iterations,
      salt: toHex(salt.buffer),
      derivedKey: toHex(bits),
   };
}

async function verifyPassword(password, record) {
   const enc = new TextEncoder();
   const baseKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
   );
   const saltBuf = hexToBuf(record.salt);
   const derived = await crypto.subtle.deriveBits(
      {
         name: "PBKDF2",
         hash: record.hash,
         salt: new Uint8Array(saltBuf),
         iterations: record.iterations,
      },
      baseKey,
      (record.derivedKey.length / 2) * 8
   );
   return equalConstTime(
      new Uint8Array(derived),
      new Uint8Array(hexToBuf(record.derivedKey))
   );
}

// ================== USER STORAGE ==================

// GET semua user
async function getUsers() {
   const users = await Storage.get("users_db"); // CHANGED
   // IndexedDB kembalikan array of record, kita ubah jadi object dengan key username
   const result = {};
   users.forEach((u) => {
      result[u.id] = u;
   }); // CHANGED
   return result;
}

// GET 1 user
async function getUser(username) {
   // CHANGED
   const dbUsers = await Storage.get("users_db");
   return dbUsers.find((u) => u.id === username) || null;
}

// SAVE/UPDATE user
async function saveUser(username, data) {
   // CHANGED
   await Storage.set("users_db", { id: username, ...data });
}

// HAPUS user
async function deleteUser(username) {
   // CHANGED
   const db = await Storage.openDB();
   return new Promise((resolve, reject) => {
      const tx = db.transaction("users_db", "readwrite");
      const store = tx.objectStore("users_db");
      const req = store.delete(username);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
   });
}

function onForgot() {
   flashAlert("error", "coming soon");
}
function onSignup() {
   flashAlert("error", "Please contact admin for registration");
}

// ================== INIT ADMIN DEFAULT ==================
async function initAdmin() {
   const admin = await getUser("admin"); // CHANGED
   if (!admin) {
      const record = await hashPassword("kmzway87aa");
      await saveUser("admin", { ...record, role: "administrasi" }); // CHANGED
   }
}
initAdmin();

// ================== LOGIN ==================
async function handleLogin(event) {
   event.preventDefault();
   const username = document.getElementById("username").value.trim();
   const password = document.getElementById("password").value.trim();

   const user = await getUser(username); // CHANGED
   if (!user) {
      flashAlert("error", "Username tidak ditemukan!");
      return false;
   }

   const ok = await verifyPassword(password, user);
   if (!ok) {
      flashAlert("error", "Password salah!");
      return false;
   }

   // simpan user aktif
   await Storage.set("loggedInUser", {
      id: "current",
      username,
      role: user.role,
   }); // CHANGED

   if (user.role === "operasional") location.href = "input.html";
   else if (user.role === "administrasi") location.href = "admin.html";

   return false;
}

// ================== CEK ROLE DI HALAMAN ==================
const path = location.pathname || "";
if (path.includes("input.html")) {
   (async () => {
      const logged = await Storage.get("loggedInUser");
      const user = logged && logged.length ? logged[0] : null;
      if (!user || user.role !== "operasional") location.href = "./login.html";
   })();
}
if (path.includes("admin.html")) {
   (async () => {
      const logged = await Storage.get("loggedInUser");
      const user = logged && logged.length ? logged[0] : null;
      if (!user || user.role !== "administrasi") location.href = "./login.html";
   })();
}

(async () => {
   const loggedArr = await Storage.get("loggedInUser");
   const officer = loggedArr && loggedArr.length ? loggedArr[0] : null;
   if (officer) {
      document.getElementById("officer-name").innerText = officer.username;
   } else {
      document.getElementById("officer-name").innerText = "Guest";
   }
})();

// ================== LOGOUT ==================
async function logout() {
   await Storage.remove("loggedInUser"); // CHANGED
   location.href = "./login.html";
}

// ================== REGISTER USER BARU (Hanya Admin) ==================
async function registerUser(username, password, role = "operasional") {
   const loggedArr = await Storage.get("loggedInUser");
   const logged = loggedArr && loggedArr.length ? loggedArr[0] : null;

   if (!logged || logged.role !== "administrasi") {
      flashAlert("error", "Hanya admin yang bisa menambah user");
      return;
   }

   const existing = await getUser(username); // CHANGED
   if (existing) {
      flashAlert("error", "User sudah ada");
      return;
   }

   const record = await hashPassword(password);
   await saveUser(username, { ...record, role }); // CHANGED
   flashAlert("success", `User ${username} berhasil dibuat`);
}
