// Contoh Flash Alert
flashAlert("success", "Data berhasil disimpan!");
flashAlert("error", "Terjadi kesalahan!", 5000);

// Contoh Confirm
flashConfirm("Yakin ingin menghapus data ini?").then((result) => {
   if (result) {
      flashAlert("success", "Data dihapus!");
   } else {
      flashAlert("info", "Penghapusan dibatalkan.");
   }
});
