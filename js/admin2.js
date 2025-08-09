// Ambil data dari localStorage
let semuaData = JSON.parse(localStorage.getItem("kayu_terkirim")) || [];
let hargaPerM3 = JSON.parse(localStorage.getItem("harga_per_m3")) || {};
let tabelContainer = document.getElementById("tabelRekap");
let totalHargaEl = document.getElementById("totalSemuaHarga");

// Fungsi untuk mengelompokkan data
function kelompokkanData() {
  let dataKelompok = {};

  semuaData.forEach((entry, groupIndex) => {
    const key = `${entry.pengirim}||${entry.tanggal}`;
    if (!dataKelompok[key]) {
      dataKelompok[key] = {
        pengirim: entry.pengirim,
        tanggal: entry.tanggal,
        kategori: {},
      };
    }

    entry.data.forEach((item, originalIndex) => {
      if (!dataKelompok[key].kategori[item.kategori]) {
        dataKelompok[key].kategori[item.kategori] = [];
      }
      // Simpan originalIndex untuk tracking saat klik tombol
      dataKelompok[key].kategori[item.kategori].push({
        ...item,
        originalIndex,
        groupIndex,
      });
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

// Render tabel
function renderTabel() {
  const { dataKelompok, totalKeseluruhan, totalVolumeKeseluruhan } =
    hitungTotal(kelompokkanData());
  let html = "";

  Object.keys(dataKelompok).forEach((key) => {
    const kelompok = dataKelompok[key];

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

      kelompok.kategori[kategori].forEach((item) => {
        const hargaKey = `${item.kategori}-${item.ukuran}`.toLowerCase();
        const harga = hargaPerM3[hargaKey] || 0;
        const uniqueId = `${key}_${kategori}_${item.originalIndex}`;

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
              <button onclick="ubahJumlah(${item.groupIndex}, ${
          item.originalIndex
        }, -1)">➖</button>
              <button onclick="ubahJumlah(${item.groupIndex}, ${
          item.originalIndex
        }, 1)">➕</button>
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

// Fungsi ubah jumlah
function ubahJumlah(groupIndex, originalIndex, delta) {
  if (!semuaData[groupIndex] || !semuaData[groupIndex].data[originalIndex])
    return;

  let item = semuaData[groupIndex].data[originalIndex];
  item.jumlah = Math.max(0, item.jumlah + delta);

  localStorage.setItem("kayu_terkirim", JSON.stringify(semuaData));
  renderTabel();
}

// Form harga
document.getElementById("hargaForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const kat = document.getElementById("kategoriHarga").value;
  const uk = document.getElementById("ukuranHarga").value;
  const harga = parseInt(document.getElementById("inputHargaPerM3").value);

  if (!kat || !uk || isNaN(harga)) {
    alert("Lengkapi input harga.");
    return;
  }

  const key = `${kat}-${uk}`.toLowerCase();
  hargaPerM3[key] = harga;
  localStorage.setItem("harga_per_m3", JSON.stringify(hargaPerM3));
  alert("Harga disimpan.");
  renderTabel();
});

window.onload = renderTabel;
