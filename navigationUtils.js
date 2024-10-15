(function () {
  // Store the original functions to allow restoration
  const originalFunctions = {
    locationSet: Object.getOwnPropertyDescriptor(window, 'location').set,
    assign: window.location.assign,
    replace: window.location.replace,
    pushState: history.pushState,
    replaceState: history.replaceState,
  };

  // Store event listener references for anchor links
  const anchorEventListeners = [];

  // Function to block navigation via various methods
  function blockNavigation() {
    // Block navigation triggered by anchor (a) tag clicks
    document.querySelectorAll('a').forEach((link) => {
      const listener = function (event) {
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          event.preventDefault(); // Prevent the link from navigating
          console.log(`Navigation attempt via link to: ${href}`);
        }
      };
      link.addEventListener('click', listener);
      anchorEventListeners.push({ link, listener }); // Store for later removal
    });

    // Block navigation using window.location and window.location.href
    Object.defineProperty(window, 'location', {
      configurable: false,
      enumerable: true,
      get() {
        return window.location;
      },
      set(value) {
        console.log(`Navigation attempt via window.location to: ${value}`);
        // Block navigation
        // To allow navigation, use: originalFunctions.locationSet.call(window.location, value);
      },
    });

    // Block navigation using window.location.assign
    window.location.assign = function (url) {
      console.log(`Navigation attempt via window.location.assign to: ${url}`);
      // Block navigation
      // To allow navigation, use: originalFunctions.assign.call(window.location, url);
    };

    // Block navigation using window.location.replace
    window.location.replace = function (url) {
      console.log(`Navigation attempt via window.location.replace to: ${url}`);
      // Block navigation
      // To allow navigation, use: originalFunctions.replace.call(window.location, url);
    };

    // Block history manipulation using history.pushState
    history.pushState = function (...args) {
      console.log('Navigation attempt via history.pushState with args:', args);
      // Block navigation
      // To allow navigation, use: originalFunctions.pushState.apply(history, args);
    };

    // Block history manipulation using history.replaceState
    history.replaceState = function (...args) {
      console.log('Navigation attempt via history.replaceState with args:', args);
      // Block navigation
      // To allow navigation, use: originalFunctions.replaceState.apply(history, args);
    };
  }

  // Function to restore the original browser behavior
  function restoreNavigation() {
    // Restore original window.location behavior
    Object.defineProperty(window, 'location', {
      configurable: false,
      enumerable: true,
      set: originalFunctions.locationSet,
    });

    // Restore original window.location.assign and window.location.replace
    window.location.assign = originalFunctions.assign;
    window.location.replace = originalFunctions.replace;

    // Restore original history.pushState and history.replaceState
    history.pushState = originalFunctions.pushState;
    history.replaceState = originalFunctions.replaceState;

    // Remove event listeners from anchor links
    anchorEventListeners.forEach(({ link, listener }) => {
      link.removeEventListener('click', listener);
    });

    // Clear the stored event listeners
    anchorEventListeners.length = 0;
    console.log('Navigation and listeners have been restored to their original state.');
  }

  // Export the blocking and restoring functions to the global scope
  window.blockNavigation = blockNavigation;
  window.restoreNavigation = restoreNavigation;

  // Example: Automatically block navigation when the script runs
  blockNavigation();
})();
