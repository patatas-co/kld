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

const chatbotDataset = [
    {
        question: 'What is this system for?',
        answer: 'This system helps users manage and track our student organization platform.'
    },
    {
        question: 'How do I register?',
        answer: 'Click on the Register button and fill in the required fields.'
    },
    {
        question: 'Who can use this system?',
        answer: 'Only registered users with valid accounts can access it.'
    },
    {
        question: 'How do I contact support?',
        answer: 'Send an email to support@example.com.'
    }
];

function normalizeChatbotInput(input) {
    return input.toLowerCase().replace(/[?!.,]/g, '').trim();
}

function initializeChatbot() {
    const widget = document.querySelector('[data-chatbot]');
    if (!widget) {
        return;
    }

    const toggleButton = widget.querySelector('.chatbot-toggle');
    const closeButton = widget.querySelector('.chatbot-close');
    const chatWindow = widget.querySelector('.chatbot-window');
    const messages = widget.querySelector('.chatbot-messages');
    const questionsList = widget.querySelector('.chatbot-questions-list');
    const questionsContainer = widget.querySelector('.chatbot-questions');
    const questionsToggle = widget.querySelector('.chatbot-questions-toggle');
    const form = widget.querySelector('.chatbot-form');
    const input = widget.querySelector('.chatbot-input');
    const dataset = new Map(chatbotDataset.map(item => [normalizeChatbotInput(item.question), item.answer]));
    let hasGreeted = false;

    function appendMessage(role, text) {
        const bubble = document.createElement('div');
        bubble.className = `chatbot-bubble chatbot-bubble--${role}`;
        bubble.textContent = text;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
    }

    function handleUserMessage(rawText) {
        const value = rawText.trim();
        if (!value) {
            return;
        }
        appendMessage('user', value);
        const normalized = normalizeChatbotInput(value);
        const answer = dataset.get(normalized) || 'Sorry, I don’t understand that yet.';
        appendMessage('bot', answer);
    }

    function openChat() {
        if (widget.classList.contains('is-open')) {
            return;
        }
        widget.classList.add('is-open');
        toggleButton.setAttribute('aria-expanded', 'true');
        chatWindow.setAttribute('aria-hidden', 'false');
        if (!hasGreeted) {
            appendMessage('bot', 'Hi! You can ask me about ConnectEd.');
            hasGreeted = true;
        }
        requestAnimationFrame(() => {
            input.focus();
        });
    }

    function closeChat() {
        widget.classList.remove('is-open');
        toggleButton.setAttribute('aria-expanded', 'false');
        chatWindow.setAttribute('aria-hidden', 'true');
    }

    toggleButton.addEventListener('click', () => {
        if (widget.classList.contains('is-open')) {
            closeChat();
        } else {
            openChat();
        }
    });

    closeButton.addEventListener('click', closeChat);

    if (questionsList) {
        chatbotDataset.forEach(item => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'chatbot-question-btn';
            button.textContent = item.question;
            button.addEventListener('click', () => {
                openChat();
                handleUserMessage(item.question);
            });
            questionsList.appendChild(button);
        });
    }

    if (questionsContainer && questionsToggle) {
        questionsToggle.addEventListener('click', () => {
            const isCollapsed = questionsContainer.classList.toggle('is-collapsed');
            questionsToggle.setAttribute('aria-expanded', String(!isCollapsed));
        });
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        const value = input.value;
        handleUserMessage(value);
        input.value = '';
    });

    widget.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeChat();
        }
    });
}

initializeChatbot();