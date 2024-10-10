const popupUtils = (() => {
  let _element, _popup, _identifier, _treeWalker;

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

  // Create the container to hold the popup
  const getContainer = () => {
    let xPathContainer = document.querySelector("#xPathContainer");
    if (xPathContainer) {
      return xPathContainer;
    }
    xPathContainer = document.createElement("div");
    xPathContainer.setAttribute("id", "xPathContainer");
    document.querySelector("body").appendChild(xPathContainer);
    return xPathContainer;
  };

  // Create the highlighter popup
  const createHighlighterPopup = () => {
    const highlighter = document.createElement("div");
    highlighter.setAttribute("id", "highlighter_popup");
    highlighter.style.position = "absolute";
    highlighter.style.pointerEvents = "none";
    highlighter.style.zIndex = 999999998; // Slightly lower z-index to sit behind the identifier
    highlighter.style.border = "2px solid #4CAF50"; // Highlight border
    highlighter.style.background = "rgba(76, 175, 80, 0.2)"; // Semi-transparent background
    document.body.appendChild(highlighter);
    return highlighter;
  };

  // Create the element identifier popover
  const createIdentifier = () => {
    const identifier = document.createElement("div");
    identifier.setAttribute("id", "element_identifier");
    identifier.style.position = "absolute";  // Updated to absolute for easy positioning
    identifier.style.zIndex = 999999999;
    identifier.style.pointerEvents = "none";
    identifier.style.backgroundColor = "#fff";
    identifier.style.color = "#333";
    identifier.style.padding = "10px";
    identifier.style.borderRadius = "5px";
    identifier.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    identifier.style.fontSize = "12px";
    identifier.style.fontFamily = "Arial, sans-serif";
    identifier.style.lineHeight = "1.5";
    identifier.style.border = "1px solid #e0e0e0";
    document.body.appendChild(identifier);
    return identifier;
  };

  // Function to build a robust identifier (like in developer tools)
  const buildElementIdentifier = (element) => {
    let identifierHTML = "";

    // Main element identifier with tag name, class, id, and dimensions
    const tagName = element.tagName.toLowerCase();
    const classList = element.classList.length
      ? `.${[...element.classList].join(".")}`
      : "";
    const id = element.id ? `#${element.id}` : "";
    const rect = element.getBoundingClientRect();
    const dimensions = `${rect.width.toFixed(2)} × ${rect.height.toFixed(2)}`;

    identifierHTML += `<div style="font-weight: bold; color: #0074D9;">${tagName}${id}${classList}</div>`;
    identifierHTML += `<div>${dimensions}</div>`;

    // Extracting style properties
    const computedStyles = window.getComputedStyle(element);
    const color = computedStyles.color;
    const fontFamily = computedStyles.fontFamily;
    const fontSize = computedStyles.fontSize;
    const backgroundColor = computedStyles.backgroundColor;
    const margin = computedStyles.margin;
    const padding = computedStyles.padding;

    identifierHTML += `<div><strong>Color</strong>: <span style="background-color: ${color}; padding: 0 5px; color: white;">${color}</span></div>`;
    identifierHTML += `<div><strong>Font</strong>: ${fontSize} "${fontFamily}"</div>`;
    identifierHTML += `<div><strong>Background</strong>: ${backgroundColor}</div>`;
    identifierHTML += `<div><strong>Margin</strong>: ${margin}</div>`;
    identifierHTML += `<div><strong>Padding</strong>: ${padding}</div>`;

    // Accessibility properties
    const role = element.getAttribute("role");
    const accessibleName =
      element.getAttribute("aria-label") || element.getAttribute("name");
    const isKeyboardFocusable = computedStyles.outline !== "none";

    identifierHTML += "<div><strong>ACCESSIBILITY</strong></div>";
    if (accessibleName) identifierHTML += `<div>Name: ${accessibleName}</div>`;
    if (role) identifierHTML += `<div>Role: ${role}</div>`;
    identifierHTML += `<div>Keyboard-focusable: ${
      isKeyboardFocusable ? "✔️" : "❌"
    }</div>`;

    // Additional ARIA attributes
    const ariaHidden = element.getAttribute("aria-hidden");
    const ariaExpanded = element.getAttribute("aria-expanded");

    if (ariaHidden !== null) identifierHTML += `<div>aria-hidden: ${ariaHidden}</div>`;
    if (ariaExpanded !== null) identifierHTML += `<div>aria-expanded: ${ariaExpanded}</div>`;

    return identifierHTML;
  };

  // Adjust the popover position based on available space
  const adjustPopoverPosition = (element, popover) => {
    const rect = element.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = rect.top - popoverRect.height - 10; // Default to top
    let left = rect.left;

    // Check if there's enough space above, otherwise show at the bottom
    if (top < 0) {
      top = rect.bottom + 10; // Show below the element
    }

    // Check if the popover goes out of the viewport horizontally
    if (left + popoverRect.width > viewportWidth) {
      left = viewportWidth - popoverRect.width - 10; // Adjust to stay within the viewport
    } else if (left < 0) {
      left = 10; // Prevent overflow to the left
    }

    // Set the calculated position
    popover.style.top = `${top + window.scrollY}px`;
    popover.style.left = `${left + window.scrollX}px`;
  };

  // Set popup and identifier attributes
  const setPopupAttribs = () => {
    if (!_popup) {
      throw new Error("Popup missing");
    }
    if (!_element) {
      throw new Error("Please select the element");
    }

    // Get the bounding rectangle of the element
    const rect = _element.getBoundingClientRect();

    // Adjust the position based on the scroll offsets
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // Highlighter Popup: Position around the element
    _popup.style.left = rect.left + scrollLeft + "px";
    _popup.style.top = rect.top + scrollTop + "px";
    _popup.style.width = rect.width + "px";
    _popup.style.height = rect.height + "px";
    _popup.style.display = "block";

    // Build the detailed identifier content
    _identifier.innerHTML = buildElementIdentifier(_element);

    // Adjust the position of the identifier
    adjustPopoverPosition(_element, _identifier);
  };

  // Attach the popup to the current element (both highlighter and identifier)
  const attachPopup = (element) => {
    _element = element;
    _popup =
      document.querySelector("#highlighter_popup") || createHighlighterPopup();
    _identifier =
      document.querySelector("#element_identifier") || createIdentifier();
    setPopupAttribs();
  };

  // Update the popup position
  const updatePopup = () => {
    setPopupAttribs();
  };

  // Throttle function with immediate execution
  const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function () {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();  // Immediate execution
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function () {
          func.apply(context, args);
          lastRan = Date.now();
        }, limit);
      }
    };
  };

  // Initialize TreeWalker
  const initTreeWalker = (rootElement) => {
    const filter = {
      acceptNode: (node) => {
        // Skip <script>, <style>, and non-visible elements
        if (node.tagName === "SCRIPT" || node.tagName === "STYLE") {
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
      attachPopup(nextNode);
    } else {
      alert("Reached the last element in the DOM.");
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
      alert("Reached the first element in the DOM.");
    }
  };

  // Check if the element is valid
  const isValidElement = (element) => {
    return element && element.nodeType === Node.ELEMENT_NODE;
  };

  // Initialize the popup update on scroll or resize
  const init = () => {
    const throttledUpdatePopup = throttle(updatePopup, 100);
    window.addEventListener("scroll", throttledUpdatePopup);
    window.addEventListener("resize", throttledUpdatePopup);
  };

  // Throttle the mouseover event to prevent excessive updates
  const throttleMouseover = throttle((e) => {
    e.preventDefault();
    popupUtils.attachPopup(e.target);
    popupUtils.init();
    popupUtils.initTreeWalker(e.target);
  }, 100);

  // Add event listener for keydown to navigate through elements
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp":
        traverseBackward();
        break;
      case "ArrowDown":
        traverseForward();
        break;
      case "ArrowLeft":
        traverseBackward();
        break;
      case "ArrowRight":
        traverseForward();
        break;
    }
  });

  return {
    init,
    attachPopup,
    updatePopup,
    initTreeWalker,
  };
})();

// Mouseover event to highlight elements and show popup
document.addEventListener("mouseover", (e) => {
  popupUtils.attachPopup(e.target);
  popupUtils.init();
  popupUtils.initTreeWalker(e.target); // Initialize TreeWalker with the hovered element as the root
});
