// ==================== VARIABEL GLOBAL ====================
let semuaData = []; // data transaksi operasional (kayu_terkirim)
let hargaPerKelompok = {}; // tabel harga per kelompok
let tabelContainer = document.getElementById("tabelRekap");

// ==================== STRUKTUR HARGA DASAR ====================
const strukturHarga = {
   standard: { 100: ["9", "10-14", "15-55"], 130: ["9", "10-14", "15-55"] },
   reject: { 100: ["9", "10-14", "15-55"], 130: ["9", "10-14", "15-55"] },
   super: {
      100: ["20-24", "25-55"],
      130: ["15-19", "20-24", "25-29", "30-55"],
      200: ["25-29", "30-39", "40-49", "50-80"],
      260: ["25-29", "30-39", "40-80"],
   },
};

// ==================== RENDER KARTU TRANSAKSI ====================
async function renderCards() {
   // 🔄 ambil ulang data dari IndexedDB
   semuaData = (await Storage.get("kayu_terkirim")) || [];
   hargaPerKelompok =
      ((await Storage.get("harga_per_kelompok")) || [])[0] || {};
   // ^ karena store keyPath:id → kalau kamu simpan sebagai object tunggal, pastikan id nya konsisten (lihat simpan di modal)

   let html = "";

   semuaData.forEach((entry, entryIndex) => {
      const dateObj = new Date(entry.waktu);
      const tanggal = dateObj.toISOString().slice(0, 10);
      const jam = dateObj.toTimeString().slice(0, 5);

      html += `
      <div class="card" style="border:1px solid #ccc; padding:10px; margin-bottom:20px; border-radius:6px; background:#f9f9f9;">
        <div class="wrapper-info">
          <h3>Buyer: <strong>${entry.pemesan}</strong></h3>
          <p>Date: ${tanggal} - ${jam}</p>
          <p>Sender: <strong>${entry.oleh}</strong></p>
        </div>
        <div class="tabel-wrapper">`;

      const kategoriUnik = [...new Set(entry.data.map((d) => d.kategori))];

      kategoriUnik.forEach((kat) => {
         html += `<div><h4>Category: ${kat}</h4>`;
         html += `
        <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse; background:white;">
          <tr style="background:#ddd;">
            <th>Ukuran</th>
            <th>Diameter</th>
            <th>Volume m³</th>
            <th>Jumlah</th>
          </tr>`;

         let totalVol = 0;
         let totalJumlah = 0;

         entry.data
            .filter((d) => d.kategori === kat)
            .forEach((row) => {
               const totalRow = row.volume * row.jumlah;
               totalVol += totalRow;
               totalJumlah += row.jumlah;
               html += `
            <tr>
              <td>${row.ukuran}</td>
              <td>${row.diameter}</td>
              <td>${row.volume}</td>
              <td>${row.jumlah}</td>
            </tr>`;
            });

         html += `
        <tr style="font-weight:bold; background:#eee;">
          <td colspan="2">TOTAL</td>
          <td>${totalVol.toFixed(2)}</td>
          <td>${totalJumlah}</td>
        </tr>
        </table></div>`;
      });

      html += `</div>
      <div style="margin-top:10px;">
        <button class="btn-option" onclick="bukaModalHarga(${entryIndex})">Cetak Invoice</button>
        <button class="btn-option" onclick="tandaiLunas(${entryIndex})">Tandai Lunas</button>
      </div>
    </div>`;
   });

   tabelContainer.innerHTML = html;
}

