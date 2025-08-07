const waktuSimpan = new Date().toLocaleString("id-ID");

function tampilkanTabel() {
  let totalSemua = 0;
  let html = `
    <div><strong>Waktu Pencatatan:</strong> ${waktuSimpan}</div>
    <table>
      <tr>
        <th>No</th>
        <th>Kategori</th>
        <th>Subkategori</th>
        <th>Diameter (cm)</th>
        <th>Volume / batang (m<sup>3)</th>
        <th>Jumlah</th>
        <th>Total Volume (m<sup>3)</th>
      </tr>`;

  dataTercatat.forEach((row, index) => {
    const total = row.volume * row.jumlah;
    totalSemua += total;

    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${row.kategori}</td>
        <td>${row.ukuran}</td>
        <td>${row.diameter}</td>
        <td>${row.volume}</td>
        <td>${row.jumlah}</td>
        <td>${total.toFixed(2)}</td>
      </tr>`;
  });

  html += `</table>
    <h3 style="text-align:right; margin-top:10px;">Total Keseluruhan: ${totalSemua.toFixed(
      2
    )} m<sup>3</h3>
  `;

  document.getElementById("tabelData").innerHTML = html;
}

function downloadCSV() {
  let csv = `Waktu Pencatatan:,${waktuSimpan}\n`;
  csv +=
    "No,Kategori,Subkategori,Diameter (cm),Volume / batang (m3),Jumlah,Total Volume (m3)\n";

  let totalAll = 0;
  dataTercatat.forEach((row, i) => {
    const total = row.volume * row.jumlah;
    totalAll += total;
    csv += `${i + 1},${row.kategori},${row.ukuran},${row.diameter},${
      row.volume
    },${row.jumlah},${total.toFixed(2)}\n`;
  });

  csv += `Total Keseluruhan,,,,,${totalAll.toFixed(2)} m<sup>3\n`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Data_Kayu_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
