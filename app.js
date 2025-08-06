let kategoriTerpilih = "";
let ukuranTerpilih = 0;
let dataTercatat = [];
let jumlahPerKategoriUkuran = {};

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
  document.getElementById(
    "judulInput"
  ).innerText = `CATEGORY: ${kategoriTerpilih} - SIZE: ${uk}`;
  generatePreset();
}

function hitungVolumeLiter(panjang, diameter) {
  const formula = 0.785;
  if (isNaN(panjang) || isNaN(diameter)) return 0;

  const volumeCm3 = panjang * diameter * diameter * formula;
  const volumeLiter = volumeCm3 / 1000;

  return Math.round(volumeLiter);
}

function generatePreset() {
  const container = document.getElementById("presetTombol");
  container.innerHTML = "";

  let min = ukuranTerpilih <= 130 ? 9 : 20;
  let max = ukuranTerpilih <= 130 ? 55 : 80;

  if (!jumlahPerKategoriUkuran[kategoriTerpilih]) {
    jumlahPerKategoriUkuran[kategoriTerpilih] = {};
  }

  if (!jumlahPerKategoriUkuran[kategoriTerpilih][ukuranTerpilih]) {
    jumlahPerKategoriUkuran[kategoriTerpilih][ukuranTerpilih] = {};
  }
  const jumlahPerDiameter =
    jumlahPerKategoriUkuran[kategoriTerpilih][ukuranTerpilih];

  for (let d = min; d <= max; d++) {
    let volume = hitungVolumeLiter(ukuranTerpilih, d);
    jumlahPerDiameter[d] = jumlahPerDiameter[d] || 0;

    let btn = document.createElement("button");
    btn.className = "preset-button";
    btn.id = `btn-${d}`;
    btn.innerHTML = `
      <div class="dia">${d}cm</div>
      <div class="volume-jumlah">
        <span>${volume} m<sup>3</sup></span>
        <span>${jumlahPerDiameter[d]}</span>
      </div>`;

    btn.onclick = () => {
      jumlahPerDiameter[d]++;

      // Update tombol sesuai ID
      const updatedBtn = document.getElementById(`btn-${d}`);
      if (updatedBtn) {
        updatedBtn.innerHTML = `
          <div class="dia">${d}cm</div>
          <div class="volume-jumlah">
            <span>${volume} m<sup>3</sup></span>
            <span>${jumlahPerDiameter[d]}</span>
          </div>`;
      }

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
  let html = `
    <table>
      <tr>
        <th>Kategori</th>
        <th>Ukuran</th>
        <th>Diameter</th>
        <th>Volume</th>
        <th>Jumlah</th>
        <th>Total Volume</th>
      </tr>`;

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

  dataTercatat = [];
  jumlahPerKategoriUkuran = {};

  const tableBody = document.getElementById("tabelData");
  if (tableBody) tableBody.innerHTML = "";

  generatePreset(); // Refresh preset tombol

  alert("Data berhasil direset!");
}

// Awal
tampilkanHalaman("halamanKategori");
