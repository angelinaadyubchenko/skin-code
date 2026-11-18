(function() {
    'use strict';

    const startTime = performance.now();

    function showLoadTime() {
        const endTime = performance.now();
        const loadTime = (endTime - startTime) / 1000;
        
        const timeElement = document.createElement('div');
        timeElement.className = 'page-load-info'; 
        timeElement.innerHTML = `
            <div class="load-time-container">
                Время загрузки: <strong>${loadTime.toFixed(3)}</strong> сек
            </div>
        `;
        
        const footer = document.querySelector('footer');
        if (footer) {
            footer.parentNode.insertBefore(timeElement, footer);
        }
    }

    function setActiveMenuItem() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const menuLinks = document.querySelectorAll('nav a');
        
        menuLinks.forEach(link => {
            link.classList.remove('active');
            const linkPath = link.getAttribute('href');
            const linkPage = linkPath.split('/').pop();
            
            if (linkPage === currentPage || 
                (currentPage === '' && linkPage === 'index.html') ||
                (currentPage === 'index.html' && linkPath === '/')) {
                link.classList.add('active');
            }
        });
    }

    
    window.addEventListener('load', function() {
        showLoadTime();
        setActiveMenuItem();
    });

})();