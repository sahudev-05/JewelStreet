document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.querySelector(".overlay");
    const cardsContainer = document.querySelector(".cards-container");
    const cards = document.querySelectorAll(".card");

    cards.forEach((card) => {
        let images = card.querySelectorAll(".product-image");
        let index = 0;

        function showImage(i) {
            images.forEach(img => img.style.display = "none");
            images[i].style.display = "block";
        }
        if (images.length > 0) showImage(index);

        let prevButton = card.querySelector(".prev-button");
        let nextButton = card.querySelector(".next-button");
        if (prevButton && nextButton) {
            prevButton.style.background = "none";
            prevButton.style.border = "none";
            nextButton.style.background = "none";
            nextButton.style.border = "none";
            
            prevButton.addEventListener("click", (e) => {
                e.stopPropagation();
                index = (index > 0) ? index - 1 : images.length - 1;
                showImage(index);
            });
            nextButton.addEventListener("click", (e) => {
                e.stopPropagation();
                index = (index < images.length - 1) ? index + 1 : 0;
                showImage(index);
            });
        }

        // Enlarge Card Functionality
        card.addEventListener("click", (e) => {
            if (!e.target.classList.contains("cart-button") && !e.target.classList.contains("heart-button")) {
                overlay.classList.add("active");
                cardsContainer.classList.add("blurred");
                cards.forEach(c => c.classList.remove("enlarged"));
                card.classList.add("enlarged");
            }
        });

        // Add to Cart Functionality
        let cartButton = card.querySelector(".cart-button");
        if (cartButton) {
            cartButton.style.background = "none";
            cartButton.style.border = "none";
            cartButton.addEventListener("click", (e) => {
                e.stopPropagation();
                if (cartButton.textContent === "Add to Cart") {
                    cartButton.textContent = "Added to Cart";
                    cartButton.classList.add("added");
                    console.log("Added to Cart: " + card.querySelector(".product-name").textContent);
                } else {
                    cartButton.textContent = "Add to Cart";
                    cartButton.classList.remove("added");
                    console.log("Removed from Cart: " + card.querySelector(".product-name").textContent);
                }
            });
        }

        // Favorite (Heart) Functionality
        let heartButton = card.querySelector(".heart-button");
        if (heartButton) {
            heartButton.style.background = "none";
            heartButton.style.border = "none";
            heartButton.addEventListener("click", (e) => {
                e.stopPropagation();
                heartButton.classList.toggle("favorited");
                heartButton.style.color = heartButton.classList.contains("favorited") ? "red" : "black";
            });
        }
    });

    // Close Enlarged View on Overlay Click (ONLY overlay)
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.remove("active");
            cardsContainer.classList.remove("blurred");
            cards.forEach(card => card.classList.remove("enlarged"));
        }
    });

    // Close Enlarged View on Escape Key Press
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            overlay.classList.remove("active");
            cardsContainer.classList.remove("blurred");
            cards.forEach(card => card.classList.remove("enlarged"));
        }
    });
});

