document.addEventListener("DOMContentLoaded", function() {
  // Select the model and text overlay elements
  const modelElement = document.querySelector('.model');
  const textOverlayElement = document.querySelector('.text-overlay');

  // Add the fade-in class to both elements after a delay
  setTimeout(() => {
      if (modelElement) {
          modelElement.classList.add('fade-in');
          modelElement.style.opacity = 1; // Corrected from 5 to 1
      }
  }, 1000);

  setTimeout(() => {
      if (textOverlayElement) {
          textOverlayElement.classList.add('fade-in');
          textOverlayElement.style.opacity = 1;
      }
  }, 1500);


});


document.addEventListener("DOMContentLoaded", function() {
  let images = document.querySelectorAll(".product-image");
  let currentIndex = 0;
  let totalImages = images.length;

  function showNextImage() {
      if (!images || images.length === 0) return; // Prevent errors
      images[currentIndex].style.display = "none"; // Hide current image
      currentIndex = (currentIndex + 1) % totalImages; // Move to the next index
      images[currentIndex].style.display = "block"; // Show next image
  }

  if (totalImages > 0) {
      images[currentIndex].style.display = "block"; // Show first image
      setInterval(showNextImage, 1500); // Change image every 1.5 seconds
  }
});


document.addEventListener("click", () => {
    const video = document.querySelector(".intro");
    video.muted = false;
    video.volume = 1.0;
    video.play();
}, { once: true });




const video = document.getElementById("introVideo");
const muteButton = document.getElementById("muteButton");
const icon = muteButton.querySelector("i");

muteButton.addEventListener("click", () => {
    if (video.muted) {
        video.muted = false;
        video.volume = 1.0;
        icon.classList.remove("fa-volume-mute");
        icon.classList.add("fa-volume-up");
    } else {
        video.muted = true;
        icon.classList.remove("fa-volume-up");
        icon.classList.add("fa-volume-mute");
    }
});
