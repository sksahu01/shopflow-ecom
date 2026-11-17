(function () {
  'use strict';

  const STORAGE_KEY = 'shopflow-cart';
  const products = {
    '1': {
      id: 1,
      name: 'Wabi Lounge Chair',
      cat: 'Furniture',
      price: 24999,
      img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80',
      desc: 'Crafted from premium solid ash with architectural textured bouclé upholstery.'
    },
    '2': {
      id: 2,
      name: 'Pendant Orb Light',
      cat: 'Lighting',
      price: 8499,
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
      desc: 'Hand-blown structured glass globe emitting calibrated ambient light spectrums.'
    },
    '3': {
      id: 3,
      name: 'Mizu Modular Sofa',
      cat: 'Furniture',
      price: 48999,
      img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
      desc: 'A deep-seated modular sofa with soft linen upholstery and adaptable proportions.'
    },
    '4': {
      id: 4,
      name: 'Sora Oak Side Table',
      cat: 'Furniture',
      price: 12999,
      img: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&auto=format&fit=crop&q=80',
      desc: 'Solid oak side table with a gently rounded profile for calm, functional spaces.'
    },
    '5': {
      id: 5,
      name: 'Arc Floor Lamp',
      cat: 'Lighting',
      price: 15999,
      img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      desc: 'A sculptural arched lamp that casts a warm, focused glow over seating areas.'
    },
    '6': {
      id: 6,
      name: 'Luna Ceramic Lamp',
      cat: 'Lighting',
      price: 6999,
      img: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
      desc: 'Hand-finished ceramic lighting with a tactile glaze and soft linen shade.'
    },
    '7': {
      id: 7,
      name: 'Hand-Fired Stoneware Vase',
      cat: 'Decor',
      price: 5499,
      img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop&q=80',
      desc: 'A hand-fired stoneware vessel made to bring organic texture to open surfaces.'
    },
    '8': {
      id: 8,
      name: 'Noma Woven Throw',
      cat: 'Decor',
      price: 3999,
      img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
      desc: 'A lightweight woven throw in natural fibres, finished with a subtle fringe.'
    },
    '9': {
      id: 9,
      name: 'Carved Ash Tray',
      cat: 'Decor',
      price: 2499,
      img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80',
      desc: 'A minimal carved ashwood tray for keys, candles, and everyday objects.'
    }
  };

  function readCart() {
    const storedCart = localStorage.getItem(STORAGE_KEY);
    if (!storedCart) return [];

    try {
      const parsedCart = JSON.parse(storedCart);
      if (!Array.isArray(parsedCart)) throw new Error('Cart data is not an array.');
      return parsedCart.filter(item => products[String(item.id)] && Number.isInteger(item.quantity) && item.quantity > 0);
    } catch (error) {
      console.error('ShopFlow could not read the saved cart.', error);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
    window.dispatchEvent(new CustomEvent('shopflow:cart-updated'));
  }

  function getCart() {
    return readCart().map(item => ({
      ...products[String(item.id)],
      quantity: item.quantity
    }));
  }

  function getCartCount() {
    return readCart().reduce((total, item) => total + item.quantity, 0);
  }

  function getCartTotal() {
    return getCart().reduce((total, item) => total + item.price * item.quantity, 0);
  }

  function addToCart(productId, quantity, ctaLabel) {
    const product = products[String(productId)];
    const amount = Number(quantity) || 1;
    if (!product || amount < 1) return false;
    const cartBefore = readCart();
    const wasCartEmpty = cartBefore.length === 0;
    const existingItem = cartBefore.find(item => String(item.id) === String(product.id));
    if (existingItem) {
      existingItem.quantity += amount;
    } else {
      cartBefore.push({ id: product.id, quantity: amount });
    }
    writeCart(cartBefore);
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push({
      event: 'addToCart',
      interaction: { ctaLabel: ctaLabel || 'Add to Cart' },
      commerce: { cartEmpty: wasCartEmpty },
      journey: { lastStage: 'Cart Added' },
      products: [{
        sku: 'SF-' + product.id,
        name: product.name,
        category: product.cat,
        price: product.price,
        quantity: amount
      }]
    });
    return true;
  }

  function updateQuantity(productId, quantity) {
    const amount = Number(quantity);
    const cart = readCart();
    const item = cart.find(cartItem => String(cartItem.id) === String(productId));
    if (!item || !Number.isInteger(amount) || amount < 1) return false;
    item.quantity = amount;
    writeCart(cart);
    return true;
  }

  function removeFromCart(productId) {
    const removedItem = getCart().find(item => String(item.id) === String(productId));
    writeCart(readCart().filter(item => String(item.id) !== String(productId)));
    if (removedItem) {
      window.adobeDataLayer = window.adobeDataLayer || [];
      window.adobeDataLayer.push({
        event: 'removeFromCart',
        products: [{
          sku: 'SF-' + removedItem.id,
          name: removedItem.name,
          category: removedItem.cat,
          price: removedItem.price,
          quantity: removedItem.quantity
        }]
      });
    }
  }

  function clearCart() {
    writeCart([]);
  }

  function updateCartCount() {
    document.querySelectorAll('[data-cart-count]').forEach(countElement => {
      const count = getCartCount();
      countElement.textContent = count;
      countElement.hidden = count === 0;
    });
  }

  function formatPrice(price) {
    return `₹${price.toLocaleString('en-IN')}`;
  }

  window.ShopFlowCart = {
    products,
    addToCart,
    clearCart,
    formatPrice,
    getCart,
    getCartCount,
    getCartTotal,
    removeFromCart,
    updateCartCount,
    updateQuantity
  };

  document.addEventListener('DOMContentLoaded', updateCartCount);
  window.addEventListener('storage', updateCartCount);

  const firedScrolls = new Set();
  window.addEventListener('scroll', function () {
    const state = window.adobeDataLayer && window.adobeDataLayer.getState ? window.adobeDataLayer.getState() : {};
    const pageType = state.page && state.page.pageType;
    if (pageType !== 'PLP' && pageType !== 'PDP') return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (docHeight <= 0) return;
    const pct = Math.round((scrollTop / docHeight) * 100);
    [25, 50, 75, 100].forEach(function (threshold) {
      if (pct >= threshold && !firedScrolls.has(threshold)) {
        firedScrolls.add(threshold);
        window.adobeDataLayer.push({
          event: 'scrollDepth',
          scroll: { threshold: threshold + '%', pageType: pageType }
        });
      }
    });
  }, { passive: true });
})();
