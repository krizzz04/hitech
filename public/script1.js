var path = window.location.pathname;

// Get the filename from the path
var page = path.split("/").pop();

// Get the anchor elements
var links = document.querySelectorAll('nav a');

// Loop through each anchor element
links.forEach(function(link) {
  // Get the href attribute value
  var href = link.getAttribute('href');

  // Check if the href matches the current page
  if (href === page) {
    // Add 'active' class to the parent 'li' element
    link.parentNode.classList.add('active');
  }
});

document.addEventListener('DOMContentLoaded', function() {
  var navToggle = document.getElementById('nav-toggle');
  var nav = document.querySelector('.nav');

  navToggle.addEventListener('change', function() {
      if (this.checked) {
          nav.classList.add('active');
      } else {
          nav.classList.remove('active');
      }
  });
});



document.getElementById("bookingForm").addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent the form from submitting normally
  
  // Get today's date
  var today = new Date();
  today.setHours(24, 0, 0, 0); // Set hours to 0 to compare only dates
  
  // Get the selected date from the form
  var selectedDate = new Date(document.getElementById("date").value);
  
  // Check if the selected date is before today's date
  if (selectedDate.getTime() < today.getTime()) {
      document.getElementById("errorMessage").style.display = "none";
      document.getElementById("confirmationMessage").style.display = "none";
      document.getElementById("pastDayMessage").style.display = "block";
      return;
  }
  
  // Check if the selected date is not a Thursday
  if (selectedDate.getDay() !== 3) {
      document.getElementById("errorMessage").style.display = "block";
      document.getElementById("confirmationMessage").style.display = "none";
      document.getElementById("pastDayMessage").style.display = "none";
  } else {
      document.getElementById("errorMessage").style.display = "none";
      document.getElementById("confirmationMessage").style.display = "block";
      document.getElementById("pastDayMessage").style.display = "none";
      // Assuming successful submission for demonstration
      this.submit(); // Submit the form
  }
});



document.addEventListener('DOMContentLoaded', function() {
  const carousel = document.getElementById('carousel');
  const arrowLeft = document.querySelector('.arrow.left');
  const arrowRight = document.querySelector('.arrow.right');
  let currentPosition = 8;

  arrowLeft.addEventListener('click', function() {
    if (currentPosition > 1) {
      currentPosition--;
      carousel.style.setProperty('--position', currentPosition);
      hideExtraCards(currentPosition);
    }
  });

  arrowRight.addEventListener('click', function() {
    if (currentPosition < 18) {
      currentPosition++;
      carousel.style.setProperty('--position', currentPosition);
      hideExtraCards(currentPosition);
    }
  });

  function hideExtraCards(position) {
    const cards = document.querySelectorAll('.carousel-item');
    cards.forEach((card, index) => {
      if (index < position - 3 || index > position + 2) {
        card.style.display = 'none';
      } else {
        card.style.display = 'block';
      }
    });
  }
});



function countUp(elementId, targetValue, duration, speed) {
  const startTime = performance.now();
  const stepDuration = duration / targetValue / speed;
  let currentValue = 0;
  
  function update() {
      const elapsedTime = performance.now() - startTime;
      const progress = Math.min(1, elapsedTime / duration);
      currentValue = Math.floor(progress * targetValue);
      document.getElementById(elementId).textContent = currentValue.toLocaleString();
  
      if (currentValue < targetValue) {
          requestAnimationFrame(update);
      } else {
          document.getElementById(elementId).textContent = targetValue.toLocaleString();
      }
  }
  
  requestAnimationFrame(update);
  }
  
  function isElementInViewport(el, threshold = 0) {
  const rect = el.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const isVisible = (
      rect.bottom >= 0 &&
      rect.top <= windowHeight &&
      (rect.top <= 0 && rect.bottom >= 0) ||
      (rect.bottom >= windowHeight && rect.top <= windowHeight) ||
      (rect.top >= 0 && rect.bottom <= windowHeight)
  );
  
  const height = Math.max(el.clientHeight, el.scrollHeight, el.offsetHeight);
  const thresholdPixels = height * threshold;
  
  return isVisible || (rect.top >= 0 && rect.top <= thresholdPixels);
  }
  
  function startCounterWhenVisible() {
  const section = document.getElementById("customer-section");
  if (isElementInViewport(section, 0.2) && !section.classList.contains("visible")) {
      setTimeout(() => {
          countUp("years-counter", 30, 500, 1); // Adjust speed here
          const customerValues = generateCustomerValues();
          let customerIndex = 0;
  
          function updateCustomersCounter() {
              if (customerIndex < customerValues.length) {
                  document.getElementById("customers-counter").textContent = customerValues[customerIndex].toLocaleString();
                  customerIndex++;
                  setTimeout(updateCustomersCounter, 20);
              }
          }
  
          updateCustomersCounter();
      }, 0); // 0.2 second delay
      section.classList.add("visible"); // Add the "visible" class
  } else if (!isElementInViewport(section, 0.2) && section.classList.contains("visible")) {
      section.classList.remove("visible"); // Remove the "visible" class when out of view
      document.getElementById("years-counter").textContent = "0";
      document.getElementById("customers-counter").textContent = "0";
  }
  }
  
  function generateCustomerValues() {
  const customerTargetValues = [];
  for (let i = 0; i <= 30; i++) {
      customerTargetValues.push(Math.round((i / 30) * 100000));
  }
  return customerTargetValues;
  }
  
  function debounce(func, wait, immediate) {
  let timeout;
  return function() {
      const context = this,
          args = arguments;
      const later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
  };
  }
  
  const debouncedStartCounterWhenVisible = debounce(startCounterWhenVisible, 100);
  
  window.addEventListener("scroll", debouncedStartCounterWhenVisible);
  window.addEventListener("resize", debouncedStartCounterWhenVisible);
  startCounterWhenVisible(); // Call on page load



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



//   document.addEventListener('DOMContentLoaded', function () {
//     var adminLink = document.getElementById('admin-link');
//     adminLink.addEventListener('click', function (event) {
//         event.preventDefault(); // Prevent the default link behavior
        
//         var password = prompt("Enter the admin password:");
        
//         // Check if the password is correct
//         if (password === "hitech") { // Replace "yourpassword" with your actual password
//             window.location.href = adminLink.getAttribute('href'); // Redirect to the admin page
//         } else {
//             alert("Incorrect password!"); // Show an alert if the password is incorrect
//         }
//     });
// });


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


