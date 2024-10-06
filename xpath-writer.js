(function () {
    // Create a floating UI for XPath input
    const uiContainer = document.createElement('div');
    uiContainer.style.position = 'fixed';
    uiContainer.style.bottom = '20px';
    uiContainer.style.right = '20px';
    uiContainer.style.width = '300px';
    uiContainer.style.padding = '15px';
    uiContainer.style.backgroundColor = '#f1f1f1';
    uiContainer.style.border = '1px solid #ccc';
    uiContainer.style.borderRadius = '8px';
    uiContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    uiContainer.style.zIndex = '9999';
    uiContainer.innerHTML = `
        <h3>XPath Tester</h3>
        <input type="text" id="xpathInput" placeholder="Enter XPath" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px;">
        <ul id="autocompleteList" style="display: none; max-height: 150px; overflow-y: auto; padding-left: 0; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px; background-color: white; list-style: none;"></ul>
        <button id="validateXPathBtn" style="padding: 8px 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Validate</button>
        <div id="feedback" style="margin-top: 10px;"></div>
        <div id="suggestions" style="margin-top: 10px;"></div>
        <div id="explanation" style="margin-top: 10px; font-size: 14px;"></div>
        <button id="closeBtn" style="position: absolute; top: 5px; right: 5px; border: none; background: none; cursor: pointer; font-size: 14px; color: #555;">✖</button>
    `;
    document.body.appendChild(uiContainer);

    // Close button handler
    document.getElementById('closeBtn').addEventListener('click', function () {
        document.body.removeChild(uiContainer);
    });

    // Highlight CSS
    const style = document.createElement('style');
    style.innerHTML = `
      .highlighted-xpath {
        outline: 2px solid red;
      }
      #autocompleteList li {
        padding: 8px;
        cursor: pointer;
      }
      #autocompleteList li:hover, #autocompleteList li.active {
        background-color: #007bff;
        color: white;
      }
    `;
    document.head.appendChild(style);

    // XPath functions and axes
    const xpathFunctions = ['contains(', 'starts-with(', 'normalize-space(', 'substring(', 'not(', 'position()'];
    const xpathAxes = ['ancestor::', 'ancestor-or-self::', 'child::', 'descendant::', 'descendant-or-self::', 'following::', 'following-sibling::', 'parent::', 'preceding::', 'preceding-sibling::', 'self::'];

    let currentSuggestionIndex = -1; // Track the currently selected suggestion

    // Function to tokenize the XPath
    function tokenizeXPath(xpath) {
        const tokenRegex = /(\.\.|\.\.\/|\/\/|\/|::|\(|\)|\[@|[@]|\[\d+\]|\]|\@[\w\-]+|and|or|\||[=><!]+|[\w\-:]+|\.\.|\.|".+?"|'.+?'|\w+\(\))/g;
        return xpath.match(tokenRegex) || [];
    }

    // Function to suggest completions based on the current context
    function suggestContextualCompletions(xpath) {
        const suggestions = [];
        const lastToken = xpath.trim().split(/[\s\/\[\]]+/).pop(); // Get last segment typed

        if (xpath.endsWith('[')) {
            suggestions.push("@id", "@class", "@name", "@href", "[1]", "[last()]"); // Suggest attributes and predicates
        } else if (xpath.endsWith('::') || lastToken.endsWith('::')) {
            suggestions.push(...xpathAxes); // Suggest axes when "::" is used
        } else if (xpath.endsWith('/')) {
            suggestions.push("div", "span", "a", "ul", "li", "*"); // Suggest node names or wildcard
        } else if (lastToken.includes('(')) {
            suggestions.push(...xpathFunctions); // Suggest XPath functions
        } else {
            suggestions.push(...xpathFunctions, ...xpathAxes, "@id", "@class", "@name", "[1]", "[last()]");
        }

        return suggestions;
    }

    // Function to validate the XPath using document.evaluate
    function validateXPath(xpath) {
        try {
            document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
            return { isValid: true, message: "XPath is valid." };
        } catch (e) {
            return { isValid: false, message: e.message };
        }
    }

    // Highlight matching elements
    function highlightMatchingElements(xpath) {
        try {
            const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (result.snapshotLength === 0) {
                return `No elements match the XPath: ${xpath}`;
            } else {
                // Clear previous highlights
                document.querySelectorAll('.highlighted-xpath').forEach(el => {
                    el.classList.remove('highlighted-xpath');
                });

                // Highlight matching elements
                for (let i = 0; i < result.snapshotLength; i++) {
                    let element = result.snapshotItem(i);
                    element.classList.add('highlighted-xpath');
                }
                return `Found ${result.snapshotLength} matching elements.`;
            }
        } catch (e) {
            return `Error in highlighting elements: ${e.message}`;
        }
    }

    // Detailed explanation of XPath
    function explainXPath(xpath) {
        const explanation = [];

        if (xpath.startsWith('//')) {
            explanation.push("Select all elements in the document that match the following criteria.");
        }
        if (xpath.includes('@class=')) {
            explanation.push("Filter elements where the 'class' attribute matches the given value.");
        }
        if (xpath.includes('[') && xpath.includes(']')) {
            explanation.push("Apply the condition within the brackets as a predicate.");
        }

        return explanation.length ? explanation.join(" ") : "No explanation available.";
    }

    // Error tolerance and automatic correction (simple demo)
    function autoCorrectXPath(xpath) {
        const corrections = [];

        // Common misspellings
        if (xpath.includes('desendant::')) {
            corrections.push(xpath.replace('desendant::', 'descendant::'));
        }
        if (xpath.includes('chlid::')) {
            corrections.push(xpath.replace('chlid::', 'child::'));
        }

        // Incorrect axis usage
        if (xpath.includes('::div') && !xpath.includes('ancestor::')) {
            corrections.push(xpath.replace('::div', 'ancestor::div'));
        }

        return corrections.length ? corrections : ['No corrections found'];
    }

    // Main function to validate, highlight, and provide suggestions
    function handleXPathValidation() {
        const xpathInput = document.getElementById('xpathInput').value.trim();
        const feedbackDiv = document.getElementById('feedback');
        const suggestionsDiv = document.getElementById('suggestions');
        const explanationDiv = document.getElementById('explanation');
        const autocompleteList = document.getElementById('autocompleteList');

        // Reset feedback
        feedbackDiv.innerHTML = '';
        suggestionsDiv.innerHTML = '';
        explanationDiv.innerHTML = '';

        // Validate XPath
        const validation = validateXPath(xpathInput);
        if (!validation.isValid) {
            feedbackDiv.innerHTML = `<p style="color: red;">${validation.message}</p>`;
            const corrections = autoCorrectXPath(xpathInput);
            if (corrections.length) {
                suggestionsDiv.innerHTML = `<p>Corrections: ${corrections.join(', ')}</p>`;
            }
        } else {
            feedbackDiv.innerHTML = `<p style="color: green;">${validation.message}</p>`;
            const highlightResult = highlightMatchingElements(xpathInput);
            feedbackDiv.innerHTML += `<p>${highlightResult}</p>`;
        }

        // If the input is empty or valid, hide the suggestion box
        if (!xpathInput || validation.isValid) {
            autocompleteList.style.display = 'none';
        }

        // Provide suggestions for completion
        const completions = suggestContextualCompletions(xpathInput);
        if (completions.length > 0) {
            suggestionsDiv.innerHTML = `<p>Suggestions: ${completions.join(', ')}</p>`;
        }

        // Explanation of the XPath
        explanationDiv.innerHTML = `<p>Explanation: ${explainXPath(xpathInput)}</p>`;
    }

    // Function to display autocomplete suggestions
    function displayAutocompleteSuggestions(suggestions) {
        const autocompleteList = document.getElementById('autocompleteList');
        autocompleteList.innerHTML = '';
        if (suggestions.length === 0) {
            autocompleteList.style.display = 'none';
            return;
        }

        suggestions.forEach((suggestion, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = suggestion;
            listItem.setAttribute('data-index', index);
            listItem.addEventListener('click', () => {
                const xpathInput = document.getElementById('xpathInput');
                xpathInput.value += suggestion;  // Append the suggestion to the input
                autocompleteList.style.display = 'none';
                xpathInput.focus();
            });
            autocompleteList.appendChild(listItem);
        });

        autocompleteList.style.display = 'block';
    }

    // Handle arrow key navigation for autocomplete suggestions
    function handleArrowKeyNavigation(e) {
        const autocompleteList = document.getElementById('autocompleteList');
        const items = autocompleteList.querySelectorAll('li');
        
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            currentSuggestionIndex = (currentSuggestionIndex + 1) % items.length;  // Move down
            e.preventDefault(); // Prevent default behavior (scroll)
        } else if (e.key === 'ArrowUp') {
            currentSuggestionIndex = (currentSuggestionIndex - 1 + items.length) % items.length;  // Move up
            e.preventDefault(); // Prevent default behavior (scroll)
        } else if (e.key === 'Enter' && currentSuggestionIndex !== -1) {
            items[currentSuggestionIndex].click();  // Select current suggestion
            currentSuggestionIndex = -1;
            e.preventDefault(); // Prevent form submission
            return;
        } else if (e.key === 'Tab' && currentSuggestionIndex !== -1) {
            e.preventDefault(); // Prevent default tab behavior
            items[currentSuggestionIndex].click();  // Select current suggestion with Tab key
            currentSuggestionIndex = -1;
        }

        // Highlight the selected suggestion, ensure it exists
        items.forEach(item => item.classList.remove('active'));
        if (items[currentSuggestionIndex]) {
            items[currentSuggestionIndex].classList.add('active');

            // Ensure the active item is in view
            items[currentSuggestionIndex].scrollIntoView({ block: "nearest" });
        }
    }

    // Add event listeners
    document.getElementById('validateXPathBtn').addEventListener('click', handleXPathValidation);

    // Autocomplete suggestions on input
    document.getElementById('xpathInput').addEventListener('input', function () {
        const xpathInput = this.value;
        const suggestions = suggestContextualCompletions(xpathInput);
        displayAutocompleteSuggestions(suggestions);
        currentSuggestionIndex = -1; // Reset suggestion index when typing

        // If there is no input or it's valid, hide suggestions
        const validation = validateXPath(xpathInput);
        const autocompleteList = document.getElementById('autocompleteList');
        if (!xpathInput || validation.isValid) {
            autocompleteList.style.display = 'none';
        }
    });

    // Handle Enter, Tab, and arrow key navigation in autocomplete
    document.getElementById('xpathInput').addEventListener('keydown', handleArrowKeyNavigation);

    // Handle Enter key for validation
    document.getElementById('xpathInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && currentSuggestionIndex === -1) {
            handleXPathValidation();
        }
    });
})();
