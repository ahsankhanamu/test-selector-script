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
      _identifier.style.position = "fixed";
      _identifier.style.zIndex = 999999999;
      _identifier.style.pointerEvents = "none";
      _identifier.style.backgroundColor = "#1d1f21";
      _identifier.style.color = "#fff";
      _identifier.style.padding = "5px 10px";
      _identifier.style.borderRadius = "3px";
      _identifier.style.boxShadow = "0 0 5px rgba(0,0,0,0.5)";
      _identifier.style.fontSize = "12px";
      _identifier.style.fontFamily = "monospace";
      _identifier.style.lineHeight = "1.5";
      document.body.appendChild(_identifier);
    }
  };

  // Function to build a robust identifier (like in developer tools)
  const buildElementIdentifier = (element) => {
    let identifier = `<${element.tagName.toLowerCase()}`;

    // Add the ID (if present)
    if (element.id) {
      identifier += ` id="${element.id}"`;
    }

    // Add the class(es) (if present)
    if (element.classList.length > 0) {
      identifier += ` class="${[...element.classList].join(" ")}"`;
    }

    // Add relevant attributes (like type, src, href, etc.)
    const importantAttributes = ["type", "src", "href", "alt", "title", "name"];
    importantAttributes.forEach((attr) => {
      if (element.getAttribute(attr)) {
        identifier += ` ${attr}="${element.getAttribute(attr)}"`;
      }
    });

    // Close the tag representation
    identifier += ">";

    // Add element dimensions and position
    const rect = element.getBoundingClientRect();
    identifier += ` [${Math.round(rect.width)}x${Math.round(
      rect.height
    )}] at (${Math.round(rect.left)}, ${Math.round(rect.top)})`;

    return identifier;
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
    const scrollLeft = 0;
    const scrollTop = 0;

    // Set the popup position relative to the document, accounting for scroll
    _popup.style.left = rect.left + scrollLeft + "px";
    _popup.style.top = rect.top + scrollTop + "px";
    _popup.style.width = rect.width + "px";
    _popup.style.height = rect.height + "px";
    _popup.style.display = "block";

    // Set the identifier content and position it just above the popup
    _identifier.innerHTML = buildElementIdentifier(_element);
    _identifier.style.left = rect.left + scrollLeft + "px";
    _identifier.style.top = rect.top + scrollTop - 30 + "px"; // Position above the element
    _identifier.style.display = "block";
  };

  // Attach the popup to the current element
  const attachPopup = (element) => {
    _element = element;
    _popup = document.querySelector("#highlighter_popup") || createPopup();
    createIdentifier();
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

    document.addEventListener("DOMContentLoaded", function () {
      updatePopup();
    });
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
