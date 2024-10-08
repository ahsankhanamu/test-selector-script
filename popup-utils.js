const popupUtils = (() => {
  let _element, _popup;
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

  const createPopup = () => {
    const innerHTML = `<input type="text" placeholder="Selector name"/>
                           <input type="text" placeholder="XPath"/>`;
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
    // popup.innerHTML = innerHTML;
    getContainer().appendChild(_popup);
    return popup;
  };

  const setPopupAttribs = () => {
    if (!_popup) {
      throw new Error("Popup missing");
    }
    if (!_element) {
      throw new Error("Please select the element");
    }
    const { top, left, width, height } = calculateBoundingRect(_element);
    _popup.style.left = left + "px";
    _popup.style.top = top + "px";
    _popup.style.width = width + "px";
    _popup.style.height = height + "px";
    _popup.style.display = "block";
  };

  const attachPopup = (element) => {
    _element = element;
    _popup = document.querySelector("#highlighter_popup") || createPopup();
    setPopupAttribs();
  };

  const updatePopup = () => {
    setPopupAttribs();
  };

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

  const init = () => {
    const throttledUpdatePopup = throttle(updatePopup, 100);

    window.addEventListener("scroll", throttledUpdatePopup);
    window.addEventListener("resize", throttledUpdatePopup);

    document.addEventListener("DOMContentLoaded", function () {
      updatePopup();
    });
  };

  return {
    init,
    attachPopup,
    updatePopup,
  };
})();

document.addEventListener("mouseover", (e) => {
  e.preventDefault();
  popupUtils.attachPopup(e.target);
  popupUtils.init();
});
