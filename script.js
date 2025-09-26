// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animated counters
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;

    counters.forEach(counter => {
        const animate = () => {
            const value = +counter.getAttribute('data-target');
            const data = +counter.innerText;
            const time = value / speed;
            
            if (data < value) {
                counter.innerText = Math.ceil(data + time);
                setTimeout(animate, 1);
            } else {
                counter.innerText = value;
            }
        }
        animate();
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('stats')) {
                animateCounters();
            }
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .stats, .cta-section').forEach(el => {
    observer.observe(el);
});

// Add hover effect to feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-15px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Testimonial rotation with fade effect
const testimonials = document.querySelectorAll('.testimonial');
let currentTestimonialIndex = 0;
const testimonialIntervalMs = 2000;
let testimonialIntervalId = null;
const testimonialsContainer = document.querySelector('.testimonials');

function rotateTestimonials() {
    if (testimonials.length <= 1) return;

    testimonials[currentTestimonialIndex].classList.remove('active');
    currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
    testimonials[currentTestimonialIndex].classList.add('active');
}

function stopTestimonialRotation() {
    if (testimonialIntervalId !== null) {
        clearInterval(testimonialIntervalId);
        testimonialIntervalId = null;
    }
}

function startTestimonialRotation() {
    stopTestimonialRotation();
    testimonialIntervalId = setInterval(rotateTestimonials, testimonialIntervalMs);
}

if (testimonials.length) {
    testimonials.forEach((testimonial, index) => {
        if (index === 0) {
            testimonial.classList.add('active');
        } else {
            testimonial.classList.remove('active');
        }
    });

    startTestimonialRotation();

    if (testimonialsContainer) {
        testimonialsContainer.addEventListener('mouseenter', stopTestimonialRotation);
        testimonialsContainer.addEventListener('mouseleave', startTestimonialRotation);
    }
}