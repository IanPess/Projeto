document.addEventListener('DOMContentLoaded', function() {
    // Cart data structure
    let cart = {
        items: [],
        total: 0
    };
    
    // DOM elements
    const cartButton = document.querySelector('.cart');
    const cartPopup = document.getElementById('cartPopup');
    const closeCartBtn = document.getElementById('closeCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartTotalElement = document.getElementById('cartTotal');
    const cartCountElement = document.querySelector('.cart_t');
    const continueShoppingBtn = document.querySelector('.btn-continue');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const checkoutBtn = document.querySelector('.btn-checkout');
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'cart-popup-overlay';
    document.body.appendChild(overlay);
    
    // Open cart popup
    cartButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Abrindo carrinho');
        cartPopup.style.display = 'block';
        setTimeout(() => {
            cartPopup.classList.add('active');
            overlay.classList.add('active');
        }, 10); // Pequeno atraso para garantir a transição
        renderCart();
    });

    // Função para fechar o carrinho
    function closeCart() {
        console.log('Fechando carrinho');
        cartPopup.classList.remove('active');
        overlay.classList.remove('active');
        
        // Remover completamente após a transição
        setTimeout(() => {
            if (!cartPopup.classList.contains('active')) {
                cartPopup.style.display = 'none';
            }
        }, 300); // O mesmo tempo da sua transição CSS
    }
    
    // Event listeners para fechar o carrinho
    closeCartBtn.addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);
    continueShoppingBtn.addEventListener('click', closeCart);
    
    // Checkout button event
    checkoutBtn.addEventListener('click', function() {
        if (cart.items.length > 0) {
            alert('Redirecionando para o checkout!');
            // Here you would redirect to checkout page
            // window.location.href = 'checkout.html';
        } else {
            showNotification('Seu carrinho está vazio!');
        }
    });
    
    // Format price to BRL
    function formatPrice(price) {
        return 'R$ ' + price.toFixed(2).replace('.', ',');
    }
    
    // Parse price string to number
    function parsePrice(priceString) {
        return parseFloat(priceString.replace('$', '').replace('R$', '').replace(',', '.').trim());
    }
    
    // Update cart count in header
    function updateCartCount() {
        const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.innerHTML = `<i class="fas fa-shopping-cart"></i> Carrinho (${itemCount})`;
    }
    
    // Calculate cart total
    function calculateTotal() {
        cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        cartTotalElement.textContent = formatPrice(cart.total);
    }
    
    // Render cart items
    function renderCart() {
        // Reset cart display
        while (cartItemsContainer.firstChild) {
            cartItemsContainer.removeChild(cartItemsContainer.firstChild);
        }
        
        if (cart.items.length === 0) {
            // Show empty cart message
            cartItemsContainer.appendChild(emptyCartMessage);
            return;
        }
        
        // Hide empty cart message
        if (emptyCartMessage.parentNode === cartItemsContainer) {
            emptyCartMessage.style.display = 'none';
        }
        
        // Create elements for each cart item
        cart.items.forEach((item, index) => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div class="cart-item-controls">
                        <div class="quantity-control">
                            <button class="quantity-btn decrease" data-index="${index}">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" data-index="${index}">
                            <button class="quantity-btn increase" data-index="${index}">+</button>
                        </div>
                        <button class="remove-item" data-index="${index}">Remover</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        // Add event listeners to quantity controls
        document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                if (cart.items[index].quantity > 1) {
                    cart.items[index].quantity--;
                    renderCart();
                    calculateTotal();
                    updateCartCount();
                    saveCartToStorage();
                }
            });
        });
        
        document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cart.items[index].quantity++;
                renderCart();
                calculateTotal();
                updateCartCount();
                saveCartToStorage();
            });
        });
        
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function() {
                const index = parseInt(this.getAttribute('data-index'));
                const quantity = parseInt(this.value);
                if (quantity >= 1) {
                    cart.items[index].quantity = quantity;
                    renderCart();
                    calculateTotal();
                    updateCartCount();
                    saveCartToStorage();
                }
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cart.items.splice(index, 1);
                renderCart();
                calculateTotal();
                updateCartCount();
                saveCartToStorage();
                
                if (cart.items.length === 0) {
                    emptyCartMessage.style.display = 'block';
                    cartItemsContainer.appendChild(emptyCartMessage);
                }
            });
        });
        
        calculateTotal();
    }
    
    // Add to cart function
    function addToCart(product) {
        // Check if product already exists in cart
        const existingItemIndex = cart.items.findIndex(item => item.id === product.id);
        
        if (existingItemIndex !== -1) {
            // Update quantity if product already in cart
            cart.items[existingItemIndex].quantity += product.quantity || 1;
        } else {
            // Add new product to cart
            cart.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: product.quantity || 1
            });
        }
        
        // Update cart display
        updateCartCount();
        calculateTotal();
        saveCartToStorage();
        
        // Show notification
        showNotification(`${product.name} adicionado ao carrinho!`);
    }
    
    // Connect Add to Cart buttons from product grid
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productBlock = this.closest('.Bloquinho_1');
            const productName = productBlock.querySelector('.title').textContent;
            const productPrice = parsePrice(productBlock.querySelector('.price').textContent);
            const productImage = productBlock.querySelector('img').src;
            const productId = productName.toLowerCase().replace(/\s+/g, '-'); // Create ID from name
            
            const product = {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            };
            
            addToCart(product);
        });
    });
    
    // Show notification function
    function showNotification(message) {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.cart-notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Save cart to localStorage
    function saveCartToStorage() {
        localStorage.setItem('shopping-cart', JSON.stringify(cart));
    }
    
    // Load cart from localStorage
    function loadCartFromStorage() {
        const savedCart = localStorage.getItem('shopping-cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartCount();
        }
    }
    
    // Initialize: load cart from storage
    loadCartFromStorage();
    
    // Add Quick View functionality
    const quickViewButtons = document.querySelectorAll('.quick-view');
    quickViewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productBlock = this.closest('.Bloquinho_1');
            const productName = productBlock.querySelector('.title').textContent;
            const productPrice = productBlock.querySelector('.price').textContent;
            const productDesc = productBlock.querySelector('.desc').textContent;
            const productImage = productBlock.querySelector('img').src;
            
            alert(`Detalhes rápidos:\n\nProduto: ${productName}\nPreço: ${productPrice}\nDescrição: ${productDesc}`);
            // In a real implementation, you would show a modal with product details
        });
    });
});

