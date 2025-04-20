document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Initialize product catalog if on the catalog page
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        initializeCatalog();
    }
    
    // Dark mode toggle if exists
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        // Check if user has a preference stored
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }
});

// Initialize the product catalog
function initializeCatalog() {
    const productsGrid = document.getElementById('productsGrid');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productModal = document.getElementById('productModal');
    const closeModal = document.getElementById('closeModal');
    const noResults = document.getElementById('noResults');
    
    // Clear loading placeholders
    productsGrid.innerHTML = '';
    
    // Display all products initially
    displayProducts(products);
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            filterProducts(searchTerm, getCurrentCategory());
        });
    }
    
    // Category filter buttons
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Filter products
                const category = this.getAttribute('data-category');
                const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
                filterProducts(searchTerm, category);
            });
        });
    }
    
    // Check URL for category parameter
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('categorie');
    if (categoryParam) {
        // Find and click the corresponding filter button
        const categoryButton = document.querySelector(`.filter-btn[data-category="${categoryParam}"]`);
        if (categoryButton) {
            categoryButton.click();
        }
    }
    
    // Close modal
    if (closeModal && productModal) {
        closeModal.addEventListener('click', function() {
            productModal.classList.add('hidden');
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === productModal) {
                productModal.classList.add('hidden');
            }
        });
    }
}

// Display products in the grid
function displayProducts(productsToShow) {
    const productsGrid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    
    // Clear current products
    productsGrid.innerHTML = '';
    
    if (productsToShow.length === 0) {
        if (noResults) noResults.classList.remove('hidden');
        return;
    }
    
    if (noResults) noResults.classList.add('hidden');
    
    // Add products to grid
    productsToShow.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card bg-white rounded-xl overflow-hidden shadow-md';
        productCard.style.animationDelay = `${index * 0.05}s`;
        
        productCard.innerHTML = `
            <div class="relative">
                <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover">
                <div class="absolute top-2 right-2 bg-guineagreen text-white px-2 py-1 rounded-full text-sm">
                    ${product.price.toLocaleString()} GNF
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2">${product.name}</h3>
                <p class="text-gray-600 mb-4">${product.description.substring(0, 100)}...</p>
                <div class="flex justify-between items-center">
                    <span class="bg-guineagreen bg-opacity-10 text-guineagreen text-xs px-2 py-1 rounded">${getCategoryName(product.category)}</span>
                    <button class="view-product-btn bg-guineagreen text-white px-4 py-2 rounded-lg hover:bg-green-700 transition" data-id="${product.id}">
                        Voir détails
                    </button>
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
        
        // Add click event to view product button
        const viewBtn = productCard.querySelector('.view-product-btn');
        viewBtn.addEventListener('click', function() {
            openProductModal(product.id);
        });
    });
}

// Filter products based on search term and category
function filterProducts(searchTerm, category) {
    let filteredProducts = products;
    
    // Filter by category if not "all"
    if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === category);
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.description.toLowerCase().includes(searchTerm) ||
            product.vendor.toLowerCase().includes(searchTerm)
        );
    }
    
    // Display filtered products
    displayProducts(filteredProducts);
}

// Get current selected category
function getCurrentCategory() {
    const activeButton = document.querySelector('.filter-btn.active');
    return activeButton ? activeButton.getAttribute('data-category') : 'all';
}

// Get category display name
function getCategoryName(categorySlug) {
    const categories = {
        'artisanat': 'Artisanat',
        'alimentaire': 'Alimentaire',
        'beaute': 'Beauté',
        'textile': 'Textile',
        'accessoires': 'Accessoires'
    };
    
    return categories[categorySlug] || categorySlug;
}

// Open product modal
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const productModal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const modalCategory = document.getElementById('modalCategory');
    const modalPrice = document.getElementById('modalPrice');
    const modalDescription = document.getElementById('modalDescription');
    const modalVendor = document.getElementById('modalVendor');
    const modalWhatsApp = document.getElementById('modalWhatsApp');
    const modalShare = document.getElementById('modalShare');
    
    modalTitle.textContent = product.name;
    modalImage.src = product.image;
    modalImage.alt = product.name;
    modalCategory.textContent = getCategoryName(product.category);
    modalPrice.textContent = `${product.price.toLocaleString()} GNF`;
    modalDescription.textContent = product.description;
    modalVendor.textContent = product.vendor;
    
        // WhatsApp link
        modalWhatsApp.href = `https://wa.me/${product.contact}?text=Bonjour, je suis intéressé(e) par votre produit "${product.name}" à ${product.price.toLocaleString()} GNF sur ProduitsGuinée. Est-il disponible ?`;
    
        // Share functionality
        modalShare.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: product.name,
                    text: `Découvrez ${product.name} à ${product.price.toLocaleString()} GNF sur ProduitsGuinée`,
                    url: window.location.href.split('?')[0] + `?produit=${product.id}`
                })
                .catch(error => console.log('Erreur de partage:', error));
            } else {
                // Fallback - copy link to clipboard
                const tempInput = document.createElement('input');
                document.body.appendChild(tempInput);
                tempInput.value = window.location.href.split('?')[0] + `?produit=${product.id}`;
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                alert('Lien copié dans le presse-papier !');
            }
        });
        
        // Show modal
        productModal.classList.remove('hidden');
    }
    