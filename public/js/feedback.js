document.addEventListener('DOMContentLoaded', function() {
    const STORAGE_KEY = 'skinCodeFeedback';
    let currentEditId = null;
   
    const form = document.getElementById('feedbackForm');
    const feedbackList = document.getElementById('feedbackList');
    const feedbackCount = document.getElementById('feedbackCount');
    const emptyMessage = document.getElementById('emptyMessage');
    const template = document.getElementById('feedbackTemplate');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const commentTextarea = document.getElementById('comment');
    const charCount = document.getElementById('charCount');

    commentTextarea.addEventListener('input', function() {
      charCount.textContent = `${this.value.length}/500`;
    });
    

    loadFeedbacks();
   
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (validateForm()) {
        const feedback = {
          id: currentEditId || Date.now(),
          name: document.getElementById('name').value.trim(),
          email: document.getElementById('email').value.trim(),
          product: document.getElementById('product').value,
          comment: document.getElementById('comment').value.trim(),
          date: new Date().toISOString()
        };
        
        if (currentEditId) {
          updateFeedback(feedback);
        } else {
          addFeedback(feedback);
        }
      }
    });
    
    cancelBtn.addEventListener('click', resetForm);
    
    
    function validateForm() {
      let valid = true;
      
      const name = document.getElementById('name').value.trim();
      const nameError = document.getElementById('nameError');
      if (name.length < 2) {
        nameError.textContent = 'Минимум 2 символа';
        nameError.style.display = 'block';
        valid = false;
      } else {
        nameError.style.display = 'none';
      }
     
      const email = document.getElementById('email').value.trim();
      const emailError = document.getElementById('emailError');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        emailError.textContent = 'Введите корректный email';
        emailError.style.display = 'block';
        valid = false;
      } else {
        emailError.style.display = 'none';
      }
      
      const comment = document.getElementById('comment').value.trim();
      const commentError = document.getElementById('commentError');
      if (comment.length < 10) {
        commentError.textContent = 'Минимум 10 символов';
        commentError.style.display = 'block';
        valid = false;
      } else if (comment.length > 500) {
        commentError.textContent = 'Максимум 500 символов';
        commentError.style.display = 'block';
        valid = false;
      } else {
        commentError.style.display = 'none';
      }
      
      return valid;
    }
    
    
    function loadFeedbacks() {
      const feedbacks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      
      if (feedbacks.length > 0) {
        emptyMessage.style.display = 'none';
        feedbacks.forEach(feedback => {
          displayFeedback(feedback);
        });
      }
      
      updateCount();
    }
    
    function addFeedback(feedback) {
      const feedbacks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      feedbacks.push(feedback);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks));
      
      displayFeedback(feedback);
      updateCount();
      showMessage('Отзыв добавлен!', 'success');
      resetForm();
    }
    

    function updateFeedback(feedback) {
      const feedbacks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const index = feedbacks.findIndex(f => f.id === feedback.id);
      
      if (index !== -1) {
        feedbacks[index] = feedback;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks));
        
        const existing = document.querySelector(`[data-id="${feedback.id}"]`);
        if (existing) {
          updateFeedbackInDOM(feedback, existing);
        }
        
        showMessage('Отзыв обновлен!', 'success');
        resetForm();
      }
    }
    

    function deleteFeedback(id) {
      if (!confirm('Удалить отзыв?')) return;
      
      const feedbacks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const filtered = feedbacks.filter(f => f.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      
      const element = document.querySelector(`[data-id="${id}"]`);
      if (element) element.remove();
      
      updateCount();
      showMessage('Отзыв удален', 'success');
      
      if (filtered.length === 0) {
        emptyMessage.style.display = 'block';
      }
      
      if (currentEditId === id) resetForm();
    }
    
    function editFeedback(id) {
      const feedbacks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const feedback = feedbacks.find(f => f.id === id);
      
      if (feedback) {
        document.getElementById('name').value = feedback.name;
        document.getElementById('email').value = feedback.email;
        document.getElementById('product').value = feedback.product || '';
        document.getElementById('comment').value = feedback.comment;
        
        charCount.textContent = `${feedback.comment.length}/500`;
        currentEditId = id;
        submitBtn.textContent = 'Обновить';
        cancelBtn.style.display = 'inline-block';
        
        
        document.querySelector('.feedback-form-wrapper').scrollIntoView({
          behavior: 'smooth'
        });
      }
    }
    
    function displayFeedback(feedback) {
      emptyMessage.style.display = 'none';
      
      const clone = template.content.cloneNode(true);
      const item = clone.querySelector('.feedback-item');
      item.setAttribute('data-id', feedback.id);
    
      item.querySelector('.feedback-author').textContent = feedback.name;
      item.querySelector('.feedback-email').textContent = feedback.email;
      
      if (feedback.product) {
        const productEl = item.querySelector('.feedback-product');
        productEl.textContent = feedback.product;
        productEl.style.cssText = 'margin-top: 5px; font-size: 0.9rem; color: #d69fa3;';
      }
      
      item.querySelector('.feedback-content').textContent = feedback.comment;
      
      const date = new Date(feedback.date);
      item.querySelector('.feedback-date').textContent = date.toLocaleDateString('ru-RU');
      
      const editBtn = item.querySelector('.btn-edit');
      const deleteBtn = item.querySelector('.btn-delete');
      
      editBtn.addEventListener('click', () => editFeedback(feedback.id));
      deleteBtn.addEventListener('click', () => deleteFeedback(feedback.id));
      
      feedbackList.prepend(item);
    }
    
    function updateFeedbackInDOM(feedback, element) {
      element.querySelector('.feedback-author').textContent = feedback.name;
      element.querySelector('.feedback-email').textContent = feedback.email;
      
      const productEl = element.querySelector('.feedback-product');
      if (feedback.product) {
        productEl.textContent = feedback.product;
        productEl.style.cssText = 'margin-top: 5px; font-size: 0.9rem; color: #d69fa3;';
      } else {
        productEl.textContent = '';
      }
      
      element.querySelector('.feedback-content').textContent = feedback.comment;
      const date = new Date(feedback.date);
      element.querySelector('.feedback-date').textContent = date.toLocaleDateString('ru-RU') + ' (изменен)';
    }
    
    function updateCount() {
      const feedbacks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      feedbackCount.textContent = feedbacks.length;
    }
    
    function resetForm() {
      form.reset();
      currentEditId = null;
      submitBtn.textContent = 'Отправить';
      cancelBtn.style.display = 'none';
      charCount.textContent = '0/500';
    
      document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
      });
    }

    function showMessage(text, type) {
      const message = document.getElementById('formMessage');
      message.textContent = text;
      message.className = `form-message ${type}`;
      
      setTimeout(() => {
        message.style.display = 'none';
      }, 3000);
    }
  });