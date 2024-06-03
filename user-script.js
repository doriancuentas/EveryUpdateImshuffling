// ==UserScript==
// @name         Jira Rapid Board Shuffle Team
// @match        https://jira.pinadmin.com/secure/RapidBoard.jspa?rapidView=2292&projectKey=ITEDP*
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';
  
    GM_registerMenuCommand("Shuffle team", () => {
      const ghxPool = document.getElementById('ghx-pool');
      const children = Array.from(ghxPool.children);
      children.forEach(child => {
        child.style.transition = 'transform 1s ease-in-out';
        child.style.transform = `translateY(${Math.floor(Math.random() * 200) - 100}px`;
      });
      setTimeout(() => {
        ghxPool.innerHTML = '';
        children.sort(() => Math.random() - 0.5);
        children.forEach((child, index) => {
          child.style.transition = 'transform 0.6s ease-in-out';
          child.style.transform = 'translateY(0)';
          ghxPool.appendChild(child);
        });
      }, 1000);
    });
  
    GM_registerMenuCommand("Shuffle team improved", () => {
  
  
  
      function getChildrenAttributes(rootElement, selector) {
        const children = Array.from(rootElement.children);
        const result = children.map((child, index) => {
          const selectedElement = child.querySelector(selector);
          const attributeValue = selectedElement ? selectedElement.textContent : null;
          return {
            order: index,
            value: attributeValue
          };
        });
        return result;
      }
  
  
      function shuffleArray(array) {
        const shuffledArray = array.slice();
        for (let i = shuffledArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        shuffledArray.forEach((item, index) => {
          item.order = index;
        });
        return shuffledArray;
      }
  
  
      function storeDataInHiddenElement(data) {
        const jsonString = JSON.stringify(data);
        const hiddenDiv = document.createElement('div');
        hiddenDiv.id = 'hidden-data-storage';
        hiddenDiv.style.display = 'none';
        hiddenDiv.textContent = jsonString;
        document.body.appendChild(hiddenDiv);
      }
  
  
      function retrieveDataFromHiddenElement() {
        const hiddenDiv = document.getElementById('hidden-data-storage');
        if (hiddenDiv) {
          return JSON.parse(hiddenDiv.textContent);
        }
        return null;
      }
  
  
      function applyOrderFromJsonList(rootElement, selector, orderJsonList) {
        if (!Array.isArray(orderJsonList)) {
          console.error('orderJsonList is not in the expected format');
          return;
        }
  
        const orderMap = new Map(orderJsonList.map(item => [item.value, item.order]));
        const children = Array.from(rootElement.children);
        const sortedChildren = [];
  
        children.forEach(child => {
          const selectedElement = child.querySelector(selector);
          const attributeValue = selectedElement ? selectedElement.textContent : null;
          const order = orderMap.get(attributeValue);
  
          if (order !== undefined) {
            sortedChildren.push({ order, child });
          } else {
            // If there's no order (e.g., new elements), add them to the end with a large order value
            sortedChildren.push({ order: Number.MAX_VALUE, child });
          }
        });
  
        // Sort the children based on the order
        sortedChildren.sort((a, b) => a.order - b.order);
  
        // Apply animations before reordering
        children.forEach(child => {
          child.style.transition = 'transform 1s ease-in-out';
          child.style.transform = `translateY(${Math.floor(Math.random() * 200) - 100}px)`;
        });
  
        // After the animation duration, actually reorder the elements
        setTimeout(() => {
          rootElement.innerHTML = '';
          sortedChildren.forEach(item => {
            item.child.style.transition = 'transform 0.6s ease-in-out';
            item.child.style.transform = 'translateY(0)';
            rootElement.appendChild(item.child);
          });
        }, 1000);
      }
  
      function mainReorder() {
        let stored_value = retrieveDataFromHiddenElement();
        if (!stored_value) {
          let root_element = document.getElementById('ghx-pool');
          let team_member_name_selector = '.ghx-heading>span:first-of-type';
          let childrenAttributes = getChildrenAttributes(root_element, team_member_name_selector);
          stored_value = shuffleArray(childrenAttributes);
          storeDataInHiddenElement(stored_value);
        }
        let root_element = document.getElementById('ghx-pool');
        let team_member_name_selector = '.ghx-heading>span:first-of-type';
        applyOrderFromJsonList(root_element, team_member_name_selector, stored_value);
      }
  
      // Function to handle mutations
      const observerCallback = (mutationsList, observer) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
            console.log('A child node has been added, removed, or reordered.');
            observer.disconnect();
            mainReorder();
  
          }
        }
      };
  
      // Create and configure the observer
      const observer = new MutationObserver(observerCallback);
      const config = { childList: true, subtree: false }; // Watch only direct children
      const rootElement = document.getElementById('ghx-pool');
      observer.observe(rootElement, config);
  
      mainReorder();
  
  
    });
  
  })();
  