class XPathGenerator {
    constructor(preferences) {
        this.preferences = preferences || {};
    }

    // Utility to escape special characters in attribute values
    escapeValue(value) {
        if (!value) return '';
        return value.replace(/(["'\\])/g, '\\$1');
    }

    // Function to construct XPath based on preferences
    generateXPath(element) {
        const attrsToCheck = [
            'userAttribute',
            'placeholder',
            'id',
            'title',
            'name',
            'value',
            'aria-label',
            'alt',
            'for',
            'data-label',
            'date-fieldlabel',
            'data-displaylabel',
            'role',
            'type',
            'class',
            'other attribute',
            'text'
        ];

        let conditions = [];
        const omittedAttribute = this.preferences.omitAttribute;

        // Handle userAttribute first, if present
        if (this.preferences.userAttribute && element.hasAttribute(this.preferences.userAttribute)) {
            const value = this.escapeValue(element.getAttribute(this.preferences.userAttribute));
            const xpath = `//${element.tagName.toLowerCase()}[@${this.preferences.userAttribute}="${value}"]`;

            if (this.evaluateXPath(xpath) === 1) {
                return xpath; // If unique, return immediately
            }
        }

        // Check the remaining attributes in the given order
        for (let attr of attrsToCheck) {
            if (this.preferences[attr] && attr !== 'userAttribute' && attr !== 'omitAttribute' && attr !== omittedAttribute && element.hasAttribute(attr)) {
                const value = this.escapeValue(element.getAttribute(attr));
                const condition = `@${attr}="${value}"`;
                const xpath = `//${element.tagName.toLowerCase()}[${condition}]`;

                // Evaluate XPath for uniqueness
                if (this.evaluateXPath(xpath) === 1) {
                    return xpath; // If unique, return this XPath
                }
            }
        }

        // Fallback to combining multiple attributes if no single attribute is sufficient
        for (let attr of attrsToCheck) {
            if (this.preferences[attr] && attr !== 'userAttribute' && attr !== 'omitAttribute' && attr !== omittedAttribute && element.hasAttribute(attr)) {
                const value = this.escapeValue(element.getAttribute(attr));
                conditions.push(`@${attr}="${value}"`);
            }
        }

        if (conditions.length === 0) {
            // Fallback to tag name if no attributes found
            return `//${element.tagName.toLowerCase()}`;
        }

        // Combine remaining conditions
        const combinedXpath = `//${element.tagName.toLowerCase()}[${conditions.join(' and ')}]`;

        return combinedXpath;
    }

    // Get element index for generating indexed XPaths (optional)
    getElementIndex(element) {
        let index = 1;
        let sibling = element.previousSibling;
        while (sibling) {
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                index++;
            }
            sibling = sibling.previousSibling;
        }
        return index;
    }

    // Utility to evaluate the generated XPath
    evaluateXPath(xpath) {
        const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        return result.snapshotLength;
    }

    // Function to generate various XPaths for an element
    constructXPaths(element) {
        const xpathResults = [];

        // Generate unique XPath
        const uniqueXpath = this.generateXPath(element);
        xpathResults.push({
            xpath: uniqueXpath,
            matches: this.evaluateXPath(uniqueXpath),
            xpathType: "uniqueXpath",
            withCommand: `document.evaluate('${uniqueXpath}', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;`
        });

        // Generate other XPaths (e.g., absolute, relative) similarly as needed

        return xpathResults;
    }
}

// Example Usage
const preferences = {
    userAttribute: "data-id",
    omitAttribute: "class",
    name: "input",
    placeholder: "Search",
    id: "search-input",
    text: "Submit"
};

const generator = new XPathGenerator(preferences);
const element = document.querySelector('input[type="search"]');  // Assume this is the target element
const xpaths = generator.constructXPaths(element);
console.log(xpaths);
