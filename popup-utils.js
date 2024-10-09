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

  // Create the popup
  const createPopup = () => {
    const popup = (_popup = document.createElement("div"));
    popup.setAttribute("id", "highlighter_popup");
    popup.setAttribute("class", "popup");
    Object.entries({
      boxShadow: "rgb(33, 65, 16) 0px 0px 5px",
      position: "fixed",
      display: "none",
      pointerEvents: "none",
      zIndex: 999999999,
      opacity: 0.98,
      transition: "0.1s",
      borderWidth: "1px !important",
      borderStyle: "solid !important",
      borderColor: "rgb(4, 71, 255) !important",
      borderImage: "initial !important",
    }).forEach(([key, value]) => (popup.style[key] = value));

    getContainer().appendChild(_popup);
    return popup;
  };

  // Create the element identifier
  const createIdentifier = () => {
    if (!_identifier) {
      _identifier = document.createElement("div");
      _identifier.setAttribute("id", "element_identifier");
      _identifier.style.position = "absolute"; // Updated to absolute for easy positioning
      _identifier.style.zIndex = 999999999;
      _identifier.style.pointerEvents = "none";
      _identifier.style.backgroundColor = "#fff";
      _identifier.style.color = "#333";
      _identifier.style.padding = "10px";
      _identifier.style.borderRadius = "5px";
      _identifier.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
      _identifier.style.fontSize = "12px";
      _identifier.style.fontFamily = "Arial, sans-serif";
      _identifier.style.lineHeight = "1.5";
      _identifier.style.border = "1px solid #e0e0e0";
      document.body.appendChild(_identifier);
    }
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

  // Highlighter Popup Creation
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

  // Throttle the update function for performance optimization
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
        lastFunc = setTimeout(function () {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
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

  // Traverse forward using TreeWalker
  const traverseForward = () => {
    const nextNode = _treeWalker.nextNode();
    if (nextNode) {
      attachPopup(nextNode);
    } else {
      alert("Reached the last element in the DOM.");
    }
  };

  // Traverse backward using TreeWalker
  const traverseBackward = () => {
    const prevNode = _treeWalker.previousNode();
    if (prevNode) {
      attachPopup(prevNode);
    } else {
      alert("Reached the first element in the DOM.");
    }
  };

  // Initialize the popup update on scroll or resize
  const init = () => {
    const throttledUpdatePopup = throttle(updatePopup, 100);

    window.addEventListener("scroll", throttledUpdatePopup);
    window.addEventListener("resize", throttledUpdatePopup);

    // document.addEventListener("DOMContentLoaded", function () {
    //   updatePopup();
    // });
  };

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
  e.preventDefault();
  popupUtils.attachPopup(e.target);
  popupUtils.init();
  popupUtils.initTreeWalker(e.target); // Initialize TreeWalker with the hovered element as the root
});
