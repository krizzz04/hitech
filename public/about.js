document.getElementById("menu-icon").addEventListener("click", function() {
    var menuList = document.getElementById("menu-list");
    if (menuList.style.display === "none") {
        menuList.style.display = "block";
    } else {
        menuList.style.display = "none";
    }
});


function redirectToGoogleMaps() {
    var address = 'Hi Tech lab, Magistrate Ct Rd, Payyanur, Kerala 670307';
    var url = 'https://www.google.com/maps?q=' + encodeURIComponent(address);
    
    // Open Google Maps in the same window
    window.location.href = url;
}

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
  

  document.addEventListener('DOMContentLoaded', function () {
    var adminLink = document.getElementById('admin-link');
    adminLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the default link behavior
        
        var password = prompt("Enter the admin password:");
        
        // Check if the password is correct
        if (password === "hitech") { // Replace "yourpassword" with your actual password
            window.location.href = adminLink.getAttribute('href'); // Redirect to the admin page
        } else {
            alert("Incorrect password!"); // Show an alert if the password is incorrect
        }
    });
});

  // Get the modal
  var modal = document.getElementById("resultModal");

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close1")[0];

  // When the user clicks on the button, open the modal
  document.getElementById("openResultModal").onclick = function() {
      modal.style.display = "block";
  }

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
      modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  }