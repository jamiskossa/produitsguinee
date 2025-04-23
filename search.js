/**
 * Fonctionnalités de recherche et filtrage pour les recettes guinéennes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Récupérer les éléments du DOM
    const searchInput = document.getElementById('search-recipes');
    const regionFilter = document.getElementById('filter-region');
    const typeFilter = document.getElementById('filter-type');
    const applyFiltersBtn = document.getElementById('apply-filters');
    
    // Charger les recettes
    loadRecipes();
    
    // Ajouter les écouteurs d'événements
    if (searchInput) {
      searchInput.addEventListener('input', debounce(filterRecipes, 300));
    }
    
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', filterRecipes);
    }
    
    // Initialiser les filtres depuis l'URL si présents
    initFiltersFromUrl();
  });
  
  /**
   * Charge les recettes depuis le fichier JSON
   */
  function loadRecipes() {
    fetch("recettes_guineennes.json")
      .then(response => response.json())
      .then(data => {
        // Stocker les recettes dans une variable globale pour faciliter le filtrage
        window.allRecipes = data;
        
        // Afficher toutes les recettes initialement
        displayRecipes(data);
        
        // Initialiser les options de filtres basées sur les données
        initFilterOptions(data);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des recettes:", error);
        showNotification("Erreur", "Impossible de charger les recettes. Veuillez réessayer plus tard.", "error");
      });
  }
  
  /**
   * Initialise les options de filtres basées sur les données disponibles
   */
  function initFilterOptions(recipes) {
    if (!regionFilter || !typeFilter) return;
    
    // Extraire les régions uniques
    const regions = [...new Set(recipes.map(recipe => recipe.region))];
    
    // Vider les options existantes sauf la première
    regionFilter.innerHTML = '<option value="">Toutes les régions</option>';
    
    // Ajouter les options de régions
    regions.forEach(region => {
      const option = document.createElement('option');
      option.value = region;
      option.textContent = region;
      regionFilter.appendChild(option);
    });
    
    // Pour le type, nous utilisons les valeurs du champ "type" dans les recettes
    const types = [...new Set(recipes.map(recipe => recipe.type))];
    
    // Vider les options existantes sauf la première
    typeFilter.innerHTML = '<option value="">Tous les types</option>';
    
    // Ajouter les options de types
    types.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeFilter.appendChild(option);
    });
  }
  
  /**
   * Filtre les recettes selon les critères de recherche et de filtrage
   */
  function filterRecipes() {
    if (!window.allRecipes) return;
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const region = regionFilter ? regionFilter.value : '';
    const type = typeFilter ? typeFilter.value : '';
    
    // Filtrer les recettes
    const filteredRecipes = window.allRecipes.filter(recipe => {
      // Vérifier le terme de recherche
      const matchesSearch = searchTerm === '' || 
        recipe.nom.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm)) ||
        recipe.region.toLowerCase().includes(searchTerm);
      
      // Vérifier le filtre de région
      const matchesRegion = region === '' || recipe.region === region;
      
      // Vérifier le filtre de type
      const matchesType = type === '' || recipe.type === type;
      
      // La recette doit correspondre à tous les critères
      return matchesSearch && matchesRegion && matchesType;
    });
    
    // Mettre à jour l'URL avec les paramètres de filtrage
    updateUrlWithFilters(searchTerm, region, type);
    
    // Afficher les recettes filtrées
    displayRecipes(filteredRecipes);
    
    // Afficher un message si aucune recette ne correspond
    const recipeContainer = document.getElementById('recette-container');
    if (filteredRecipes.length === 0 && recipeContainer) {
      recipeContainer.innerHTML = `
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Aucune recette trouvée</h3>
          <p class="mt-1 text-gray-500 dark:text-gray-400">Essayez de modifier vos critères de recherche.</p>
          <div class="mt-6">
            <button id="reset-filters" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-300">
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      `;
      
      // Ajouter un écouteur d'événement pour réinitialiser les filtres
      document.getElementById('reset-filters').addEventListener('click', resetFilters);
    }
  }
  
  /**
   * Met à jour l'URL avec les paramètres de filtrage pour permettre le partage
   */
  function updateUrlWithFilters(search, region, type) {
    const url = new URL(window.location);
    
    // Mettre à jour ou supprimer les paramètres selon leur valeur
    if (search) {
      url.searchParams.set('q', search);
    } else {
      url.searchParams.delete('q');
    }
    
    if (region) {
      url.searchParams.set('region', region);
    } else {
      url.searchParams.delete('region');
    }
    
    if (type) {
      url.searchParams.set('type', type);
    } else {
      url.searchParams.delete('type');
    }
    
    // Mettre à jour l'URL sans recharger la page
    window.history.pushState({}, '', url);
  }
  
  /**
   * Initialise les filtres à partir des paramètres de l'URL
   */
  function initFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);
    
    // Récupérer les valeurs des paramètres
    const search = params.get('q');
    const region = params.get('region');
    const type = params.get('type');
    
    // Appliquer les valeurs aux champs de formulaire
    if (search && searchInput) {
      searchInput.value = search;
    }
    
    if (region && regionFilter) {
      regionFilter.value = region;
    }
    
    if (type && typeFilter) {
      typeFilter.value = type;
    }
    
    // Si au moins un paramètre est présent, filtrer les recettes
    if (search || region || type) {
      // Attendre que les recettes soient chargées
      const checkRecipesLoaded = setInterval(() => {
        if (window.allRecipes) {
          clearInterval(checkRecipesLoaded);
          filterRecipes();
        }
      }, 100);
    }
  }
  
  /**
   * Réinitialise tous les filtres et affiche toutes les recettes
   */
  function resetFilters() {
    if (searchInput) searchInput.value = '';
    if (regionFilter) regionFilter.value = '';
    if (typeFilter) typeFilter.value = '';
    
    // Mettre à jour l'URL
    window.history.pushState({}, '', window.location.pathname);
    
    // Réafficher toutes les recettes
    if (window.allRecipes) {
      displayRecipes(window.allRecipes);
    } else {
      loadRecipes();
    }
  }
  
  /**
   * Affiche les recettes dans le conteneur
   */
  function displayRecipes(recipes) {
    const container = document.getElementById('recette-container');
    if (!container) return;
    
    // Vider le conteneur des recettes précédentes
    // Mais conserver les éléments de filtrage s'ils existent
    const filterSection = container.querySelector('.filters');
    container.innerHTML = '';
    if (filterSection) {
      container.appendChild(filterSection);
    }
    
    // Récupérer les favoris
    const favoris = JSON.parse(localStorage.getItem('favoris')) || [];
    
    // Créer un élément pour chaque recette
    recipes.forEach((recette, index) => {
      const isFavori = favoris.includes(recette.nom);
      
      const card = document.createElement('div');
      card.className = 'recipe-card animate-fade-in';
      card.style.animationDelay = `${0.1 * index}s`;
      
      card.innerHTML = `
        <img src="${recette.image}" alt="${recette.nom}" onerror="this.src='images/placeholder.jpg'">
        <div class="recipe-card-content">
          <h2>${recette.nom}</h2>
          <div class="flex justify-between items-center mb-4">
            <span class="region">${recette.region}</span>
            <button class="favori-btn ${isFavori ? 'active' : ''}" data-nom="${recette.nom}">
              ${isFavori ? '★ Favori' : '☆ Ajouter aux favoris'}
            </button>
          </div>
          <p class="ingredients"><strong>Ingrédients:</strong> ${recette.ingredients.join(', ')}</p>
          <div class="preparation">
            <strong>Préparation:</strong>
            <ol>
              ${recette.preparation.map(etape => `<li>${etape}</li>`).join('')}
            </ol>
          </div>
          <p><strong>Techniques:</strong> ${recette.techniques.join(', ')}</p>
          <p><strong>Présentation:</strong> ${recette.presentation}</p>
          <div class="meta">
            <div class="persons">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              ${recette.personnes} personnes
            </div>
            <button class="details-btn" data-index="${index}">Voir détails</button>
          </div>
          <div class="timer mt-4">
            <input type="number" id="temps-${index}" placeholder="Durée (min)" min="1" class="mr-2">
            <button class="start-timer-btn" data-index="${index}">⏱ Démarrer</button>
            <span id="compteur-${index}" class="ml-2"></span>
          </div>
        </div>
      `;
      
      container.appendChild(card);
    });
    
    // Initialiser les écouteurs d'événements pour les boutons
    initRecipeCardListeners(recipes);
  }
  
  /**
   * Initialise les écouteurs d'événements pour les cartes de recettes
   */
  function initRecipeCardListeners(recipes) {
    // Boutons favoris
    document.querySelectorAll('.favori-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const nom = this.dataset.nom;
        toggleFavori(nom, this);
      });
    });
    
    // Boutons de détails
    document.querySelectorAll('.details-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        showRecipeDetails(recipes[index]);
      });
    });
    
    // Boutons de minuteur
    document.querySelectorAll('.start-timer-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = this.dataset.index;
        startRecipeTimer(index);
      });
    });
  }
  
  /**
   * Ajoute ou supprime une recette des favoris
   */
  function toggleFavori(nom, button) {
    let favoris = JSON.parse(localStorage.getItem('favoris')) || [];
    
    if (favoris.includes(nom)) {
      // Supprimer des favoris
      favoris = favoris.filter(f => f !== nom);
      button.textContent = '☆ Ajouter aux favoris';
      button.classList.remove('active');
      showNotification('Recette retirée des favoris', `"${nom}" a été retiré de vos favoris.`, 'info');
    } else {
      // Ajouter aux favoris
      favoris.push(nom);
      button.textContent = '★ Favori';
      button.classList.add('active');
      showNotification('Recette ajoutée aux favoris', `"${nom}" a été ajouté à vos favoris.`, 'success');
    }
    
    localStorage.setItem('favoris', JSON.stringify(favoris));
  }
  
  /**
   * Affiche les détails d'une recette dans une modale
   */
  function showRecipeDetails(recette) {
    // Créer la modale
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="text-xl font-bold">${recette.nom}</h2>
          <button class="close-modal">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
              <div class="modal-body">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img src="${recette.image}" alt="${recette.nom}" class="w-full h-64 object-cover rounded-lg mb-4" onerror="this.src='images/placeholder.jpg'">
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="region">${recette.region}</span>
              <span class="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm">${recette.type}</span>
              <span class="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm">${recette.personnes} personnes</span>
            </div>
            <h3 class="text-lg font-semibold mb-2">Ingrédients</h3>
            <ul class="list-disc pl-5 mb-4">
              ${recette.ingredients.map(ing => `<li>${ing}</li>`).join('')}
            </ul>
            <h3 class="text-lg font-semibold mb-2">Valeurs nutritionnelles</h3>
            <p class="mb-4">${recette.valeur_nutritionnelle}</p>
            <h3 class="text-lg font-semibold mb-2">Santé</h3>
            <p>${recette.sante}</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-2">Préparation</h3>
            <ol class="list-decimal pl-5 mb-4">
              ${recette.preparation.map(etape => `<li class="mb-2">${etape}</li>`).join('')}
            </ol>
            <h3 class="text-lg font-semibold mb-2">Techniques</h3>
            <p class="mb-4">${recette.techniques.join(', ')}</p>
            <h3 class="text-lg font-semibold mb-2">Présentation</h3>
            <p class="mb-4">${recette.presentation}</p>
            <h3 class="text-lg font-semibold mb-2">Accompagnements suggérés</h3>
            <p class="mb-4">${recette.accompagnements.join(', ')}</p>
            <h3 class="text-lg font-semibold mb-2">Boissons recommandées</h3>
            <p class="mb-4">${recette.boissons.join(', ')}</p>
            <h3 class="text-lg font-semibold mb-2">Conseils d'hygiène</h3>
            <p>${recette.hygiene}</p>
          </div>
        </div>
        ${recette.video ? `
          <div class="mt-6">
            <h3 class="text-lg font-semibold mb-2">Vidéo de préparation</h3>
            <div class="video-container">
              ${recette.video}
            </div>
          </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary close-modal">Fermer</button>
        <button class="btn btn-primary print-recipe" data-nom="${recette.nom}">Imprimer la recette</button>
        <button class="btn btn-primary share-recipe" data-nom="${recette.nom}">Partager</button>
      </div>
    </div>
  `;
  
  // Ajouter la modale au DOM
  document.body.appendChild(modal);
  
  // Gérer la fermeture de la modale
  modal.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.remove();
    });
  });
  
  // Fermer la modale en cliquant en dehors du contenu
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Gérer l'impression de la recette
  modal.querySelector('.print-recipe').addEventListener('click', () => {
    printRecipe(recette);
  });
  
  // Gérer le partage de la recette
  modal.querySelector('.share-recipe').addEventListener('click', () => {
    shareRecipe(recette);
  });
}

