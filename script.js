// Initialize Lucide Icons
lucide.createIcons();

// --- Header Scroll Effect & Mobile Menu ---
const header = document.getElementById('header');
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');
let isMenuOpen = false;

window.addEventListener('scroll', () => {
    if (window.scrollY > 50 || isMenuOpen) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

menuBtn.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
        mobileMenu.classList.add('active');
        header.classList.add('scrolled');
        menuBtn.innerHTML = '<i data-lucide="x"></i>';
    } else {
        mobileMenu.classList.remove('active');
        if (window.scrollY <= 50) {
            header.classList.remove('scrolled');
        }
        menuBtn.innerHTML = '<i data-lucide="menu"></i>';
    }
    lucide.createIcons(); // Re-initialize icons
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        isMenuOpen = false;
        mobileMenu.classList.remove('active');
        if (window.scrollY <= 50) {
            header.classList.remove('scrolled');
        }
        menuBtn.innerHTML = '<i data-lucide="menu"></i>';
        lucide.createIcons();
    });
});

// --- Scroll Reveal Animations ---
const revealElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const elementVisible = 100;

    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
// Trigger once on load
revealOnScroll();

// --- Animated Counters ---
const counters = document.querySelectorAll('.counter');
let hasCounted = false;

const startCounters = () => {
    const statsSection = document.querySelector('.stats');
    if (!statsSection) return;
    
    const sectionTop = statsSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (sectionTop < windowHeight - 50 && !hasCounted) {
        hasCounted = true;
        
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // ms
            const increment = target / (duration / 16); // 60fps
            
            let current = 0;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                }
            };
            
            updateCounter();
        });
    }
};

window.addEventListener('scroll', startCounters);

// --- Smooth Scrolling for Anchor Links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            e.preventDefault();
            
            // Adjust offset for fixed header
            const headerHeight = header.offsetHeight;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = Math.max(0, elementPosition + window.scrollY - headerHeight);
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});
