(function () {
  let startX, startY, selectionBox;
  let selectedElements = new Map(); // Use Map to store key-value pairs
  let scrollSpeed = 20;
  let popup,
    popupTopBar,
    popupContent,
    isMinimized = false;
  let isDraggingPopup = false;
  let isDraggingSelection = false;
  let scrollInterval;
  let popupOffsetX = 0,
    popupOffsetY = 0;

  // Default and hover outline styles
  const defaultOutlineStyle = "2px solid blue";
  const hoverOutlineStyle = "3px dashed orange";

  // Prevent text selection during dragging
  function preventTextSelection() {
    document.body.style.userSelect = "none";
  }

  // Restore text selection after dragging
  function restoreTextSelection() {
    document.body.style.userSelect = "";
  }

  // Utility function to convert text to camelCase
  function toCamelCase(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
        index === 0 ? match.toLowerCase() : match.toUpperCase()
      )
      .replace(/\s+/g, "");
  }

  // Generate a unique string format for each element
  function getElementIdentifier(element) {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    const className = element.classList.length
      ? `.${[...element.classList].join(".")}`
      : "";
    return `${tag}${id}${className}`;
  }

  // Generate the selector based on element attributes
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
    if (element.getAttribute("aria-labelledby")) {
      return `//${element.tagName.toLowerCase()}[@aria-labelledby="${element.getAttribute(
        "aria-labelledby"
      )}"]`;
    }
    return `//${element.tagName.toLowerCase()}`;
  }

  // Determine suffix for element type
  function getSuffix(element) {
    if (element.tagName === "INPUT") {
      if (element.type === "text" || element.type === "password")
        return "Textbox";
      if (element.type === "radio") return "Radio";
      if (element.type === "checkbox") return "Checkbox";
    }
    if (element.tagName === "TEXTAREA") return "Textbox";
    if (element.tagName === "SELECT") return "Select";
    return "";
  }

  // Check if the element is clickable or focusable
  function isInteractive(element) {
    return (
      element.tagName === "A" ||
      element.tagName === "BUTTON" ||
      element.tagName === "TEXTAREA" ||
      element.tagName === "SELECT" ||
      (element.tagName === "INPUT" &&
        (element.type === "button" ||
          element.type === "submit" ||
          element.type === "text" ||
          element.type === "password" ||
          element.type === "checkbox" ||
          element.type === "radio")) ||
      element.hasAttribute("onclick") ||
      element.getAttribute("role") === "button" ||
      element.tabIndex >= 0
    ); // Includes elements that are focusable (tabbable)
  }

  // Create and style the selection box
  function createSelectionBox() {
    selectionBox = document.createElement("div");
    selectionBox.style.position = "absolute";
    selectionBox.style.border = "2px dashed blue";
    selectionBox.style.backgroundColor = "rgba(173, 216, 230, 0.3)";
    // selectionBox.style.pointerEvents = "all";
    document.body.appendChild(selectionBox);
  }

  // Update the position and size of the selection box using pageX and pageY
  function updateSelectionBox(pageX, pageY) {
    const width = Math.abs(pageX - startX);
    const height = Math.abs(pageY - startY);
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    selectionBox.style.left = `${Math.min(pageX, startX)}px`;
    selectionBox.style.top = `${Math.min(pageY, startY)}px`;
  }

  // Check if an element is in the selection box
  function isElementInSelection(element) {
    const rect = element.getBoundingClientRect();
    const selectionRect = selectionBox.getBoundingClientRect();

    return (
      rect.left >= selectionRect.left &&
      rect.right <= selectionRect.right &&
      rect.top >= selectionRect.top &&
      rect.bottom <= selectionRect.bottom
    );
  }

  // Scroll the page if the mouse is near the edges
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

  // Mouse down event to start the selection process
  function onMouseDown(event) {
    if (event.target === popupTopBar) {
      isDraggingPopup = true;
      popupOffsetX = event.clientX - popup.getBoundingClientRect().left;
      popupOffsetY = event.clientY - popup.getBoundingClientRect().top;
      return;
    }

    startX = event.pageX;
    startY = event.pageY;
    isDraggingSelection = true;

    preventTextSelection();
    createSelectionBox();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  // Mouse move event to update the selection box as the user drags
  function onMouseMove(event) {
    if (isDraggingPopup) {
      popup.style.left = `${event.clientX - popupOffsetX}px`;
      popup.style.top = `${event.clientY - popupOffsetY}px`;
      return;
    }

    if (isDraggingSelection) {
      updateSelectionBox(event.pageX, event.pageY);
      autoScroll(event);
      startAutoScroll(event);
    }
  }

  // Mouse up event to complete the selection and gather elements
  function onMouseUp() {
    if (isDraggingPopup) {
      isDraggingPopup = false;
      return;
    }

    if (isDraggingSelection) {
      isDraggingSelection = false;

      // Collect all focusable and clickable elements within the selection box
      const allElements = document.querySelectorAll(
        'a, button, input, textarea, select, [onclick], [role="button"], [tabindex]'
      );

      allElements.forEach((element) => {
        if (
          isInteractive(element) &&
          isElementInSelection(element) &&
          !selectedElements.has(element)
        ) {
          selectedElements.set(element, ""); // Initialize with empty key name
          element.style.outline = defaultOutlineStyle;
        }
      });

      document.body.removeChild(selectionBox);
      restoreTextSelection();
      stopAutoScroll();

      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      createPopup();
      populatePopup();
    }
  }

  // Create a popup to display the selected elements
  function createPopup() {
    if (popup) {
      popupContent.innerHTML = "";
      return;
    }

    popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.bottom = "10px";
    popup.style.right = "10px";
    popup.style.width = "400px";
    popup.style.backgroundColor = "#f0f0f0";
    popup.style.border = "1px solid #333";
    popup.style.zIndex = "10000";
    popup.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
    popup.style.fontFamily = "Arial, sans-serif";
    popup.style.borderRadius = "8px";
    popup.style.display = "flex";
    popup.style.flexDirection = "column";

    popupTopBar = document.createElement("div");
    popupTopBar.style.backgroundColor = "#333";
    popupTopBar.style.color = "white";
    popupTopBar.style.padding = "5px 10px";
    popupTopBar.style.cursor = "move";
    popupTopBar.style.display = "flex";
    popupTopBar.style.justifyContent = "space-between";
    popupTopBar.style.alignItems = "center";
    popupTopBar.style.borderTopLeftRadius = "8px";
    popupTopBar.style.borderTopRightRadius = "8px";
    popupTopBar.innerHTML = "<span>Selected Elements</span>";

    const minimizeButton = document.createElement("button");
    minimizeButton.textContent = "-";
    minimizeButton.style.backgroundColor = "transparent";
    minimizeButton.style.color = "white";
    minimizeButton.style.border = "none";
    minimizeButton.style.cursor = "pointer";
    minimizeButton.style.fontSize = "16px";
    popupTopBar.appendChild(minimizeButton);

    minimizeButton.addEventListener("click", () => {
      isMinimized = !isMinimized;
      popupContent.style.display = isMinimized ? "none" : "block";
      minimizeButton.textContent = isMinimized ? "+" : "-";
      popup.style.width = isMinimized ? "300px" : "400px";
    });

    popupContent = document.createElement("div");
    popupContent.style.padding = "10px";
    popupContent.style.flexGrow = "1";
    popupContent.style.maxHeight = "300px";
    popupContent.style.overflowY = "auto";
    popupContent.style.backgroundColor = "white";
    popupContent.style.borderBottomLeftRadius = "8px";
    popupContent.style.borderBottomRightRadius = "8px";

    popup.appendChild(popupTopBar);
    popup.appendChild(popupContent);

    // Create a container for the buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "space-between";
    buttonContainer.style.padding = "10px";
    buttonContainer.style.borderTop = "1px solid #ccc";
    buttonContainer.style.backgroundColor = "#f9f9f9";

    // Create Export Selectors button
    const exportSelectorsButton = document.createElement("button");
    exportSelectorsButton.textContent = "Export Selectors";
    exportSelectorsButton.style.padding = "5px 10px";
    exportSelectorsButton.style.border = "none";
    exportSelectorsButton.style.backgroundColor = "#007bff";
    exportSelectorsButton.style.color = "white";
    exportSelectorsButton.style.borderRadius = "5px";
    exportSelectorsButton.style.cursor = "pointer";
    exportSelectorsButton.addEventListener("click", exportSelectors);
    buttonContainer.appendChild(exportSelectorsButton);

    // Create Export Data button
    const exportDataButton = document.createElement("button");
    exportDataButton.textContent = "Export Data";
    exportDataButton.style.padding = "5px 10px";
    exportDataButton.style.border = "none";
    exportDataButton.style.backgroundColor = "#28a745";
    exportDataButton.style.color = "white";
    exportDataButton.style.borderRadius = "5px";
    exportDataButton.style.cursor = "pointer";
    exportDataButton.addEventListener("click", exportData);
    buttonContainer.appendChild(exportDataButton);

    popup.appendChild(buttonContainer);

    document.body.appendChild(popup);
  }

  // Populate the popup with the list of selected elements
  function populatePopup() {
    popupContent.innerHTML = ""; // Clear previous content
    selectedElements.forEach((_, element) => {
      const li = document.createElement("div");
      li.style.padding = "5px";
      li.style.cursor = "pointer";
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      li.style.borderBottom = "1px solid #ccc";

      const identifier = getElementIdentifier(element);

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Enter Key Name";
      input.value = typeof selectedElements.get(element) === "string" ? selectedElements.get(element) : "X";
      input.style.width = "150px";
      input.addEventListener("blur", (e) => {
        const keyName = toCamelCase(e.target.value) + getSuffix(element);
        selectedElements.set(element, keyName);
      });

      const label = document.createElement("span");
      label.textContent = identifier;
      label.style.marginLeft = "10px";
      label.style.fontSize = "12px";
      label.style.whiteSpace = "nowrap";
      label.style.overflow = "hidden";
      label.style.textOverflow = "ellipsis";
      label.style.maxWidth = "120px"; // Limit the width for ellipsis to show

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.style.marginLeft = "10px";
      deleteButton.style.border = "none";
      deleteButton.style.backgroundColor = "#dc3545";
      deleteButton.style.color = "white";
      deleteButton.style.borderRadius = "3px";
      deleteButton.style.cursor = "pointer";
      deleteButton.addEventListener("click", () => {
        selectedElements.delete(element);
        element.style.outline = ""; // Remove the outline from the element on the page
        li.remove();
      });

      li.appendChild(input);
      li.appendChild(label);
      li.appendChild(deleteButton);

      li.addEventListener("mouseenter", () => {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.style.outline = hoverOutlineStyle; // Highlight element on hover
      });

      li.addEventListener("mouseleave", () => {
        element.style.outline = defaultOutlineStyle; // Revert to default outline
      });

      popupContent.appendChild(li);
    });
  }

  // Export selectors to an object
  function exportSelectors() {
    const exportObject = {};
    selectedElements.forEach((keyName, element) => {
      if (keyName) {
        exportObject[keyName] = getSelector(element);
      }
    });
    console.log(exportObject);
  }

  // Export selected elements data for further use
  function exportData() {
    const exportData = [];
    selectedElements.forEach((keyName, element) => {
      const data = {
        key: keyName,
        tagName: element.tagName,
        id: element.id || null,
        className: element.className || null,
        type: element.type || null,
      };
      exportData.push(data);
    });
    console.log(exportData);
    console.log(selectedElements);
  }

  // Add the mousedown listener to start the selection process
  window.addEventListener("mousedown", onMouseDown);

  console.log(
    "Hold and drag the mouse to select interactive elements. A popup will show the selected items."
  );
})();
