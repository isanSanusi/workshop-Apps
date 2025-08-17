// storage.js

class Storage {
   static backend = "indexeddb"; // bisa diubah ke "local" kalau mau testing localStorage

   // ===== LocalStorage Version =====
   static local = {
      set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
      get: (key) => {
         const data = localStorage.getItem(key);
         return data ? JSON.parse(data) : null;
      },
      remove: (key) => localStorage.removeItem(key),
   };

   // ===== IndexedDB Version =====
   static async openDB() {
      return new Promise((resolve, reject) => {
         const request = indexedDB.open("MyAppDB", 2); // ⬅️ naik versi ke 2

         request.onupgradeneeded = (e) => {
            const db = e.target.result;

            // USERS (id = username)
            if (db.objectStoreNames.contains("users_db")) {
               db.deleteObjectStore("users_db");
            }
            db.createObjectStore("users_db", { keyPath: "id" });

            // LOGGED IN USER (hanya simpan 1 user aktif, id = "current")
            if (db.objectStoreNames.contains("loggedInUser")) {
               db.deleteObjectStore("loggedInUser");
            }
            db.createObjectStore("loggedInUser", { keyPath: "id" });

            // HARGA PER KELOMPOK (disimpan sebagai record tunggal, id = "all")
            if (db.objectStoreNames.contains("harga_per_kelompok")) {
               db.deleteObjectStore("harga_per_kelompok");
            }
            db.createObjectStore("harga_per_kelompok", { keyPath: "id" });

            // DATA TRANSAKSI KAYU TERKIRIM (autoIncrement id)
            if (db.objectStoreNames.contains("kayu_terkirim")) {
               db.deleteObjectStore("kayu_terkirim");
            }
            db.createObjectStore("kayu_terkirim", {
               keyPath: "id",
               autoIncrement: true,
            });

            // DATA TRANSAKSI KAYU LUNAS (autoIncrement id)
            if (db.objectStoreNames.contains("kayu_lunas")) {
               db.deleteObjectStore("kayu_lunas");
            }
            db.createObjectStore("kayu_lunas", {
               keyPath: "id",
               autoIncrement: true,
            });
         };

         request.onsuccess = (e) => resolve(e.target.result);
         request.onerror = (e) => reject(e.target.error);
      });
   }

   static async set(key, value) {
      if (this.backend === "local") return this.local.set(key, value);

      const db = await this.openDB();
      return new Promise((resolve, reject) => {
         const tx = db.transaction(key, "readwrite");
         const store = tx.objectStore(key);

         if (Array.isArray(value)) {
            value.forEach((item) => store.put(item));
         } else {
            store.put(value);
         }

         tx.oncomplete = () => resolve(true);
         tx.onerror = (e) => reject(e.target.error);
      });
   }

   static async get(key) {
      if (this.backend === "local") return this.local.get(key);

      const db = await this.openDB();
      return new Promise((resolve, reject) => {
         const tx = db.transaction(key, "readonly");
         const store = tx.objectStore(key);
         const request = store.getAll();

         request.onsuccess = () => resolve(request.result);
         request.onerror = (e) => reject(e.target.error);
      });
   }

   static async remove(key) {
      if (this.backend === "local") return this.local.remove(key);

      const db = await this.openDB();
      return new Promise((resolve, reject) => {
         const tx = db.transaction(key, "readwrite");
         const store = tx.objectStore(key);
         const request = store.clear();

         request.onsuccess = () => resolve(true);
         request.onerror = (e) => reject(e.target.error);
      });
   }

   static async deleteRecord(key, id) {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
         const tx = db.transaction(key, "readwrite");
         const store = tx.objectStore(key);
         const req = store.delete(id);
         req.onsuccess = () => resolve(true);
         req.onerror = (e) => reject(e.target.error);
      });
   }
}
