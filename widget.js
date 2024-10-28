class ElementBuilder {
  constructor(tagName) {
    this.element = document.createElement(tagName);
  }

  setAttributes(attributes) {
    Object.keys(attributes).forEach(key => {
      this.element.setAttribute(key, attributes[key]);
    });
    return this; // for chaining
  }

  addClass(...classNames) {
    classNames.forEach(className => {
      this.element.classList.add(...className.split(' ')); // Split by space
    });
    return this; // for chaining
  }

  addTextContent(text) {
    this.element.textContent = text;
    return this; // for chaining
  }

  addHTMLContent(html) {
    this.element.innerHTML = html;
    return this; // for chaining
  }

  appendTo(parent) {
    // Check if parent is an HTMLElement or DocumentFragment
    if (parent instanceof HTMLElement || parent instanceof DocumentFragment) {
      parent.appendChild(this.element);
    } else if (typeof parent === 'string') {
      document.querySelector(parent).appendChild(this.element);
    }
    return this; // for chaining
  }

  insertAdjacent(target, position = 'beforeend') {
    if (target instanceof HTMLElement) {
      target.insertAdjacentElement(position, this.element);
    } else if (typeof target === 'string') {
      document
        .querySelector(target)
        .insertAdjacentElement(position, this.element);
    }
    return this; // for chaining
  }

  addEventListener(event, callback) {
    this.element.addEventListener(event, callback);
    return this; // for chaining
  }

  setStyle(styles) {
    Object.assign(this.element.style, styles);
    return this; // for chaining
  }

  getElement() {
    return this.element;
  }
}

const cssString = `
  /* Selection box styling */
    .selection-box {
      position: absolute;
      border: 2px dashed rgba(0, 122, 255, 0.7);
      background-color: rgba(173, 216, 230, 0.3);
      pointer-events: none;
      transition: all 0.1s ease-in-out;
      border-radius: 4px;
      display: none;
    }

    /* Widget styling */
    #widget {
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 400px;
      background-color: #f0f0f0;
      border: 1px solid #333;
      z-index: 10000;
      box-shadow: 0 8px 10px 1px rgba(0, 0, 0, .14), 0 3px 14px 2px rgba(0, 0, 0, .12), 0 5px 5px -3px rgba(0, 0, 0, .2);
      font-family: Arial, sans-serif;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
    }

    /* Widget top bar styling */
    #widget-top-bar {
      color: white;
      background-color: #f2f2f2;
      box-shadow: 0 3px 2px -2px rgba(0, 0, 0, .1);
      color: #041e49;
      padding: 10px 16px;
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    /* Widget content area styling */
    .widget-content {
      padding: 10px;
      flex-grow: 1;
      max-height: 300px;
      overflow-y: auto;
      background-color: white;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    .second-bar {
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: space-between;
      padding: 10px;
      align-items: center;
      border-bottom: 1px solid #ccc;
      height: 48px;
    }

    /* Button container for dynamic buttons */
    .dynamic-buttons-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-inline: 10px;
      background-color: #f9f9f9;
    }

    /* Delete button styling */
    .dynamic-buttons-container button {
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px 5px;
      margin-inline: 2px;
      border-radius: 3px;
    }
    .delete-button {
      background-color: #dc3545;
    }

    .copy-button {
      background-color: black;
    }

    .group-button {
      background-color: blueviolet;
    }


    /* Settings overlay styling */
    #settings-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 10001;
    }

    /* Settings container styling */
    #settings-container {
      width: 300px;
      padding: 20px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }

    #widget {
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 400px;
      background-color: #f0f0f0;
      border: 1px solid #333;
      z-index: 10000;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      font-family: Arial, sans-serif;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
    }

    #popupTopBar {
      background-color: #333;
      color: white;
      padding: 5px 10px;
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    #minimizeButton {
      background-color: transparent;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }

    .widget-content {
      padding: 10px;
      flex-grow: 1;
      max-height: 300px;
      overflow-y: auto;
      background-color: white;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
      
    .export-buttons-container {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background-color: #f9f9f9;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
    .exportButton {
      padding: 5px 10px;
      border: none;
      background-color: #007bff;
      color: white;
      border-radius: 5px;
      cursor: pointer;
    }
    
    .exportSelectorButton {
      background-color: #4CAF50;
      color: white;
    }

    .exportDataButton {
      background-color: #2196F3;
      color: white;
    }
    
    .exportActionButton {
      background-color: #FFC107;
      color: white;
    }

    .exportAssertionButton {
      background-color: #FF5722;
      color: white;
    }

    /* Overlay styling */
    #export-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10001;
    }

    /* Container styling */
    #export-container {
      background-color: #fff;
      width: 80%;
      max-height: 100%;
      padding: 20px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    /* Close button styling */
    .export-close-button {
      background-color: #f44336;
      color: #fff;
      border: none;
      padding: 10px;
      border-radius: 4px;
      cursor: pointer;
      align-self: flex-end;
    }
    
    /* Copy button positioned at the right top corner of the textarea */
    .copy-text-area-button {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: #2196f3;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.3s ease, transform 0.3s ease;
    }

    .copy-text-area-button:active {
      transform: scale(0.95);
    }

    /* Animation for the button when text changes */
    .copy-text-area-button.copied {
      background-color: #4caf50;
      transition: background-color 0.3s ease;
    }

    /* Input for file name */
    #export-filename {
      border: 1px solid #ccc;
      padding: 8px;
      font-size: 14px;
      border-radius: 4px;
      width: 50%;
      outline: none;
      margin-bottom: 10px;
    }

    /* Export button styling */
    .export-json-button {
      background-color: #4caf50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 10px;
      margin-left: 10px;
    }


    /* Textarea styling */
    #export-textarea {
      width: 100%;
      height: 70vh;
      padding: 10px;
      font-size: 14px;
      font-family: monospace;
      border: 1px solid #ccc;
      border-radius: 4px;
      resize: none;
      background-color: #f9f9f9;
      white-space: pre;
      overflow: auto;
    }
    
    .selector-identifier {
      color: #747775;
      margin-left: 10px;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 120px;
    /* Limit the width for ellipsis to show */
    }

        
    .selectorListItem {
      padding: 5px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #ccc;
    }

    .delete-row-button {
      margin-left: 10px;
      border: none;
      background-color: #dc3545;
      color: white;
      border-radius: 3px;
      cursor: pointer;
    }

    /* widget action buttons */
    .widget-topbar-action-buttons-container {
        display: flex;
        text-align: right;
        white-space: nowrap;
    }
    .widget-topbar-action-button, .widget-topbar-selection-button {
        background: none repeat scroll 0 0 transparent;
        border: medium none;
        border-spacing: 0;
        color: #26589F;
        font-family: 'PT Sans Narrow',sans-serif;
        font-size: 16px;
        font-weight: normal;
        line-height: 1.42rem;
        list-style: none outside none;
        margin: 0;
        padding: 0;
        text-align: left;
        text-decoration: none;
        text-indent: 0;
        margin-left: 4px;
        opacity: 1;
        position: relative;
        top: 2px;
    }
    .widget-topbar-selection-button{
        color: #f2f2f2;
        width: 20px;
        height: 20px;
    }
    .widget-topbar-selection-button:hover, .widget-topbar-action-button:hover {
      color: blue;
    }
    .widget-topbar-selection-button:active, .widget-topbar-action-button:active, .widget-topbar-selection-button:focus, .widget-topbar-action-button:focus {
      color: green;
    }
    .widget-topbar-minimise-button{
        background: url(//ssl.gstatic.com/ui/v1/icons/mail/rfr/ic_minimize_16px_2x.png);
        background-size: 16px;
        width: 16px;
        height: 16px;
    }
    .widget-topbar-expand-button {
        background-image: url(//ssl.gstatic.com/ui/v1/icons/mail/rfr/ic_open_in_full_16px_2x.png);
        background-size: 16px;
        width: 16px;
        height: 16px;
    }
    .widget-topbar-unexpand-button {
        background-image: url(//ssl.gstatic.com/ui/v1/icons/mail/rfr/ic_close_fullscreen_16px_2x.png);
        background-size: 16px;
        width: 16px;
        height: 16px;
    }
    
    .widget-topbar-close-button {
        background: url(//ssl.gstatic.com/ui/v1/icons/mail/rfr/ic_close_16px_2x.png);
        background-size: 16px;
        width: 16px;
        height: 16px;
    }
  `;

