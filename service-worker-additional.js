/* global navigator, window, document */
/* eslint no-restricted-globals: [0, 'navigator', 'window', 'document'] */
/* eslint no-console: 0 */
/* eslint no-plusplus: 0 */
/* eslint func-names: 0 */
/* eslint no-var: 0 */
/* eslint prefer-arrow-callback: 0 */
/* eslint prefer-template: 0 */

/**
 * 
 * @param {*} selector 
 * @description
 * Add to home screen handler
 */

var addToHomeScreenHandler = function (selector) {
  var deferredPrompt = null;

  var addToHomeScreen = function () {
    // hide our user interface that shows button
    var homeScreenButtonReference = document.querySelector(selector);
    // Show the prompt
    homeScreenButtonReference.style.display = 'none';
    //  Wait for the user to respond to the prompt
    deferredPrompt.prompt();
    deferredPrompt.userChoice
      .then(function (choiceResult) {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }

        deferredPrompt = null;
      });
  };

  var showAddToHomeScreen = function () {
    var homeScreenButtonReference = document.querySelector(selector);
    homeScreenButtonReference.style.display = 'block';
    homeScreenButtonReference.querySelector('.add-to-home-button').addEventListener('click', addToHomeScreen);
    homeScreenButtonReference.querySelector('.remove-from-home-button').addEventListener('click', () => {
      homeScreenButtonReference.style.display = 'none';
    });
  };

  var attachListner = function () {
    window.addEventListener('beforeinstallprompt', function (e) {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      showAddToHomeScreen();
    });
  };
  attachListner();
};

function ServiceWorkerManager() {
  this.registration = null;

  this.getRegistration = (callback) => {
    if (this.registration) {
      callback(this.registration);
    }
    navigator.serviceWorker.getRegistration()
      .then((registration) => {
        if (registration) {
          this.registration = registration;
          callback(this.registration);
        } else {
          callback(null);
        }
      })
      .catch(() => {
        callback(null);
      });
  };

  this.register = function () {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js');
    }
  };

  this.unregister = function () {
    this.getRegistration((registration) => {
      if (registration) {
        registration.unregister();
      }
    });
  };
}

try {
  const serviceWorkerManagerInstance = new ServiceWorkerManager();
  const SELECTOR = '.add-to-home';
  serviceWorkerManagerInstance.register();
  addToHomeScreenHandler(SELECTOR);
} catch (e) {
  console.log(e);
}