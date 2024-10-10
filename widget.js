(function () {
  let startX, startY, selectionBox;
  let selectedElements = new Map();
  let popupSelectedItems = new Set();
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
  let secondBar;
  let dynamicButtonsContainer;
  let isDragSelectMode = false;
  let isSingleSelectMode = false;
  let isMaximized = false;
  let isWidgetActive = false;

  const defaultOutlineStyle = '2px solid blue';
  const hoverOutlineStyle = '3px dashed orange';

  // Toggle widget activation and deactivation
  function toggleWidgetActivation() {
    isWidgetActive = !isWidgetActive;
    console.log(isWidgetActive ? 'Widget Activated' : 'Widget Deactivated');
  }

  function preventTextSelection() {
    document.body.style.userSelect = 'none';
  }

  function restoreTextSelection() {
    document.body.style.userSelect = '';
  }

  function toCamelCase(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
        index === 0 ? match.toLowerCase() : match.toUpperCase(),
      )
      .replace(/\s+/g, '');
  }

  function getElementIdentifier(element) {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const className = element.classList.length ? `.${[...element.classList].join('.')}` : '';
    return `${tag}${id}${className}`;
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
        'aria-labelledby',
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
      if (element.type === 'button' || element.type === 'submit' || element.type === 'reset')
        return 'Button';
    }
    if (element.tagName === 'SELECT') return 'Select';
    return '';
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

  function toggleSingleSelectMode() {
    isSingleSelectMode = !isSingleSelectMode;
    if (isSingleSelectMode) {
      document.body.style.cursor = 'crosshair'; // Change cursor to indicate single select mode
      window.addEventListener('click', handleSingleSelect);
      document.addEventListener('mouseover', popupUtils.throttleMouseover);
    } else {
      document.body.style.cursor = ''; // Reset cursor
      window.removeEventListener('click', handleSingleSelect);
      document.removeEventListener('mouseover', popupUtils.throttleMouseover);
    }
  }

  function handleSingleSelect(event) {
    if (!isSingleSelectMode || (popup && popup.contains(event.target))) return;
    const element = event.target;
    if (popupUtils.isValidElement(element)) {
      selectedElements.set(element, '');
      element.style.outline = defaultOutlineStyle;
      console.log('Single Element Selected:', element);
      popupUtils.attachPopup(element); // Integrate popupUtils for the single select tool
      createPopup();
      updatePopup();
    }
  }

  function toggleDragSelectMode() {
    isDragSelectMode = !isDragSelectMode;
    if (isDragSelectMode) {
      window.addEventListener('mousedown', onDragSelectionStart);
    } else {
      window.removeEventListener('mousedown', onDragSelectionStart);
    }
  }

  function onDragSelectionStart(event) {
    if (popupContent && popupContent.contains(event.target)) {
      return;
    }
    if (popupTopBar && popupTopBar.contains(event.target)) {
      isDraggingPopup = true;
      popupOffsetX = event.clientX - popup.getBoundingClientRect().left;
      popupOffsetY = event.clientY - popup.getBoundingClientRect().top;

      window.addEventListener('mousemove', onDragSelectMove);
      window.addEventListener('mouseup', onDragSelectionEnd);
      return;
    }
    if (!isWidgetActive || isSingleSelectMode) return;
    preventTextSelection();
    startX = event.pageX;
    startY = event.pageY;
    isDraggingSelection = true;

    createSelectionBox();

    window.addEventListener('mousemove', onDragSelectMove);
    window.addEventListener('mouseup', onDragSelectionEnd);
  }

  function onDragSelectMove(event) {
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

  function onDragSelectionEnd(event) {
    window.removeEventListener('mousemove', onDragSelectMove);
    window.removeEventListener('mouseup', onDragSelectionEnd);
    stopAutoScroll;
    if (isDraggingPopup) {
      isDraggingPopup = false;
      return;
    }

    if (isDraggingSelection) {
      isDraggingSelection = false;

      const allElements = document.querySelectorAll(
        'a, button, input, textarea, select, [onclick], [role="button"], [tabindex]',
      );

      allElements.forEach((element) => {
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

      createPopup();
      updatePopup();
    }
  }

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

  // Update selection box dimensions during drag select
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

  function createPopup() {
    if (popup) {
      popupContent.innerHTML = '';
      return;
    }

    popup = new ElementBuilder('div')
      .setAttributes({ id: 'popup' })
      .appendTo(document.body)
      .getElement();

    popupTopBar = new ElementBuilder('div')
      .setAttributes({ id: 'popup-top-bar' })
      .addHTMLContent('<span>Selected Elements</span>')
      .appendTo(popup)
      .getElement();

    // Create the Selection container div
    const selectionButtonsContainer = new ElementBuilder('div')
      .addClass('widget-topbar-action-buttons-container')
      .appendTo(popupTopBar)
      .getElement();

    // Single Select Button
    const singleSelectButton = new ElementBuilder('button')
      .addClass('widget-topbar-selection-button', 'widget-topbar-single-select-button')
      .addHTMLContent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" width="100%" height="100%">
          <rect x="1.6" y="1.5" width="12.6" height="12.7" rx="1" stroke="#000" stroke-width="1.5" fill="currentColor"></rect>
          <rect x="4" y="4" width="8" height="1.5" rx="0.2" stroke="#000" fill="currentColor"></rect>
          <rect x="7" y="7" width="8" height="8" fill="currentColor"></rect>
          <path d="M8 15V8H15M8 8L14 14" stroke="#000" stroke-width="1.5" id="arrow"></path>
        </svg>`,
      )
      .addEventListener('click', toggleSingleSelectMode)
      .getElement();

    // Drag Select Button with ◩
    const dragSelectButton = new ElementBuilder('button')
      .addClass('widget-topbar-selection-button', 'widget-topbar-drag-select-button')
      .addHTMLContent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" width="100%" height="100%">
          <rect x="1.6" y="1.5" width="12.6" height="12.7" rx="1" stroke="#000" stroke-width="1.5" fill="currentColor"></rect>
          <rect x="4" y="4" width="2" height="2" rx="0.2" fill="#000"></rect>
          <rect x="7" y="4" width="2" height="2" rx="0.2" fill="#000"></rect>
          <rect x="10" y="4" width="2" height="2" rx="0.2" fill="#000"></rect>
          <rect x="4" y="7" width="2" height="2" rx="0.2" fill="#000"></rect>
          <rect x="4" y="10" width="2" height="2" rx="0.2" fill="#000"></rect>
          <rect x="7" y="7" width="8" height="8" fill="currentColor"></rect>
          <path d="M8 15V8H15M8 8L14 14" stroke="#000" stroke-width="1.5" id="arrow"></path>
        </svg>`,
      )
      .addEventListener('click', toggleDragSelectMode)
      .getElement();

    selectionButtonsContainer.appendChild(singleSelectButton);
    selectionButtonsContainer.appendChild(dragSelectButton);

    // Create the Action buttons container div
    const actionButtonsContainer = new ElementBuilder('div')
      .addClass('widget-topbar-action-buttons-container')
      .appendTo(popupTopBar)
      .getElement();

    // Minimise button
    new ElementBuilder('button')
      .addClass('widget-topbar-action-button', 'widget-topbar-minimise-button')
      .setAttributes({
        id: ':4i4',
        src: 'images/cleardot.gif',
        alt: 'Minimise',
        'aria-label': 'Minimise',
        'data-tooltip-delay': '800',
        'data-tooltip': 'Minimise',
      })
      .addEventListener('click', () => {
        isMinimized = !isMinimized;
        popupContent.style.display = isMinimized ? 'none' : 'block';
        popup.style.width = isMinimized ? '328px' : '510px';
      })
      .appendTo(actionButtonsContainer);

    // Create the expand button
    const expandButton = new ElementBuilder('button')
      .addClass('widget-topbar-action-button', 'widget-topbar-expand-button')
      .setAttributes({
        id: ':4g4',
        src: 'images/cleardot.gif',
        alt: 'Pop-out',
        'aria-label': 'Exit full screen (Shift for pop-out)',
        'data-tooltip-delay': '800',
        'data-tooltip': 'Exit full screen (Shift for pop-out)',
      })
      .addEventListener('click', () => {
        expandButton.style.display = 'none';
        unexpandButton.style.display = 'inline-block';
      })
      .addEventListener('click', toggleMaximizePopup)
      .getElement();

    // Create the unexpand button
    const unexpandButton = new ElementBuilder('button')
      .addClass('widget-topbar-action-button', 'widget-topbar-unexpand-button')
      .setAttributes({
        id: ':4g4',
        src: 'images/cleardot.gif',
        alt: 'Pop-out',
        'aria-label': 'Full screen (Shift for pop-out)',
        'data-tooltip-delay': '800',
        'data-tooltip': 'Full screen (Shift for pop-out)',
      })
      .addEventListener('click', () => {
        unexpandButton.style.display = 'none';
        expandButton.style.display = 'inline-block';
      })
      .addEventListener('click', toggleMaximizePopup)
      .setStyle({ display: 'none' }) // Initially hide the unexpand button
      .getElement();

    // Append the buttons to the container
    actionButtonsContainer.appendChild(expandButton);
    actionButtonsContainer.appendChild(unexpandButton);

    // Close button
    new ElementBuilder('button')
      .addClass('widget-topbar-action-button', 'widget-topbar-close-button')
      .setAttributes({
        id: ':4g5',
        src: 'images/cleardot.gif',
        alt: 'Close',
        'aria-label': 'Save & close',
        'data-tooltip-delay': '800',
        'data-tooltip': 'Save & close',
      })
      .appendTo(actionButtonsContainer);

    popupContent = new ElementBuilder('div').addClass('popup-content').appendTo(popup).getElement();

    const buttonContainer = new ElementBuilder('div')
      .addClass('button-container')
      .appendTo(popup)
      .getElement();

    new ElementBuilder('button')
      .addTextContent('Export Selectors')
      .addClass('exportSelectorButton')
      .addEventListener('click', exportSelectors)
      .appendTo(buttonContainer);

    new ElementBuilder('button')
      .addTextContent('Export Data')
      .addClass('exportDataButton')
      .addEventListener('click', exportData)
      .appendTo(buttonContainer);

    createSecondBar();
  }

  function updatePopup() {
    popupContent.innerHTML = '';
    selectedElements.forEach((value, element) => {
      const li = new ElementBuilder('div')
        .addClass('selectorListItem')
        .appendTo(popupContent)
        .getElement();

      const checkbox = new ElementBuilder('input')
        .setAttributes({ type: 'checkbox' })
        .addClass('popup-item-checkbox')
        .addEventListener('change', () => {
          if (checkbox.checked) {
            popupSelectedItems.add(element);
          } else {
            popupSelectedItems.delete(element);
          }
          updateSelectAllCheckbox();
          updateDynamicButtons();
        })
        .appendTo(li);

      const identifier = getElementIdentifier(element);

      new ElementBuilder('input')
        .setAttributes({
          type: 'text',
          placeholder: 'Enter Key Name',
          value: value,
        })
        .setStyle({ width: '150px' })
        .addEventListener('blur', (e) => {
          const val = e.target.value;
          const suffix = getSuffix(element);
          const finalSuffix = val.endsWith(suffix) ? '' : suffix;
          const keyName = toCamelCase(val) + finalSuffix;
          selectedElements.set(element, keyName);
        })
        .appendTo(li);

      new ElementBuilder('span')
        .addClass('selector-identifier')
        .addTextContent(identifier)
        .appendTo(li);

      new ElementBuilder('button')
        .addTextContent('Delete')
        .addClass('delete-row-button')
        .addEventListener('click', () => {
          selectedElements.delete(element);
          element.style.outline = '';
          li.remove();
        })
        .appendTo(li);

      li.addEventListener('mouseenter', () => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.outline = hoverOutlineStyle;
      });

      li.addEventListener('mouseleave', () => {
        element.style.outline = defaultOutlineStyle;
      });
    });
  }

  function createSecondBar() {
    secondBar = new ElementBuilder('div')
      .addClass('second-bar')
      .insertAdjacent(popupTopBar, 'afterend')
      .getElement();

    new ElementBuilder('input')
      .setAttributes({ type: 'checkbox', name: 'Select All' })
      .addEventListener('change', handleSelectAll)
      .appendTo(secondBar);

    dynamicButtonsContainer = new ElementBuilder('div')
      .addClass('dynamic-buttons-container')
      .appendTo(secondBar)
      .getElement();

    new ElementBuilder('button')
      .addTextContent('⚙️')
      .setAttributes({ name: 'Settings' })
      .setStyle({ border: 'none', cursor: 'pointer' })
      .addEventListener('click', toggleSettingsOverlay)
      .appendTo(secondBar);
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

  function toggleMaximizePopup() {
    isMaximized = !isMaximized;
    if (isMaximized) {
      popup.style.position = 'fixed';
      popup.style.top = 0;
      popup.style.left = 0;
      popup.style.width = '100vw';
      popup.style.height = '100vh';
      popup.style.zIndex = 10001; // Ensure it's on top of everything
      popupContent.style.maxHeight = '90vh';
    } else {
      popup.style.position = 'fixed';
      popup.style.bottom = '10px';
      popup.style.right = '10px';
      popup.style.width = '400px';
      popup.style.height = 'auto';
      popupContent.style.maxHeight = '300px';
    }
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
    const handleCopy = () => {
      const exportData = {};
      popupSelectedItems.size < 1
        ? selectedElements.forEach((selectorName, element) => {
            exportData[selectorName] = getSelector(element);
          })
        : popupSelectedItems.forEach((element) => {
            exportData[selectedElements.get(element)] = getSelector(element);
          });
      console.log('Copied Data:', exportData);
      navigator.clipboard.writeText(JSON.stringify(exportData));
    };

    const handleDeleteAll = () => {
      let newSelectedElements = new Map();
      selectedElements.forEach((value, element) => {
        if (!popupSelectedItems.has(element)) {
          newSelectedElements.set(element, value);
        } else {
          element.style.outline = '';
        }
      });
      selectedElements = newSelectedElements;
      popupSelectedItems.clear();
      updatePopup();
    };

    const handleGroup = () => {
      const groupName = prompt('Enter Group Name:');
      if (groupName) {
        popupSelectedItems.forEach((element) => {
          selectedElements.set(element, groupName);
        });
        updatePopup();
        updateDynamicButtons();
      }
    };

    dynamicButtonsContainer.innerHTML = '';
    if (popupSelectedItems.size > 0) {
      new ElementBuilder('button')
        .addTextContent('Delete All')
        .addClass('delete-button')
        .addEventListener('click', handleDeleteAll)
        .appendTo(dynamicButtonsContainer);

      new ElementBuilder('button')
        .addTextContent('Copy')
        .addClass('copy-button')
        .addEventListener('click', handleCopy)
        .appendTo(dynamicButtonsContainer);

      new ElementBuilder('button')
        .addTextContent('Group')
        .addClass('group-button')
        .addEventListener('click', handleGroup)
        .appendTo(dynamicButtonsContainer);
    }
  }

  function exportSelectors() {
    const exportObject = {};
    selectedElements.forEach((keyName, element) => {
      if (keyName) {
        exportObject[keyName] = getSelector(element);
      }
    });
    console.log(exportObject);
  }

  function exportData() {
    const exportData = {};
    selectedElements.forEach((selectorName, element) => {
      let value;

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

      if (selectorName) {
        exportData[selectorName] = value;
      }
    });

    console.log('Exported Data:', exportData);
    return exportData;
  }

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
        `,
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
        `,
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
        `,
        )
        .appendTo(settingsContainer);
    }

    settingsOverlay.style.display =
      settingsOverlay.style.display === 'none' || !settingsOverlay.style.display ? 'flex' : 'none';
  }

  // Add keyboard listeners for activating/deactivating the widget
  function addKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        toggleWidgetActivation();
      }
    });
  }

  // Initialize the widget with drag select as the default tool
  function initWidget() {
    toggleWidgetActivation();
    toggleDragSelectMode(); // Default to drag select
    addKeyboardShortcuts();
    console.log(
      'Hold and drag the mouse to select interactive elements. A popup will show the selected items.',
    );
  }

  // Initialize the widget
  initWidget();
})();
