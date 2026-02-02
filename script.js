// ========================================
// MENU HAMBÚRGUER MOBILE
// ========================================

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const menuOverlay = document.getElementById('menuOverlay');

// Toggle menu
function toggleMenu() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('mobile-menu');
    navLinks.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
}

// Fecha menu ao clicar no hambúrguer
if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
}

// Fecha menu ao clicar no overlay
if (menuOverlay) {
    menuOverlay.addEventListener('click', toggleMenu);
}

// Fecha menu ao clicar em um link
if (navLinks) {
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
}

// Fecha menu ao pressionar ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        toggleMenu();
    }
});

// Reorganiza menu no resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            toggleMenu();
        }
    }, 250);
});

// ========================================
// PARTICULAS - POEIRA RÁPIDA (OTIMIZADA)
// ========================================

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const isMobile = window.innerWidth <= 768;
    const particleCount = isMobile ? 30 : 60;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const randomLeft = Math.random() * window.innerWidth;
        const randomDuration = Math.random() * 12 + 8;
        const randomDelay = Math.random() * 2;
        const randomSize = Math.random() * (isMobile ? 2 : 3) + 1;
        
        particle.style.left = randomLeft + 'px';
        particle.style.bottom = '-10px';
        particle.style.width = randomSize + 'px';
        particle.style.height = randomSize + 'px';
        particle.style.animationDuration = randomDuration + 's';
        particle.style.animationDelay = randomDelay + 's';
        
        particlesContainer.appendChild(particle);
    }
}

window.addEventListener('DOMContentLoaded', createParticles);

// Recria partículas ao redimensionar
let particleResizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(particleResizeTimeout);
    particleResizeTimeout = setTimeout(() => {
        const particlesContainer = document.getElementById('particles');
        if (particlesContainer) {
            particlesContainer.innerHTML = '';
            createParticles();
        }
    }, 250);
});

// ========================================
// LOADING SCREEN - FADE OUT RÁPIDO COM GIF
// ========================================

window.addEventListener('load', () => {
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }, 2000);
});

// ========================================
// MOUSE PARALLAX GRADIENTE (DESKTOP)
// ========================================

const mouseGradient = document.getElementById('mouseGradient');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Apenas em desktop
if (window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        const gradientX = (mouseX / window.innerWidth) * 100;
        const gradientY = (mouseY / window.innerHeight) * 100;
        
        if (mouseGradient) {
            mouseGradient.style.backgroundImage = `radial-gradient(
                600px at ${gradientX}% ${gradientY}%,
                rgba(120, 0, 20, 0.15) 0%,
                transparent 100%
            )`;
        }
    }, { passive: true });
}

// ========================================
// SMOOTH SCROLL
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        
        if (target) {
            const offsetTop = target.offsetTop - (window.innerWidth <= 768 ? 60 : 80);
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// SCROLL ANIMATIONS (OTIMIZADO)
// ========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('[data-aos]').forEach(el => {
    observer.observe(el);
});

// ========================================
// CONTATO FORM MODAL
// ========================================

const modal = document.getElementById('successModal');
const form = document.getElementById('contactForm');
const closeModal = document.querySelector('.modal-close');

if (form && modal && closeModal) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        modal.classList.add('active');
        form.reset();
        document.body.style.overflow = 'hidden';
    });

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ========================================
// NAVBAR EFFECT
// ========================================

const nav = document.querySelector('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const isMobile = window.innerWidth <= 768;

    if (currentScroll > 100) {
        if (isMobile) {
            nav.style.padding = '15px 20px';
        } else {
            nav.style.padding = '20px 60px';
        }
        nav.style.background = 'rgba(0, 0, 0, 0.95)';
        nav.style.backdropFilter = 'blur(10px)';
    } else {
        if (isMobile) {
            nav.style.padding = '20px';
        } else {
            nav.style.padding = '30px 60px';
        }
        nav.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%)';
        nav.style.backdropFilter = 'none';
    }

    lastScroll = currentScroll;
}, { passive: true });

// ========================================
// GALERIA HOVER EFFECTS (DESKTOP)
// ========================================

const isMobileDevice = window.innerWidth <= 768;

if (!isMobileDevice) {
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            const img = this.querySelector('img');
            if (img) {
                img.style.filter = 'contrast(1.3) brightness(0.9)';
            }
        });

        item.addEventListener('mouseleave', function() {
            const img = this.querySelector('img');
            if (img) {
                img.style.filter = 'contrast(1.2)';
            }
        });
    });
}

// ========================================
// TOUCH SUPPORT PARA GALERIA (MOBILE)
// ========================================

if (isMobileDevice) {
    document.querySelectorAll('.gallery-item').forEach(item => {
        let touchStartTime = 0;
        
        item.addEventListener('touchstart', function() {
            touchStartTime = Date.now();
            const img = this.querySelector('img');
            if (img) {
                img.style.filter = 'contrast(1.2) brightness(0.95)';
            }
        });

        item.addEventListener('touchend', function() {
            const touchDuration = Date.now() - touchStartTime;
            const img = this.querySelector('img');
            
            if (img) {
                img.style.filter = 'contrast(1.2)';
            }
            
            // Se o toque foi rápido (< 200ms), abre lightbox
            if (touchDuration < 200) {
                openLightbox(img);
            }
        });
    });
}

// ========================================
// LIGHTBOX GALERIA
// ========================================

function openLightbox(imgElement) {
    const lightbox = document.createElement('div');
    
    lightbox.style.cssText = `
        position: fixed;
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%;
        background: rgba(0,0,0,0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        cursor: pointer;
        animation: fadeIn 0.3s ease;
    `;

    const fullImg = document.createElement('img');
    fullImg.src = imgElement.src;
    fullImg.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border: 2px solid rgba(255, 255, 255, 0.2);
    `;

    // Botão fechar
    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 50px;
        color: white;
        cursor: pointer;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;
    `;

    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.transform = 'rotate(90deg)';
    });

    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.transform = 'rotate(0deg)';
    });

    lightbox.appendChild(fullImg);
    lightbox.appendChild(closeBtn);
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';

    // Remove ao clicar
    lightbox.onclick = (e) => {
        if (e.target === lightbox || e.target === closeBtn) {
            document.body.style.overflow = '';
            lightbox.remove();
        }
    };

    // Remove com ESC
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            document.body.style.overflow = '';
            lightbox.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// Desktop - clique normal
document.querySelectorAll('.gallery-item img').forEach(img => {
    if (!isMobileDevice) {
        img.addEventListener('click', function() {
            openLightbox(this);
        });
    }
});

// ========================================
// PERFORMANCE - Lazy Loading de Imagens
// ========================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ========================================
// CONSOLE MESSAGE
// ========================================

console.log('%c MODE SKETCH ', 'background: #000; color: #fff; font-size: 20px; padding: 10px;');
console.log('%c Todos os modos de arte ', 'background: #500000; color: #fff; font-size: 14px; padding: 5px;');