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
