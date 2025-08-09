// ==================== VARIABEL GLOBAL ====================
let semuaData = JSON.parse(localStorage.getItem("kayu_terkirim")) || [];
let hargaPerKelompok =
   JSON.parse(localStorage.getItem("harga_per_kelompok")) || {};
let tabelContainer = document.getElementById("tabelRekap");

/// ==================== STRUKTUR HARGA DASAR ====================
const strukturHarga = {
   standardReject: ["9", "10-14", "15-up"],
   super: {
      100: ["20-24", "25-up"],
      130: ["15-19", "20-24", "25-29", "30-up"],
      200: ["25-29", "30-39", "40-49", "50-up"],
      260: ["25-29", "30-39", "40-up"],
   },
};

// ==================== RENDER KARTU TRANSAKSI ====================
function renderCards() {
   let html = "";

   semuaData.forEach((entry, entryIndex) => {
      const dateObj = new Date(entry.waktu);
      const tanggal = dateObj.toISOString().slice(0, 10);
      const jam = dateObj.toTimeString().slice(0, 5);

      html += `
        <div class="card" style="border:1px solid #ccc; padding:10px; margin-bottom:20px; border-radius:6px; background:#f9f9f9;">
            <h3>Buyer: <strong>${entry.pemesan}</strong></h3>
            <p>Sender: <strong>${entry.oleh}</strong></p>
            <p>Date: ${tanggal} - ${jam}</p>
        `;

      const kategoriUnik = [...new Set(entry.data.map((d) => d.kategori))];

      kategoriUnik.forEach((kat) => {
         html += `<h4>Category: ${kat}</h4>`;
         html += `
            <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse; background:white;">
                <tr style="background:#ddd;">
                    <th>Ukuran</th>
                    <th>Diameter</th>
                    <th>Volume m³</th>
                    <th>Jumlah</th>
                </tr>
            `;

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
                </tr>
                `;
            });

         html += `
                <tr style="font-weight:bold; background:#eee;">
                    <td colspan="2">TOTAL</td>
                    <td>${totalVol.toFixed(2)}</td>
                    <td>${totalJumlah}</td>
                </tr>
            </table><br>`;
      });

      html += `
            <div style="margin-top:10px;">
                <button onclick="bukaModalHarga(${entryIndex})">Cetak Invoice</button>
                <button onclick="tandaiLunas(${entryIndex})">Tandai Lunas</button>
            </div>
        </div>
        `;
   });

   tabelContainer.innerHTML = html;
}

// ==================== MODAL INPUT HARGA ====================
function bukaModalHarga(index) {
   const data = semuaData[index];
   if (!data) return alert("Data tidak ditemukan");

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
      ["9", "10-14", "15 up"].forEach((kelompok) => {
         const key = `standardReject-${kelompok}`;
         const nilaiAwal = hargaPerKelompok[key] || "";
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
      { ukuran: "100", kelompok: ["20-24", "25 up"] },
      { ukuran: "130", kelompok: ["15-19", "20-24", "25-29", "30 up"] },
      { ukuran: "200", kelompok: ["25-29", "30-39", "40-49", "50 up"] },
      { ukuran: "260", kelompok: ["25-29", "30-39", "40 up"] },
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
               <div style="margin-top:10px;text-align:right;">
                   <button type="button" onclick="tutupModal()">Batal</button>
                   <button type="submit">Simpan & Cetak</button>
               </div>
           </form>
       </div>
   </div>
   `;

   document.body.insertAdjacentHTML("beforeend", modalHTML);

   // Handle submit
   document.getElementById("formHarga").onsubmit = function (e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      formData.forEach((val, key) => {
         hargaPerKelompok[key] = parseFloat(val) || 0;
      });
      localStorage.setItem(
         "harga_per_kelompok",
         JSON.stringify(hargaPerKelompok)
      );
      tutupModal();
      cetakInvoice(index);
   };
}

function tutupModal() {
   const modal = document.getElementById("modalHarga");
   if (modal) modal.remove();
}

// ==================== CETAK INVOICE ====================
function cetakInvoice(index) {
   const data = semuaData[index];
   if (!data) return alert("Data tidak ditemukan");

   const dateObj = new Date();
   const tanggalInvoice = dateObj.toISOString().slice(0, 10);

   let totalKeseluruhanVol = 0;
   let totalKeseluruhanHarga = 0;
   let totalKeseluruhanJumlah = 0;

   let rincian = "";

   data.data.forEach((item) => {
      const kategoriKey = item.kategori.toLowerCase();
      const kelompok = cariKelompok(
         kategoriKey === "standard" || kategoriKey === "reject"
            ? "standardReject"
            : kategoriKey,
         item.ukuran,
         item.diameter
      );
      const keyHarga = `${
         kategoriKey === "standard" || kategoriKey === "reject"
            ? "standardReject"
            : kategoriKey
      }-${item.ukuran}-${kelompok}`;

      const harga = hargaPerKelompok[keyHarga] || 0;
      const totalRowVol = item.volume * item.jumlah;
      const totalRowHarga = totalRowVol * harga;

      rincian += `${item.kategori} ${item.ukuran} ${
         item.diameter
      }cm | Jumlah: ${item.jumlah} | Vol: ${totalRowVol.toFixed(
         2
      )} m³ | Harga/m³: Rp${harga.toLocaleString()} | Total: Rp${totalRowHarga.toLocaleString()}\n`;

      totalKeseluruhanVol += totalRowVol;
      totalKeseluruhanHarga += totalRowHarga;
      totalKeseluruhanJumlah += Number(item.jumlah);
   });

   const invoiceHTML = `
<pre>
==============================================================
                PT. Meong Coding Sejahtera

Tanggal Invoice : ${tanggalInvoice}
Kepada          : ${data.pemesan}
Pengirim        : ${data.oleh}
--------------------------------------------------------------
${rincian}
--------------------------------------------------------------
TOTAL JUMLAH    : ${totalKeseluruhanJumlah} batang
TOTAL VOLUME    : ${totalKeseluruhanVol.toFixed(2)} m³
TOTAL HARGA     : Rp ${totalKeseluruhanHarga.toLocaleString()}
==============================================================
</pre>
    `;

   const win = window.open("", "_blank");
   win.document.write(`
        <html>
            <head>
                <title>Invoice - ${tanggalInvoice}</title>
                <style>
                    body { font-family: monospace; white-space: pre; }
                </style>
            </head>
            <body>
                ${invoiceHTML}
                <script>window.print();</script>
            </body>
        </html>
    `);
   win.document.close();
}

// ==================== FUNGSI BANTU ====================
function cariKelompok(kategori, ukuran, diameter) {
   diameter = parseFloat(diameter);
   if (!strukturHarga[kategori] || !strukturHarga[kategori][ukuran]) return "";

   // Cocokkan range
   for (let k of strukturHarga[kategori][ukuran]) {
      if (k.includes("-")) {
         let [min, max] = k.split("-").map((n) => parseFloat(n));
         if (diameter >= min && diameter <= max) return k;
      } else if (k.includes("up")) {
         let min = parseFloat(k);
         if (diameter >= min) return k;
      } else if (diameter == parseFloat(k)) {
         return k;
      }
   }
   return "";
}

function tandaiLunas(index) {
   let dataTerkirim = JSON.parse(localStorage.getItem("kayu_terkirim")) || [];
   let dataLunas = JSON.parse(localStorage.getItem("kayu_lunas")) || [];

   if (!dataTerkirim[index]) return alert("Data tidak ditemukan!");

   const transaksi = dataTerkirim[index];
   dataLunas.push(transaksi);
   localStorage.setItem("kayu_lunas", JSON.stringify(dataLunas));

   dataTerkirim.splice(index, 1);
   localStorage.setItem("kayu_terkirim", JSON.stringify(dataTerkirim));

   alert("Transaksi berhasil ditandai lunas!");
   renderCards();
}

// ==================== AUTO REFRESH ====================
setInterval(() => {
   const latestData = JSON.parse(localStorage.getItem("kayu_terkirim")) || [];
   if (JSON.stringify(latestData) !== JSON.stringify(semuaData)) {
      semuaData = latestData;
      renderCards();
   }
}, 2000);

// ==================== LOAD AWAL ====================
window.onload = () => {
   renderCards();
};
