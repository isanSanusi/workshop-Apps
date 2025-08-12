(function () {
   // ====== KONFIGURASI ======
   const ALERT_MSG = "ALERT_MSG";
   const icons = {
      success: "✔️",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
   };

   // ====== BUAT ELEMENT ALERT CONTAINER ======
   let flashContainer = document.getElementById("flash-alert-container");
   if (!flashContainer) {
      flashContainer = document.createElement("div");
      flashContainer.id = "flash-alert-container";
      document.body.appendChild(flashContainer);
   }

   // ====== FLASH ALERT LISTENER ======
   document.addEventListener(ALERT_MSG, function (e) {
      const type = e.detail?.type || "info";
      const message = e.detail?.message || "Pesan default";
      const duration = e.detail?.duration || 3500;
      showFlashAlert(message, type, duration);
   });

   function showFlashAlert(msg, type, duration) {
      const alertBox = document.createElement("div");
      alertBox.className = `flash-alert ${type}`;
      alertBox.innerHTML = `<span class="icon">${
         icons[type] || icons.info
      }</span> ${msg}`;
      flashContainer.appendChild(alertBox);

      setTimeout(() => {
         alertBox.remove();
      }, duration);
   }

   // ====== GLOBAL FUNCTION UNTUK FLASH ALERT ======
   window.flashAlert = function (type, message, duration = 3500) {
      document.dispatchEvent(
         new CustomEvent(ALERT_MSG, {
            detail: { type, message, duration },
         })
      );
   };

   // ====== CUSTOM CONFIRM ======
   let confirmContainer = document.getElementById("custom-confirm-container");
   if (!confirmContainer) {
      confirmContainer = document.createElement("div");
      confirmContainer.id = "custom-confirm-container";
      document.body.appendChild(confirmContainer);
   }

   window.flashConfirm = function (message) {
      return new Promise((resolve) => {
         confirmContainer.innerHTML = `
               <div class="custom-confirm-box">
                   <div>${message}</div>
                   <div class="custom-confirm-buttons">
                       <button id="confirm-ok">OK</button>
                       <button id="confirm-cancel">Cancel</button>
                   </div>
               </div>
           `;
         confirmContainer.style.display = "flex";

         document.getElementById("confirm-ok").onclick = () => {
            confirmContainer.style.display = "none";
            resolve(true);
         };
         document.getElementById("confirm-cancel").onclick = () => {
            confirmContainer.style.display = "none";
            resolve(false);
         };
      });
   };
})();
