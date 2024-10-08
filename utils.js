class ElementBuilder {
  constructor(tagName) {
    this.element = document.createElement(tagName);
  }

  setAttributes(attributes) {
    Object.keys(attributes).forEach((key) => {
      this.element.setAttribute(key, attributes[key]);
    });
    return this; // for chaining
  }

  addClass(...classNames) {
    classNames.forEach((className) => {
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
    if (parent instanceof HTMLElement) {
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
      document.querySelector(target).insertAdjacentElement(position, this.element);
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
    justify-content: space-between;
    padding: 10px;
    align-items: center;
    border-bottom: 1px solid #ccc;
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
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
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
    width: 120px;
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

    //popup action buttons
    @media (-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 144dpi) {
    .widget-topbar-minimise-button{
        background: url(//ssl.gstatic.com/ui/v1/icons/mail/rfr/ic_minimize_16px_2x.png);
        background-size: 16px;
    }
    .widget-topbar-expand-button {
        background-image: url(//ssl.gstatic.com/ui/v1/icons/mail/rfr/ic_open_in_full_16px_2x.png);
        background-size: 16px;
    }
    .widget-topbar-unexpand-button {
        background-image: url(//ssl.gstatic.com/ui/v1/icons/mail/rfr/ic_close_fullscreen_16px_2x.png);
        background-size: 16px;
    }
    .widget-topbar-close-button {
        background: url(//ssl.gstatic.com/ui/v1/icons/mail/rfr/ic_close_16px_2x.png);
        background-size: 16px;
    }
}
    .widget-topbar-action-buttons-container{
        width: 60px;
        padding: 0 12px 0 4px;
        text-align: right;
        white-space: nowrap;
    }
    .widget-topbar-action-button{
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
        width: 16px;
        height: 16px;
    }
    .widget-topbar-minimise-button {
        background: url(//ssl.gstatic.com/ui/v1/icons/mail/rfr/ic_minimize_16px_1x.png);
    }
    .widget-topbar-expand-button {
        background-image: url(//ssl.gstatic.com/ui/v1/icons/mail/rfr/ic_open_in_full_16px_1x.png);
    }
    .widget-topbar-unexpand-button {
        background-image: url(//ssl.gstatic.com/ui/v1/icons/mail/rfr/ic_close_fullscreen_16px_1x.png);
    }
    .widget-topbar-close-button {
        background: url(//ssl.gstatic.com/ui/v1/icons/mail/rfr/ic_close_16px_1x.png);
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
