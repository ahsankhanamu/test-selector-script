(function () {
  let startX, startY, selectionBox;
  let selectedElements = new Map(); // Use Map to store key-value pairs
  let scrollSpeed = 20;
  let popup,
    popupTopBar,
    popupContent,
    isMinimized = false;
  let popupSelectedItems = new Set(); // Track selected items inside the popup
  let isDraggingPopup = false;
  let isDraggingSelection = false;
  let scrollInterval;
  let popupOffsetX = 0,
    popupOffsetY = 0;
  let secondBar;

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
      if (
        element.type === "text" ||
        element.type === "number" ||
        element.type === "email" ||
        element.type === "tel" ||
        element.type === "password" ||
        element.type === "search" ||
        element.type === "url"
      )
        return "Textbox";
      if (element.tagName === "TEXTAREA") return "Textbox";
      if (element.type === "radio") return "Radio";
      if (element.type === "checkbox") return "Checkbox";
      if (
        element.type === "button" ||
        element.type === "submit" ||
        element.type === "reset"
      )
        return "Button";
    }
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
    if (popup && popup.contains(element)) {
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
    if (popupContent && popupContent.contains(event.target)) {
      return;
    }
    if (popupTopBar && popupTopBar.contains(event.target)) {
      isDraggingPopup = true;
      popupOffsetX = event.clientX - popup.getBoundingClientRect().left;
      popupOffsetY = event.clientY - popup.getBoundingClientRect().top;

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      return;
    }
    preventTextSelection();
    startX = event.pageX;
    startY = event.pageY;
    isDraggingSelection = true;

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
  function onMouseUp(event) {
    if (isDraggingPopup) {
      isDraggingPopup = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
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
    popup.setAttribute("id", "popup");

    popupTopBar = document.createElement("div");
    popupTopBar.setAttribute("id", "popup-top-bar");

    popupTopBar.innerHTML = "<span>Selected Elements</span>";

    const minimizeButton = document.createElement("button");
    minimizeButton.textContent = "-";

    popupTopBar.appendChild(minimizeButton);

    minimizeButton.addEventListener("click", () => {
      isMinimized = !isMinimized;
      popupContent.style.display = isMinimized ? "none" : "block";
      minimizeButton.textContent = isMinimized ? "+" : "-";
      popup.style.width = isMinimized ? "300px" : "400px";
    });

    popupContent = document.createElement("div");
    popupContent.classList.add("popup-content"); // Uses CSS for styling

    popup.appendChild(popupTopBar);
    popup.appendChild(popupContent);

    // Create a container for the buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    // Create Export Selectors button
    const exportSelectorsButton = document.createElement("button");
    exportSelectorsButton.classList.add("exportSelectorButton");
    exportSelectorsButton.textContent = "Export Selectors";

    exportSelectorsButton.addEventListener("click", exportSelectors);
    buttonContainer.appendChild(exportSelectorsButton);

    // Create Export Data button
    const exportDataButton = document.createElement("button");
    exportDataButton.classList.add("exportDataButton");
    exportDataButton.textContent = "Export Data";

    exportDataButton.addEventListener("click", exportData);
    buttonContainer.appendChild(exportDataButton);

    popup.appendChild(buttonContainer);
    createSecondBar(); // Adds the select all, settings, and dynamic buttons

    document.body.appendChild(popup);
  }

  function createSecondBar() {
    secondBar = document.createElement("div");
    secondBar.setAttribute("class", "second-bar button-container"); // Uses CSS for styling

    // Select All checkbox
    const selectAllCheckbox = document.createElement("input");
    selectAllCheckbox.type = "checkbox";
    selectAllCheckbox.addEventListener("change", handleSelectAll);
    secondBar.appendChild(selectAllCheckbox);

    // Settings button
    const settingsButton = document.createElement("button");
    settingsButton.textContent = "⚙️";
    settingsButton.style.border = "none";
    settingsButton.style.cursor = "pointer";
    settingsButton.addEventListener("click", toggleSettingsOverlay);
    secondBar.appendChild(settingsButton);

    dynamicButtonsContainer = document.createElement("div");
    dynamicButtonsContainer.setAttribute(
      "class",
      "dynamic-buttons-container button-container"
    ); // Uses CSS for styling
    secondBar.appendChild(dynamicButtonsContainer);

    popup.appendChild(secondBar);
  }

  function handleSelectAll(event) {
    const isChecked = event.target.checked;
    popupSelectedItems.clear();
    if (isChecked) {
      selectedElements.forEach((_, key) => {
        popupSelectedItems.add(key);
      });
    }

    updateDynamicButtons();
  }

  function updateSelectAllCheckbox() {
    const selectedItemsSize = selectedElements.size;
    const popupSelectedItemsSize = popupSelectedItems.size;
    const selectAllCheckbox = secondBar.querySelector('input[type="checkbox"]');
    selectAllCheckbox.checked = popupSelectedItemsSize === selectedItemsSize;
    selectAllCheckbox.indeterminate =
      popupSelectedItemsSize > 0 && popupSelectedItemsSize < selectedItemsSize;
  }

  function updateDynamicButtons() {
    dynamicButtonsContainer.innerHTML = "";
    if (popupSelectedItems.size > 0) {
      const deleteAllButton = document.createElement("button");
      deleteAllButton.textContent = "Delete All";
      deleteAllButton.classList.add("delete-button"); // Uses CSS for styling
      deleteAllButton.addEventListener("click", () => {
        let newSelectedElements = new Map();
        selectedElements.forEach((value, element) => {
          if (!popupSelectedItems.has(element)) {
            newSelected.set(element);
          } else {
            element.style.outline = ""; // Remove the outline from the element on the page
          }
        });
        selectedElements = newSelectedElements;
        popupSelectedItems.clear();
        populatePopup();
      });

      const copyButton = document.createElement("button");
      copyButton.classList.add("copy-button");
      copyButton.textContent = "Copy";
      copyButton.addEventListener("click", () => {
        const exportData = {};
        popupSelectedItems.size < 1
          ? selectedElements.forEach((selectorName, element) => {
              exportData[selectorName] = getSelector(element);
            })
          : popupSelectedItems.forEach((element) => {
              exportData[selectedElements.get(element)] = getSelector(element);
            });
        console.log("Copied Data:", exportData);
        navigator.clipboard.writeText(JSON.stringify(exportData));
      });

      const groupButton = document.createElement("button");
      groupButton.classList.add("group-button");
      groupButton.textContent = "Group";
      groupButton.addEventListener("click", () => {
        const groupName = prompt("Enter Group Name:");
        if (groupName) {
          popupSelectedItems.forEach((element) => {
            selectedElements.set(element, groupName);
          });
          populatePopup();
          updateDynamicButtons();
        }
      });

      dynamicButtonsContainer.appendChild(deleteAllButton);
      dynamicButtonsContainer.appendChild(copyButton);
      dynamicButtonsContainer.appendChild(groupButton);
    }
  }

  // Populate the popup with the list of selected elements
  function populatePopup() {
    popupContent.innerHTML = ""; // Clear previous content
    selectedElements.forEach((_, element) => {
      const li = document.createElement("div");
      li.classList.add("selectorListItem");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = popupSelectedItems.has(element);
      checkbox.classList.add("popup-item-checkbox"); // Uses CSS for styling
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          popupSelectedItems.add(element);
        } else {
          popupSelectedItems.delete(element);
        }
        updateSelectAllCheckbox();
        updateDynamicButtons();
      });

      const identifier = getElementIdentifier(element);

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Enter Key Name";
      input.value =
        typeof selectedElements.get(element) === "string"
          ? selectedElements.get(element)
          : "X";
      input.style.width = "150px";
      input.addEventListener("blur", (e) => {
        const keyName = toCamelCase(e.target.value) + getSuffix(element);
        selectedElements.set(element, keyName);
      });

      const label = document.createElement("span");
      label.classList.add("selector-identifier");
      label.textContent = identifier;

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-row-button");
      deleteButton.textContent = "Delete";
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
    const exportData = {};
    selectedElements.forEach((selectorName, element) => {
      let value;

      // Capture value based on element type
      if (element.tagName === "INPUT") {
        if (
          element.type === "text" ||
          element.type === "email" ||
          element.type === "password" ||
          element.type === "search"
        ) {
          value = element.value; // Capture text input value
        } else if (element.type === "checkbox" || element.type === "radio") {
          value = element.checked; // Capture checked state
        }
      } else if (element.tagName === "TEXTAREA") {
        value = element.value; // Capture textarea value
      } else if (element.tagName === "SELECT") {
        const selectedOption = element.options[element.selectedIndex];
        value = selectedOption ? selectedOption.textContent : ""; // Capture text of the selected option
      } else if (element.tagName === "BUTTON") {
        value = element.textContent; // Capture button text
      }

      // Add value to export data
      if (selectorName) {
        exportData[selectorName] = value;
      }
    });

    console.log("Exported Data:", exportData);
    return exportData;
  }

  function toggleSettingsOverlay() {
    let settingsOverlay = document.getElementById("settings-overlay");
    if (!settingsOverlay) {
      settingsOverlay = document.createElement("div");
      settingsOverlay.id = "settings-overlay"; // Uses CSS for styling

      const settingsContainer = document.createElement("div");
      settingsContainer.id = "settings-container"; // Uses CSS for styling

      const closeButton = document.createElement("button");
      closeButton.textContent = "Close";
      closeButton.addEventListener("click", toggleSettingsOverlay);
      settingsContainer.appendChild(closeButton);

      const filterLabel = document.createElement("label");
      filterLabel.textContent = "Sort/Filter Elements by:";
      filterLabel.style.display = "block";
      filterLabel.style.marginBottom = "10px";

      const sortFilterSelect = document.createElement("select");
      sortFilterSelect.innerHTML = `
      <option value="visible">Visible</option>
      <option value="hidden">Hidden</option>
      <option value="disabled">Disabled</option>
      <option value="focusable">Focusable</option>
    `;

      settingsContainer.appendChild(filterLabel);
      settingsContainer.appendChild(sortFilterSelect);

      settingsOverlay.appendChild(settingsContainer);
      document.body.appendChild(settingsOverlay);
    }

    settingsOverlay.style.display =
      settingsOverlay.style.display === "none" || !settingsOverlay.style.display
        ? "flex"
        : "none";
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

/* Popup styling */
#popup {
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

/* Popup top bar styling */
#popup-top-bar {
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

/* Popup content area styling */
.popup-content {
  padding: 10px;
  flex-grow: 1;
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.second-bar {
  display: flex;
  align-items: center;
  border-top: 1px solid #ccc;
}

/* Button container for dynamic buttons */
.dynamic-buttons-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f9f9f9;
}

/* Delete button styling */
.dynamic-buttons-container button {
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
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

#popup {
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

.popup-content {
  padding: 10px;
  flex-grow: 1;
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.button-container {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f9f9f9;
}

.selectorListItem {
  padding: 5px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ccc;
}

.exportSelectorButton {
  padding: 5px 10px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.exportDataButton {
  padding: 5px 10px;
  border: none;
  background-color: #28a745;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.selector-identifier {
  margin-left: 10px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  /* Limit the width for ellipsis to show */
}

.delete-row-button {
  margin-left: 10px;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 3px;
  cursor: pointer;
}
  `;

  function attachStyles(cssString) {
    // Create a <style> element
    const style = document.createElement("style");

    // Set the inner content of the <style> element
    style.innerHTML = cssString;

    // Append the <style> element to the document head
    document.head.appendChild(style);
  }

  attachStyles(cssString);

  // Add the mousedown listener to start the selection process
  window.addEventListener("mousedown", onMouseDown);

  console.log(
    "Hold and drag the mouse to select interactive elements. A popup will show the selected items."
  );
})();
