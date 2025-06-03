/**
 * Modern Portfolio JavaScript
 * Handles navigation, animations, and interactive features
 */

(function() {
    'use strict';

    // DOM Elements
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile Navigation Toggle
    function initMobileNavigation() {
        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');

            // Animate hamburger icon
            const bars = navToggle.querySelectorAll('.bar');
            bars.forEach((bar, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) bar.style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                    if (index === 1) bar.style.opacity = '0';
                    if (index === 2) bar.style.transform = 'rotate(45deg) translate(-5px, -6px)';
                } else {
                    bar.style.transform = '';
                    bar.style.opacity = '';
                }
            });
        });

        // Close mobile menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');

                // Reset hamburger icon
                const bars = navToggle.querySelectorAll('.bar');
                bars.forEach(bar => {
                    bar.style.transform = '';
                    bar.style.opacity = '';
                });
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');

                // Reset hamburger icon
                const bars = navToggle.querySelectorAll('.bar');
                bars.forEach(bar => {
                    bar.style.transform = '';
                    bar.style.opacity = '';
                });
            }
        });
    }

    // Navbar Scroll Effect
    function initNavbarScrollEffect() {
        if (!navbar) return;

        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '';
            }
        });
    }

    // Smooth Scrolling for Navigation Links
    function initSmoothScrolling() {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Only handle internal anchor links, let other links work normally
                if (href && href.startsWith('#')) {
                    e.preventDefault();

                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);

                    if (targetElement) {
                        const navbarHeight = navbar ? navbar.offsetHeight : 0;
                        const targetPosition = targetElement.offsetTop - navbarHeight - 20;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
                // For external links (like /blog/), let them work normally
            });
        });
    }

    // Fade-in Animation on Scroll
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Elements to animate
        const animatedElements = document.querySelectorAll(`
            .about-content,
            .skill-category,
            .project-card,
            .timeline-item,
            .contact-content,
            .stat-item
        `);

        animatedElements.forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });
    }

    // Active Navigation Link Highlighting
    function initActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');

        function updateActiveNav() {
            const scrollPosition = window.scrollY + navbar.offsetHeight + 50;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    // Remove active class from all nav links
                    navLinks.forEach(link => link.classList.remove('active'));

                    // Add active class to current section's nav link
                    const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }

        window.addEventListener('scroll', updateActiveNav);
        updateActiveNav(); // Initial call
    }

    // Skill Tag Hover Effects
    function initSkillTagEffects() {
        const skillTags = document.querySelectorAll('.skill-tag');

        skillTags.forEach(tag => {
            tag.addEventListener('mouseenter', function() {
                // Add ripple effect
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }

    // Project Card Hover Effects
    function initProjectCardEffects() {
        const projectCards = document.querySelectorAll('.project-card');

        projectCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }

    // Contact Form Enhancement
    function initContactForm() {
        const form = document.querySelector('.contact-form-element');
        const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');

        if (!form) return;

        // Add floating label effect
        formInputs.forEach(input => {
            // Add focus and blur effects
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', function() {
                if (this.value === '') {
                    this.parentElement.classList.remove('focused');
                }
            });

            // Check if input has value on load
            if (input.value !== '') {
                input.parentElement.classList.add('focused');
            }
        });

        // Form submission (if using Formspree or similar)
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const submitBtn = this.querySelector('.btn-primary');
            const originalText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            // Simulate form submission (replace with actual submission logic)
            setTimeout(() => {
                submitBtn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check"></i>';
                submitBtn.style.backgroundColor = '#10b981';

                // Reset form
                setTimeout(() => {
                    this.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';

                    formInputs.forEach(input => {
                        input.parentElement.classList.remove('focused');
                    });
                }, 2000);
            }, 1000);
        });
    }

    // Parallax Effect for Hero Section
    function initParallaxEffect() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            if (scrolled < hero.offsetHeight) {
                hero.style.transform = `translateY(${rate}px)`;
            }
        });
    }

    // Typing Animation for Hero Text
    function initTypingAnimation() {
        const heroTitle = document.querySelector('.hero-text h1');
        if (!heroTitle) return;

        const text = heroTitle.textContent;
        const highlight = heroTitle.querySelector('.highlight');

        if (!highlight) return;

        const highlightText = highlight.textContent;
        const beforeText = text.substring(0, text.indexOf(highlightText));
        const afterText = text.substring(text.indexOf(highlightText) + highlightText.length);

        heroTitle.innerHTML = beforeText + '<span class="highlight typing-cursor"></span>' + afterText;

        const typingElement = heroTitle.querySelector('.highlight');
        let i = 0;

        function typeWriter() {
            if (i < highlightText.length) {
                typingElement.textContent = highlightText.substring(0, i + 1);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                typingElement.classList.remove('typing-cursor');
            }
        }

        // Start typing animation after a delay
        setTimeout(typeWriter, 1000);
    }

    // Social Links Click Tracking
    function initSocialTracking() {
        const socialLinks = document.querySelectorAll('.social-links a, .contact-social a');

        socialLinks.forEach(link => {
            link.addEventListener('click', function() {
                const platform = this.getAttribute('aria-label') || 'Unknown';
                console.log(`Social link clicked: ${platform}`);

                // Add analytics tracking here if needed
                // gtag('event', 'social_click', { 'platform': platform });
            });
        });
    }

    // Performance Optimization: Debounce Function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Lazy Loading for Images (if any are added later)
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // Print Friendly Version
    function initPrintStyles() {
        window.addEventListener('beforeprint', function() {
            // Expand all collapsed sections for printing
            const collapsedElements = document.querySelectorAll('.collapse:not(.show)');
            collapsedElements.forEach(el => el.classList.add('show'));
        });
    }

    // Initialize all functions when DOM is loaded
    function init() {
        initMobileNavigation();
        initNavbarScrollEffect();
        initSmoothScrolling();
        initScrollAnimations();
        initActiveNavigation();
        initSkillTagEffects();
        initProjectCardEffects();
        initContactForm();
        initTypingAnimation();
        initSocialTracking();
        initLazyLoading();
        initPrintStyles();

        // Add debounced scroll listeners
        window.addEventListener('scroll', debounce(function() {
            // Any additional scroll-based functionality
        }, 10));

        console.log('Portfolio JavaScript initialized successfully!');
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Add CSS for typing cursor animation
    const style = document.createElement('style');
    style.textContent = `
        .typing-cursor::after {
            content: '|';
            animation: blink 1s infinite;
        }

        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }

        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }

        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        .nav-link.active {
            color: var(--primary-color);
        }

        .form-group.focused input,
        .form-group.focused textarea {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
    `;
    document.head.appendChild(style);

})();