// Search functionality for Projetin Futuro
document.addEventListener('DOMContentLoaded', function() {
    // Get the search button element
    const searchButton = document.querySelector('.link:nth-child(2)');
    
    // Create a search form and input that will be shown/hidden
    const searchForm = document.createElement('div');
    searchForm.className = 'search-form';
    searchForm.innerHTML = `
      <input type="text" id="searchInput" placeholder="O que você está procurando?">
      <button id="submitSearch"><i class="fas fa-search"></i></button>
    `;
    
    // Insert the search form after the header
    const header = document.querySelector('.Header');
    header.parentNode.insertBefore(searchForm, header.nextSibling);
    
    // Hide the search form initially
    searchForm.style.display = 'none';
    
    // Toggle search form visibility when search button is clicked
    searchButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (searchForm.style.display === 'none') {
        searchForm.style.display = 'flex';
        document.getElementById('searchInput').focus();
      } else {
        searchForm.style.display = 'none';
      }
    });
    
    // Handle search submission
    document.getElementById('submitSearch').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
    
    // Function to perform the search
    function performSearch() {
      const searchTerm = document.getElementById('searchInput').value.trim();
      if (searchTerm) {
        // You can replace this with actual search functionality
        // For now, we'll just alert the search term
        alert('Pesquisando por: ' + searchTerm);
        
        // Here you would typically:
        // 1. Redirect to a search results page
        // 2. Or filter elements on the current page
        // 3. Or make an AJAX request to a backend search API
        
        // Example of redirecting to a search results page:
        // window.location.href = 'search-results.html?q=' + encodeURIComponent(searchTerm);
      }
    }
  });

  // Script para funcionalidade de cadastro

document.addEventListener('DOMContentLoaded', function() {
    // Botão de criar conta na página de login
    const signupButton = document.querySelector('.signup-button');
    if (signupButton) {
        signupButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'cadastro.html';
        });
    }
    
    // Formulário de cadastro
    const signupForm = document.querySelector('.signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter os valores dos campos
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const agreeTerms = document.getElementById('agree-terms').checked;
            
            // Validar os campos
            if (!name) {
                alert('Por favor, insira seu nome completo.');
                return;
            }
            
            if (!email) {
                alert('Por favor, insira seu e-mail.');
                return;
            }
            
            if (!validateEmail(email)) {
                alert('Por favor, insira um e-mail válido.');
                return;
            }
            
            if (!password) {
                alert('Por favor, crie uma senha.');
                return;
            }
            
            if (password.length < 6) {
                alert('A senha deve ter pelo menos 6 caracteres.');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('As senhas não coincidem.');
                return;
            }
            
            if (!agreeTerms) {
                alert('Você precisa concordar com os Termos de Uso e Política de Privacidade.');
                return;
            }
            
            // Se tudo estiver válido, poderia enviar os dados para o servidor
            // Aqui estamos apenas simulando o cadastro e redirecionando
            alert('Cadastro realizado com sucesso!');
            
            // Em um sistema real, você enviaria os dados para um servidor
            // e faria o tratamento de resposta
            
            // Simular redirecionamento após cadastro bem-sucedido
            window.location.href = 'login.html';
        });
    }
    
    // Formulário de login
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            if (!email || !validateEmail(email)) {
                alert('Por favor, insira um e-mail válido.');
                return;
            }
            
            if (!password) {
                alert('Por favor, insira sua senha.');
                return;
            }
            
            // Simulação de login bem-sucedido
            alert('Login realizado com sucesso!');
            
            // Redirecionar para a página principal após login
            window.location.href = 'index.html';
        });
    }
    
    // Função auxiliar para validar e-mail
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    
    // Animação de pulsação suave
    function pulseAnimation() {
        whatsappBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            whatsappBtn.style.transform = 'scale(1)';
        }, 500);
    }
    
    // Inicia a animação de pulsação a cada 3 segundos
    setInterval(pulseAnimation, 3000);
});