<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dynamic Breadcrumb with Add Section/Group/Key-Value</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f2f5;
    }
    .breadcrumb {
      display: flex;
      flex-wrap: wrap;
      padding: 12px;
      background-color: #ffffff;
      border-radius: 8px;
      list-style: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      align-items: center;
      margin: 20px;
    }
    .breadcrumb-item {
      margin-right: 8px;
      position: relative;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 6px;
    }
    .breadcrumb-item + .breadcrumb-item::before {
      content: '>';
      margin-right: 10px;
      color: #6c757d;
      font-weight: bold;
    }
    .breadcrumb-item a {
      text-decoration: none;
      color: #007bff;
      font-weight: 500;
      font-size: 14px;
    }
    .breadcrumb-item:hover {
      background-color: #e9ecef;
      transition: background-color 0.3s;
    }
    .breadcrumb-item .dropdown-content {
      display: none;
      position: absolute;
      background-color: #fff;
      min-width: 160px;
      box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
      padding: 10px;
      z-index: 1;
      left: 0;
      top: 35px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    .breadcrumb-item:hover .dropdown-content {
      display: block;
    }
    .dropdown-content a {
      text-decoration: none;
      display: block;
      padding: 8px 10px;
      color: #007bff;
      font-size: 13px;
      font-weight: 400;
    }
    .dropdown-content a:hover {
      background-color: #f1f1f1;
    }
    .breadcrumb-actions {
      display: flex;
      gap: 10px;
      margin: 20px;
    }
    .breadcrumb-actions button {
      padding: 8px 12px;
      border: none;
      background-color: #007bff;
      color: white;
      cursor: pointer;
      border-radius: 6px;
      font-size: 14px;
      transition: background-color 0.3s;
    }
    .breadcrumb-actions button:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <h2 style="margin: 20px">
    Dynamic Breadcrumb with Group and Section Navigation
  </h2>

  <ul class="breadcrumb" id="breadcrumb"></ul>

  <!-- Action buttons for adding new sections or groups -->
  <div class="breadcrumb-actions">
    <button id="add-section">Add Section</button>
    <button id="add-group">Add Group</button>
    <button id="add-keyvalue">Add Key-Value</button>
  </div>

  <script>
    // Mock object structure to represent the state of your data.
    let dataStructure = {
      sectionName: {
        nestedSection: {
          nestedGroup: [{ item1: 'value1' }, { item2: 'value2' }],
        },
      },
    };

    let currentPath = [];

    // Helper function to get the current object based on the currentPath
    function getCurrentObject() {
      let obj = dataStructure;
      currentPath.forEach(key => {
        if (key.includes('[')) {
          // Handle array paths like groupName[0]
          const [groupName, index] = key.match(/([^\[]+)\[(\d+)\]/).slice(1, 3);
          obj = obj[groupName][parseInt(index, 10)];
        } else {
          obj = obj[key];
        }
      });
      return obj;
    }

    // Function to update the breadcrumb dynamically
    function updateBreadcrumb() {
      const breadcrumb = document.getElementById('breadcrumb');
      breadcrumb.innerHTML = ''; // Clear existing breadcrumbs

      let currentObject = dataStructure;

      // Iterate through the currentPath to build the breadcrumb
      currentPath.forEach((key, index) => {
        const breadcrumbItem = document.createElement('li');
        breadcrumbItem.className = 'breadcrumb-item dropdown';

        // Create an anchor element for the breadcrumb item
        const breadcrumbLink = document.createElement('a');
        breadcrumbLink.href = '#';
        breadcrumbLink.textContent = key; // Set the key name for the breadcrumb item

        // Append the anchor link to the breadcrumb item
        breadcrumbItem.appendChild(breadcrumbLink);

        // Dropdown content with forward (child) sections or group elements
        const dropdownContent = document.createElement('div');
        dropdownContent.className = 'dropdown-content';

        // Check if the current object is an array (group)
        if (Array.isArray(currentObject[key])) {
          breadcrumbLink.textContent = `${key} [ ]`; // Display as groupName [ ]

          // Populate the dropdown with group items (elements in the array)
          currentObject[key].forEach((item, arrayIndex) => {
            const groupLink = document.createElement('a');
            groupLink.href = '#';
            groupLink.textContent = `${key} [${arrayIndex}]`;

            // Add event listener for dropdown item clicks (forward/backward navigation)
            groupLink.addEventListener('click', e => {
              e.preventDefault();
              // Update path based on dropdown selection
              if (currentPath.length > index + 1) {
                currentPath = currentPath.slice(0, index + 1); // Reset deeper path levels
              }
              currentPath.push(`${key}[${arrayIndex}]`);
              updateBreadcrumb(); // Refresh the breadcrumb
            });

            dropdownContent.appendChild(groupLink);
          });
        } else {
          // For regular sections (not groups), handle child items
          if (typeof currentObject[key] === 'object') {
            const children = Object.keys(currentObject[key] || {});
            children.forEach(childKey => {
              const childLink = document.createElement('a');
              childLink.href = '#';
              childLink.textContent = childKey;

              // Add event listener for dropdown item clicks (forward/backward navigation)
              childLink.addEventListener('click', e => {
                e.preventDefault();
                // Update path based on dropdown selection
                if (currentPath.length > index + 1) {
                  currentPath = currentPath.slice(0, index + 1); // Reset deeper path levels
                }
                currentPath.push(childKey);
                updateBreadcrumb(); // Refresh the breadcrumb
              });

              dropdownContent.appendChild(childLink);
            });
          }
        }

        breadcrumbItem.appendChild(dropdownContent);

        // Add event listener for breadcrumb item clicks (forward/backward navigation)
        breadcrumbLink.addEventListener('click', e => {
          e.preventDefault();

          // If we're clicking on an item that is deeper or at the same level, slice the path
          if (index < currentPath.length - 1) {
            // Backward navigation: Slice the path up to the clicked breadcrumb item
            currentPath = currentPath.slice(0, index + 1);
          } else if (index === currentPath.length - 1) {
            // Forward navigation: Add the clicked breadcrumb as the last item in the path
            if (currentPath.length > index + 1) {
              currentPath = currentPath.slice(0, index + 1);
            }
          }
          updateBreadcrumb(); // Refresh breadcrumb to reflect the updated path
        });

        breadcrumb.appendChild(breadcrumbItem);

        // Navigate deeper into the object for the next level
        currentObject = Array.isArray(currentObject[key])
          ? currentObject[key] // If it's an array, stay at the group level
          : currentObject[key];
      });
    }

    // Add Section functionality
    function addSection() {
      const currentObject = getCurrentObject();
      const isObject = !Array.isArray(currentObject);
      if (isObject) {
        const sectionName = prompt('Enter the name of the new section:');
        if (sectionName) {
          // Add new section at the current path (object)
          currentObject[sectionName] = {}; // Add new empty section
          currentPath.push(sectionName); // Move into the new section
          updateBreadcrumb(); // Update UI
        }
      }
    }

    // Add Group functionality
    function addGroup() {
      const currentObject = getCurrentObject();
      const isObject = !Array.isArray(currentObject);
      if (isObject) {
        let sectionName = prompt('Enter the name of the new section:');
        currentObject[sectionName] = [{}]; // Add new empty section
        currentObject = currentObject[sectionName];
        currentPath.push(sectionName);
      } else {
        let index = currentObject.push({});
        currentPath.push(index - 1);
      }
      updateBreadcrumb(); // Update UI
    }

    // Add Key-Value Pair functionality
    function addKeyValue() {
      const currentObject = getCurrentObject();
      let path;
      if (typeof currentObject === 'string' || Array.isArray(currentObject)) {
        path = currentPath.slice(0, -1);
      }
      const keyName = prompt('Enter the key name:');
      const keyValue = prompt('Enter the key value:');
      if (keyName && keyValue) {
        // Add new key-value pair at the current path
        currentObject[keyName] = keyValue; // Add the key-value pair
        updateBreadcrumb(); // Update UI
      }
    }

    // Initialize breadcrumb with the root
    currentPath.push('sectionName');
    updateBreadcrumb();

    document.getElementById('add-section').addEventListener('click', addSection);
    document.getElementById('add-group').addEventListener('click', addGroup);
    document.getElementById('add-keyvalue').addEventListener('click', addKeyValue);
  </script>

</body>
</html>
