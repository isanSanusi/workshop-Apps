// Ambil data awal dari localStorage
let semuaData = JSON.parse(localStorage.getItem("kayu_terkirim")) || [];
let hargaPerM3 = JSON.parse(localStorage.getItem("harga_per_m3")) || {};
let tabelContainer = document.getElementById("tabelRekap");

// Fungsi set harga dari form
document.getElementById("hargaForm").addEventListener("submit", function (e) {
   e.preventDefault();

   const kat = document
      .getElementById("kategoriHarga")
      .value.trim()
      .toLowerCase();
   const uk = document.getElementById("ukuranHarga").value.trim().toLowerCase();
   const harga = parseInt(document.getElementById("inputHargaPerM3").value);

   if (!kat || !uk || isNaN(harga)) {
      alert("Lengkapi semua input harga.");
      return;
   }

   // Buat key unik kategori-ukuran
   const key = `${kat}-${uk}`;
   hargaPerM3[key] = harga;

   // Simpan ke localStorage
   localStorage.setItem("harga_per_m3", JSON.stringify(hargaPerM3));

   alert(`Harga ${kat} ukuran ${uk} disimpan: Rp ${harga.toLocaleString()}`);

   // Reset form
   document.getElementById("hargaForm").reset();

   // Kalau tabel card ada di halaman ini, kita render ulang
   if (typeof renderCards === "function") {
      renderCards();
   }
});

function renderCards() {
   let html = "";

   semuaData.forEach((entry, entryIndex) => {
      const dateObj = new Date(entry.waktu);
      const tanggal = dateObj.toISOString().slice(0, 10);
      const jam = dateObj.toTimeString().slice(0, 5);

      html += `
    <div class="card" style="border:1px solid #ccc; padding:10px; margin-bottom:20px; border-radius:6px; background:#f9f9f9;">
      <h3 style="margin:0;">Date: ${tanggal} - ${jam}</h3>
      <p style="margin:2px 0 10px 0;">Sender: <strong>${entry.oleh}</strong></p>
    `;

      // Ambil kategori unik
      const kategoriUnik = [...new Set(entry.data.map((d) => d.kategori))];

      kategoriUnik.forEach((kat) => {
         html += `<h4 style="margin:10px 0 5px 0;">Category: ${kat}</h4>`;
         html += `
        <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse; background:white;">
          <tr style="background:#ddd;">
            <th>Ukuran</th>
            <th>Diameter</th>
            <th>Volume m³</th>
            <th>Jumlah</th>
            <th>Harga/m³</th>
          </tr>
      `;

         let totalVol = 0;
         let totalJumlah = 0;
         let totalHarga = 0;

         entry.data
            .filter((d) => d.kategori === kat)
            .forEach((row) => {
               const keyHarga = `${row.kategori}-${row.ukuran}`.toLowerCase();
               const harga = hargaPerM3[keyHarga] || 0;
               const totalRow = row.volume * row.jumlah;
               const totalRowHarga = totalRow * harga;

               totalVol += totalRow;
               totalJumlah += row.jumlah;
               totalHarga += totalRowHarga;

               html += `
            <tr>
              <td>${row.ukuran}</td>
              <td>${row.diameter}</td>
              <td>${row.volume}</td>
              <td>${row.jumlah}</td>
              <td>Rp ${harga.toLocaleString()}</td>
            </tr>
          `;
            });

         html += `
        <tr style="font-weight:bold; background:#eee;">
          <td colspan="2">TOTAL</td>
          <td>${totalVol.toFixed(2)}</td>
          <td>${totalJumlah}</td>
          <td>Rp ${totalHarga.toLocaleString()}</td>
        </tr>
      `;
         html += `</table><br>`;
      });

      html += `
      <div style="margin-top:10px;">
        <button onclick="cetakInvoice(${entryIndex})" style="margin-right:5px;">Cetak Invoice</button>
        <button onclick="tandaiLunas(${entryIndex})">Tandai Lunas</button>
      </div>
    </div>`;
   });

   tabelContainer.innerHTML = html;
}

function tandaiLunas(index) {
   const data = semuaData[index];
   alert(`Data dari ${data.oleh} - ${data.waktu} ditandai lunas`);
   // Bisa update status di localStorage kalau perlu
}

// Auto update data jika ada perubahan di localStorage
setInterval(() => {
   const latestData = JSON.parse(localStorage.getItem("kayu_terkirim")) || [];
   if (JSON.stringify(latestData) !== JSON.stringify(semuaData)) {
      semuaData = latestData;
      renderCards();
   }
}, 2000);

// Load awal
window.onload = () => {
   renderCards();
};
