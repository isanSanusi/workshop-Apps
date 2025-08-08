// Ambil data dari localStorage
let semuaData = JSON.parse(localStorage.getItem("kayu_terkirim")) || [];
let hargaPerM3 = JSON.parse(localStorage.getItem("harga_per_m3")) || {};
let dataRekapGabungan = {};
let dataRincian = {};
let tabelContainer = document.getElementById("tabelRekap");
let totalHargaEl = document.getElementById("totalSemuaHarga");

// Gabungkan data menjadi rekap per kategori-ukuran-diameter

function rekapData() {
  dataRekapGabungan = {};

  dataRincian = {};
  semuaData.forEach((datas) => {
    dataRincian["Sender"] = datas.oleh;
    dataRincian["Date"] = datas.waktu;
    let details = datas.data;
    details.forEach((detail) => {
      dataRincian["Category"] = detail.kategori;
      dataRincian["Volume"] = detail.volume;
      dataRincian["Total"] = detail.jumlah;
    });
    console.log(dataRincian);
  });

  semuaData.forEach((entry) => {
    entry.data.forEach((item) => {
      const key = `${item.kategori}-${item.ukuran}-${item.diameter}`;
      if (!dataRekapGabungan[key]) {
        dataRekapGabungan[key] = {
          kategori: item.kategori,
          ukuran: item.ukuran,
          diameter: item.diameter,
          volume: item.volume,
          jumlah: 0,
        };
      }
      dataRekapGabungan[key].jumlah += item.jumlah;
    });
  });

  renderTabel();
}

function renderTabel() {
  let totalKeseluruhan = 0;
  let html =
    "<table><tr><th>Kategori</th><th>Ukuran</th><th>Diameter</th><th>Volume</th><th>Total Volume</th><th>Jumlah</th><th>Harga/m³</th><th>Total Harga</th></tr>";

  Object.values(dataRekapGabungan).forEach((row, idx) => {
    const keyHarga = `${row.kategori}-${row.ukuran}`;
    const harga = hargaPerM3[keyHarga] || 0;
    const totalVol = row.volume * row.jumlah;
    const totalHarga = totalVol * harga;
    totalKeseluruhan += totalHarga;
    html += `
      <tr>
        <td>${row.kategori}</td>
        <td>${row.ukuran}</td>
        <td>${row.diameter}</td>
        <td>${row.volume}m<sup>3</td>
        <td id="totalVol-${idx}">${totalVol.toFixed(2)}m<sup>3</td>
        <td>
          <button onclick="ubahJumlah('${idx}', -1)">➖</button>
          <span id="jumlah-${idx}">${row.jumlah}</span>
          <button onclick="ubahJumlah('${idx}', 1)">➕</button>
        </td>
        <td>Rp ${harga.toLocaleString()}</td>
        <td id="totalHarga-${idx}">Rp ${totalHarga.toLocaleString()}</td>
      </tr>
    `;
  });

  html += "</table>";
  tabelContainer.innerHTML = html;
  totalHargaEl.innerText = "Rp " + totalKeseluruhan.toLocaleString();
}

function ubahJumlah(index, delta) {
  const keys = Object.keys(dataRekapGabungan);
  const key = keys[index];
  if (!key) return;

  const row = dataRekapGabungan[key];
  row.jumlah = Math.max(0, row.jumlah + delta);

  renderTabel();
}

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

function simpanRekap() {
  const hasil = Object.values(dataRekapGabungan);
  localStorage.setItem("rekap_kayu_final", JSON.stringify(hasil));
  alert("Rekap berhasil disimpan.");
}

window.onload = () => {
  rekapData();
};