new ElementBuilder('style').addHTMLContent(cssString).appendTo(document.head);

// Example Usage:

// Create a button with class, attributes, event listener, and append it to a div
// new ElementBuilder('button')
//   .setAttributes({ id: 'myButton', type: 'button' })
//   .addClass('btn', 'btn-primary')
//   .addTextContent('Click Me')
//   .addEventListener('click', () => alert('Button clicked!'))
//   .appendTo('#myDiv');

// // Create a paragraph with text, add some styles, and insert it before another element
// new ElementBuilder('p')
//   .addTextContent('This is a new paragraph.')
//   .setStyle({ color: 'blue', fontSize: '18px' })
//   .insertAdjacent('#anotherElement', 'beforebegin');


const widgetUtils = (() => {
  let _element,
    _popup,
    _identifier,
    _treeWalker,
    callbacks = {};
  let popupEnabled = false; // To toggle popup display
  let popupLocked = false; // To lock popup on an element

  // Function to calculate the bounding rect of the hovered element
  const calculateBoundingRect = _element => {
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
  const buildElementIdentifier = element => {
    let identifierHTML = '';

    // Main element identifier with tag name, class, id, and dimensions
    const tagName = element.tagName.toLowerCase();
    const classList = element.classList.length
      ? `.${[...element.classList].join('.')}`
      : '';
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
    const accessibleName =
      element.getAttribute('aria-label') || element.getAttribute('name');
    const ariaExpanded = element.getAttribute('aria-expanded');
    const ariaHidden = element.getAttribute('aria-hidden');
    const ariaChecked = element.getAttribute('aria-checked');
    const tabindex = element.getAttribute('tabindex');
    const ariaDisabled = element.getAttribute('aria-disabled');

    identifierHTML += '<div><strong>ACCESSIBILITY</strong></div>';
    if (accessibleName)
      identifierHTML += `<div><strong>Name:</strong> ${accessibleName}</div>`;
    if (role) identifierHTML += `<div><strong>Role:</strong> ${role}</div>`;
    if (ariaExpanded !== null)
      identifierHTML += `<div><strong>Aria-Expanded:</strong> ${ariaExpanded}</div>`;
    if (ariaHidden !== null)
      identifierHTML += `<div><strong>Aria-Hidden:</strong> ${ariaHidden}</div>`;
    if (ariaChecked !== null)
      identifierHTML += `<div><strong>Aria-Checked:</strong> ${ariaChecked}</div>`;
    if (tabindex !== null)
      identifierHTML += `<div><strong>Tabindex:</strong> ${tabindex}</div>`;
    if (ariaDisabled !== null)
      identifierHTML += `<div><strong>Aria-Disabled:</strong> ${ariaDisabled}</div>`;

    // Add element states (disabled, readonly, required)
    const isDisabled = element.hasAttribute('disabled');
    const isReadOnly = element.hasAttribute('readonly');
    const isRequired = element.hasAttribute('required');
    if (isDisabled)
      identifierHTML += `<div><strong>Disabled:</strong> ✔️</div>`;
    if (isReadOnly)
      identifierHTML += `<div><strong>Readonly:</strong> ✔️</div>`;
    if (isRequired)
      identifierHTML += `<div><strong>Required:</strong> ✔️</div>`;

    // Display CSS Selector
    const getCSSSelector = el => {
      if (el.id) return `#${el.id}`;
      let selector = el.tagName.toLowerCase();
      if (el.className) {
        let _className =
          element.className.baseVal !== undefined
            ? element.className.baseVal
            : element.className;
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

    if (!_element) return;
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
  const attachInspectPopup = element => {
    _element = element;
    setPopupAttribs();
  };

  // Toggle popup visibility (Ctrl+H)
  const toggleSingleSelectTool = () => {
    popupEnabled = !popupEnabled;
    if (!popupEnabled) {
      if (_popup) {
        _popup.style.display = 'none';
        _identifier.style.display = 'none';
      }
      document.removeEventListener('mouseover', throttleMouseover);
      // Handle keydown for toggling or locking popups
      document.removeEventListener('keydown', keyDownListeners);
    } else {
      document.addEventListener('mouseover', throttleMouseover);
      // Handle keydown for toggling or locking popups
      document.addEventListener('keydown', keyDownListeners);
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
          limit - (Date.now() - lastRan)
        );
      }
    };
  };

  // Throttle the mouseover event to prevent excessive updates
  const throttleMouseover = throttle(e => {
    if (!popupLocked && popupEnabled) {
      attachInspectPopup(e.target);
      initTreeWalker(e.target);
    }
  }, 100);

  // Check if the element is valid
  const isValidElement = element => {
    return element && element.nodeType === Node.ELEMENT_NODE;
  };

  // Initialize TreeWalker
  const initTreeWalker = rootElement => {
    if (!rootElement) return;

    const filter = {
      acceptNode: node => {
        // Skip <script>, <style>, and non-visible elements
        if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') {
          return NodeFilter.FILTER_REJECT;
        }

        const rect = node.getBoundingClientRect();
        if (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.top >= 0 &&
          rect.left >= 0
        ) {
          return NodeFilter.FILTER_ACCEPT;
        }

        return NodeFilter.FILTER_REJECT;
      },
    };

    _treeWalker = document.createTreeWalker(
      document.body, // Set the root as document.body so it can traverse the entire document
      NodeFilter.SHOW_ELEMENT,
      filter,
      false
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
      attachInspectPopup(nextNode);
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
      attachInspectPopup(prevNode);
    } else {
      alert('Reached the first element in the DOM.');
    }
  };

  // Traverse up (to the parent element)
  const traverseUp = () => {
    const parentElement = _treeWalker.currentNode.parentElement;
    if (parentElement && isValidElement(parentElement)) {
      _treeWalker.currentNode = parentElement;
      attachInspectPopup(parentElement); // Attach the popup to the parent element
    } else {
      alert('Reached the top of the DOM tree.');
    }
  };

  // Traverse down (to the first child element)
  const traverseDown = () => {
    const firstChild = _treeWalker.currentNode.firstElementChild;
    if (firstChild && isValidElement(firstChild)) {
      _treeWalker.currentNode = firstChild;
      attachInspectPopup(firstChild); // Attach the popup to the first child element
    } else {
      alert('No valid child element found.');
    }
  };

  // Handle keydown for traversing elements
  function keyDownListeners(e) {
    // Toggle popups visibility with Ctrl+H or Cmd+H
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      toggleSingleSelectTool();
    }

    // Lock the popup on Enter key press
    if ((e.ctrlKey || e.metaKey) && e.key === 'l' && _element) {
      popupLocked = !popupLocked;
    }

    if (e.key === 'Escape') {
      // Example: Hide popup on Escape key press
      toggleSingleSelectTool();
    }

    // Add the element to selected on Enter key press
    if (e.key === 'Enter' && _element) {
      if (typeof callbacks['enterKeyCallback'] === 'function' && _element) {
        callbacks['enterKeyCallback'](_element);
      }
    }

    // Add keydown handler to navigate through elements
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
  }

  function setCallbacks(callback) {
    callbacks = { callbacks, ...callback };
  }
  console.log('popupUtils');
  return {
    attachInspectPopup,
    isValidElement,
    toggleSingleSelectTool,
    setCallbacks,
  };
})();

