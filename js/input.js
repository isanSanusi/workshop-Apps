let kategoriTerpilih = "";
let subkategoriTerpilih = "";
let dataTercatat = [];

let jumlahPerKategori = {
  SUPER: {
    100: {},
    130: {},
    200: {},
    260: {},
    standard: {},
  },
  REJECT: {
    100: {},
    130: {},
    200: {},
    260: {},
  },
};

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

function pilihUkuran(subkat) {
  subkategoriTerpilih = subkat;
  document.getElementById(
    "judulInput"
  ).innerText = `CATEGORY: ${kategoriTerpilih} - SIZE: ${subkat}`;
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
    max = 80;
  if (subkategori === 200) {
    min = 20;
    max = kategori === "SUPER" ? 80 : 80;
  }
  if (subkategori === 260) {
    min = 20;
    max = kategori === "SUPER" ? 80 : 80;
  }
  if (subkategori === "standard") {
    min = 15;
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

function simpanData() {
  alert("Data disimpan.");
  tampilkanHalaman("halamanRingkasan");
}

function resetData() {
  if (!confirm("Yakin ingin menghapus semua data?")) return;
  dataTercatat = [];
  jumlahPerKategori = {
    SUPER: { 100: {}, 130: {}, 200: {}, 260: {}, standard: {} },
    REJECT: { 100: {}, 130: {}, 200: {}, 260: {} },
  };
  document.getElementById("tabelData").innerHTML = "";
  generatePreset(kategoriTerpilih, subkategoriTerpilih);
  alert("Data berhasil direset.");
}
