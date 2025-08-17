// ================== STATE AWAL ==================
let kategoriTerpilih = "";
let subkategoriTerpilih = "";
let dataTercatat = [];
let jumlahPerKategori = {
   SUPER: { 100: {}, 130: {}, 200: {}, 260: {} },
   STANDARD: { 100: {}, 130: {} },
   REJECT: { 100: {}, 130: {} },
};

// ================== UTIL ID ==================
function generateId() {
   if (crypto?.randomUUID) return crypto.randomUUID();
   return "id_" + Date.now() + "_" + Math.random().toString(16).slice(2);
}

// ================== CEK ROLE (hanya operasional) ==================
(async () => {
   const logged = await Storage.get("loggedInUser");
   const user = logged && logged.length ? logged[0] : null;
   if (!user || user.role !== "operasional") {
      location.href = "./login.html";
   }
})();

// ================== PILIHAN KATEGORI ==================
function pilihKategori(kat) {
   kategoriTerpilih = kat;
   document.getElementById(
      "kategori-input"
   ).innerHTML = `<span>${kategoriTerpilih}</span>`;

   let subkategoriList = [];
   if (kat === "SUPER") subkategoriList = [100, 130, 200, 260];
   else if (kat === "STANDARD" || kat === "REJECT")
      subkategoriList = [100, 130];

   const container = document.querySelector(".btn-subcat");
   container.innerHTML = "";
   subkategoriList.forEach((sub) => {
      const btn = document.createElement("button");
      btn.textContent = sub + "cm";
      btn.onclick = () => pilihUkuran(sub);
      container.appendChild(btn);
   });

   tampilkanHalaman("halamanInput");
}

function pilihUkuran(subkat) {
   const buttons = document.querySelectorAll(".btn-subcat button");
   buttons.forEach((btn) => btn.classList.remove("active"));
   buttons.forEach((btn) => {
      if (btn.textContent === subkat + "cm") btn.classList.add("active");
   });

   subkategoriTerpilih = subkat;
   hitungKayu();
   updateTotalKayuKategori();
   generatePreset(kategoriTerpilih, subkat);
}

function hitungKayu() {
   const jumlahPerDiameter =
      jumlahPerKategori[kategoriTerpilih][subkategoriTerpilih];
   const totalKayu = Object.values(jumlahPerDiameter).reduce(
      (s, v) => s + v,
      0
   );
   document.getElementById("judulInput").innerHTML = `
    <span>Size ${subkategoriTerpilih}</span>
    <span>${totalKayu}</span>`;
}

function updateTotalKayuKategori() {
   const kategoriData = jumlahPerKategori[kategoriTerpilih];
   let total = 0;
   for (const sub in kategoriData) {
      const jumlahPerDiameter = kategoriData[sub];
      total += Object.values(jumlahPerDiameter).reduce((s, v) => s + v, 0);
   }
   const el = document.getElementById("totalKayuKategori");
   if (el) el.innerHTML = `<span>Total wood</span><span>${total}</span>`;
}

function generatePreset(kategori, subkategori) {
   const container = document.getElementById("presetTombol");
   container.innerHTML = "";

   let min = 9,
      max = 55;
   if (kategori == "SUPER") {
      if (subkategori == 100) min = 20;
      if (subkategori == 130) min = 15;
   }
   if (subkategori === 200 || subkategori === 260) {
      min = 25;
      max = 80;
   }

   const jumlahPerDiameter = jumlahPerKategori[kategori][subkategori];

   for (let d = min; d <= max; d++) {
      jumlahPerDiameter[d] = jumlahPerDiameter[d] || 0;
      const volume = hitungVolumeLiter(parseInt(subkategori), d);

      const btn = document.createElement("button");
      btn.className = "preset-button";
      btn.id = `btn-${kategori}-${subkategori}-${d}`;
      btn.innerHTML = `
      <div class="dia">${d}cm</div>
      <div class="volume-jumlah">
        <span>${volume} m<sup>3</sup></span>
        <span>${jumlahPerDiameter[d]}</span>
      </div>`;

      btn.onclick = () => {
         jumlahPerDiameter[d]++;
         hitungKayu();
         updateTotalKayuKategori();
         document.getElementById(
            `btn-${kategori}-${subkategori}-${d}`
         ).innerHTML = `
        <div class="dia">${d}cm</div>
        <div class="volume-jumlah">
          <span>${volume} m<sup>3</sup></span>
          <span>${jumlahPerDiameter[d]}</span>
        </div>`;
         tambahData(kategori, subkategori, d, volume);
      };

      container.appendChild(btn);
   }
}

