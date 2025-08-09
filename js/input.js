let kategoriTerpilih = "";
let subkategoriTerpilih = "";
let dataTercatat = [];

let jumlahPerKategori = {
   SUPER: {
      100: {},
      130: {},
      200: {},
      260: {},
   },
   STANDARD: {
      100: {},
      130: {},
   },
   REJECT: {
      100: {},
      130: {},
   },
};

function hitungKayu() {
   const jumlahPerDiameter =
      jumlahPerKategori[kategoriTerpilih][subkategoriTerpilih];

   const totalKayu = Object.values(jumlahPerDiameter).reduce(
      (sum, val) => sum + val,
      0
   );

   document.getElementById("judulInput").innerHTML = `
    <span>Ukuran ${subkategoriTerpilih}</span>
    <span>${totalKayu}</span>`;
}

function updateTotalKayuKategori() {
   const kategoriData = jumlahPerKategori[kategoriTerpilih];
   let total = 0;

   for (const sub in kategoriData) {
      const jumlahPerDiameter = kategoriData[sub];
      total += Object.values(jumlahPerDiameter).reduce(
         (sum, val) => sum + val,
         0
      );
   }

   // Tampilkan ke layar
   const el = document.getElementById("totalKayuKategori");
   if (el) {
      el.innerHTML = `<span>Total Kayu</span><span>${total}</span>`;
   }
}

// Param dari tombol kat = SUPER/REJECT
function pilihKategori(kat) {
   kategoriTerpilih = kat;
   document.getElementById(
      "kategori-input"
   ).innerHTML = `<span>${kategoriTerpilih}</span>`;

   // Tentukan subkategori yang boleh ditampilkan
   let subkategoriList = [];
   if (kat === "SUPER") {
      subkategoriList = [100, 130, 200, 260];
   } else if (kat === "STANDARD" || kat === "REJECT") {
      subkategoriList = [100, 130]; // dibatasi hanya ini
   }

   // Generate tombol subkategori sesuai daftar
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

function tampilkanHalaman(id) {
   document
      .querySelectorAll(".container > div")
      .forEach((div) => div.classList.add("hidden"));
   document.getElementById(id).classList.remove("hidden");
   if (id === "halamanRingkasan") tampilkanTabel();
}

function pilihUkuran(subkat) {
   // 1. Dapatkan semua tombol subkategori
   const buttons = document.querySelectorAll(".btn-subcat button");
   // 2. Hapus class 'active' dari semua tombol
   buttons.forEach((btn) => {
      btn.classList.remove("active");
   });

   // 3. Temukan tombol yang diklik dan tambahkan class 'active'
   buttons.forEach((btn) => {
      if (
         btn.textContent === subkat + "cm" ||
         (subkat === "standard" && btn.textContent === "standard")
      ) {
         btn.classList.add("active");
      }
   });
   subkategoriTerpilih = subkat;
   hitungKayu();
   updateTotalKayuKategori();
   generatePreset(kategoriTerpilih, subkat);
}

function hitungVolumeLiter(panjang, diameter) {
   const formula = 0.785;
   if (isNaN(panjang) || isNaN(diameter)) return 0;
   const volumeCm3 = panjang * diameter * diameter * formula;
   return Math.round(volumeCm3 / 1000); // liter
}

function generatePreset(kategori, subkategori) {
   const container = document.getElementById("presetTombol");
   container.innerHTML = "";

   let min = 9,
      max = 55;
   if (subkategori === 200 || subkategori === 260) {
      min = 20;
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
        <span>${volume} m<sup>3</span>
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
          <span>${volume} m<sup>3</span>
          <span>${jumlahPerDiameter[d]}</span>
        </div>`;
         tambahData(kategori, subkategori, d, volume);
      };

      container.appendChild(btn);
   }
}

function tambahData(kategori, subkategori, diameter, volume) {
   const existing = dataTercatat.find(
      (d) =>
         d.kategori === kategori &&
         d.ukuran === subkategori &&
         d.diameter === diameter
   );

   if (existing) {
      existing.jumlah += 1;
   } else {
      dataTercatat.push({
         kategori,
         ukuran: subkategori,
         diameter,
         volume,
         jumlah: 1,
      });
   }
}

function onBack() {
   const container = document.getElementById("presetTombol");
   document.getElementById("judulInput").innerHTML = `
    <span>Ukuran</span>
    <span></span>`;
   const el = document.getElementById("totalKayuKategori");
   if (el) {
      el.innerHTML = `<span>Total Kayu</span><span></span>`;
   }
   const buttons = document.querySelectorAll(".btn-subcat button");
   buttons.forEach((btn) => {
      btn.classList.remove("active");
   });
   container.innerHTML = "";
   tampilkanHalaman("halamanKategori");
}

function simpanData() {
   if (dataTercatat.length === 0) {
      alert("Belum ada data yang dimasukkan.");
      return;
   }
   const user = JSON.parse(localStorage.getItem("loggedInUser"));
   const waktu = new Date().toISOString();
   const buyer = document.getElementById("buyer").value;

   const dataBaru = {
      oleh: user?.username || "anonim",
      waktu,
      pemesan: buyer || "anonim",
      data: [...dataTercatat], // copy semua inputan
   };

   // Ambil data sebelumnya dari localStorage
   const dataSebelumnya =
      JSON.parse(localStorage.getItem("kayu_terkirim")) || [];

   // Tambahkan data baru ke list
   dataSebelumnya.push(dataBaru);

   // Simpan kembali
   localStorage.setItem("kayu_terkirim", JSON.stringify(dataSebelumnya));

   // Reset tampilan dan input
   dataTercatat = [];
   jumlahPerKategori = {
      SUPER: {
         100: {},
         130: {},
         200: {},
         260: {},
      },
      STANDARD: {
         100: {},
         130: {},
      },
      REJECT: {
         100: {},
         130: {},
      },
   };

   generatePreset(kategoriTerpilih, subkategoriTerpilih);
   alert("Data berhasil disimpan dan dikirim ke admin!");
   onBack();
}

function resetData() {
   if (!confirm("Yakin ingin menghapus semua data?")) return;
   dataTercatat = [];
   jumlahPerKategori = {
      SUPER: {
         100: {},
         130: {},
         200: {},
         260: {},
      },
      STANDARD: {
         100: {},
         130: {},
      },
      REJECT: {
         100: {},
         130: {},
      },
   };

   // document.getElementById("tabelData").innerHTML = "";

   generatePreset(kategoriTerpilih, subkategoriTerpilih);
   alert("Data berhasil direset.");
   onBack();
}
