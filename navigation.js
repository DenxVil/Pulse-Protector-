/**
 * Navigation Component for Pulse Protector Website
 * Handles responsive navigation, mobile menu, and smooth scrolling
 */

(function() {
    'use strict';

    // Highlight current page in navigation
    function highlightCurrentPage() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Handle both relative and absolute paths
            const linkPath = href ? href.replace('./', '').split('/').pop() : '';
            if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Smooth scroll for anchor links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Close mobile menu if open
                    closeMobileMenu();
                }
            });
        });
    }

    // Add scroll-based header styling
    function initScrollHeader() {
        const header = document.querySelector('.header');
        if (!header) return;

        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }

    // Animate elements on scroll
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements that should animate
        document.querySelectorAll('.glass-card-light, .section-header, .solution-card, .metric-card').forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    // Close mobile menu
    function closeMobileMenu() {
        const nav = document.querySelector('.main-nav');
        const menuToggle = document.querySelector('.menu-toggle');
        if (nav && menuToggle) {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    }

    // Mobile menu toggle
    function initMobileMenu() {
        const headerContent = document.querySelector('.header-content');
        const nav = document.querySelector('.main-nav');
        
        if (!headerContent || !nav) return;

        // Check if menu toggle already exists
        let menuToggle = document.querySelector('.menu-toggle');
        
        if (!menuToggle) {
            // Create hamburger menu button
            menuToggle = document.createElement('button');
            menuToggle.className = 'menu-toggle';
            menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('type', 'button');
            menuToggle.innerHTML = '<span></span><span></span><span></span>';
            
            // Insert after logo, before nav
            const logo = document.querySelector('.logo');
            if (logo && logo.parentNode) {
                logo.parentNode.insertBefore(menuToggle, nav);
            }
        }

        // Toggle menu on click
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = nav.classList.toggle('active');
            this.classList.toggle('active');
            this.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        // Close menu when clicking a nav link
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                closeMobileMenu();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMobileMenu();
            }
        });

        // Close menu on resize to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
    }

    // Initialize all navigation features
    function init() {
        highlightCurrentPage();
        initSmoothScroll();
        initScrollHeader();
        initMobileMenu();
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
