// Variables globales
let recettesData = [];
let timerInterval = null;
let currentRecipe = null;
let favorites = JSON.parse(localStorage.getItem("favoris")) || [];
let darkMode = localStorage.getItem("darkMode") === "true";

// Initialisation au chargement du document
document.addEventListener("DOMContentLoaded", () => {
  // Appliquer le mode sombre si nécessaire
  if (darkMode) {
    document.documentElement.classList.add("dark");
  }
  
  // Charger les recettes depuis le JSON
  loadRecipes();
  
  // Initialiser les écouteurs d'événements
  initEventListeners();
  
  // Initialiser le FAQ
  initFAQ();
  
  // Initialiser le minuteur
  initTimer();
});

// Fonction pour charger les recettes
function loadRecipes() {
  fetch("recettes_guineennes.json")
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      recettesData = data;
      displayRecipes(data);
      initSwiper(data);
      populateRecipeSelect(data);
      
      // Vérifier si une recette spécifique est demandée dans l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const recipeId = urlParams.get('recette');
      if (recipeId) {
        showRecipeDetails(recipeId);
      }
    })
    .catch(error => {
      console.error("Erreur lors du chargement des recettes:", error);
      document.getElementById("recette-container").innerHTML = `
        <div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
          <h3 class="font-bold">Erreur de chargement</h3>
          <p>Impossible de charger les recettes. Veuillez réessayer plus tard.</p>
          <button id="retry-load" class="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
            Réessayer
          </button>
        </div>
      `;
      document.getElementById("retry-load")?.addEventListener("click", loadRecipes);
    });
}

// Fonction principale d'affichage des recettes
function displayRecipes(recettes) {
  const container = document.getElementById("recette-container");
  if (!container) return;
  
  // Vider le conteneur et afficher un message de chargement
  container.innerHTML = "";
  
  // Créer la grille de recettes
  const recipeGrid = document.createElement("div");
  recipeGrid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8";
  
  recettes.forEach(recette => {
    const isFavorite = favorites.includes(recette.id);
    
    const card = document.createElement("div");
    card.className = "bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300";
    
    // Créer le contenu de la carte
    card.innerHTML = `
      <div class="relative">
        <img src="${recette.image}" alt="${recette.nom}" class="w-full h-50 object-cover">
        <span class="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          ${recette.region}
        </span>
        <button class="favorite-btn absolute top-2 left-2 bg-white dark:bg-gray-800 text-2xl w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300" data-id="${recette.id}">
          ${isFavorite ? "★" : "☆"}
        </button>
      </div>
      
      <div class="p-4">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">${recette.nom}</h3>
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <svg class="w-5 h-5 mr-1 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          ${recette.temps_preparation + recette.temps_cuisson} min
          <span class="mx-2">•</span>
          <svg class="w-5 h-5 mr-1 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          ${recette.difficulte}
        </div>
        
        <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          ${recette.ingredients.slice(0, 3).join(", ")}${recette.ingredients.length > 3 ? "..." : ""}
        </p>
        
        <div class="flex flex-wrap gap-2 mb-4">
          ${recette.tags.map(tag => `
            <span class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
              ${tag}
            </span>
          `).join("")}
        </div>
        
        <button class="details-btn w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-300 flex items-center justify-center" data-id="${recette.id}">
          <span>Voir la recette</span>
          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </button>
      </div>
    `;
    
    recipeGrid.appendChild(card);
  });
  
  container.appendChild(recipeGrid);
  
  // Initialiser les écouteurs pour les boutons de détails et favoris
  initRecipeCardListeners();
}

// Initialiser les écouteurs d'événements pour les cartes de recettes
function initRecipeCardListeners() {
  // Écouteurs pour les boutons de détails
  document.querySelectorAll(".details-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const recipeId = btn.dataset.id;
      showRecipeDetails(recipeId);
    });
  });
  
  // Écouteurs pour les boutons de favoris
  document.querySelectorAll(".favorite-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const recipeId = btn.dataset.id;
      toggleFavorite(recipeId, btn);
    });
  });
}