// Add mouseover event listener for highlighting elements and showing popups
// document.addEventListener('mouseover', popupUtils.toggleSingleSelectTool);


// Main widget here
(function () {
  let startX, startY, selectionBox;
  let selectedElements = new Map();
  let widgetSelectedItems = new Set();
  let widget,
    widgetTopBar,
    secondBar,
    widgetContent,
    widgetContentFragment,
    exportOverlay;
  (isMinimized = false), (isMaximized = false);
  let isDraggingWidget = false;
  let isDraggingSelection = false;
  let scrollSpeed = 20;
  let scrollInterval;
  let widgetOffsetX = 0,
    widgetOffsetY = 0;
  let dynamicButtonsContainer;
  let isWidgetActive = false;
  let tool = '';

  const defaultOutlineStyle = '2px solid blue';
  const hoverOutlineStyle = '3px dashed orange';

  class ToolManager {
    constructor() {
      this.currentTool = null;
    }

    activateTool(toolName) {
      if (this.currentTool) {
        this.deactivateTool(this.currentTool);
      }
      this.currentTool = toolName;
      this.activateToolHandlers(toolName);
    }

    deactivateTool(toolName) {
      this.deactivateToolHandlers(toolName);
      this.currentTool = null;
    }

    activateToolHandlers(toolName) {
      switch (toolName) {
        case 'singleSelect':
          window.addEventListener('click', handleSingleSelect);
          widgetUtils.setCallbacks({
            enterKeyCallback: addSingleElementToSelection,
          });
          widgetUtils.toggleSingleSelectTool();
          break;
        case 'dragSelect':
          window.addEventListener('mousedown', onDragSelectionStart);
          break;
        default:
          break;
      }
    }

    deactivateToolHandlers(toolName) {
      switch (toolName) {
        case 'singleSelect':
          window.removeEventListener('click', handleSingleSelect);
          widgetUtils.toggleSingleSelectTool();
          break;
        case 'dragSelect':
          window.removeEventListener('mousedown', onDragSelectionStart);
          break;
        default:
          break;
      }
    }
  }

  const toolManager = new ToolManager();

  // Toggle widget activation and deactivation
  function toggleWidgetActivation() {
    isWidgetActive = !isWidgetActive;
    if (!isWidgetActive) {
      toolManager.deactivateTool(toolManager.currentTool);
    }
    console.log(isWidgetActive ? 'Widget Activated' : 'Widget Deactivated');
  }

  // browser specific
  function preventTextSelection() {
    document.body.style.userSelect = 'none';
  }

  function restoreTextSelection() {
    document.body.style.userSelect = '';
  }

  function autoScroll(event) {
    const buffer = 50;
    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const maxScrollX = document.documentElement.scrollWidth - innerWidth;
    const maxScrollY = document.documentElement.scrollHeight - innerHeight;

    let scrollXDelta = 0;
    let scrollYDelta = 0;

    if (clientY > innerHeight - buffer && scrollY < maxScrollY) {
      scrollYDelta = scrollSpeed;
    } else if (clientY < buffer && scrollY > 0) {
      scrollYDelta = -scrollSpeed;
    }

    if (clientX > innerWidth - buffer && scrollX < maxScrollX) {
      scrollXDelta = scrollSpeed;
    } else if (clientX < buffer && scrollX > 0) {
      scrollXDelta = -scrollSpeed;
    }

    if (scrollXDelta !== 0 || scrollYDelta !== 0) {
      window.scrollBy(scrollXDelta, scrollYDelta);
    }
  }

  function startAutoScroll(event) {
    stopAutoScroll();
    scrollInterval = setInterval(() => autoScroll(event), 50);
  }

  function stopAutoScroll() {
    clearInterval(scrollInterval);
  }

  // selector specific
  function toCamelCase(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
        index === 0 ? match.toLowerCase() : match.toUpperCase()
      )
      .replace(/\s+/g, '');
  }

  function getElementIdentifier(element) {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const className = element.classList.length
      ? `.${[...element.classList].join('.')}`
      : '';
    return `${tag}${id}${className}`;
  }

  function getElementState(element) {
    const states = [];

    // Check if the element is hidden by calculating the bounding box
    const boundingBox = element.getBoundingClientRect();
    const isHidden = boundingBox.width === 0 && boundingBox.height === 0;
    if (isHidden) {
      states.push('hidden');
    }

    // Check if the element is disabled
    if (element.disabled) {
      states.push('disabled');
    }

    // Check if the element is focused
    if (document.activeElement === element) {
      states.push('focused');
    }

    // Check if the element is "empty" (for input, textarea, or select)
    if (
      element.tagName === 'INPUT' ||
      element.tagName === 'TEXTAREA' ||
      element.tagName === 'SELECT'
    ) {
      if (
        element.value === '' ||
        element.value === null ||
        element.value === undefined
      ) {
        states.push('empty');
      }
    }

    // Check if the element is checked (for checkboxes or radio buttons)
    if (element.type === 'checkbox' || element.type === 'radio') {
      if (element.checked) {
        states.push('checked');
      }
    }

    // Return the joined states, or "normal" if there are no special states
    return states.length > 0 ? states.join(', ') : 'normal';
  }

  function isInteractive(element) {
    return (
      element.tagName === 'A' ||
      element.tagName === 'BUTTON' ||
      element.tagName === 'TEXTAREA' ||
      element.tagName === 'SELECT' ||
      (element.tagName === 'INPUT' &&
        (element.type === 'button' ||
          element.type === 'submit' ||
          element.type === 'text' ||
          element.type === 'password' ||
          element.type === 'checkbox' ||
          element.type === 'radio')) ||
      element.hasAttribute('onclick') ||
      element.getAttribute('role') === 'button' ||
      element.tabIndex >= 0
    );
  }

  function isElementInSelection(element) {
    if (widget && widget.contains(element)) {
      return;
    }
    const rect = element.getBoundingClientRect();
    const selectionRect = selectionBox.getBoundingClientRect();

    return (
      rect.left >= selectionRect.left &&
      rect.right <= selectionRect.right &&
      rect.top >= selectionRect.top &&
      rect.bottom <= selectionRect.bottom
    );
  }

  function highlightElement(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.style.outline = hoverOutlineStyle;
  }

  function unhighlightElement(element) {
    element.style.outline = defaultOutlineStyle;
  }

  function getSelector(element) {
    if (element.id) {
      return `//${element.tagName.toLowerCase()}[@id="${element.id}"]`;
    }
    if (element.name) {
      return `//${element.tagName.toLowerCase()}[@name="${element.name}"]`;
    }
    if (element.title) {
      return `//${element.tagName.toLowerCase()}[@title="${element.title}"]`;
    }
    if (element.getAttribute('aria-labelledby')) {
      return `//${element.tagName.toLowerCase()}[@aria-labelledby="${element.getAttribute(
        'aria-labelledby'
      )}"]`;
    }
    return `//${element.tagName.toLowerCase()}`;
  }

  function getSuffix(element) {
    if (element.tagName === 'INPUT') {
      if (
        element.type === 'text' ||
        element.type === 'number' ||
        element.type === 'email' ||
        element.type === 'tel' ||
        element.type === 'password' ||
        element.type === 'search' ||
        element.type === 'url'
      )
        return 'Textbox';
      if (element.tagName === 'TEXTAREA') return 'Textbox';
      if (element.type === 'radio') return 'Radio';
      if (element.type === 'checkbox') return 'Checkbox';
      if (
        element.type === 'button' ||
        element.type === 'submit' ||
        element.type === 'reset'
      )
        return 'Button';
    }
    if (element.tagName === 'SELECT') return 'Select';
    return '';
  }

  function getActionType(element) {
    if (element.tagName === 'INPUT') {
      if (
        element.type === 'text' ||
        element.type === 'number' ||
        element.type === 'email' ||
        element.type === 'tel' ||
        element.type === 'password' ||
        element.type === 'search' ||
        element.type === 'url'
      ) {
        return 'text'; // Action for text input
      }
      if (element.type === 'radio') return 'mark'; // Action for radio button
      if (element.type === 'checkbox') return 'mark'; // Action for checkbox
      // if (element.type === 'button' || element.type === 'submit' || element.type === 'reset') {
      //   return 'click'; // Action for buttons
      // }
    }
    // if (element.tagName === 'BUTTON') {
    //   return 'click'; // Action for buttons
    // }
    if (element.tagName === 'TEXTAREA') return 'text'; // Action for textarea input
    if (element.tagName === 'SELECT') return 'select'; // Action for select dropdown
    return 'unknown'; // Return empty if no match found
  }

  // tool specific
  function toggleSingleSelectMode() {
    if (toolManager.currentTool !== 'singleSelect') {
      toolManager.activateTool('singleSelect');
    } else {
      toolManager.deactivateTool('singleSelect');
    }
  }

  function toggleDragSelectMode() {
    if (toolManager.currentTool !== 'dragSelect') {
      toolManager.activateTool('dragSelect');
    } else {
      toolManager.deactivateTool('dragSelect');
    }
  }

  function addSingleElementToSelection(element) {
    if (
      toolManager.currentTool !== 'singleSelect' ||
      (widget && widget.contains(element))
    )
      return;
    if (widgetUtils.isValidElement(element)) {
      selectedElements.set(element, '');
      element.style.outline = defaultOutlineStyle;
      console.log('Single Element Selected:', element);
      // widgetUtils.attachInspectWidget(element); // Integrate widgetUtils for the single select tool
      createWidget();
      updateWidgetContent();
    }
  }

  function handleSingleSelect(event) {
    const element = event.target;
    addSingleElementToSelection(element);
  }

  function onDragSelectionStart(event) {
    if (widgetContent && widgetContent.contains(event.target)) {
      return;
    }
    if (widgetTopBar && widgetTopBar.contains(event.target)) {
      isDraggingWidget = true;
      widgetOffsetX = event.clientX - widget.getBoundingClientRect().left;
      widgetOffsetY = event.clientY - widget.getBoundingClientRect().top;

      window.addEventListener('mousemove', onDragSelectMove);
      window.addEventListener('mouseup', onDragSelectionEnd);
      return;
    }
    if (!isWidgetActive || tool === 'singleSelect') return;
    preventTextSelection();
    startX = event.pageX;
    startY = event.pageY;
    isDraggingSelection = true;

    createSelectionBox();

    window.addEventListener('mousemove', onDragSelectMove);
    window.addEventListener('mouseup', onDragSelectionEnd);
  }

  function onDragSelectMove(event) {
    if (isDraggingWidget) {
      widget.style.left = `${event.clientX - widgetOffsetX}px`;
      widget.style.top = `${event.clientY - widgetOffsetY}px`;
      return;
    }

    if (isDraggingSelection) {
      updateSelectionBox(event.pageX, event.pageY);
      autoScroll(event);
      startAutoScroll(event);
    }
  }

  function onDragSelectionEnd(event) {
    window.removeEventListener('mousemove', onDragSelectMove);
    window.removeEventListener('mouseup', onDragSelectionEnd);
    stopAutoScroll;
    if (isDraggingWidget) {
      isDraggingWidget = false;
      return;
    }

    if (isDraggingSelection) {
      isDraggingSelection = false;

      const allElements = document.querySelectorAll(
        'a, button, input, textarea, select, [onclick], [role="button"], [tabindex]'
      );

      allElements.forEach(element => {
        if (
          isInteractive(element) &&
          isElementInSelection(element) &&
          !selectedElements.has(element)
        ) {
          selectedElements.set(element, '');
          element.style.outline = defaultOutlineStyle;
        }
      });

      document.body.removeChild(selectionBox);
      restoreTextSelection();
      stopAutoScroll();

      createWidget();
      updateWidgetContent();
    }
  }

  // Selection box
  function createSelectionBox() {
    selectionBox = new ElementBuilder('div')
      .setAttributes({ id: 'selection_box' })
      .setStyle({
        position: 'absolute',
        border: '2px dashed blue',
        backgroundColor: 'rgba(173, 216, 230, 0.3)',
      })
      .appendTo(document.body)
      .getElement();
  }

  function updateSelectionBox(pageX, pageY) {
    const width = Math.abs(pageX - startX);
    const height = Math.abs(pageY - startY);
    Object.assign(selectionBox.style, {
      width: `${width}px`,
      height: `${height}px`,
      left: `${Math.min(pageX, startX)}px`,
      top: `${Math.min(pageY, startY)}px`,
    });
  }

  // Widget
  function createWidget() {
    if (widget) {
      return;
    }

    // Create the widget container
    widget = new ElementBuilder('div')
      .setAttributes({ id: 'widget' })
      .getElement();

    // Create top bar, second bar, and content
    createTopBar(widget);
    createSecondBar(widget);
    createWidgetContent(widget); // Using the extracted function
    createExportButtons(widget);

    // Append widget to the body
    document.body.appendChild(widget);
  }

  function createTopBar(widget) {
    const fragment = document.createDocumentFragment();

    // Create widgetTopBar
    const widgetTopBar = new ElementBuilder('div')
      .setAttributes({ id: 'widget-top-bar' })
      .addHTMLContent('<span>Selected Elements</span>')
      .getElement();

    // Selection Buttons Container
    const selectionButtonsContainer = new ElementBuilder('div')
      .addClass('widget-topbar-action-buttons-container')
      .getElement();

    // Single Select Button
    const singleSelectButton = new ElementBuilder('button')
      .addClass(
        'widget-topbar-selection-button',
        'widget-topbar-single-select-button'
      )
      .addHTMLContent(
        `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" width="100%" height="100%">
        <rect x="1.6" y="1.5" width="12.6" height="12.7" rx="1" stroke="#000" stroke-width="1.5" fill="currentColor"></rect>
        <rect x="4" y="4" width="8" height="1.5" rx="0.2" stroke="#000" fill="currentColor"></rect>
        <rect x="7" y="7" width="8" height="8" fill="currentColor"></rect>
        <path d="M8 15V8H15M8 8L14 14" stroke="#000" stroke-width="1.5" id="arrow"></path>
      </svg>`
      )
      .addEventListener('click', toggleSingleSelectMode)
      .getElement();

    // Drag Select Button
    const dragSelectButton = new ElementBuilder('button')
      .addClass(
        'widget-topbar-selection-button',
        'widget-topbar-drag-select-button'
      )
      .addHTMLContent(
        `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" width="100%" height="100%">
        <rect x="1.6" y="1.5" width="12.6" height="12.7" rx="1" stroke="#000" stroke-width="1.5" fill="currentColor"></rect>
        <rect x="4" y="4" width="2" height="2" rx="0.2" fill="#000"></rect>
        <rect x="7" y="4" width="2" height="2" rx="0.2" fill="#000"></rect>
        <rect x="10" y="4" width="2" height="2" rx="0.2" fill="#000"></rect>
        <rect x="4" y="7" width="2" height="2" rx="0.2" fill="#000"></rect>
        <rect x="4" y="10" width="2" height="2" rx="0.2" fill="#000"></rect>
      </svg>`
      )
      .addEventListener('click', toggleDragSelectMode)
      .getElement();

    selectionButtonsContainer.append(singleSelectButton, dragSelectButton);
    widgetTopBar.appendChild(selectionButtonsContainer);

    // Action Buttons Container
    const actionButtonsContainer = new ElementBuilder('div')
      .addClass('widget-topbar-action-buttons-container')
      .getElement();

    // Minimize Button
    const minimizeButton = new ElementBuilder('button')
      .addClass('widget-topbar-action-button', 'widget-topbar-minimise-button')
      .setAttributes({
        id: ':4i4',
        alt: 'Minimise',
        'aria-label': 'Minimise',
        'data-tooltip-delay': '800',
        'data-tooltip': 'Minimise',
      })
      .addEventListener('click', () => {
        isMinimized = !isMinimized;
        widgetContent.style.display = isMinimized ? 'none' : 'block';
        widget.style.width = isMinimized ? '328px' : '510px';
      })
      .getElement();

    // Expand and Unexpand Buttons
    const expandButton = new ElementBuilder('button')
      .addClass('widget-topbar-action-button', 'widget-topbar-expand-button')
      .setAttributes({
        id: ':4g4',
        alt: 'Pop-out',
        'aria-label': 'Exit full screen (Shift for pop-out)',
        'data-tooltip-delay': '800',
        'data-tooltip': 'Exit full screen (Shift for pop-out)',
      })
      .addEventListener('click', toggleMaximizeWidget)
      .addEventListener('click', () => {
        expandButton.style.display = 'none';
        unexpandButton.style.display = 'inline-block';
      })
      .getElement();

    const unexpandButton = new ElementBuilder('button')
      .addClass('widget-topbar-action-button', 'widget-topbar-unexpand-button')
      .setAttributes({
        id: ':4g4',
        alt: 'Full screen',
        'aria-label': 'Full screen (Shift for pop-out)',
        'data-tooltip-delay': '800',
        'data-tooltip': 'Full screen (Shift for pop-out)',
      })
      .addEventListener('click', toggleMaximizeWidget)
      .addEventListener('click', () => {
        unexpandButton.style.display = 'none';
        expandButton.style.display = 'inline-block';
      })
      .setStyle({ display: 'none' })
      .getElement();

    // Close Button
    const closeButton = new ElementBuilder('button')
      .addClass('widget-topbar-action-button', 'widget-topbar-close-button')
      .setAttributes({
        id: ':4g5',
        alt: 'Close',
        'aria-label': 'Save & close',
        'data-tooltip-delay': '800',
        'data-tooltip': 'Save & close',
      })
      .addEventListener('click', toggleWidgetActivation)
      .getElement();

    actionButtonsContainer.append(
      minimizeButton,
      expandButton,
      unexpandButton,
      closeButton
    );
    widgetTopBar.appendChild(actionButtonsContainer);

    fragment.appendChild(widgetTopBar);
    widget.appendChild(fragment);
  }

  function createSecondBar(widget) {
    const fragment = document.createDocumentFragment();

    // Create second bar container
    const secondBar = new ElementBuilder('div')
      .addClass('second-bar')
      .getElement();

    // Create "Select All" checkbox
    const selectAllCheckbox = new ElementBuilder('input')
      .setAttributes({ type: 'checkbox', name: 'Select All' })
      .addEventListener('change', handleSelectAll)
      .getElement();

    // Create dynamic buttons container
    dynamicButtonsContainer = new ElementBuilder('div')
      .addClass('dynamic-buttons-container')
      .getElement();

    // Create Settings button
    const settingsButton = new ElementBuilder('button')
      .addTextContent('⚙️')
      .setAttributes({ name: 'Settings' })
      .setStyle({ border: 'none', cursor: 'pointer' })
      .addEventListener('click', toggleSettingsOverlay)
      .getElement();

    // Append all elements to second bar
    secondBar.append(
      selectAllCheckbox,
      dynamicButtonsContainer,
      settingsButton
    );

    // Append second bar to fragment and then to the widget
    fragment.appendChild(secondBar);
    widget.appendChild(fragment);
  }

  // Extracted function to create widget content
  function createWidgetContent(parent) {
    if (widgetContent) return;
    widgetContent = new ElementBuilder('div')
      .addClass('widget-content')
      .appendTo(parent)
      .getElement();

    updateWidgetContent();
    parent.appendChild(widgetContent);
  }

  function createListItem(element, value) {
    const li = document.createDocumentFragment();

    // Create list item container
    const itemContainer = new ElementBuilder('div')
      .addClass('selectorListItem')
      .appendTo(li)
      .getElement();

    // Checkbox for selection
    new ElementBuilder('input')
      .setAttributes({
        type: 'checkbox',
        checked: widgetSelectedItems.has(element),
      })
      .addClass('widget-item-checkbox')
      .addEventListener('change', e => {
        const checked = e.target.checked;
        if (checked) {
          widgetSelectedItems.add(element);
        } else {
          widgetSelectedItems.delete(element);
        }
        updateSelectAllCheckbox();
        updateDynamicButtons();
      })
      .appendTo(itemContainer);

    // Input for the selector name
    const selectorNameInput = new ElementBuilder('input')
      .setAttributes({
        type: 'text',
        placeholder: 'Enter Key Name',
        value: value,
      })
      .setStyle({ width: '150px' })
      .addEventListener('blur', e => {
        const val = e.target.value;
        const suffix = getSuffix(element);
        const finalSuffix = val.endsWith(suffix) ? '' : suffix;
        const keyName = toCamelCase(val) + finalSuffix;
        selectedElements.set(element, keyName);
      })
      .appendTo(itemContainer);

    // Element identifier
    new ElementBuilder('span')
      .addClass('selector-identifier')
      .addTextContent(getElementIdentifier(element))
      .appendTo(itemContainer);

    // Delete button
    new ElementBuilder('button')
      .addTextContent('Delete')
      .addClass('delete-row-button')
      .addEventListener('click', () => {
        deleteListItem(element, itemContainer);
      })
      .appendTo(itemContainer);

    // Hover and focus listeners to highlight the element
    itemContainer.addEventListener('mouseenter', () =>
      highlightElement(element)
    );
    itemContainer.addEventListener('mouseleave', () =>
      unhighlightElement(element)
    );
    selectorNameInput.addEventListener('focus', () =>
      highlightElement(element)
    );
    selectorNameInput.addEventListener('blur', () =>
      unhighlightElement(element)
    );

    return li;
  }

  function addListItem(element, value) {
    const listItem = createListItem(element, value);
    widgetContentFragment.appendChild(listItem);
  }

  function deleteListItem(element, itemContainer) {
    selectedElements.delete(element);
    element.style.outline = '';
    itemContainer.remove();
  }

  function updateWidgetContent() {
    widgetContent.innerHTML = '';
    widgetContentFragment = document.createDocumentFragment();

    selectedElements.forEach((value, element) => {
      addListItem(element, value);
    });

    widgetContent.appendChild(widgetContentFragment);
  }

  function createExportButtons(widget) {
    const fragment = document.createDocumentFragment();

    // Create the button container
    const buttonContainer = new ElementBuilder('div')
      .addClass('export-buttons-container')
      .getElement();

    // Helper function to create export buttons
    const createButton = (text, className, exportType) => {
      return new ElementBuilder('button')
        .addTextContent(`${text} ↗️`)
        .addClass('exportButton', className)
        .addEventListener('click', () => toggleExportOverlay(exportType))
        .getElement();
    };

    // Create and append all export buttons
    buttonContainer.append(
      createButton('Selectors', 'exportSelectorButton', 'selectors'),
      createButton('Data', 'exportDataButton', 'data'),
      createButton('Actions', 'exportActionButton', 'actions'),
      createButton('Assertions', 'exportAssertionsButton', 'assertions')
    );

    // Append the button container to the fragment and then to the widget
    fragment.appendChild(buttonContainer);
    widget.appendChild(fragment);
  }

  function toggleMaximizeWidget() {
    isMaximized = !isMaximized;
    if (isMaximized) {
      widget.style.position = 'fixed';
      widget.style.top = 0;
      widget.style.left = 0;
      widget.style.width = '100vw';
      widget.style.height = '100vh';
      widget.style.zIndex = 10001; // Ensure it's on top of everything
      widgetContent.style.maxHeight = '90vh';
    } else {
      widget.style.position = 'fixed';
      widget.style.bottom = '10px';
      widget.style.right = '10px';
      widget.style.width = '400px';
      widget.style.height = 'auto';
      widgetContent.style.maxHeight = '100vh';
    }
  }

  function handleSelectAll(event) {
    const isChecked = event.target.checked;
    widgetSelectedItems.clear();
    if (isChecked) {
      selectedElements.forEach((_, key) => {
        widgetSelectedItems.add(key);
      });
    }

    updateDynamicButtons();
  }

  function updateSelectAllCheckbox() {
    const selectedItemsSize = selectedElements.size;
    const widgetSelectedItemsSize = widgetSelectedItems.size;
    const selectAllCheckbox = secondBar.querySelector('input[type="checkbox"]');
    selectAllCheckbox.checked = widgetSelectedItemsSize === selectedItemsSize;
    selectAllCheckbox.indeterminate =
      widgetSelectedItemsSize > 0 &&
      widgetSelectedItemsSize < selectedItemsSize;
  }

  function updateDynamicButtons() {
    // Helper function to create a button and append to fragment

    const createButton = (text, className, eventHandler, fragment) => {
      new ElementBuilder('button')
        .addTextContent(text)
        .addClass(className)
        .addEventListener('click', eventHandler)
        .appendTo(fragment);
    };

    // Handle copying selected elements to clipboard
    const handleCopy = () => {
      const exportData = {};
      const source =
        widgetSelectedItems.size < 1 ? selectedElements : widgetSelectedItems;

      source.forEach((value, element) => {
        const selectorName = selectedElements.get(element) || value;
        exportData[selectorName] = getSelector(element);
      });

      console.log('Copied Data:', exportData);
      navigator.clipboard.writeText(JSON.stringify(exportData));
    };

    // Handle deletion of selected items
    const handleDeleteAll = () => {
      selectedElements = new Map(
        [...selectedElements].filter(([element]) => {
          if (widgetSelectedItems.has(element)) {
            element.style.outline = '';
            return false;
          }
          return true;
        })
      );
      widgetSelectedItems.clear();
      updateWidgetContent();
    };

    // Handle grouping selected items
    const handleGroup = () => {
      const groupName = prompt('Enter Group Name:');
      if (groupName) {
        widgetSelectedItems.forEach(element =>
          selectedElements.set(element, groupName)
        );
        updateWidgetContent();
        updateDynamicButtons();
      }
    };

    // Clear dynamic buttons container
    dynamicButtonsContainer.innerHTML = '';

    // Create a DocumentFragment to batch DOM updates
    const fragment = document.createDocumentFragment();

    // Add buttons to the fragment if there are selected items
    if (widgetSelectedItems.size > 0) {
      createButton('Delete All', 'delete-button', handleDeleteAll, fragment);
      createButton('Copy', 'copy-button', handleCopy, fragment);
      createButton('Group', 'group-button', handleGroup, fragment);
    }

    // Append the fragment to the dynamic buttons container
    dynamicButtonsContainer.appendChild(fragment);
  }

  // export functions
  function exportSelectors() {
    const exportSelectorsObject = {};
    selectedElements.forEach((keyName, element) => {
      if (keyName) {
        exportSelectorsObject[keyName] = getSelector(element);
      }
    });

    return exportSelectorsObject;
  }

  function exportElementValue(element) {
    let value = '';

    if (element.tagName === 'INPUT') {
      if (
        element.type === 'text' ||
        element.type === 'email' ||
        element.type === 'password' ||
        element.type === 'search'
      ) {
        value = element.value;
      } else if (element.type === 'checkbox' || element.type === 'radio') {
        value = element.checked;
      }
    } else if (element.tagName === 'TEXTAREA') {
      value = element.value;
    } else if (element.tagName === 'SELECT') {
      const selectedOption = element.options[element.selectedIndex];
      value = selectedOption ? selectedOption.textContent : '';
    } else if (element.tagName === 'BUTTON') {
      value = element.textContent;
    }
    return value;
  }

  function exportData() {
    const exportDataobject = {};
    selectedElements.forEach((selectorName, element) => {
      let elementValue = exportElementValue(element);
      if (selectorName) {
        exportDataobject[selectorName] = elementValue;
      }
    });

    return exportDataobject;
  }

  function exportActions() {
    let actions = [['selector', 'type', 'value']];

    selectedElements.forEach((selectorName, element) => {
      const action = getActionType(element); // Get action type (text, mark, click, select)
      const elementValue = exportElementValue(element); // Retrieve exported data

      if (selectorName) {
        actions.push([selectorName, action, elementValue]);
      }
    });
    const formattedTable = formatTable(actions);
    return formattedTable; // Return string with proper newlines
  }

  function exportAssertions() {
    let assertions = [['selector', 'states', 'value']]; // Add \n for new line

    selectedElements.forEach((selectorName, element) => {
      const states = getElementState(element); // Get the state of the element
      const elementValue = exportElementValue(element); // Retrieve exported data

      if (selectorName) {
        assertions.push([selectorName, states, elementValue]);
      }
    });
    const formattedTable = formatTable(assertions);
    return formattedTable; // Return string with proper newlines
  }

  function formatTable(rows) {
    // Find the maximum width for each column
    const colWidths = rows[0].map((_, colIndex) =>
      Math.max(...rows.map(row => row[colIndex].length))
    );

    // Format each row to align the columns with pipes at the start and end
    return rows
      .map(
        row =>
          '| ' +
          row
            .map((cell, colIndex) => String(cell).padEnd(colWidths[colIndex]))
            .join(' | ') +
          ' |'
      )
      .join('\n');
  }

  // export modal
  function toggleExportOverlay(contentType) {
    exportOverlay = document.getElementById('export-overlay');
    let fileName;
    let copyButton;

    if (contentType === 'selectors') {
      fileName = 'export-selectors.json';
    } else if (contentType === 'data') {
      fileName = 'export-data.json';
    } else if (contentType === 'actions') {
      fileName = 'export-actions.json';
    } else if (contentType === 'assertions') {
      fileName = 'export-assertions.json';
    }

    if (!exportOverlay) {
      // Create overlay
      exportOverlay = new ElementBuilder('div')
        .setAttributes({ id: 'export-overlay' })
        .appendTo(document.body)
        .getElement();

      // Create container
      const exportContainer = new ElementBuilder('div')
        .setAttributes({ id: 'export-container' })
        .appendTo(exportOverlay)
        .getElement();

      // Create close button
      new ElementBuilder('button')
        .addTextContent('Close')
        .addClass('export-close-button')
        .addEventListener('click', () => {
          exportOverlay.style.display = 'none';
        })
        .appendTo(exportContainer);

      const newFilenameContainer = new ElementBuilder('div')
        .setAttributes({ id: 'filename-container', class: '' })
        .appendTo(exportContainer)
        .getElement();

      // Create input for file name
      new ElementBuilder('input')
        .setAttributes({ id: 'export-filename', value: fileName, type: 'text' })
        .appendTo(newFilenameContainer)
        .getElement();

      // Create Export button
      new ElementBuilder('button')
        .addTextContent('Export to JSON')
        .addClass('export-json-button')
        .addEventListener('click', () => {
          const exportName = document.getElementById('export-filename').value;
          const data = document.getElementById('export-textarea').value;

          // Function to download the content as JSON
          const downloadObjectAsJson = (exportObj, exportName) => {
            const dataStr =
              'data:text/json;charset=utf-8,' + encodeURIComponent(exportObj);
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute('href', dataStr);
            downloadAnchorNode.setAttribute('download', exportName);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
          };

          downloadObjectAsJson(data, exportName); // Call the function to download the file
        })
        .appendTo(newFilenameContainer)
        .getElement();

      // Create textarea for displaying exported content
      const exportTextAreaContainer = new ElementBuilder('div')
        .setStyle({
          position: 'relative', // To position the copy button inside this container
        })
        .appendTo(exportContainer)
        .getElement();

      new ElementBuilder('textarea')
        .setAttributes({ id: 'export-textarea', readonly: 'true' })
        .appendTo(exportTextAreaContainer)
        .getElement();

      // Create Copy button positioned inside the textarea container
      copyButton = new ElementBuilder('button')
        .addTextContent('Copy')
        .addClass('copy-text-area-button')
        .addEventListener('click', () => {
          const textArea = document.getElementById('export-textarea');
          const textToCopy = textArea.value;

          // Use the Clipboard API to copy the text
          navigator.clipboard
            .writeText(textToCopy)
            .then(() => {
              // Temporarily change button text to "Copied" with animation
              copyButton.textContent = 'Copied!';
              copyButton.classList.add('copied');
              setTimeout(() => {
                copyButton.textContent = 'Copy';
                copyButton.classList.remove('copied');
              }, 1000); // Revert back to "Copy" after 500ms
            })
            .catch(err => {
              console.error('Failed to copy text: ', err);
            });
        })
        .appendTo(exportTextAreaContainer) // Append inside the textarea container
        .getElement();
    }

    // Set overlay content based on the contentType requested (selectors, data, actions, assertions)
    const exportTextArea = document.getElementById('export-textarea');
    let data;

    if (contentType === 'selectors') {
      data = exportSelectors();
    } else if (contentType === 'data') {
      data = exportData();
    } else if (contentType === 'actions') {
      data = exportActions();
    } else if (contentType === 'assertions') {
      data = exportAssertions();
    }

    // Remove escape characters from JSON when displaying
    if (typeof data === 'object') {
      data = JSON.stringify(data, null, 2)
        .replace(/\\n/g, '\n') // Remove escaped newlines
        .replace(/\\t/g, '\t') // Remove escaped tabs
        .replace(/\\"/g, '"') // Unescape double quotes
        .replace(/\\\\/g, '\\'); // Unescape backslashes
    }
    exportTextArea.value = data;
    // Auto-populate the file name based on the content type
    document.getElementById('export-filename').value = fileName;

    // Show the overlay
    exportOverlay.style.display = 'flex';
  }

  // Settings modal
  function toggleSettingsOverlay() {
    let settingsOverlay = document.getElementById('settings-overlay');
    if (!settingsOverlay) {
      settingsOverlay = new ElementBuilder('div')
        .setAttributes({ id: 'settings-overlay' })
        .appendTo(document.body)
        .getElement();

      const settingsContainer = new ElementBuilder('div')
        .setAttributes({ id: 'settings-container' })
        .appendTo(settingsOverlay)
        .getElement();

      new ElementBuilder('button')
        .addTextContent('Close')
        .addEventListener('click', toggleSettingsOverlay)
        .appendTo(settingsContainer);

      new ElementBuilder('label')
        .addTextContent('Sort/Filter Elements by:')
        .setStyle({ display: 'block', marginBottom: '10px' })
        .appendTo(settingsContainer);

      new ElementBuilder('select')
        .addHTMLContent(
          `
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
          <option value="disabled">Disabled</option>
          <option value="focusable">Focusable</option>
        `
        )
        .appendTo(settingsContainer);

      new ElementBuilder('select')
        .addHTMLContent(
          `
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
          <option value="disabled">Disabled</option>
          <option value="focusable">Focusable</option>
          <option value="focusable">Inside iframe</option>
          <option value="focusable">Inside shadow dom</option>
          <option value="focusable">Inside iframe or shadow dom</option>
        `
        )
        .appendTo(settingsContainer);

      new ElementBuilder('div')
        .addHTMLContent(
          `
          <ul>
          <li>Show the sorting button in the </li>
          <li>Show the jsonviewer and editor</li>
          <li>Export to file or console when exporting</li>
          </ul>
        `
        )
        .appendTo(settingsContainer);
    }

    settingsOverlay.style.display =
      settingsOverlay.style.display === 'none' || !settingsOverlay.style.display
        ? 'flex'
        : 'none';
  }

  // Add keyboard listeners for activating/deactivating the widget
  function addKeyboardShortcuts() {
    window.addEventListener('keydown', handleKeydown);
  }

  // Remove keyboard listeners for activating/deactivating the widget
  function removeKeyboardShortcuts() {
    window.removeEventListener('keydown', handleKeydown);
  }

  function handleKeydown(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'H') {
      toggleWidgetActivation();
    }
  }

  // Initialize the widget with drag select as the default tool
  function initWidget() {
    toggleWidgetActivation();
    toggleDragSelectMode(); // Default to drag select
    addKeyboardShortcuts();
    console.log(
      'Hold and drag the mouse to select interactive elements. A widget will show the selected items.'
    );
  }

  // TODO Add all type of event listeners in the widget only
  // TODO communicate with other libs using events or message.
  // TODO Add the icon for the dom navigation by side of drag select.
  // TODO Add the new toll for activation and deactivation of dom navigation, refresh and more, it may even have dropdown???.
  // TODO Add the filter option in the second toolbar.
  // TODO Add "displayItems" Map() for items after all kind of filter operations, or pagination.
  // TODO Modify the selectedItems to the "storeItems" Map()
  // TODO Add a new library integration for the xpath

  // Initialize the widget
  initWidget();
})();
