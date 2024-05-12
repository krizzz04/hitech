document.addEventListener("DOMContentLoaded", function () {
    const menuBtn = document.querySelector(".menu-btn");
    const menuOverlay = document.querySelector(".menu-overlay");
  
    // Check if menuBtn and menuOverlay exist before adding event listener
    if (menuBtn && menuOverlay) {
        menuBtn.addEventListener("click", function () {
            // Toggle menu overlay visibility when menu button is clicked
            menuOverlay.style.display = menuOverlay.style.display === "block" ? "none" : "block";
        });
    } else {
        console.error("Menu button or menu overlay not found.");
    }
  });