// Afficher les détails d'une recette
function showRecipeDetails(recipeId) {
  const recette = recettesData.find(r => r.id === recipeId);
  if (!recette) return;
  
  currentRecipe = recette;
  
  // Mettre à jour l'URL sans recharger la page
  history.pushState({recipeId}, "", `?recette=${recipeId}`);
  
  // Créer une modal pour afficher les détails
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fade-in";
  
  const modalContent = document.createElement("div");
  modalContent.className = "bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up";
  
  modalContent.innerHTML = `
    <div class="relative">
      <img src="${recette.image}" alt="${recette.nom}" class="w-full h-64 object-cover">
      <button id="close-modal" class="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
        <h2 class="text-3xl font-bold text-white">${recette.nom}</h2>
        <p class="text-white/80">${recette.region} • ${recette.type}</p>
      </div>
    </div>
    
    <div class="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="flex items-center bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Préparation: ${recette.temps_preparation} min
        </div>
        <div class="flex items-center bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>
          </svg>
          Cuisson: ${recette.temps_cuisson} min
        </div>
        <div class="flex items-center bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.318c-3.942-4.984-10.797-2.407-10.797 3.55 0 4.288 3.63 9.698 10.797 16.132 7.167-6.434 10.797-11.844 10.797-16.132 0-5.957-6.855-8.534-10.797-3.55z"></path>
          </svg>
          Difficulté: ${recette.difficulte}
        </div>
        <div class="flex items-center bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          Pour ${recette.personnes} personnes
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Ingrédients
          </h3>
          <ul class="space-y-2">
            ${recette.ingredients.map(ingredient => `
              <li class="flex items-start">
                <svg class="w-5 h-5 mr-2 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="text-gray-700 dark:text-gray-300">${ingredient}</span>
              </li>
            `).join("")}
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
            </svg>
            Préparation
          </h3>
          <ol class="space-y-4">
            ${recette.preparation.map((etape, index) => `
              <li class="flex">
                <span class="flex-shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center mr-3 font-bold text-sm">
                  ${index + 1}
                </span>
                <span class="text-gray-700 dark:text-gray-300">${etape}</span>
              </li>
            `).join("")}
          </ol>
        </div>
      </div>
      
      <div class="mb-8">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <svg class="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Informations complémentaires
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h4 class="font-bold text-gray-700 dark:text-gray-300 mb-2">Techniques</h4>
            <p class="text-gray-600 dark:text-gray-400">${recette.techniques.join(", ")}</p>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h4 class="font-bold text-gray-700 dark:text-gray-300 mb-2">Présentation</h4>
            <p class="text-gray-600 dark:text-gray-400">${recette.presentation}</p>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h4 class="font-bold text-gray-700 dark:text-gray-300 mb-2">Accompagnements</h4>
            <p class="text-gray-600 dark:text-gray-400">${recette.accompagnements.join(", ")}</p>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h4 class="font-bold text-gray-700 dark:text-gray-300 mb-2">Boissons</h4>
            <p class="text-gray-600 dark:text-gray-400">${recette.boissons.join(", ")}</p>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h4 class="font-bold text-gray-700 dark:text-gray-300 mb-2">Santé</h4>
            <p class="text-gray-600 dark:text-gray-400">${recette.sante}</p>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h4 class="font-bold text-gray-700 dark:text-gray-300 mb-2">Hygiène</h4>
            <p class="text-gray-600 dark:text-gray-400">${recette.hygiene}</p>
          </div>
        </div>
      </div>
      
      <div class="mb-8">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <svg class="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Minuteur de cuisson
        </h3>
        
        <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex flex-wrap items-center gap-4">
          <div class="flex items-center">
            <input type="number" id="timer-minutes" class="w-16 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 text-gray-800 dark:text-white" value="${recette.temps_cuisson}" min="1" max="180">
            <span class="ml-2 text-gray-700 dark:text-gray-300">minutes</span>
          </div>
          
          <button id="start-timer" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-300 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Démarrer
          </button>
          
          <button id="stop-timer" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300 flex items-center hidden">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
            </svg>
            Arrêter
          </button>
          
          <div id="timer-display" class="text-xl font-bold text-gray-800 dark:text-white"></div>
        </div>
      </div>
      
      <div class="mb-8">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <svg class="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
          </svg>
          Histoire du plat
        </h3>
        
        <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <p class="text-gray-600 dark:text-gray-400">${recette.histoire}</p>
        </div>
      </div>
      
      <div class="mb-8">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <svg class="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          Vidéo
        </h3>
        
        <div class="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                    <iframe src="${recette.video}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full"></iframe>
        </div>
      </div>
      
      <div class="mb-8">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <svg class="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
          </svg>
          Partager cette recette
        </h3>
        
        <div class="flex flex-wrap gap-3">
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </a>
          
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`Découvrez la recette de ${recette.nom} de ${recette.region}`)}&url=${encodeURIComponent(window.location.href)}" target="_blank" class="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition-colors duration-300 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Twitter
          </a>
          
          <a href="https://wa.me/?text=${encodeURIComponent(`Découvrez la recette de ${recette.nom} de ${recette.region}: ${window.location.href}`)}" target="_blank" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-300 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
          
          <a href="mailto:?subject=${encodeURIComponent(`Recette de ${recette.nom}`)}&body=${encodeURIComponent(`Découvrez cette délicieuse recette de ${recette.nom} de ${recette.region}: ${window.location.href}`)}" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-300 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            Email
          </a>
        </div>
      </div>
    </div>
    
    <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
      <button id="print-recipe" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors duration-300 flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
        </svg>
        Imprimer la recette
      </button>
      
      <button id="add-to-favorites" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-300 flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
        ${favorites.includes(recipeId) ? "Retirer des favoris" : "Ajouter aux favoris"}
      </button>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  document.body.classList.add("overflow-hidden");
  
  // Ajouter les écouteurs d'événements pour la modal
  document.getElementById("close-modal").addEventListener("click", closeRecipeModal);
  document.getElementById("print-recipe").addEventListener("click", () => printRecipe(recette));
  document.getElementById("add-to-favorites").addEventListener("click", () => {
    toggleFavorite(recipeId);
    const btn = document.getElementById("add-to-favorites");
    btn.innerHTML = favorites.includes(recipeId) 
      ? `<svg class="w-5 h-5 mr-2" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> Retirer des favoris`
      : `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> Ajouter aux favoris`;
  });
  
  // Initialiser le minuteur
  document.getElementById("start-timer").addEventListener("click", startRecipeTimer);
  document.getElementById("stop-timer").addEventListener("click", stopRecipeTimer);
  
  // Fermer la modal en cliquant à l'extérieur
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeRecipeModal();
    }
  });
  
  // Fermer la modal avec la touche Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeRecipeModal();
    }
  });
}

// Fermer la modal de recette
function closeRecipeModal() {
  const modal = document.querySelector(".fixed.inset-0.z-50");
  if (modal) {
    modal.classList.add("animate-fade-out");
    setTimeout(() => {
      modal.remove();
      document.body.classList.remove("overflow-hidden");
      
      // Réinitialiser l'URL si nécessaire
      if (history.state && history.state.recipeId) {
        history.pushState({}, "", window.location.pathname);
      }
    }, 300);
  }
  
  // Arrêter le minuteur s'il est en cours
  stopRecipeTimer();
}

// Ajouter/retirer des favoris
function toggleFavorite(recipeId, button = null) {
  const index = favorites.indexOf(recipeId);
  
  if (index === -1) {
    favorites.push(recipeId);
    if (button) button.textContent = "★";
  } else {
    favorites.splice(index, 1);
    if (button) button.textContent = "☆";
  }
  
  localStorage.setItem("favoris", JSON.stringify(favorites));
  
  // Mettre à jour l'affichage des favoris si nécessaire
  if (button) {
    button.classList.toggle("text-yellow-500");
    const cards = document.querySelectorAll(`.favorite-btn[data-id="${recipeId}"]`);
    cards.forEach(card => {
      card.textContent = favorites.includes(recipeId) ? "★" : "☆";
      card.classList.toggle("text-yellow-500", favorites.includes(recipeId));
    });
  }
  
  // Afficher une notification
  showNotification(
    favorites.includes(recipeId) 
      ? "Recette ajoutée aux favoris" 
      : "Recette retirée des favoris"
  );
}

// Initialiser le Swiper pour l'affichage en carrousel
function initSwiper(recettes) {
  const swiperContainer = document.querySelector('.swiper-wrapper');
  if (!swiperContainer) return;
  
  // Vider le conteneur
  swiperContainer.innerHTML = "";
  
  // Ajouter les slides
  recettes.forEach(recette => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    
    slide.innerHTML = `
      <div class="recette-card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
        <img src="${recette.image}" alt="${recette.nom}" class="w-full h-48 object-cover">
        <div class="p-4 flex-grow flex flex-col">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">${recette.nom}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">${recette.region}</p>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            ${recette.ingredients.slice(0, 3).join(", ")}${recette.ingredients.length > 3 ? "..." : ""}
          </p>
          <button class="details-btn mt-auto w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-300" data-id="${recette.id}">
            Voir Détails
          </button>
        </div>
      </div>
    `;
    
    swiperContainer.appendChild(slide);
  });
  
  // Initialiser Swiper
  if (typeof Swiper !== 'undefined') {
    new Swiper('.swiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        640: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }
    });
    
    // Ajouter les écouteurs pour les boutons de détails
    document.querySelectorAll('.swiper .details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const recipeId = btn.dataset.id;
        showRecipeDetails(recipeId);
      });
    });
  }
}

// Initialiser les écouteurs d'événements globaux
function initEventListeners() {
  // Écouteur pour le bouton de mode sombre
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }
  
  // Écouteur pour le bouton de recherche
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
      searchRecipes(searchTerm);
    });
  }
  
  // Écouteur pour le bouton de filtrage par région
  const regionFilter = document.getElementById('region-filter');
  if (regionFilter) {
    regionFilter.addEventListener('change', () => {
      const region = regionFilter.value;
      filterRecipesByRegion(region);
    });
  }
  
  // Écouteur pour le bouton de tri
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const sortBy = sortSelect.value;
      sortRecipes(sortBy);
    });
  }
  
  // Écouteur pour le bouton de favoris
  const favoritesBtn = document.getElementById('show-favorites');
  if (favoritesBtn) {
    favoritesBtn.addEventListener('click', toggleFavoritesView);
  }
  
  // Écouteur pour le bouton WhatsApp
  const whatsappBtn = document.querySelector('.whatsapp-float');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (e) => {
      // Tracker l'événement si Google Analytics est disponible
      if (typeof gtag === 'function') {
        gtag('event', 'click', {
          'event_category': 'Contact',
          'event_label': 'WhatsApp Button'
        });
      }
    });
  }
  
  // Écouteur pour le bouton d'achat d'eBook
  const buyBtn = document.querySelector('.buy-btn');
  if (buyBtn) {
    buyBtn.addEventListener('click', (e) => {
      // Tracker l'événement si Google Analytics est disponible
      if (typeof gtag === 'function') {
        gtag('event', 'click', {
          'event_category': 'Conversion',
          'event_label': 'eBook Purchase'
        });
      }
    });
  }
}

// Initialiser le FAQ
function initFAQ() {
  const faqToggle = document.getElementById('toggle-faq');
  const faqWindow = document.getElementById('faq-window');
  const faqList = document.getElementById('faq-list');
  
  if (faqToggle && faqWindow && faqList) {
    // Données FAQ
    const faqData = [
      {
        question: "Comment acheter l'eBook ?",
        answer: "Cliquez sur le bouton 'Acheter sur Amazon' ou contactez-nous via WhatsApp."
      },
      {
        question: "Est-ce que les recettes sont en français ?",
        answer: "Oui, toutes les recettes sont rédigées en français clair et local."
      },
      {
        question: "Puis-je accéder au site sans internet ?",
        answer: "Une fois le site téléchargé, certaines fonctionnalités comme les recettes sont disponibles offline."
      },
      {
        question: "Comment ajouter une recette en favori ?",
        answer: "Cliquez sur l'étoile ☆ en haut de chaque carte recette."
      },
      {
        question: "Comment utiliser le minuteur de cuisson ?",
        answer: "Dans la page de détail d'une recette, définissez le temps et cliquez sur 'Démarrer'."
      },
      {
        question: "Les recettes sont-elles adaptées aux débutants ?",
        answer: "Oui, chaque recette indique son niveau de difficulté et propose des conseils détaillés."
      }
    ];
    
    // Remplir la liste FAQ
    faqList.innerHTML = "";
    faqData.forEach(item => {
      const li = document.createElement('li');
      li.className = 'mb-4';
      li.innerHTML = `
        <div class="faq-question cursor-pointer flex justify-between items-center">
          <span class="font-bold text-gray-800 dark:text-white">${item.question}</span>
          <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        <div class="faq-answer hidden mt-2 text-gray-600 dark:text-gray-400">
          ${item.answer}
        </div>
      `;
      faqList.appendChild(li);
    });
    
    // Ajouter les écouteurs pour les questions FAQ
    document.querySelectorAll('.faq-question').forEach(question => {
      question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const icon = question.querySelector('svg');
        
        answer.classList.toggle('hidden');
        icon.classList.toggle('rotate-180');
      });
    });
    
    // Écouteur pour le bouton de bascule FAQ
    faqToggle.addEventListener('click', () => {
      faqWindow.classList.toggle('hidden');
    });
    
    // Écouteur pour le bouton de fermeture FAQ
    document.querySelector('#faq-window button').addEventListener('click', () => {
      faqWindow.classList.add('hidden');
    });
  }
}

// Initialiser le minuteur
function initTimer() {
  // Rien à faire ici, le minuteur est initialisé dans la modal de recette
}

// Démarrer le minuteur de recette
function startRecipeTimer() {
  // Arrêter le minuteur existant s'il y en a un
  stopRecipeTimer();
  
  const minutesInput = document.getElementById('timer-minutes');
  const timerDisplay = document.getElementById('timer-display');
  const startBtn = document.getElementById('start-timer');
  const stopBtn = document.getElementById('stop-timer');
  
  if (!minutesInput || !timerDisplay || !startBtn || !stopBtn) return;
  
  const minutes = parseInt(minutesInput.value);
  if (isNaN(minutes) || minutes <= 0 || minutes > 180) {
    showNotification("Veuillez entrer une durée valide (1-180 minutes)", "error");
    return;
  }
  
  // Désactiver l'input et afficher le bouton d'arrêt
  minutesInput.disabled = true;
  startBtn.classList.add('hidden');
  stopBtn.classList.remove('hidden');
  
  // Calculer le temps de fin
  const endTime = Date.now() + minutes * 60 * 1000;
  
  // Mettre à jour l'affichage immédiatement
  updateTimerDisplay(endTime, timerDisplay);
  
  // Configurer l'intervalle pour mettre à jour l'affichage
  timerInterval = setInterval(() => {
    const finished = updateTimerDisplay(endTime, timerDisplay);
    
    if (finished) {
      stopRecipeTimer();
      
      // Afficher une notification
      showNotification(`Minuteur terminé pour ${currentRecipe.nom} !`, "success");
      
      // Jouer un son si disponible
      const audio = new Audio('sounds/timer-done.mp3');
      audio.play().catch(e => console.log('Impossible de jouer le son:', e));
      
      // Vibrer si disponible
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, 1000);
}

// Mettre à jour l'affichage du minuteur
function updateTimerDisplay(endTime, display) {
  const now = Date.now();
  const timeLeft = Math.max(0, endTime - now);
  
  if (timeLeft === 0) {
    display.innerHTML = `
      <span class="text-green-600 dark:text-green-400 flex items-center">
        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Terminé !
      </span>
    `;
    return true;
  }
  
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  
  display.innerHTML = `
    <span class="flex items-center">
      <svg class="w-6 h-6 mr-2 text-primary-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}
    </span>
  `;
  
  return false;
}

// Arrêter le minuteur de recette
function stopRecipeTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    
    const minutesInput = document.getElementById('timer-minutes');
    const startBtn = document.getElementById('start-timer');
    const stopBtn = document.getElementById('stop-timer');
    const timerDisplay = document.getElementById('timer-display');
    
    if (minutesInput) minutesInput.disabled = false;
    if (startBtn) startBtn.classList.remove('hidden');
    if (stopBtn) stopBtn.classList.add('hidden');
    if (timerDisplay) timerDisplay.textContent = '';
  }
}

// Rechercher des recettes
function searchRecipes(term) {
  if (!term) {
    displayRecipes(recettesData);
    return;
  }
  
  const results = recettesData.filter(recette => {
    const searchableText = `
      ${recette.nom.toLowerCase()}
      ${recette.region.toLowerCase()}
      ${recette.ingredients.join(' ').toLowerCase()}
      ${recette.tags.join(' ').toLowerCase()}
    `;
    
    return searchableText.includes(term);
  });
  
  if (results.length === 0) {
    document.getElementById("recette-container").innerHTML = `
            <div class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="mt-4 text-xl font-bold text-gray-700 dark:text-gray-300">Aucune recette trouvée</h3>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Aucune recette ne correspond à votre recherche "${term}"</p>
        <button id="reset-search" class="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-300">
          Réinitialiser la recherche
        </button>
      </div>
    `;
    
    document.getElementById("reset-search").addEventListener("click", () => {
      document.getElementById("search-input").value = "";
      displayRecipes(recettesData);
    });
  } else {
    displayRecipes(results);
    
    // Afficher un message de résultats
    showNotification(`${results.length} recette(s) trouvée(s) pour "${term}"`, "info");
  }
}

// Filtrer les recettes par région
function filterRecipesByRegion(region) {
  if (!region || region === "all") {
    displayRecipes(recettesData);
    return;
  }
  
  const results = recettesData.filter(recette => recette.region === region);
  
  if (results.length === 0) {
    document.getElementById("recette-container").innerHTML = `
      <div class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="mt-4 text-xl font-bold text-gray-700 dark:text-gray-300">Aucune recette trouvée</h3>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Aucune recette n'est disponible pour la région "${region}"</p>
        <button id="reset-filter" class="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-300">
          Réinitialiser le filtre
        </button>
      </div>
    `;
    
    document.getElementById("reset-filter").addEventListener("click", () => {
      document.getElementById("region-filter").value = "all";
      displayRecipes(recettesData);
    });
  } else {
    displayRecipes(results);
    
    // Afficher un message de résultats
    showNotification(`${results.length} recette(s) de la région "${region}"`, "info");
  }
}

// Trier les recettes
function sortRecipes(sortBy) {
  let sortedRecipes = [...recettesData];
  
  switch (sortBy) {
    case "name-asc":
      sortedRecipes.sort((a, b) => a.nom.localeCompare(b.nom));
      break;
    case "name-desc":
      sortedRecipes.sort((a, b) => b.nom.localeCompare(a.nom));
      break;
    case "region":
      sortedRecipes.sort((a, b) => a.region.localeCompare(b.region));
      break;
    case "difficulty-asc":
      sortedRecipes.sort((a, b) => {
        const difficultyOrder = { "Facile": 1, "Moyenne": 2, "Difficile": 3 };
        return difficultyOrder[a.difficulte] - difficultyOrder[b.difficulte];
      });
      break;
    case "difficulty-desc":
      sortedRecipes.sort((a, b) => {
        const difficultyOrder = { "Facile": 1, "Moyenne": 2, "Difficile": 3 };
        return difficultyOrder[b.difficulte] - difficultyOrder[a.difficulte];
      });
      break;
    case "time-asc":
      sortedRecipes.sort((a, b) => (a.temps_preparation + a.temps_cuisson) - (b.temps_preparation + b.temps_cuisson));
      break;
    case "time-desc":
      sortedRecipes.sort((a, b) => (b.temps_preparation + b.temps_cuisson) - (a.temps_preparation + a.temps_cuisson));
      break;
    default:
      // Ne rien faire
      break;
  }
  
  displayRecipes(sortedRecipes);
}

// Basculer l'affichage des favoris
function toggleFavoritesView() {
  const favoritesBtn = document.getElementById('show-favorites');
  const isShowingFavorites = favoritesBtn.classList.contains('active');
  
  if (isShowingFavorites) {
    // Revenir à toutes les recettes
    displayRecipes(recettesData);
    favoritesBtn.classList.remove('active');
    favoritesBtn.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
      </svg>
      Voir mes favoris
    `;
  } else {
    // Afficher uniquement les favoris
    const favoriteRecipes = recettesData.filter(recette => favorites.includes(recette.id));
    
    if (favoriteRecipes.length === 0) {
      document.getElementById("recette-container").innerHTML = `
        <div class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
          <h3 class="mt-4 text-xl font-bold text-gray-700 dark:text-gray-300">Aucun favori</h3>
          <p class="mt-2 text-gray-500 dark:text-gray-400">Vous n'avez pas encore ajouté de recettes à vos favoris</p>
          <p class="mt-1 text-gray-500 dark:text-gray-400">Cliquez sur l'étoile ☆ d'une recette pour l'ajouter à vos favoris</p>
        </div>
      `;
    } else {
      displayRecipes(favoriteRecipes);
      showNotification(`${favoriteRecipes.length} recette(s) en favoris`, "info");
    }
    
    favoritesBtn.classList.add('active');
    favoritesBtn.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
      </svg>
      Voir toutes les recettes
    `;
  }
}

// Basculer le mode sombre
function toggleDarkMode() {
  darkMode = !darkMode;
  document.documentElement.classList.toggle('dark', darkMode);
  localStorage.setItem('darkMode', darkMode);
  
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.innerHTML = darkMode 
      ? `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`
      : `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
  }
  
  showNotification(darkMode ? "Mode sombre activé" : "Mode clair activé", "info");
}

