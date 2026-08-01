/* assets/theme.js */

(function() {
  'use strict';

  // Toggle Header Scrolled States
  const header = document.querySelector('.sticky-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('sticky-header-scrolled');
      } else {
        header.classList.remove('sticky-header-scrolled');
      }
    });
  }

  // Mobile Navigation Menu Toggle
  const menuBtn = document.getElementById('MobileMenuToggle');
  const mobileNav = document.getElementById('MobileMenuDrawer');
  const closeMenuBtn = document.getElementById('CloseMobileMenu');
  
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      mobileNav.classList.remove('hidden');
      setTimeout(() => {
        mobileNav.classList.remove('translate-x-full');
      }, 10);
    });
  }

  if (closeMenuBtn && mobileNav) {
    closeMenuBtn.addEventListener('click', () => {
      mobileNav.classList.add('translate-x-full');
      setTimeout(() => {
        mobileNav.classList.add('hidden');
      }, 300);
    });
  }

  // Cart Drawer Logic
  const cartDrawer = document.getElementById('CartDrawer');
  const cartDrawerOverlay = document.getElementById('CartDrawerOverlay');
  const openCartBtns = document.querySelectorAll('.open-cart-drawer');
  const closeCartBtn = document.getElementById('CloseCartDrawer');
  const continueShoppingBtn = document.getElementById('CartDrawerContinue');

  function openCart() {
    if (cartDrawer && cartDrawerOverlay) {
      cartDrawer.classList.remove('hidden');
      cartDrawerOverlay.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      setTimeout(() => {
        cartDrawer.classList.remove('translate-x-full');
        cartDrawerOverlay.classList.remove('opacity-0');
      }, 10);
    }
  }

  function closeCart() {
    if (cartDrawer && cartDrawerOverlay) {
      cartDrawer.classList.add('translate-x-full');
      cartDrawerOverlay.classList.add('opacity-0');
      document.body.classList.remove('overflow-hidden');
      setTimeout(() => {
        cartDrawer.classList.add('hidden');
        cartDrawerOverlay.classList.add('hidden');
      }, 300);
    }
  }

  openCartBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openCart();
  }));

  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', closeCart);
  if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', closeCart);

  // Expose function globally for AJAX cart updates
  window.openThemeCart = openCart;

  // AJAX Cart Interactions
  document.addEventListener('click', function(e) {
    // Add to Cart from Product Cards / Main Product
    const addToCartFormBtn = e.target.closest('.ajax-add-to-cart-btn');
    if (addToCartFormBtn) {
      e.preventDefault();
      const form = addToCartFormBtn.closest('form');
      if (form) {
        const formData = new FormData(form);
        addToCartFormBtn.disabled = true;
        const originalText = addToCartFormBtn.innerHTML;
        addToCartFormBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Adding...';

        fetch(window.Shopify ? `${window.Shopify.routes.root}cart/add.js` : '/cart/add.js', {
          method: 'POST',
          body: formData
        })
        .then(response => {
          if (!response.ok) throw new Error('Failed to add');
          return response.json();
        })
        .then(data => {
          addToCartFormBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Added!';
          addToCartFormBtn.classList.add('bg-green-500');
          
          // Refresh cart elements
          refreshCartDrawer();
          setTimeout(() => {
            addToCartFormBtn.disabled = false;
            addToCartFormBtn.innerHTML = originalText;
            addToCartFormBtn.classList.remove('bg-green-500');
            openCart();
          }, 1200);
        })
        .catch(err => {
          console.error(err);
          addToCartFormBtn.disabled = false;
          addToCartFormBtn.innerHTML = originalText;
        });
      }
    }

    // Change Quantity / Remove via Cart Drawer Button
    const qtyBtn = e.target.closest('.cart-drawer-qty-btn');
    const removeBtn = e.target.closest('.cart-drawer-remove');

    if (qtyBtn) {
      const key = qtyBtn.getAttribute('data-id');
      const newQty = parseInt(qtyBtn.getAttribute('data-qty'), 10);
      updateCartQuantity(key, newQty);
    }

    if (removeBtn) {
      const key = removeBtn.getAttribute('data-id');
      updateCartQuantity(key, 0);
    }
  });

  // Update Cart Quantity using standard AJAX API
  function updateCartQuantity(key, quantity) {
    const data = { id: key, quantity: quantity };
    
    fetch(window.Shopify ? `${window.Shopify.routes.root}cart/change.js` : '/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(cart => {
      refreshCartDrawer();
    })
    .catch(err => console.error('Error updating cart:', err));
  }

  // Reload the HTML in Cart Drawer
  function refreshCartDrawer() {
    fetch(window.location.pathname)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Update Cart Drawer Contents
        const originalDrawerItems = document.getElementById('CartDrawerItems');
        const newDrawerItems = doc.getElementById('CartDrawerItems');
        if (originalDrawerItems && newDrawerItems) {
          originalDrawerItems.innerHTML = newDrawerItems.innerHTML;
        }

        // Update Cart Drawer Footer/Totals
        const originalDrawerFooter = document.querySelector('#CartDrawer .p-6.border-t');
        const newDrawerFooter = doc.querySelector('#CartDrawer .p-6.border-t');
        if (originalDrawerFooter && newDrawerFooter) {
          originalDrawerFooter.innerHTML = newDrawerFooter.innerHTML;
        } else if (originalDrawerFooter && !newDrawerFooter) {
          // If no footer exists in new html (cart is empty)
          originalDrawerFooter.remove();
        } else if (!originalDrawerFooter && newDrawerFooter) {
          // If footer didn't exist (previously empty) and now we have items
          const parent = document.getElementById('CartDrawer');
          parent.appendChild(newDrawerFooter);
        }

        // Update Cart Bubble Counters
        const originalCartBubbles = document.querySelectorAll('.cart-item-count');
        const newCartBubbles = doc.querySelectorAll('.cart-item-count');
        originalCartBubbles.forEach((bubble, idx) => {
          if (newCartBubbles[idx]) {
            bubble.innerHTML = newCartBubbles[idx].innerHTML;
            if (parseInt(bubble.innerText.trim(), 10) > 0) {
              bubble.classList.remove('hidden');
            } else {
              bubble.classList.add('hidden');
            }
          }
        });
      })
      .catch(err => console.error('Error refreshing cart:', err));
  }

  // Simple testimonial slider controller
  let activeReviewIdx = 0;
  const reviews = document.querySelectorAll('.testimonial-slide');
  const prevReviewBtn = document.getElementById('PrevReviewBtn');
  const nextReviewBtn = document.getElementById('NextReviewBtn');

  function showReview(idx) {
    if (reviews.length === 0) return;
    if (idx < 0) idx = reviews.length - 1;
    if (idx >= reviews.length) idx = 0;
    
    reviews.forEach((review, i) => {
      if (i === idx) {
        review.classList.remove('hidden');
        review.classList.add('opacity-100');
      } else {
        review.classList.add('hidden');
        review.classList.remove('opacity-100');
      }
    });
    activeReviewIdx = idx;
  }

  if (prevReviewBtn) prevReviewBtn.addEventListener('click', () => showReview(activeReviewIdx - 1));
  if (nextReviewBtn) nextReviewBtn.addEventListener('click', () => showReview(activeReviewIdx + 1));
  
  // Auto slide reviews every 6 seconds
  if (reviews.length > 0) {
    showReview(0);
    setInterval(() => {
      showReview(activeReviewIdx + 1);
    }, 6000);
  }

})();