function hitungVolumeLiter(panjang, diameter) {
   const formula = 0.785;
   if (isNaN(panjang) || isNaN(diameter)) return 0;
   const volumeCm3 = panjang * diameter * diameter * formula;
   const volDecimal = volumeCm3 / 1000;
   const decimal = Math.floor(volDecimal);
   const intPart = volDecimal - decimal;
   return intPart >= 0.9 ? decimal + 1 : decimal;
}

function tambahData(kategori, subkategori, diameter, volume) {
   const existing = dataTercatat.find(
      (d) =>
         d.kategori === kategori &&
         d.ukuran === subkategori &&
         d.diameter === diameter
   );
   if (existing) existing.jumlah += 1;
   else
      dataTercatat.push({
         kategori,
         ukuran: subkategori,
         diameter,
         volume,
         jumlah: 1,
      });
}

// ================== HALAMAN DAN NAVIGASI ==================
function tampilkanHalaman(id) {
   document
      .querySelectorAll(".container > div")
      .forEach((div) => div.classList.add("hidden"));
   document.getElementById(id).classList.remove("hidden");
   if (id === "halamanRingkasan") tampilkanTabel();
}

function onBack() {
   const container = document.getElementById("presetTombol");
   document.getElementById(
      "judulInput"
   ).innerHTML = `<span>Ukuran</span><span></span>`;
   const el = document.getElementById("totalKayuKategori");
   if (el) el.innerHTML = `<span>Total Kayu</span><span></span>`;
   const buttons = document.querySelectorAll(".btn-subcat button");
   buttons.forEach((btn) => btn.classList.remove("active"));
   container.innerHTML = "";
   tampilkanHalaman("halamanKategori");
}

// ================== SIMPAN & RESET ==================
async function simpanData() {
   if (dataTercatat.length === 0) {
      flashAlert("error", "Nothing to save!");
      return;
   }

   const loggedArr = await Storage.get("loggedInUser");
   const user = loggedArr && loggedArr.length ? loggedArr[0] : null;
   const waktu = new Date().toISOString();
   const buyer = document.getElementById("buyer")?.value;

   const dataBaru = {
      id: generateId(), // penting: store 'kayu_terkirim' butuh keyPath 'id'
      oleh: user?.username || "anonim",
      waktu,
      pemesan: buyer || "anonim",
      data: [...dataTercatat],
   };

   await Storage.set("kayu_terkirim", dataBaru);

   // reset state UI
   dataTercatat = [];
   jumlahPerKategori = {
      SUPER: { 100: {}, 130: {}, 200: {}, 260: {} },
      STANDARD: { 100: {}, 130: {} },
      REJECT: { 100: {}, 130: {} },
   };

   if (kategoriTerpilih && subkategoriTerpilih) {
      generatePreset(kategoriTerpilih, subkategoriTerpilih);
   }
   flashAlert("success", "Data saved and was sent to admin!");
   onBack();
}

async function resetData() {
   flashConfirm("Are you sure delete all data?").then(async (ok) => {
      if (!ok) {
         flashAlert("info", "Erase canceled.");
         return;
      }
      dataTercatat = [];
      jumlahPerKategori = {
         SUPER: { 100: {}, 130: {}, 200: {}, 260: {} },
         STANDARD: { 100: {}, 130: {} },
         REJECT: { 100: {}, 130: {} },
      };
      // PERHATIAN: ini menghapus SEMUA transaksi di store 'kayu_terkirim'
      await Storage.remove("kayu_terkirim");
      if (kategoriTerpilih && subkategoriTerpilih) {
         generatePreset(kategoriTerpilih, subkategoriTerpilih);
      }
      onBack();
      flashAlert("success", "Reset data succesfully!");
   });
}

// ================== TABEL RINGKASAN ==================
async function tampilkanTabel() {
   const dataSemua = await Storage.get("kayu_terkirim");
   const tabelBody = document.getElementById("tabelRingkasan");
   tabelBody.innerHTML = "";

   if (!dataSemua || dataSemua.length === 0) {
      tabelBody.innerHTML = `<tr><td colspan="5">Belum ada data</td></tr>`;
      return;
   }

   dataSemua.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.oleh}</td>
      <td>${item.pemesan}</td>
      <td>${new Date(item.waktu).toLocaleString()}</td>
      <td>
        ${item.data
           .map(
              (d) => `${d.kategori}-${d.ukuran}cm Ø${d.diameter} (${d.jumlah}x)`
           )
           .join("<br>")}
      </td>`;
      tabelBody.appendChild(tr);
   });
}
