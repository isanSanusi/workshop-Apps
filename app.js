let kategoriTerpilih = "";
let ukuranTerpilih = 0;
let dataTercatat = [];

function tampilkanHalaman(id) {
  document
    .querySelectorAll(".container > div")
    .forEach((div) => div.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  if (id === "halamanRingkasan") tampilkanTabel();
}

function pilihKategori(kat) {
  kategoriTerpilih = kat;
  tampilkanHalaman("halamanUkuran");
}

function pilihUkuran(uk) {
  ukuranTerpilih = uk;
  tampilkanHalaman("halamanInput");
  document.getElementById(
    "judulInput"
  ).innerText = `Input Diameter - ${kategoriTerpilih} - ${uk}`;
  generatePreset();
}

let jumlahPerDiameter = {};

function hitungVolumeLiter(panjang, diameter) {
  const formula = 0.785;
  const minDia = Math.min(diameter, diameter); // karena tidak ada diaA & diaB, gunakan diameter 2x
  if (isNaN(panjang) || isNaN(minDia)) return 0;

  const volumeCm3 = panjang * minDia * minDia * formula;
  const volumeLiter = volumeCm3 / 1000;

  return Math.round(volumeLiter); // Hasil akhir = dalam Liter
}

function generatePreset() {
  const container = document.getElementById("presetTombol");
  container.innerHTML = "";
  let min = ukuranTerpilih <= 130 ? 9 : 20;
  let max = ukuranTerpilih <= 130 ? 55 : 80;

  for (let d = min; d <= max; d++) {
    let volume = hitungVolumeLiter(ukuranTerpilih, d);
    jumlahPerDiameter[d] = jumlahPerDiameter[d] || 0;

    let btn = document.createElement("button");
    btn.className = "preset-button";
    btn.id = `btn-${d}`;
    btn.innerHTML = `${d}cm<br>(${volume} m&sup3)<br>Jumlah: ${jumlahPerDiameter[d]}`;

    btn.onclick = () => {
      jumlahPerDiameter[d]++;
      btn.innerHTML = `${d}cm<br>(${volume} m&sup3)<br>Jumlah: ${jumlahPerDiameter[d]}`;
      tambahData(d, volume);
    };

    container.appendChild(btn);
  }
}

function tambahData(diameter, volume) {
  let existing = dataTercatat.find(
    (d) =>
      d.kategori === kategoriTerpilih &&
      d.ukuran === ukuranTerpilih &&
      d.diameter === diameter
  );
  if (existing) {
    existing.jumlah += 1;
  } else {
    dataTercatat.push({
      kategori: kategoriTerpilih,
      ukuran: ukuranTerpilih,
      diameter,
      volume,
      jumlah: 1,
    });
  }
}

function simpanData() {
  alert("Data disimpan.");
  tampilkanHalaman("halamanRingkasan");
}

function tampilkanTabel() {
  let html =
    "<table><tr><th>Kategori</th><th>Ukuran</th><th>Diameter</th><th>Volume</th><th>Jumlah</th><th>Total Volume</th></tr>";
  dataTercatat.forEach((row) => {
    html += `<tr>
        <td>${row.kategori}</td>
        <td>${row.ukuran}</td>
        <td>${row.diameter}</td>
        <td>${row.volume}</td>
        <td>${row.jumlah}</td>
        <td>${(row.volume * row.jumlah).toFixed(2)}</td>
      </tr>`;
  });
  html += "</table>";
  document.getElementById("tabelData").innerHTML = html;
}

function downloadCSV() {
  let csv = "Kategori,Ukuran,Diameter,Volume,Jumlah,Total Volume\n";
  dataTercatat.forEach((row) => {
    csv += `${row.kategori},${row.ukuran},${row.diameter},${row.volume},${
      row.jumlah
    },${(row.volume * row.jumlah).toFixed(2)}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data_kayu.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function resetData() {
  if (!confirm("Yakin ingin menghapus semua data?")) return;

  dataKayu = [];
  jumlahPerDiameter = {};

  // Hapus isi tabel
  const tableBody = document.getElementById("tabelDataBody");
  if (tableBody) tableBody.innerHTML = "";

  // Reset tampilan tombol preset (jika sedang di halaman preset)
  generatePreset();

  alert("Data berhasil direset!");
}

// Awal
tampilkanHalaman("halamanKategori");
