document.addEventListener('DOMContentLoaded', () => {
    
    // --- NAVBAR---
    const btnMenu = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');

    if (btnMenu && menu) {
        btnMenu.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
    }

    // --- CARRUSEL---
    const swiperContainer = document.querySelector('.mySwiper');
    
    if (swiperContainer) {
        const swiper = new Swiper(".mySwiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            loop: true,
            speed: 1200,
            
            // Autoplay
            autoplay: {
                delay: 2000,
                disableOnInteraction: false, 
            },

            coverflowEffect: {
                rotate: 30,
                stretch: 0,
                depth: 200,
                modifier: 1,
                slideShadows: true,
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
        });
    }
});