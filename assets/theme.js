/* ==========================================================================
   Shopify Theme: Paws & Claws Extravaganza JS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initBackgroundInteractiveShapes();
  initScrollingEffects();
  initShowcaseInteractions();
});

/**
 * Custom Extravagant Cursor Tracking
 */
function initCustomCursor() {
  const follower = document.getElementById('customCursorFollower');
  const dot = document.getElementById('customCursorDot');
  
  if (!follower || !dot) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;
  
  // Track mouse coordinates
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediate dot update
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  // Smooth follower interpolation
  function updateFollower() {
    // Linear interpolation
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;
    
    requestAnimationFrame(updateFollower);
  }
  updateFollower();

  // Add hover state triggers
  const interactiveElements = document.querySelectorAll(`
    a, button, select, summary, input, textarea, 
    .interactive-shape, .collection-card, .showcase-card, 
    .testimonial-card, .footer-social-link, .header-action-btn
  `);
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('custom-cursor-hovering');
    });
    
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('custom-cursor-hovering');
    });
  });
}

/**
 * Interactive Background Shape Physics on Mouse Move
 */
function initBackgroundInteractiveShapes() {
  const shapes = document.querySelectorAll('.hero-shape');
  const hero = document.querySelector('.hero-extravaganza');
  
  if (!hero || shapes.length === 0) return;
  
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    shapes.forEach((shape, index) => {
      // Calculate depth based on element order/index
      const depth = (index + 1) * 0.04;
      const moveX = x * depth;
      const moveY = y * depth;
      
      // Keep original transforms if any
      let rotation = 0;
      if (shape.classList.contains('hero-square-1')) {
        rotation = 15;
      } else if (shape.classList.contains('hero-rect-1')) {
        rotation = -15;
      }
      
      shape.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotate(${rotation}deg)`;
    });
  });
  
  hero.addEventListener('mouseleave', () => {
    shapes.forEach((shape) => {
      let rotation = 0;
      if (shape.classList.contains('hero-square-1')) {
        rotation = 15;
      } else if (shape.classList.contains('hero-rect-1')) {
        rotation = -15;
      }
      shape.style.transform = `translate3d(0, 0, 0) rotate(${rotation}deg)`;
    });
  });
}

/**
 * Scroll and Fade In Effects for premium feel
 */
function initScrollingEffects() {
  const cards = document.querySelectorAll('.collection-card, .showcase-card, .testimonial-card, .newsletter-frame');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0) scale(1)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  cards.forEach(card => {
    // Initial states set by JS to fallback gracefully if JS disabled
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px) scale(0.95)';
    card.style.transition = 'opacity 0.8s cubic-bezier(0.165, 0.84, 0.44, 1), transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)';
    observer.observe(card);
  });
}

/**
 * Showcase Interactivity (Add to Cart simulated alert, list items)
 */
function initShowcaseInteractions() {
  const cartButtons = document.querySelectorAll('.showcase-add-to-cart, .card-btn, .btn-primary, .newsletter-btn');
  const cartBubble = document.querySelector('.cart-count-bubble');
  
  cartButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Avoid form submits for mock
      if (btn.classList.contains('newsletter-btn')) return;
      
      e.preventDefault();
      
      // Scale button effect
      btn.style.transform = 'scale(0.9)';
      setTimeout(() => {
        btn.style.transform = '';
      }, 150);
      
      // Update cart bubble
      if (cartBubble) {
        let count = parseInt(cartBubble.textContent) || 0;
        count += 1;
        cartBubble.textContent = count;
        
        // Bounce bubble
        cartBubble.style.transform = 'scale(1.4)';
        setTimeout(() => {
          cartBubble.style.transform = 'scale(1)';
        }, 300);
      }
      
      // Fun notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, var(--color-accent-teal), var(--color-accent-purple));
        color: #fff;
        padding: 1rem 2rem;
        border-radius: 50px;
        z-index: 100000;
        font-family: var(--font-accent-family);
        font-weight: 700;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        border: 2px solid var(--color-accent-pink);
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      `;
      notification.textContent = '🐾 Added to Cart! Extravagant Choice! 🐾';
      document.body.appendChild(notification);
      
      // Trigger animations
      setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
      }, 50);
      
      // Remove
      setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
        setTimeout(() => {
          notification.remove();
        }, 400);
      }, 2500);
    });
  });
}
