// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('Service Worker enregistré avec succès:', registration.scope);
            })
            .catch(function(error) {
                console.log('Échec de l\'enregistrement du Service Worker:', error);
            });
    });
}

// Install button functionality
let deferredPrompt;
const installApp = document.getElementById('installApp');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    if (installApp) {
        installApp.classList.remove('hidden');
    }
});

if (installApp) {
    installApp.addEventListener('click', (e) => {
        // Hide our user interface that shows our A2HS button
        installApp.classList.add('hidden');
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('L\'utilisateur a accepté l\'installation de l\'application');
            } else {
                console.log('L\'utilisateur a refusé l\'installation de l\'application');
            }
            deferredPrompt = null;
        });
    });
}

// Check if app is installed
window.addEventListener('appinstalled', (evt) => {
    console.log('Application installée');
});
