let kayuList = [];

function hitungVolume(panjang, diaA, diaB) {
   const formula = 0.785;
   const minDia = Math.min(diaA, diaB);

   if (isNaN(panjang) || isNaN(minDia)) return 0;

   // Hitung volume dalam cm³
   const volumeCm3 = panjang * minDia * minDia * formula;

   // Konversi ke liter
   const volumeLiter = volumeCm3 / 1000;

   // Bulatkan ke bilangan bulat liter
   return Math.round(volumeLiter);
}

function tambahKayu() {
   const panjang = parseFloat(document.getElementById("panjang").value);
   const diaA = parseFloat(document.getElementById("diaA").value);
   const diaB = parseFloat(document.getElementById("diaB").value);

   if (!panjang || !diaA || !diaB) return;

   const volume = hitungVolume(panjang, diaA, diaB);
   kayuList.push({ panjang, minDia: Math.min(diaA, diaB), volume, jumlah: 0 });
   //   kayuList.push({ panjang, diaA, diaB, minDia: Math.min(diaA, diaB), volume });

   updateTabel();
}

const tallyData = {
   130: {
      8: 0,
      9: 0,
      10: 0,
   },
};

function tambahKayuTally(panjang, diameter) {
   if (!tallyData[panjang]) tallyData[panjang] = {};
   if (!tallyData[panjang][diameter]) tallyData[panjang][diameter] = 0;

   tallyData[panjang][diameter]++;
   updateTallyDisplay(panjang);
}

function updateTallyDisplay(panjang) {
   const container = document.getElementById(`rekap${panjang}`);
   const data = tallyData[panjang];
   let total = 0;
   let html = "";

   for (let dia in data) {
      const count = data[dia];
      total += count;
      html += `<p>Diameter ${dia} cm: <strong>${count}</strong> batang</p>`;
   }

   html += `<hr><p><strong>Total: ${total} batang</strong></p>`;
   container.innerHTML = html;
}

function updateTabel() {
   const tbody = document.querySelector("#tabelKayu tbody");
   tbody.innerHTML = "";
   //   <td>${kayu.diaA}</td>
   //   <td>${kayu.diaB}</td>

   let totalVolume = 0;
   kayuList.forEach((kayu, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${index + 1}</td>
      <td>${kayu.panjang}</td>
      <td>${kayu.minDia}</td>
      <td>${kayu.volume}</td>
      <td>
        <div>
            <button onclick="kurangJumlah(${index})">➖</button>
            <strong>${kayu.jumlah}</strong>
            <button onclick="tambahJumlah(${index})">➕</button>
        </div>
      </td>
    `;
      tbody.appendChild(row);
      totalVolume += kayu.volume;
   });
}

function tambahJumlah(index) {
   kayuList[index].jumlah++;
   updateTabel();
   updateTotal();
}

function kurangJumlah(index) {
   if (kayuList[index].jumlah > 0) {
      kayuList[index].jumlah--;
      updateTabel();
      updateTotal();
   }
}

function getTotalKayu() {
   return kayuList.reduce((total, kayu) => total + kayu.jumlah, 0);
}

function getTotalVolume() {
   return kayuList.reduce(
      (total, kayu) => total + kayu.volume * kayu.jumlah,
      0
   );
}

function updateTotal() {
   document.getElementById("totalKayu").innerText = getTotalKayu();
   document.getElementById("totalVolume").innerText = getTotalVolume();
}

function resetData() {
   kayuList = [];
   updateTabel();
   updateTotal();
}

function exportCSV() {
   let csv = "No,Panjang,DiaA,DiaB,MinDia,Volume(m3)\n";
   kayuList.forEach((k, i) => {
      csv += `${i + 1},${k.panjang},${k.diaA},${k.diaB},${k.minDia},${
         k.volume
      }\n`;
   });

   const blob = new Blob([csv], { type: "text/csv" });
   const link = document.createElement("a");
   link.href = URL.createObjectURL(blob);
   link.download = "data_kayu.csv";
   link.click();
}

console.log(kayuList);
