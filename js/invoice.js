function cetakInvoice(index) {
   const data = semuaData[index];
   if (!data) return alert("Data tidak ditemukan");

   const dateObj = new Date();
   const tanggalInvoice = dateObj.toISOString().slice(0, 10);

   // Hitung total per kategori
   let totalSuperVol = 0;
   let totalSuperHarga = 0;
   let totalRejectVol = 0;
   let totalRejectHarga = 0;

   data.data.forEach((item) => {
      const keyHarga = `${item.kategori}-${item.ukuran}`.toLowerCase();
      const harga = hargaPerM3[keyHarga] || 0;
      const totalRowVol = item.volume * item.jumlah;
      const totalRowHarga = totalRowVol * harga;

      if (item.kategori.toLowerCase() === "super") {
         totalSuperVol += totalRowVol;
         totalSuperHarga += totalRowHarga;
      } else if (item.kategori.toLowerCase() === "reject") {
         totalRejectVol += totalRowVol;
         totalRejectHarga += totalRowHarga;
      }
   });

   const totalKeseluruhanVol = totalSuperVol + totalRejectVol;
   const totalKeseluruhanHarga = totalSuperHarga + totalRejectHarga;

   // Buat template invoice
   const invoiceHTML = `
 <pre style="font-family:monospace; white-space:pre;">
 ====================================================
          PT. Meong Coding Sejahtera
 
 Nama Penerima      : Bapak Dummy
 Tanggal Pengiriman : ${tanggalInvoice}
 ====================================================
 Total Kayu:
   SUPER :
     Total Volume : ${totalSuperVol.toFixed(2)} m³
     Total Harga  : Rp ${totalSuperHarga.toLocaleString()}
   REJECT :
     Total Volume : ${totalRejectVol.toFixed(2)} m³
     Total Harga  : Rp ${totalRejectHarga.toLocaleString()}
 
 Total Keseluruhan:
     Volume : ${totalKeseluruhanVol.toFixed(2)} m³
     Harga  : Rp ${totalKeseluruhanHarga.toLocaleString()}
 ====================================================
 Pengirim: ${data.oleh}
 </pre>
   `;

   // Buka tab baru untuk print
   const win = window.open("", "_blank");
   win.document.write(`
     <html>
       <head>
         <title>Invoice - ${tanggalInvoice}</title>
         <style>
           body { font-family: Arial, sans-serif; }
           pre { font-size: 14px; }
         </style>
       </head>
       <body>
         ${invoiceHTML}
         <script>
           window.print();
         </script>
       </body>
     </html>
   `);
   win.document.close();
}
