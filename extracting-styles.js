function getCssForElement(element) {
  // Helper function to get CSS rules from stylesheets
  function getAppliedCssRules(element, matchedRules) {
    const sheets = document.styleSheets;

    for (const sheet of sheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;

        for (const rule of rules) {
          if (
            rule instanceof CSSStyleRule &&
            element.matches(rule.selectorText)
          ) {
            matchedRules.add(rule);
          }
        }
      } catch (e) {
        // Catch errors if accessing cross-origin stylesheets
        console.warn("Unable to access some stylesheet due to CORS policy.");
      }
    }
    return matchedRules;
  }

  // Helper function to get the computed styles

  // Main function to process element and its descendants
  function processElement(element) {
    const matchedRules = new Set();
    getAppliedCssRules(element, matchedRules);
    const descendants = Array.from(element.querySelectorAll("*"));
    descendants.forEach(el => getAppliedCssRules(el, matchedRules));
    let cssString = "";
    for (const rule of matchedRules) {
        cssString += rule.cssText + "\n";
    }
    console.log(cssString);
    return cssString;
  }

  return processElement(element);
}

// Usage: Pass the element to get CSS information
// Example: Extract CSS for a specific element with id="targetElement"
// const element = document.querySelector("#targetElement");
const cssInfo = getCssForElement($0);
