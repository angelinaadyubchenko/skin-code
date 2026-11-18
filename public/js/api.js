(function() {
    'use strict';

    const API_URL = 'https://jsonplaceholder.typicode.com/comments';
    
    function init() {
        const btn = document.getElementById('loadApiBtn');
        if (btn) btn.addEventListener('click', loadReviews);
    }

    async function loadReviews() {
        showLoader();
        
        try {
            const postId = Math.floor(Math.random() * 100) + 1;
            const url = `${API_URL}?postId=${postId}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('API_ERROR');
            
            const data = await response.json();
            if (!data.length) throw new Error('NO_DATA');
            
            displayReviews(data, postId);
            hideLoader();
            showSuccess(`✅ Loaded ${data.length} reviews (Post #${postId})`);
            
        } catch (error) {
            hideLoader();
            showError(error);
        }
    }

    function displayReviews(reviews, postId) {
        const list = document.getElementById('feedbackList');
        const template = document.getElementById('feedbackTemplate');
        
        list.querySelectorAll('.api-feedback').forEach(el => el.remove());
        
        const empty = document.getElementById('emptyMessage');
        if (empty) empty.style.display = 'none';
        
        reviews.forEach(review => {
            const item = template.content.cloneNode(true);
            const div = item.querySelector('.feedback-item');
            
            div.classList.add('api-feedback');
            div.querySelector('.feedback-author').textContent = getName(review.email);
            div.querySelector('.feedback-email').textContent = review.email;
            div.querySelector('.feedback-product').textContent = getProduct(postId);
            div.querySelector('.feedback-content').textContent = cutText(review.body, 200);
            div.querySelector('.feedback-date').textContent =
                new Date().toLocaleDateString('ru-RU') + ' (API)';
            
            div.querySelectorAll('.btn-edit, .btn-delete').forEach(btn => btn.remove());
            
            list.prepend(div);
        });
        
        updateCount();
    }

    function showLoader() {
        const list = document.getElementById('feedbackList');
        const old = document.getElementById('loader');
        if (old) old.remove();
        
        const loader = document.createElement('div');
        loader.id = 'loader';
        loader.className = 'api-preloader';
        loader.innerHTML = '<div class="spinner"></div><p>Loading...</p>';
        list.prepend(loader);
    }

    function hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) loader.remove();
    }

    function showError(error) {
        const list = document.getElementById('feedbackList');
        list.querySelectorAll('.api-error').forEach(el => el.remove());
        
        let msg = 'Error loading reviews';
        if (error.message === 'Failed to fetch') msg = '🌐 Network error. Check internet or VPN.';
        if (error.message === 'NO_DATA') msg = '⚠️ No data available';
        
        const div = document.createElement('div');
        div.className = 'api-error';
        div.innerHTML = `
            <div>⚠️</div>
            <div>
                <h4>${msg}</h4>
                <button onclick="document.getElementById('loadApiBtn').click()">🔄 Retry</button>
            </div>
        `;
        list.prepend(div);
        
        showMessage(msg, 'error');
    }

    function showSuccess(text) {
        showMessage(text, 'success');
    }

    function showMessage(text, type) {
        const msg = document.getElementById('formMessage');
        if (!msg) return;
        
        msg.textContent = text;
        msg.className = `form-message ${type}`;
        msg.style.display = 'block';
        
        setTimeout(() => msg.style.display = 'none', 5000);
    }

    function getName(email) {
        const name = email.split('@')[0];
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._-]/g, ' ');
    }

    function getProduct(id) {
        const products = [
            'Увлажняющий крем',
            'Сыворотка Vitamin C',
            'Пенка для умывания',
            'Солнцезащитный SPF50'
        ];
        return products[id % 4];
    }

    function cutText(text, max) {
        return text.length > max ? text.substring(0, max) + '...' : text;
    }

    function updateCount() {
        const count = document.getElementById('feedbackCount');
        if (count) {
            count.textContent = document.querySelectorAll('.feedback-item').length;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