/**
 * Démarre un minuteur pour une recette
 */
function startRecipeTimer(index) {
  const input = document.getElementById(`temps-${index}`);
  const display = document.getElementById(`compteur-${index}`);
  
  if (!input || !display) return;
  
  let time = parseInt(input.value) * 60;
  
  if (isNaN(time) || time <= 0) {
    showNotification('Erreur', 'Veuillez entrer une durée valide en minutes.', 'error');
    return;
  }
  
  // Stocker l'ID de l'intervalle pour pouvoir l'arrêter plus tard
  if (window.timerIntervals && window.timerIntervals[index]) {
    clearInterval(window.timerIntervals[index]);
  }
  
  if (!window.timerIntervals) {
    window.timerIntervals = {};
  }
  
  // Afficher une notification
  showNotification('Minuteur démarré', `Le minuteur de ${input.value} minutes a été démarré.`, 'info');
  
  // Démarrer le minuteur
  window.timerIntervals[index] = setInterval(() => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    
    display.textContent = `⏳ ${minutes}m ${seconds.toString().padStart(2, '0')}s`;
    
    if (time <= 0) {
      clearInterval(window.timerIntervals[index]);
      display.textContent = '✅ Terminé !';
      
      // Afficher une notification
      showNotification('Minuteur terminé', 'Votre plat est prêt !', 'success');
      
      // Jouer un son
      playTimerEndSound();
    }
    
    time--;
  }, 1000);
}