// ==================== MODAL INPUT HARGA ====================
async function bukaModalHarga(index) {
   const data = semuaData[index];
   if (!data) return alert("Data tidak ditemukan");

   // TODO: pakai modalHTML kamu yang sudah ada.
   // pastikan formHarga menghasilkan key2 yang kemudian disimpan di 'hargaPerKelompok'
   let modalHTML = `
   <div id="modalHarga" style="position:fixed;top:0;left:0;width:100%;height:100%;background:#0008;display:flex;justify-content:center;align-items:center;z-index:9999;">
       <div style="background:white;padding:20px;border-radius:8px;max-height:90%;overflow:auto;width:500px;">
           <h3>Input Harga /m³</h3>
           <form id="formHarga">
   `;

   // Gabungkan kategori standard + reject jadi satu (3 input harga saja)
   const adaStandardReject = data.data.some((d) =>
      ["standard", "reject"].includes(d.kategori.toLowerCase())
   );
   if (adaStandardReject) {
      modalHTML += `<h4>Kategori: STANDARD & REJECT (100 & 130)</h4>`;
      ["9", "10-14", "15-55"].forEach((kelompok) => {
         const key = `standardReject-${kelompok}`;
         const nilaiAwal =
            hargaPerKelompok[`standard-${kelompok}`] ??
            hargaPerKelompok[`reject-${kelompok}`] ??
            "";
         modalHTML += `
               <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:3px;">
                  <div style="flex:1;">${kelompok}</div>
                  <input type="number" name="${key}" value="${nilaiAwal}"style="width:120px;padding:5px;">
               </div>
            `;
      });
   }

   // Kategori super tetap seperti struktur harga
   const kategoriSuper = [
      { ukuran: "100", kelompok: ["20-24", "25-55"] },
      { ukuran: "130", kelompok: ["15-19", "20-24", "25-29", "30-55"] },
      { ukuran: "200", kelompok: ["25-29", "30-39", "40-49", "50-80"] },
      { ukuran: "260", kelompok: ["25-29", "30-39", "40-80"] },
   ];

   kategoriSuper.forEach((s) => {
      const adaUkuranIni = data.data.some(
         (d) => d.kategori.toLowerCase() === "super" && d.ukuran == s.ukuran
      );
      if (adaUkuranIni) {
         modalHTML += `<h4>Kategori: SUPER ${s.ukuran}cm</h4>`;
         s.kelompok.forEach((kelompok) => {
            const key = `super-${s.ukuran}-${kelompok}`;
            const nilaiAwal = hargaPerKelompok[key] || "";
            modalHTML += `
               <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:3px;">
                  <div style="flex:1;">${kelompok}</div>
                  <input type="number" name="${key}" value="${nilaiAwal}"style="width:120px;padding:5px;">
               </div>
            `;
         });
      }
   });

   modalHTML += `
               <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:3px;">
                  <div style="flex:1;">Bongkar</div>
                  <input type="number" name="bongkar" id="bongkar" value="bongkar"style="width:120px;padding:5px;">
               </div>

               <div style="margin-top:10px;text-align:right;">
                   <button class="btn-option" type="button" onclick="tutupModal()">Batal</button>
                   <button class="btn-option" type="submit">Simpan & Cetak</button>
               </div>
           </form>
       </div>
   </div>
   `;

   document.body.insertAdjacentHTML("beforeend", modalHTML);

   document.getElementById("formHarga").onsubmit = async function (e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      formData.forEach((val, key) => {
         const harga = parseFloat(val) || 0;

         if (key.startsWith("standardReject-")) {
            const range = key.replace("standardReject-", "");
            ["standard", "reject"].forEach((kat) => {
               ["100", "130"].forEach((ukuran) => {
                  hargaPerKelompok[`${kat}-${ukuran}-${range}`] = harga;
               });
            });
         } else {
            hargaPerKelompok[key] = harga;
         }
      });
      Object.keys(hargaPerKelompok).forEach((k) => {
         if (k.startsWith("standardReject-")) delete hargaPerKelompok[k];
      });

      // Simpan sebagai satu record tunggal (id: 'all') supaya mudah di-get
      await Storage.set("harga_per_kelompok", {
         id: "all",
         ...hargaPerKelompok,
      });

      tutupModal();
      cetakInvoice(index);
   };
}

function tutupModal() {
   const modal = document.getElementById("modalHarga");
   if (modal) modal.remove();
}

function roundTotal(num) {
   if (num === 0) return 0;
   let digits = Math.floor(Math.log10(num));
   let pows = Math.pow(10, digits);
   return Math.round(num / pows) * pows;
}

function cetakInvoice(index) {
   const data = semuaData[index];
   if (!data) return alert("Data tidak ditemukan");
   const dateObj = new Date();
   const tanggalInvoice = dateObj.toISOString().slice(0, 10);

   let totalKeseluruhanVol = 0;
   let totalKeseluruhanHarga = 0;
   let totalKeseluruhanJumlah = 0;
   let bongkarHarga = 0;
   let totalAkhir = 0;
   let grandTotal = 0;

   let rincianTabel = [
      [
         "Kategori",
         "Ukuran",
         "Diameter",
         "Jumlah",
         "Volume m³",
         "Harga/m³",
         "Total Harga",
      ],
   ];
   let rincianText = "";
   rincianText += `<table border="1" cellspacing="0" cellpadding="3" style="width:100%; border-collapse:collapse; background:white;">
      <tr style="background:#ddd;">
            <th>CATEGORY SIZE-DIA</th>
            <th>Qty(Logs)</th>
            <th>VOLUME m³</th>
            <th>PRICE</th>
            <th>AMOUNT</th>
      </tr>`;
   data.data.forEach((item) => {
      const kategoriKey = item.kategori.toLowerCase();
      const kelompok = cariKelompok(kategoriKey, item.ukuran, item.diameter);
      const keyHarga = `${kategoriKey}-${item.ukuran}-${kelompok}`;

      const harga = hargaPerKelompok[keyHarga] || 0;
      const bongkar = hargaPerKelompok["bongkar"] || 0;
      console.log(`bongkar ${bongkarHarga}`); // cek kalau udah sesuai

      const totalRowVol = item.volume * item.jumlah;
      const totalRowHarga = totalRowVol * harga;

      rincianText += `<tr>
                        <td>${item.kategori} ${item.ukuran} ${
         item.diameter
      }cm</td>
                        <td style="text-align: center;" >${item.jumlah}</td>
                        <td>${totalRowVol.toFixed(2)} m³</td>
                        <td>Rp ${harga.toLocaleString()};/m³</td>
                        <td>Rp ${totalRowHarga.toLocaleString()};</td>
                     </tr>`;

      rincianTabel.push([
         item.kategori,
         item.ukuran,
         item.diameter,
         item.jumlah,
         totalRowVol.toFixed(2),
         harga,
         totalRowHarga,
      ]);

      totalKeseluruhanVol += totalRowVol;
      totalKeseluruhanHarga += totalRowHarga;
      totalKeseluruhanJumlah += Number(item.jumlah);
      bongkarHarga = Number(bongkar);
      totalAkhir = totalKeseluruhanHarga - bongkarHarga;
      grandTotal = roundTotal(totalAkhir);
   });

   rincianText += `</table>`;
   // Cetak invoice ke tab baru
   const invoiceHTML = `
<pre>
============================================================================================
                                       PK 47 CIKEMBULAN

Invoice Date    : ${tanggalInvoice}
Customer        : ${data.pemesan}
Shiper          : ${data.oleh}
--------------------------------------------------------------------------------------------
${rincianText}
--------------------------------------------------------------------------------------------
TOTAL QUANTITY  : ${totalKeseluruhanJumlah} Logs
TOTAL VOLUME    : ${totalKeseluruhanVol.toFixed(2)} m³
SUB TOTAL       : Rp ${totalKeseluruhanHarga.toLocaleString()};
UNLOADING FEE   : Rp ${bongkarHarga.toLocaleString()};
GRAND TOTAL     : Rp ${grandTotal.toLocaleString()};
============================================================================================
</pre>
   `;
   const win = window.open("", "_blank");
   win.document.write(`
       <html>
           <head>
               <title>Invoice - ${tanggalInvoice}</title>
               <style>
                   body { display:flex; justify-content:center; align-items: start; font-family: monospace; white-space: pre; font-size: 0.8rem; }
               </style>
           </head>
           <body>
               ${invoiceHTML}
               // <script>window.print();</script>
           </body>
       </html>
   `);
   win.document.close();

   // Simpan ke CSV langsung
   exportDataArrayToCSV(rincianTabel, `invoice_${tanggalInvoice}.csv`);
}