// Afficher une notification
function showNotification(message, type = "success") {
  // Supprimer les notifications existantes
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => {
    notification.remove();
  });
  
  // Créer la notification
  const notification = document.createElement('div');
  notification.className = `notification fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
    type === "success" ? "bg-green-500 text-white" :
    type === "error" ? "bg-red-500 text-white" :
    type === "info" ? "bg-blue-500 text-white" :
    "bg-gray-700 text-white"
  }`;
  
  notification.innerHTML = `
    <div class="flex items-center">
      ${
        type === "success" ? `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>` :
        type === "error" ? `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>` :
        type === "info" ? `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>` :
        ""
      }
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animation d'entrée
  setTimeout(() => {
    notification.classList.add('translate-y-0');
    notification.classList.remove('translate-y-12');
  }, 10);
  
  // Supprimer après 3 secondes
  setTimeout(() => {
    notification.classList.add('translate-y-12');
    notification.classList.remove('translate-y-0');
    
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Imprimer une recette
function printRecipe(recette) {
  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Recette: ${recette.nom}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #2c5282;
          border-bottom: 2px solid #2c5282;
          padding-bottom: 10px;
        }
        h2 {
          color: #2c5282;
          margin-top: 20px;
                }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 20px 0;
        }
        .info {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 20px 0;
        }
        .info-item {
          background-color: #f0f4f8;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 14px;
        }
        ul, ol {
          padding-left: 20px;
        }
        li {
          margin-bottom: 8px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        @media print {
          body {
            font-size: 12pt;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>${recette.nom}</h1>
      
      <div class="info">
        <div class="info-item">Région: ${recette.region}</div>
        <div class="info-item">Pour ${recette.personnes} personnes</div>
        <div class="info-item">Difficulté: ${recette.difficulte || 'Moyenne'}</div>
        <div class="info-item">Temps total: ${(recette.temps_preparation || 0) + (recette.temps_cuisson || 0)} min</div>
      </div>
      
      <img src="${recette.image}" alt="${recette.nom}">
      
      <h2>Ingrédients</h2>
      <ul>
        ${recette.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
      </ul>
      
      <h2>Préparation</h2>
      <ol>
        ${recette.preparation.map(etape => `<li>${etape}</li>`).join('')}
      </ol>
      
      <h2>Informations complémentaires</h2>
      <p><strong>Techniques:</strong> ${recette.techniques.join(', ')}</p>
      <p><strong>Présentation:</strong> ${recette.presentation}</p>
      <p><strong>Accompagnements:</strong> ${recette.accompagnements.join(', ')}</p>
      <p><strong>Boissons:</strong> ${recette.boissons.join(', ')}</p>
      <p><strong>Santé:</strong> ${recette.sante}</p>
      <p><strong>Hygiène:</strong> ${recette.hygiene}</p>
      
      <div class="footer">
        <p>Recette extraite de l'eBook "Recettes Traditionnelles de Guinée" © 2024 Yattara Ousmane</p>
        <p class="no-print">Imprimé depuis le site web: ${window.location.href}</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
}

// Initialiser l'application
function initApp() {
  // Charger les données des recettes
  fetch('recettes_guineennes.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des recettes');
      }
      return response.json();
    })
    .then(data => {
      // Ajouter des IDs aux recettes si nécessaire
      recettesData = data.map((recette, index) => {
        if (!recette.id) {
          recette.id = `recette-${index + 1}`;
        }
        // Ajouter des tags par défaut si nécessaire
        if (!recette.tags) {
          recette.tags = [recette.region, ...recette.techniques];
        }
        // Ajouter une difficulté par défaut si nécessaire
        if (!recette.difficulte) {
          recette.difficulte = "Moyenne";
        }
        return recette;
      });
      
      // Afficher les recettes
      displayRecipes(recettesData);
      
      // Initialiser le Swiper
      initSwiper(recettesData);
      
      // Vérifier si une recette spécifique est demandée dans l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const recipeId = urlParams.get('recette');
      
      if (recipeId) {
        showRecipeDetails(recipeId);
      }
    })
    .catch(error => {
      console.error('Erreur:', error);
      document.getElementById("recette-container").innerHTML = `
        <div class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="mt-4 text-xl font-bold text-gray-700 dark:text-gray-300">Erreur de chargement</h3>
          <p class="mt-2 text-gray-500 dark:text-gray-400">${error.message}</p>
          <button id="retry-load" class="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-300">
            Réessayer
          </button>
        </div>
      `;
      
      document.getElementById("retry-load").addEventListener("click", () => {
        initApp();
      });
    });
  
  // Initialiser les écouteurs d'événements
  initEventListeners();
  
  // Initialiser le FAQ
  initFAQ();
  
  // Initialiser le mode sombre
  darkMode = localStorage.getItem('darkMode') === 'true';
  document.documentElement.classList.toggle('dark', darkMode);
  
  // Initialiser le service worker pour le mode hors ligne
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker enregistré avec succès:', registration);
        })
        .catch(error => {
          console.log('Échec de l\'enregistrement du Service Worker:', error);
        });
    });
  }
}


// Démarrer l'application lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', initApp);
