// inisialisasi state $ value awal

let kategoriTerpilih = ""; //state awal kategori
let subkategoriTerpilih = ""; // state awal sub/ukuran
let dataTercatat = []; // kumpulan data yang akan di kirim ke localstorage
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
// ======================================================

// Pertama di halaman pemilihan kategori
function pilihKategori(kat) {
   // kat = Super/standard/reject

   // isi state dengan param dari tombol
   kategoriTerpilih = kat;
   // cari element h2 dan isi dengan el span dan text dari state kategori terpilih
   document.getElementById(
      "kategori-input"
   ).innerHTML = `<span>${kategoriTerpilih}</span>`;

   //========== Tentukan subkategori yang boleh tampil ====
   // buat list kosong yang akan di isi sub category/ukuran
   let subkategoriList = [];
   // jika kategori adalah SUPER ,
   // mak isi list dengan subkategori/ukuran 100,130,200 & 260
   if (kat === "SUPER") {
      subkategoriList = [100, 130, 200, 260];
      // namun jika kategori adalah STD atau REJECT,
      // maka list isi dengan subkategori/ukuran 100 & 200 saja
   } else if (kat === "STANDARD" || kat === "REJECT") {
      subkategoriList = [100, 130]; // dibatasi hanya ini
   }

   //======= Generate tombol subkategori sesuai daftar
   // cari element penampung button subcategori
   const container = document.querySelector(".btn-subcat");
   // kosongkan isinya terlebih dahulu
   container.innerHTML = "";
   // bongkar list subkategori yang sudah di isi ukuran tadi
   subkategoriList.forEach((sub) => {
      // sub adalah 100-260 jika super
      // 100 $ 130 jika STD/REJECT

      // Buat element button baru
      const btn = document.createElement("button");
      // isi text button dengan angka dari sub tambah cm
      // jadi text button examp. 100 + cm = 100cm
      btn.textContent = sub + "cm";
      // buat fungsi onClick dengan param angka dari sub
      // di masing masing tombol
      btn.onclick = () => pilihUkuran(sub);
      // lalu isi lagi penampung button yang sudah di kosongkan
      // dengan button baru yang membawa param sub
      container.appendChild(btn);
   });

   // setelah tombol super/std/reject di klik
   // arahkan ke halaman tombol preset
   tampilkanHalaman("halamanInput");
}

// Kedua setelah masuk halaman tombol preset
function pilihUkuran(subkat) {
   // subkat adalah param dari tombol subkategori yang,
   // sudah di buat di fungsi pilihKategori tadi
   // membawa param angka 100-260 / 100 & 130 jika kategori std/reject

   // 1. Ambil dan kumpulkan semua tombol subkategori
   const buttons = document.querySelectorAll(".btn-subcat button");
   // 2. Hapus class 'active' dari semua tombol
   buttons.forEach((btn) => {
      // btn mewakili masing-masing tombol
      btn.classList.remove("active");
   });

   // 3. Temukan tombol yang diklik dan tambahkan class 'active'
   buttons.forEach((btn) => {
      //jika tombol berisi text dari subkat 100\130\200\260 +cm
      if (btn.textContent === subkat + "cm") {
         // maka tambahkan class active padanya
         btn.classList.add("active");
      }
   });

   // isi state subKategoriTerpilih dengan subkat
   subkategoriTerpilih = subkat;
   // lalu jalankan fungsi di bawah
   hitungKayu();
   updateTotalKayuKategori();

   // kirim param berisi exap. (Super,200)
   generatePreset(kategoriTerpilih, subkat);
}

// Ketiga buat fungsi menghitung jumlah kayu
// dari masing masing ukuran / subkat atau dalam 1 subkategori
function hitungKayu() {
   // Buat variabel yang menampung data baru
   // lalu kirim ke storage jumlahPerKategori
   const jumlahPerDiameter =
      jumlahPerKategori[kategoriTerpilih][subkategoriTerpilih];

   // buat variabel baru
   // total kayu berfungsi menghitung berapa kali tombol preset
   // pada kategori dan sub kategori tersebut di tekan
   // sehingga angka tersebut bisa di pakai untuk
   // mengetahui berapa jumlah kayu dalam 1 sub kategori
   const totalKayu = Object.values(jumlahPerDiameter).reduce(
      (sum, val) => sum + val,
      0
   );

   // cari el penampung jumlah /sub lalu isi
   //  examp. sub = 100, jumlah di tekan = 20
   document.getElementById("judulInput").innerHTML = `
    <span>Size ${subkategoriTerpilih}</span>
    <span>${totalKayu}</span>`;
}