/**
 * Joue un son lorsque le minuteur est terminé
 */
function playTimerEndSound() {
  const audio = new Audio('sounds/timer-end.mp3');
  audio.play().catch(err => console.error('Erreur lors de la lecture du son:', err));
}

/**
 * Imprime une recette
 */
function printRecipe(recette) {
  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Recette: ${recette.nom}</title>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #e67e22;
          border-bottom: 2px solid #e67e22;
          padding-bottom: 10px;
        }
        .region {
          display: inline-block;
          padding: 3px 10px;
          background-color: #f39c12;
          color: white;
          border-radius: 20px;
          font-size: 14px;
          margin-bottom: 15px;
        }
        .meta {
          color: #7f8c8d;
          margin-bottom: 20px;
        }
        h2 {
          color: #d35400;
          margin-top: 20px;
        }
        ul, ol {
          margin-bottom: 20px;
        }
        li {
          margin-bottom: 5px;
        }
        .footer {
          margin-top: 30px;
          border-top: 1px solid #eee;
          padding-top: 10px;
          font-size: 12px;
          color: #7f8c8d;
        }
      </style>
    </head>
    <body>
      <h1>${recette.nom}</h1>
      <div class="region">${recette.region}</div>
      <div class="meta">
        <p><strong>Type:</strong> ${recette.type} | <strong>Pour:</strong> ${recette.personnes} personnes</p>
      </div>
      
      <h2>Ingrédients</h2>
      <ul>
        ${recette.ingredients.map(ing => `<li>${ing}</li>`).join('')}
      </ul>
      
      <h2>Préparation</h2>
      <ol>
        ${recette.preparation.map(etape => `<li>${etape}</li>`).join('')}
      </ol>
      
      <h2>Techniques</h2>
      <p>${recette.techniques.join(', ')}</p>
      
      <h2>Présentation</h2>
      <p>${recette.presentation}</p>
      
      <h2>Accompagnements suggérés</h2>
      <p>${recette.accompagnements.join(', ')}</p>
      
      <h2>Boissons recommandées</h2>
      <p>${recette.boissons.join(', ')}</p>
      
      <h2>Valeurs nutritionnelles</h2>
      <p>${recette.valeur_nutritionnelle}</p>
      
      <h2>Conseils santé</h2>
      <p>${recette.sante}</p>
      
      <h2>Conseils d'hygiène</h2>
      <p>${recette.hygiene}</p>
      
      <div class="footer">
        <p>Recette extraite de l'eBook "Recettes Traditionnelles de Guinée" © ${new Date().getFullYear()} Yattara Ousmane</p>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  // Imprimer après chargement complet
  printWindow.onload = function() {
    printWindow.print();
    // printWindow.close();
  };
}

