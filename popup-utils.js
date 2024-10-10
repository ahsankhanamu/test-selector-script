const popupUtils = (() => {
  let _element, _popup, _identifier, _treeWalker;
  let popupEnabled = true; // To toggle popup display
  let popupLocked = false; // To lock popup on an element

  // Function to calculate the bounding rect of the hovered element
  const calculateBoundingRect = (_element) => {
    const rect = _element.getBoundingClientRect();
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height,
      right: rect.right + scrollLeft,
      bottom: rect.bottom + scrollTop,
    };
  };

  // Create the highlighter popup
  const createHighlighterPopup = () => {
    const highlighter = document.createElement('div');
    highlighter.setAttribute('id', 'highlighter_popup');
    highlighter.style.position = 'absolute';
    highlighter.style.pointerEvents = 'none';
    highlighter.style.zIndex = 999999998; // Slightly lower z-index to sit behind the identifier
    highlighter.style.border = '2px solid #4CAF50'; // Highlight border
    highlighter.style.background = 'rgba(76, 175, 80, 0.2)'; // Semi-transparent background
    highlighter.style.opacity = '1'; // Ensure it's visible when created
    document.body.appendChild(highlighter);
    return highlighter;
  };

  // Create the element identifier popup with a tooltip arrow
  const createIdentifier = () => {
    const identifier = document.createElement('div');
    identifier.setAttribute('id', 'element_identifier');
    identifier.style.position = 'absolute'; // Updated to absolute for easy positioning
    identifier.style.zIndex = 999999999;
    identifier.style.pointerEvents = 'none';
    identifier.style.backgroundColor = '#fff';
    identifier.style.color = '#333';
    identifier.style.padding = '12px';
    identifier.style.borderRadius = '6px';
    identifier.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
    identifier.style.fontSize = '12px';
    identifier.style.lineHeight = '1.5';
    identifier.style.border = '1px solid #ccc';
    identifier.style.transition = 'all 0.3s ease';
    identifier.style.fontFamily = 'Arial, sans-serif';

    // Add tooltip arrow
    const arrow = document.createElement('div');
    arrow.style.position = 'absolute';
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.borderLeft = '10px solid transparent';
    arrow.style.borderRight = '10px solid transparent';
    arrow.style.borderTop = '10px solid #fff'; // Arrow color
    arrow.style.bottom = '-10px'; // Adjust position for arrow
    arrow.style.left = '50%';
    arrow.style.transform = 'translateX(-50%)';
    identifier.appendChild(arrow);

    document.body.appendChild(identifier);
    return identifier;
  };

  // Function to build the identifier content (with additional accessibility checks)
  const buildElementIdentifier = (element) => {
    let identifierHTML = '';

    // Main element identifier with tag name, class, id, and dimensions
    const tagName = element.tagName.toLowerCase();
    const classList = element.classList.length ? `.${[...element.classList].join('.')}` : '';
    const id = element.id ? `#${element.id}` : '';
    const rect = calculateBoundingRect(element);
    const dimensions = `${rect.width.toFixed(2)} × ${rect.height.toFixed(2)}`;

    identifierHTML += `<div style="font-weight: bold; color: #0074D9;">${tagName}${id}${classList}</div>`;
    identifierHTML += `<div>${dimensions}</div>`;

    // Extract computed styles (e.g., color, background, font)
    const computedStyles = window.getComputedStyle(element);
    const color = computedStyles.color;
    const backgroundColor = computedStyles.backgroundColor;
    const fontFamily = computedStyles.fontFamily;
    const fontSize = computedStyles.fontSize;

    identifierHTML += `<div><strong>Color:</strong> <span style="background-color: ${color}; padding: 0 5px; color: white;">${color}</span></div>`;
    identifierHTML += `<div><strong>Background:</strong> ${backgroundColor}</div>`;
    identifierHTML += `<div><strong>Font:</strong> ${fontSize} "${fontFamily}"</div>`;

    // Add margin and padding info
    const margin = computedStyles.margin;
    const padding = computedStyles.padding;
    identifierHTML += `<div><strong>Margin:</strong> ${margin}</div>`;
    identifierHTML += `<div><strong>Padding:</strong> ${padding}</div>`;

    // Add accessibility properties
    const role = element.getAttribute('role');
    const accessibleName = element.getAttribute('aria-label') || element.getAttribute('name');
    const ariaExpanded = element.getAttribute('aria-expanded');
    const ariaHidden = element.getAttribute('aria-hidden');
    const ariaChecked = element.getAttribute('aria-checked');
    const tabindex = element.getAttribute('tabindex');
    const ariaDisabled = element.getAttribute('aria-disabled');

    identifierHTML += '<div><strong>ACCESSIBILITY</strong></div>';
    if (accessibleName) identifierHTML += `<div><strong>Name:</strong> ${accessibleName}</div>`;
    if (role) identifierHTML += `<div><strong>Role:</strong> ${role}</div>`;
    if (ariaExpanded !== null)
      identifierHTML += `<div><strong>Aria-Expanded:</strong> ${ariaExpanded}</div>`;
    if (ariaHidden !== null)
      identifierHTML += `<div><strong>Aria-Hidden:</strong> ${ariaHidden}</div>`;
    if (ariaChecked !== null)
      identifierHTML += `<div><strong>Aria-Checked:</strong> ${ariaChecked}</div>`;
    if (tabindex !== null) identifierHTML += `<div><strong>Tabindex:</strong> ${tabindex}</div>`;
    if (ariaDisabled !== null)
      identifierHTML += `<div><strong>Aria-Disabled:</strong> ${ariaDisabled}</div>`;

    // Add element states (disabled, readonly, required)
    const isDisabled = element.hasAttribute('disabled');
    const isReadOnly = element.hasAttribute('readonly');
    const isRequired = element.hasAttribute('required');
    if (isDisabled) identifierHTML += `<div><strong>Disabled:</strong> ✔️</div>`;
    if (isReadOnly) identifierHTML += `<div><strong>Readonly:</strong> ✔️</div>`;
    if (isRequired) identifierHTML += `<div><strong>Required:</strong> ✔️</div>`;

    // Display CSS Selector
    const getCSSSelector = (el) => {
      if (el.id) return `#${el.id}`;
      let selector = el.tagName.toLowerCase();
      if (el.className) {
        let _className =
          element.className.baseVal !== undefined ? element.className.baseVal : element.className;
        selector += `.${_className.trim().split(/\s+/).join('.')}`;
      }
      return selector;
    };
    identifierHTML += `<div><strong>CSS Selector:</strong> ${getCSSSelector(element)}</div>`;

    return identifierHTML;
  };

  // Adjust the position of the identifier with auto-adjustment if not enough space
  const adjustPopoverPosition = (element, popover) => {
    const rect = calculateBoundingRect(element);
    const popoverRect = popover.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = rect.top - popoverRect.height - 10; // Default to top
    let left = rect.left;

    // If there's not enough space at the top, position it below the element
    if (top < 0) {
      top = rect.bottom + 10;
    }

    // If there's not enough space to the left or right, adjust horizontally
    if (left + popoverRect.width > viewportWidth) {
      left = viewportWidth - popoverRect.width - 10; // Adjust to stay within the viewport
    } else if (left < 0) {
      left = 10; // Prevent overflow to the left
    }

    // Set the calculated position
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;

    // Handle arrow placement for the tooltip
    const arrow = popover.querySelector('div');
    if (top < rect.top) {
      // If popup is below the element
      arrow.style.borderTop = 'none';
      arrow.style.borderBottom = '10px solid #fff';
      arrow.style.top = '-10px'; // Position arrow on the top of the popover
      arrow.style.bottom = '';
    } else {
      // If popup is above the element
      arrow.style.borderBottom = 'none';
      arrow.style.borderTop = '10px solid #fff';
      arrow.style.bottom = '-10px'; // Position arrow at the bottom of the popover
      arrow.style.top = '';
    }
  };

  // Set the popup and identifier positions and content
  const setPopupAttribs = () => {
    if (!_popup) _popup = createHighlighterPopup();
    if (!_identifier) _identifier = createIdentifier();

    const rect = calculateBoundingRect(_element);

    // Position and size the highlighter popup
    _popup.style.left = `${rect.left}px`;
    _popup.style.top = `${rect.top}px`;
    _popup.style.width = `${rect.width}px`;
    _popup.style.height = `${rect.height}px`;

    // Build and display the identifier popup
    _identifier.innerHTML = buildElementIdentifier(_element);
    adjustPopoverPosition(_element, _identifier);

    // Ensure both popups are visible
    _popup.style.display = 'block';
    _identifier.style.display = 'block';
  };

  // Attach the popup to the current element
  const attachPopup = (element) => {
    _element = element;
    setPopupAttribs();
  };

  // Toggle popup visibility (Ctrl+H)
  const togglePopupVisibility = () => {
    popupEnabled = !popupEnabled;
    if (!popupEnabled) {
      _popup.style.display = 'none';
      _identifier.style.display = 'none';
    } else {
      setPopupAttribs(); // Re-enable the popups if turned back on
    }
  };

  // Throttle function
  const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function () {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(
          () => {
            if (Date.now() - lastRan >= limit) {
              func.apply(context, args);
              lastRan = Date.now();
            }
          },
          limit - (Date.now() - lastRan),
        );
      }
    };
  };

  // Throttle the mouseover event to prevent excessive updates
  const throttleMouseover = throttle((e) => {
    if (!popupLocked && popupEnabled) {
      attachPopup(e.target);
      initTreeWalker(e.target);
    }
  }, 100);

  // Check if the element is valid
  const isValidElement = (element) => {
    return element && element.nodeType === Node.ELEMENT_NODE;
  };

  // Initialize TreeWalker
  const initTreeWalker = (rootElement) => {
    const filter = {
      acceptNode: (node) => {
        // Skip <script>, <style>, and non-visible elements
        if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') {
          return NodeFilter.FILTER_REJECT;
        }

        const rect = node.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0) {
          return NodeFilter.FILTER_ACCEPT;
        }

        return NodeFilter.FILTER_REJECT;
      },
    };

    _treeWalker = document.createTreeWalker(
      document.body, // Set the root as document.body so it can traverse the entire document
      NodeFilter.SHOW_ELEMENT,
      filter,
      false,
    );

    _treeWalker.currentNode = rootElement; // Start with the element under mouse
  };

  // Traverse forward using TreeWalker with recursive checks
  const traverseForward = () => {
    let nextNode = _treeWalker.nextNode();
    while (nextNode && !isValidElement(nextNode)) {
      nextNode = _treeWalker.nextNode();
    }
    if (nextNode) {
      attachPopup(nextNode);
    } else {
      alert('Reached the last element in the DOM.');
    }
  };

  // Traverse backward using TreeWalker with recursive checks
  const traverseBackward = () => {
    let prevNode = _treeWalker.previousNode();
    while (prevNode && !isValidElement(prevNode)) {
      prevNode = _treeWalker.previousNode();
    }
    if (prevNode) {
      attachPopup(prevNode);
    } else {
      alert('Reached the first element in the DOM.');
    }
  };

  // Traverse up (to the parent element)
  const traverseUp = () => {
    const parentElement = _treeWalker.currentNode.parentElement;
    if (parentElement && isValidElement(parentElement)) {
      _treeWalker.currentNode = parentElement;
      attachPopup(parentElement); // Attach the popup to the parent element
    } else {
      alert('Reached the top of the DOM tree.');
    }
  };

  // Traverse down (to the first child element)
  const traverseDown = () => {
    const firstChild = _treeWalker.currentNode.firstElementChild;
    if (firstChild && isValidElement(firstChild)) {
      _treeWalker.currentNode = firstChild;
      attachPopup(firstChild); // Attach the popup to the first child element
    } else {
      alert('No valid child element found.');
    }
  };

  // Add event listener for keydown to navigate through elements
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
        traverseForward();
        break;
      case 'ArrowLeft':
        traverseBackward();
        break;
      case 'ArrowUp':
        traverseUp();
        break;
      case 'ArrowDown':
        traverseDown();
        break;
    }
  });

  // Handle keydown for toggling or locking popups
  document.addEventListener('keydown', (e) => {
    // Toggle popups visibility with Ctrl+H or Cmd+H
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      togglePopupVisibility();
    }
    // Lock the popup on Enter key press
    if (e.key === 'Enter' && _element) {
      popupLocked = !popupLocked;
    }
  });

  return {
    throttleMouseover, // Make this accessible
    attachPopup,
    isValidElement,
  };
})();

// Add mouseover event listener for highlighting elements and showing popups
// document.addEventListener('mouseover', popupUtils.throttleMouseover);