function exportDataArrayToCSV(dataArray, filename) {
   const csvContent = dataArray
      .map((row) =>
         row
            .map((cell) => {
               let text = String(cell).replace(/"/g, '""');
               return text.includes(",") || text.includes("\n")
                  ? `"${text}"`
                  : text;
            })
            .join(",")
      )
      .join("\n");

   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
   const link = document.createElement("a");
   link.href = URL.createObjectURL(blob);
   link.download = filename;
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
}

// ==================== FUNGSI BANTU ====================
function normalisasiKelompok(str) {
   return str.toString().trim().replace(/\s+/g, "").toLowerCase(); // hilangin semua spasi
}

function cariKelompok(kategori, ukuran, diameter) {
   diameter = parseFloat(diameter);
   if (!strukturHarga[kategori] || !strukturHarga[kategori][ukuran]) return "";

   for (let k of strukturHarga[kategori][ukuran]) {
      let key = normalisasiKelompok(k);

      if (key.includes("-")) {
         let [min, max] = key.split("-").map((n) => parseFloat(n));
         if (diameter >= min && diameter <= max) return k;
      } else if (!isNaN(parseFloat(key)) && diameter === parseFloat(key)) {
         return k;
      }
   }
   return "";
}

// ==================== FUNGSI TANDAI LUNAS ====================
async function tandaiLunas(index) {
   let dataTerkirim = (await Storage.get("kayu_terkirim")) || [];
   let dataLunas = (await Storage.get("kayu_lunas")) || [];

   const current = dataTerkirim[index];
   if (!current) return alert("Data tidak ditemukan!");

   dataLunas.push(current);
   await Storage.set(
      "kayu_lunas",
      dataLunas.map((d) => ({ id: d.id || String(d.id || index), ...d }))
   );

   // hapus dari terkirim
   const idToRemove = current.id;
   // cara termudah: clear & tulis ulang selain yang dihapus
   await Storage.remove("kayu_terkirim");
   const sisa = dataTerkirim.filter((d, i) => (d.id || i) !== idToRemove);
   for (const d of sisa) {
      await Storage.set("kayu_terkirim", {
         id: d.id || generateFallbackId(),
         ...d,
      });
   }

   flashAlert("success", "Transaksi berhasil di tandai lunas");
   renderCards();
}

function generateFallbackId() {
   if (crypto?.randomUUID) return crypto.randomUUID();
   return "id_" + Date.now() + "_" + Math.random().toString(16).slice(2);
}

// ==================== AUTO REFRESH ====================
setInterval(async () => {
   const latestData = (await Storage.get("kayu_terkirim")) || [];
   if (JSON.stringify(latestData) !== JSON.stringify(semuaData)) {
      semuaData = latestData;
      renderCards();
   }
}, 2000);

// ==================== LOAD AWAL + CEK ROLE ADMIN ====================
window.onload = async () => {
   const logged = await Storage.get("loggedInUser");
   const user = logged && logged.length ? logged[0] : null;
   if (!user || user.role !== "administrasi") {
      location.href = "./login.html";
      return;
   }
   renderCards();
};
