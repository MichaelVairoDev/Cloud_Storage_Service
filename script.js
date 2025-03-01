document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu handling
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileMenuButton?.addEventListener('click', () => {
        mobileMenu?.classList.toggle('hidden');
    });

    // Storage usage chart
    const ctx = document.getElementById('storageChart')?.getContext('2d');
    if (ctx) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Documents', 'Photos', 'Videos', 'Available'],
                datasets: [{
                    data: [25, 42, 18, 15],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(229, 231, 235, 0.8)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    // Animate elements when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Animate feature cards with delay
    document.querySelectorAll('#features .grid > div').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.animation = `slideUp 0.5s ease-out ${index * 0.2}s forwards`;
    });

    // Animate pricing cards with delay
    document.querySelectorAll('#pricing .grid > div').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.animation = `scale 0.5s ease-out ${index * 0.2}s forwards`;
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                mobileMenu?.classList.add('hidden');
            }
        });
    });

    // Animate progress bars
    const progressBars = document.querySelectorAll('.bg-blue-500.h-2');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.transition = 'width 1s ease-out';
            bar.style.width = width;
        }, 100);
    });

    // Add hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('hover-scale');
    });
});