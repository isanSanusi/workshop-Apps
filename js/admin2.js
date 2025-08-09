// Ambil data dari localStorage
let semuaData = JSON.parse(localStorage.getItem("kayu_terkirim")) || [];
let hargaPerM3 = JSON.parse(localStorage.getItem("harga_per_m3")) || {};
let tabelContainer = document.getElementById("tabelRekap");
let totalHargaEl = document.getElementById("totalSemuaHarga");

// Fungsi untuk mengelompokkan data
function kelompokkanData() {
  let dataKelompok = {};

  // Kelompokkan berdasarkan pengirim dan tanggal
  semuaData.forEach((entry) => {
    const key = `${entry.pengirim}_${entry.tanggal}`;
    if (!dataKelompok[key]) {
      dataKelompok[key] = {
        pengirim: entry.pengirim,
        tanggal: entry.tanggal,
        kategori: {}, // Sub-kelompok berdasarkan kategori
      };
    }

    // Kelompokkan berdasarkan kategori dalam setiap pengirim
    entry.data.forEach((item) => {
      if (!dataKelompok[key].kategori[item.kategori]) {
        dataKelompok[key].kategori[item.kategori] = [];
      }
      dataKelompok[key].kategori[item.kategori].push(item);
    });
  });

  return dataKelompok;
}

// Hitung total untuk setiap item
function hitungTotal(dataKelompok) {
  let totalKeseluruhan = 0;
  let totalVolumeKeseluruhan = 0;

  Object.keys(dataKelompok).forEach((key) => {
    const kelompok = dataKelompok[key];
    kelompok.totalHarga = 0;

    Object.keys(kelompok.kategori).forEach((kategori) => {
      kelompok.kategori[kategori].forEach((item) => {
        // Normalisasi key harga menjadi lowercase
        const hargaKey = `${item.kategori}-${item.ukuran}`.toLowerCase();
        const harga = hargaPerM3[hargaKey] || 0;

        item.totalVolume = item.volume * item.jumlah;
        item.totalHarga = item.totalVolume * harga;
        kelompok.totalHarga += item.totalHarga;
        totalVolumeKeseluruhan += item.totalVolume;
      });
    });

    totalKeseluruhan += kelompok.totalHarga;
  });

  return {
    dataKelompok,
    totalKeseluruhan,
    totalVolumeKeseluruhan,
  };
}

function renderTabel() {
  const { dataKelompok, totalKeseluruhan } = hitungTotal(kelompokkanData());
  let html = "";
  let totalVolumeKeseluruhan = 0;

  Object.keys(dataKelompok).forEach((key) => {
    const kelompok = dataKelompok[key];
    Object.keys(kelompok.kategori).forEach((kategori) => {
      kelompok.kategori[kategori].forEach((item) => {
        totalVolumeKeseluruhan += item.totalVolume;
      });
    });

    html += `
      <div class="card">
        <div class="card-header">
          <h3>Pengirim: ${kelompok.pengirim}</h3>
          <p>Tanggal: ${kelompok.tanggal}</p>
        </div>
        <div class="card-body">
    `;

    Object.keys(kelompok.kategori).forEach((kategori) => {
      html += `
        <div class="kategori-section">
          <h4>Kategori: ${kategori}</h4>
          <table class="kategori-table">
            <thead>
              <tr>
                <th>Ukuran</th>
                <th>Diameter</th>
                <th>Jumlah</th>
                <th>Volume per Batang</th>
                <th>Total Volume</th>
                <th>Harga/m³</th>
                <th>Total Harga</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
      `;

      kelompok.kategori[kategori].forEach((item, index) => {
        const hargaKey = `${item.kategori}-${item.ukuran}`;
        const harga = hargaPerM3[hargaKey] || 0;
        const uniqueId = `${key}_${kategori}_${index}`;

        html += `
          <tr id="row-${uniqueId}">
            <td>${item.ukuran}</td>
            <td>${item.diameter}</td>
            <td id="jumlah-${uniqueId}">${item.jumlah}</td>
            <td>${item.volume}</td>
            <td id="totalVol-${uniqueId}">${item.totalVolume.toFixed(4)}</td>
            <td>Rp ${harga.toLocaleString()}</td>
            <td id="totalHarga-${uniqueId}">Rp ${item.totalHarga.toLocaleString()}</td>
            <td class="aksi">
              <button onclick="ubahJumlah('${uniqueId}', '${key}', '${kategori}', ${index}, -1)">➖</button>
              <button onclick="ubahJumlah('${uniqueId}', '${key}', '${kategori}', ${index}, 1)">➕</button>
            </td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
    });

    html += `
          <div class="total-pengirim">
            <strong>Total untuk Pengirim ${
              kelompok.pengirim
            }: Rp ${kelompok.totalHarga.toLocaleString()}</strong>
          </div>
        </div>
      </div>
    `;
  });

  tabelContainer.innerHTML = html;
  totalHargaEl.innerHTML = `
    <div class="total-keseluruhan">
      <div><strong>Total Volume Keseluruhan:</strong> ${totalVolumeKeseluruhan.toFixed(
        4
      )} m³</div>
      <div><strong>Total Harga Keseluruhan:</strong> Rp ${totalKeseluruhan.toLocaleString()}</div>
    </div>
  `;
}

// Fungsi untuk mengubah jumlah
function ubahJumlah(uniqueId, groupKey, kategori, index, delta) {
  // Temukan data yang sesuai di localStorage
  const semuaData = JSON.parse(localStorage.getItem("kayu_terkirim")) || [];

  // Temukan group berdasarkan pengirim dan tanggal
  const groupParts = groupKey.split("_");
  const pengirim = groupParts[0];
  const tanggal = groupParts.slice(1).join("_"); // Handle tanggal yang mungkin mengandung underscore

  const groupIndex = semuaData.findIndex(
    (entry) => entry.pengirim === pengirim && entry.tanggal === tanggal
  );

  if (groupIndex === -1) return;

  // Temukan item yang akan diubah
  const item = semuaData[groupIndex].data.find(
    (it, idx) => it.kategori === kategori && idx === index
  );

  if (!item) return;

  // Update jumlah
  item.jumlah = Math.max(0, item.jumlah + delta);

  // Simpan kembali ke localStorage
  localStorage.setItem("kayu_terkirim", JSON.stringify(semuaData));

  // Perbarui tampilan
  renderTabel();
}

// Fungsi untuk menangani form harga (tetap sama)
document.getElementById("hargaForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const kat = document.getElementById("kategoriHarga").value;
  const uk = document.getElementById("ukuranHarga").value;
  const harga = parseInt(document.getElementById("inputHargaPerM3").value);

  if (!kat || !uk || isNaN(harga)) {
    alert("Lengkapi input harga.");
    return;
  }

  const key = `${kat}-${uk}`;
  hargaPerM3[key] = harga;
  localStorage.setItem("harga_per_m3", JSON.stringify(hargaPerM3));
  alert("Harga disimpan.");
  renderTabel();
});

window.onload = renderTabel;