/**
 * Partage une recette
 */
function shareRecipe(recette) {
  // Créer la modale de partage
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h2 class="text-xl font-bold">Partager la recette</h2>
        <button class="close-modal">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <p class="mb-4">Partagez cette délicieuse recette de ${recette.nom} avec vos amis !</p>
        
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300">
            <i class="fab fa-facebook-f mr-2"></i>
            Facebook
          </a>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`Découvrez cette délicieuse recette de ${recette.nom} de la cuisine guinéenne !`)}&url=${encodeURIComponent(window.location.href)}" target="_blank" class="flex items-center justify-center px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors duration-300">
            <i class="fab fa-twitter mr-2"></i>
            Twitter
          </a>
          <a href="https://wa.me/?text=${encodeURIComponent(`Découvrez cette délicieuse recette de ${recette.nom} de la cuisine guinéenne : ${window.location.href}`)}" target="_blank" class="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-300">
            <i class="fab fa-whatsapp mr-2"></i>
            WhatsApp
          </a>
          <a href="mailto:?subject=${encodeURIComponent(`Recette de ${recette.nom}`)}&body=${encodeURIComponent(`Découvre cette délicieuse recette de ${recette.nom} de la cuisine guinéenne : ${window.location.href}`)}" class="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300">
            <i class="far fa-envelope mr-2"></i>
            Email
          </a>
          <a href="https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(recette.image)}&description=${encodeURIComponent(`Recette de ${recette.nom} - Cuisine guinéenne traditionnelle`)}" target="_blank" class="flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300">
            <i class="fab fa-pinterest-p mr-2"></i>
            Pinterest
          </a>
          <button id="copy-link" class="flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-300">
            <i class="far fa-copy mr-2"></i>
            Copier le lien
          </button>
        </div>
        
        <div class="mt-4">
          <label for="share-url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lien de la recette</label>
          <input type="text" id="share-url" value="${window.location.href}" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white" readonly>