// Keempat fungsi menghitung semua jumlah kayu dalam 1 kategori
function updateTotalKayuKategori() {
   // buat variable baru
   // berisi data kategori saat ini super/std/reject
   const kategoriData = jumlahPerKategori[kategoriTerpilih];
   // buat variable baru sebagai total awal
   let total = 0;

   for (const sub in kategoriData) {
      // sub adalah angka ukuran masing-masing kategori
      const jumlahPerDiameter = kategoriData[sub];
      // buat variabel baru
      // ini berfungsi menghitung semua tombol preset
      // di dalam kategori tersebut di tekan
      // sehingga angka tersebut bisa di pakai untuk
      // mengetahui berapa jumlah kayu dalam 1 kategori
      total += Object.values(jumlahPerDiameter).reduce(
         (sum, val) => sum + val,
         0
      );
   }

   // Cari elemen penampung dan isi text dengan data baru
   // yang sudah di dapat
   const el = document.getElementById("totalKayuKategori");
   if (el) {
      el.innerHTML = `<span>Total wood</span><span>${total}</span>`;
   }
}

// Kelimas saat tombol subkategori/ukuran di tekan
// lalu buat beberapa tombol preset berisi
// angka Diameter, volume dan jumlahnya
function generatePreset(kategori, subkategori) {
   // Cari elemen penampung tombol preset
   // lalu kosongkan terlebih dahulu
   const container = document.getElementById("presetTombol");
   container.innerHTML = "";

   // inisialisasi angka yang akan dipakai
   // untuk menentukan jumlah tombol
   // sekaligus inisialiasi ukuran diameter kecil-besar
   // jumlah default dari diameter min 9 dan max nya 55
   let min = 9,
      max = 55;

   if (kategori == "SUPER") {
      if (subkategori == 100) {
         min = 20;
      }
      if (subkategori == 130) {
         min = 15;
      }
   }

   // namun Jika subkategori dengan ukuran 200 & 260
   // maka ubah minimalnya jadi 20 dan max nya 80
   if (subkategori === 200 || subkategori === 260) {
      min = 25;
      max = 80;
   }

   const jumlahPerDiameter = jumlahPerKategori[kategori][subkategori];

   for (let d = min; d <= max; d++) {
      //  d adalah angka masing" diameter 9..55 atau
      // jika subkategorinya 200&260 maka diameter 20..80

      jumlahPerDiameter[d] = jumlahPerDiameter[d] || 0;

      // buat variabel volume yang berisi
      // jumlah volume dari setiap diameter di kali subkategorinya
      // fungsi hitungVolumLier membawa parameter ukuran dan diameter yang di pilih
      const volume = hitungVolumeLiter(parseInt(subkategori), d);
      // karna subkategori berisi string "100/130/200/260"
      // maka ubah dulu menjadi number 100/130/200/260 dengan fungsi perseInt()
      // lalu di kalikan dengan diameter
      // subkategori * d = examp. 100 * 9

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
         console.log(dataTercatat);
         document.getElementById(
            `btn-${kategori}-${subkategori}-${d}`
         ).innerHTML = `
        <div class="dia">${d}cm</div>
        <div class="volume-jumlah">
          <span>${volume} m<sup>3</span>
          <span>${jumlahPerDiameter[d]}</span>
        </div>`;
         //   kirim data data di atas ke param
         // isi param examp. Super,100,9,8
         tambahData(kategori, subkategori, d, volume);
      };

      container.appendChild(btn);
   }
}

// keenam buat fungsi hitung volume
// Rumus mendapatkan hasil volume dari 1 ukuran
// param panjang berisi angka 100/130/200/260
// param diameter berisi angka 9-55 \\ 20-80
function hitungVolumeLiter(panjang, diameter) {
   const formula = 0.785;
   if (isNaN(panjang) || isNaN(diameter)) return 0;
   const volumeCm3 = panjang * diameter * diameter * formula;
   return Math.round(volumeCm3 / 1000); // liter
}

// fungsi mencatat semua data yang sudah di dapat
// simpan data ke array dataTercatat
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

// Fungsi hide dan show element container
// menurut tombol yang membawa param id
// halaman ktegori ,input dan preset
function tampilkanHalaman(id) {
   document
      .querySelectorAll(".container > div")
      .forEach((div) => div.classList.add("hidden"));
   document.getElementById(id).classList.remove("hidden");
   if (id === "halamanRingkasan") tampilkanTabel();
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
      flashAlert("error", "Nothing to save!");
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
   flashAlert("success", "Data saved and was sent to admin!");

   onBack();
}

function resetData() {
   flashConfirm("Are you sure delete all data?").then((result) => {
      if (result) {
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
         onBack();
         flashAlert("success", "Resete data succesfully!");
      } else {
         flashAlert("info", "Erase canceled.");
      }
   });
}
