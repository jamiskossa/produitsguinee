/**
 * eBook Recettes Guinéennes - Fonctionnalités spécifiques à la page eBook
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des fonctionnalités spécifiques à la page eBook
    initPricingToggle();
    initPreviewDownload();
    initTestimonialCarousel();
    initFAQAccordion();
    initCountdown();
  });
  
  /**
   * Gestion du toggle entre paiement mensuel et annuel
   */
  function initPricingToggle() {
    const pricingToggle = document.getElementById('pricing-toggle');
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const yearlyPrices = document.querySelectorAll('.yearly-price');
    const saveTexts = document.querySelectorAll('.save-text');
    
    if (!pricingToggle) return;
    
    pricingToggle.addEventListener('change', function() {
      if (this.checked) {
        // Afficher les prix annuels
        monthlyPrices.forEach(el => el.classList.add('hidden'));
        yearlyPrices.forEach(el => el.classList.remove('hidden'));
        saveTexts.forEach(el => el.classList.remove('hidden'));
      } else {
        // Afficher les prix mensuels
        monthlyPrices.forEach(el => el.classList.remove('hidden'));
        yearlyPrices.forEach(el => el.classList.add('hidden'));
        saveTexts.forEach(el => el.classList.add('hidden'));
      }
    });
  }
  
  /**
   * Gestion du téléchargement de l'aperçu gratuit
   */
  function initPreviewDownload() {
    const downloadBtn = document.querySelector('a[href="#"][data-action="download-preview"]');
    
    if (!downloadBtn) return;
    
    downloadBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Simuler un téléchargement
      const link = document.createElement('a');
      link.href = 'downloads/extrait-recettes-guineennes.pdf';
      link.download = 'Extrait_Recettes_Guineennes.pdf';
      link.click();
      
      // Afficher une notification
      showNotification('Téléchargement démarré !', 'Merci de votre intérêt pour notre eBook.');
      
      // Collecter l'email pour le marketing (optionnel)
      setTimeout(() => {
        showEmailCollector();
      }, 2000);
    });
  }
  
  /**
   * Initialisation du carousel de témoignages
   */
  function initTestimonialCarousel() {
    const testimonialContainer = document.querySelector('.testimonial-container');
    
    if (!testimonialContainer) return;
    
    // Créer un carousel automatique
    let currentIndex = 0;
    const testimonials = testimonialContainer.querySelectorAll('.testimonial-card');
    const totalTestimonials = testimonials.length;
    
    // Masquer tous les témoignages sauf le premier
    testimonials.forEach((testimonial, index) => {
      if (index !== 0) {
        testimonial.classList.add('hidden');
      }
    });
    
    // Fonction pour afficher le témoignage suivant
    function showNextTestimonial() {
      testimonials[currentIndex].classList.add('hidden');
      currentIndex = (currentIndex + 1) % totalTestimonials;
      testimonials[currentIndex].classList.remove('hidden');
    }
    
    // Changer de témoignage toutes les 5 secondes
    setInterval(showNextTestimonial, 5000);
  }
  
  /**
   * Initialisation de l'accordéon FAQ
   */
  function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const icon = item.querySelector('.faq-icon');
      
      question.addEventListener('click', () => {
        // Fermer toutes les autres réponses
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.querySelector('.faq-answer').classList.add('hidden');
            otherItem.querySelector('.faq-icon').classList.remove('rotate-180');
          }
        });
        
        // Basculer l'état de la réponse actuelle
        answer.classList.toggle('hidden');
        icon.classList.toggle('rotate-180');
      });
    });
  }
  
  /**
   * Initialisation du compte à rebours pour les offres limitées
   */
  function initCountdown() {
    const countdownElement = document.getElementById('offer-countdown');
    
    if (!countdownElement) return;
    
    // Date de fin de l'offre (7 jours à partir de maintenant)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    function updateCountdown() {
      const now = new Date();
      const diff = endDate - now;
      
      if (diff <= 0) {
        countdownElement.textContent = "Offre expirée";
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      countdownElement.textContent = `${days}j ${hours}h ${minutes}m ${seconds}s`;
    }
    
    // Mettre à jour le compte à rebours chaque seconde
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
  
  /**
   * Affiche une notification à l'utilisateur
   */
  function showNotification(title, message) {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 animate-slide-up max-w-md';
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0 pt-0.5">
          <svg class="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="ml-3 w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white">${title}</p>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">${message}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button class="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    // Ajouter la notification au DOM
    document.body.appendChild(notification);
    
    // Configurer le bouton de fermeture
    const closeButton = notification.querySelector('button');
    closeButton.addEventListener('click', () => {
      notification.remove();
    });
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
  
  /**
   * Affiche un collecteur d'email pour le marketing
   */
  function showEmailCollector() {
    // Créer l'élément de collecte d'email
    const collector = document.createElement('div');
    collector.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    collector.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md mx-4 animate-slide-up">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Restez informé !</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">Inscrivez-vous à notre newsletter pour recevoir des recettes gratuites et être informé des nouvelles éditions de notre eBook.</p>
        <form class="space-y-4">
          <div>
            <label for="email-collector" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Votre email</label>
            <input type="email" id="email-collector" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white" placeholder="exemple@email.com" required>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="consent" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
            <label for="consent" class="ml-2 block text-sm text-gray-600 dark:text-gray-400">
              J'accepte de recevoir des emails marketing
            </label>
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" id="close-collector" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Non merci
            </button>
            <button type="submit" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
              S'inscrire
            </button>
          </div>
        </form>
      </div>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(collector);
    
    // Configurer les boutons
    const closeButton = collector.querySelector('#close-collector');
    const form = collector.querySelector('form');
    
    closeButton.addEventListener('click', () => {
      collector.remove();
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email-collector').value;
      const consent = document.getElementById('consent').checked;
      
      // Ici, vous pourriez envoyer l'email à votre service de newsletter
      console.log('Email collecté:', email, 'Consentement:', consent);
      
      // Afficher un message de confirmation
      showNotification('Inscription réussie !', 'Merci de vous être inscrit à notre newsletter.');
      
      // Fermer le collecteur
      collector.remove();
    });
  }
  