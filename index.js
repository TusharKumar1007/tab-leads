const itemsContainer = document.querySelector(".savedItems");
const inputEl = document.querySelector("#input-el");
const inputEditEl = document.querySelector(".input-edit-el");
const saveBtn = document.querySelector(".save-btn");
const tabBtn = document.querySelector(".tab-btn");
const delBtn = document.querySelector(".del-btn");
const editBtn = document.querySelector(".edit");
const searchEl = document.querySelector(".searchBox");

const saveAllTabBtn = document.querySelector(".save-all-btn");
const openAllTabBtn = document.querySelector(".open-all-btn");

const darkModeArr = ["#0D1117", "#121212", "#2B1E1E", "#000", "#1B263B"];
const lightModeArr = ["#FAF0E6", "#F0EAD6", "#F5F5DC", "#fff", "#F8E9D2"];

const root = document.documentElement;
const lightBtn = document.getElementById("lightModeBtn");
const darkBtn = document.getElementById("darkModeBtn");

let currentLightIndex = 0;
let currentDarkIndex = 0;

chrome.storage.local.get(["themeMode", "bgColor"], (result) => {
  if (result.themeMode === "dark" && result.bgColor) {
    root.style.setProperty("--dark-bg", result.bgColor);
    document.body.style.backgroundColor = "var(--dark-bg)";
  } else if (result.themeMode === "light" && result.bgColor) {
    root.style.setProperty("--light-bg", result.bgColor);
    document.body.style.backgroundColor = "var(--light-bg)";
  }

  if (result.themeMode === "light") {
    const index = lightModeArr.indexOf(result.bgColor);
    currentLightIndex = index >= 0 ? index : 0;
  } else if (result.themeMode === "dark") {
    const index = darkModeArr.indexOf(result.bgColor);
    currentDarkIndex = index >= 0 ? index : 0;
  }
});

function saveThemePreference(mode, color) {
  chrome.storage.local.set({ themeMode: mode, bgColor: color }, () => {
    // console.log("Saved theme:", mode, color);
  });
}

function applyThemeVariable(mode, color) {
  if (mode === "light") {
    root.style.setProperty("--light-bg", color);
    document.body.style.backgroundColor = "var(--light-bg)";
  } else {
    root.style.setProperty("--dark-bg", color);
    document.body.style.backgroundColor = "var(--dark-bg)";
  }
}

function changeLightMode() {
  currentLightIndex = (currentLightIndex + 1) % lightModeArr.length;
  const newColor = lightModeArr[currentLightIndex];
  applyThemeVariable("light", newColor);
  saveThemePreference("light", newColor);
}

function changeDarkMode() {
  currentDarkIndex = (currentDarkIndex + 1) % darkModeArr.length;
  const newColor = darkModeArr[currentDarkIndex];
  applyThemeVariable("dark", newColor);
  saveThemePreference("dark", newColor);
}

lightBtn.addEventListener("click", changeLightMode);
darkBtn.addEventListener("click", changeDarkMode);

// console.log("Using chrome.storage.local for Chrome Extension data!");

inputEditEl.classList.add("hidden");

let saveLst = [];

const getNextId = function () {
  return saveLst.length ? saveLst.at(-1).id + 1 : 1;
};

const focusEl = function () {
  if (saveLst.length > 5) {
    searchEl.focus();
  } else {
    inputEl.focus();
  }
};

// dataFormate=[
//   {},{}
// ]

chrome.storage.local.get("myList", (result) => {
  if (result.myList) {
    saveLst = result.myList;
    focusEl();

    renderItems(saveLst);
  }
});

function saveToChromeStorage(lst) {
  chrome.storage.local.set({ myList: lst }, () => {
    // console.log("List saved to chrome.storage.local");
  });
}

inputEl.addEventListener("keypress", (event) => {
  if (event.key === "Enter") saveInput();
});

inputEditEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") saveInput();
});

function saveInput() {
  const link = inputEl.value.trim();

  if (link === "") {
    inputEl.setAttribute("placeholder", "Paste Your Link Here");
    return;
  }

  saveLst.push({
    id: getNextId(),
    customName: inputEditEl.value.trim(),
    value: link,
  });

  inputEl.value = "";
  inputEditEl.value = "";
  inputEditEl.classList.add("hidden");

  saveToChromeStorage(saveLst);
  renderItems(saveLst);
}

tabBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab && activeTab.url) {
      if (!activeTab.url || activeTab.title === "New Tab") return;
      if (saveLst.some((item) => item.value === activeTab.url)) return;

      saveLst.push({
        id: getNextId(),
        customName: activeTab.title,
        value: activeTab.url,
      });
      saveToChromeStorage(saveLst);
      renderItems(saveLst);
    }
  });
});
itemsContainer.addEventListener("click", handleItemAction);

const formatText = function (item) {
  return item.customName
    ? item.customName.length > 50
      ? item.customName.split(" ").slice(0, 4).join(" ") + "......."
      : item.customName
    : item.value.length > 50
    ? item.value.slice(0, 42) + "......."
    : item.value;
};

function renderItems(itemsLst) {
  itemsContainer.innerHTML = "";
  const fragment = document.createDocumentFragment();
  itemsLst = itemsLst.slice().sort((a, b) => b.id - a.id);

  itemsLst.forEach((item) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <button class="bin" data-id="${item.id}" >
        <img class="bin-svg" data-id="${
          item.id
        }" src="./svg/bin.svg" title="Delete link"/>
      </button>

      <a id="editableLink-${item.id}" class="linkText" href="${
      item.value
    }" title="${
      item.customName.length > 40 ? item.customName : ""
    }" target="_blank">
        ${item.customName ? item.customName : item.value}
      </a>

      <button class="edit_link" data-id="${item.id}">
        <img class="edit_link-svg" data-id="${
          item.id
        }" src="./svg/link.svg" title="Change Link"/>
      </button>

      <button class="edit_text" data-id="${item.id}">
        <img class="edit_text-svg" data-id="${
          item.id
        }" src="./svg/edit.svg" title="Rename your link"/>
      </button>
    `;
    fragment.appendChild(li);
  });

  itemsContainer.appendChild(fragment);
}

function handleItemAction(e) {
  const nodeEl = e.target;
  if (nodeEl.classList.contains("bin-svg")) {
    const nodeElMainParent = nodeEl.parentNode.parentNode;
    console.log(nodeElMainParent);
    const itemId = parseInt(nodeEl.dataset.id, 10);
    deleteItem(itemId, nodeElMainParent);
  } else if (nodeEl.classList.contains("edit_text-svg")) {
    const itemId = parseInt(nodeEl.dataset.id, 10);
    editItemText(itemId);
  } else if (nodeEl.classList.contains("edit_link-svg")) {
    const itemId = parseInt(nodeEl.dataset.id, 10);
    editItemLink(itemId);
  }
}

function deleteItem(id, nodeEl) {
  nodeEl.remove();
  saveLst = saveLst.filter((item) => item.id !== id);
  saveToChromeStorage(saveLst);
  // renderItems(saveLst);
  // searchedItems();
}

function editItemText(id) {
  const anchor = document.getElementById(`editableLink-${id}`);
  if (!anchor) return;

  const anchorHref = anchor.getAttribute("href");

  const input = document.createElement("input");
  input.type = "text";
  input.value = anchor.textContent.trim();
  input.id = `tempInput-${id}`;
  input.spellcheck = false;
  input.classList.add("edit-custom-prop-name");

  anchor.replaceWith(input);
  input.focus();
  input.select();

  input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      const newAnchor = document.createElement("a");
      newAnchor.id = `editableLink-${id}`;
      newAnchor.classList = "linkText";
      newAnchor.href = `${anchorHref}`;
      newAnchor.textContent = input.value;
      newAnchor.target = "_blank";
      input.replaceWith(newAnchor);

      const item = saveLst.find((item) => item.id === id);
      if (item) {
        item.customName = input.value.trim();
        saveToChromeStorage(saveLst);
        // renderItems(saveLst);
        // searchedItems();
      }
    }
  });
}

function editItemLink(id) {
  const anchor = document.getElementById(`editableLink-${id}`);
  if (!anchor) return;

  const anchorText = anchor.textContent;

  const item = saveLst.find((item) => item.id === id);

  const input = document.createElement("input");
  input.type = "text";
  input.value = item.value.trim();
  input.id = `tempInput-${id}`;
  input.spellcheck = false;
  input.classList.add("edit-custom-prop-link");

  anchor.replaceWith(input);
  input.focus();
  input.select();

  input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      const newAnchor = document.createElement("a");
      newAnchor.id = `editableLink-${id}`;
      newAnchor.classList = "linkText";
      newAnchor.href = `${input.value}`;
      newAnchor.textContent = anchorText;
      newAnchor.target = "_blank";
      input.replaceWith(newAnchor);

      if (item) {
        item.value = input.value.trim();
        saveToChromeStorage(saveLst);
        // renderItems(saveLst);
        // searchedItems();
      }
    }
  });
}

saveBtn.addEventListener("click", saveInput);

delBtn.addEventListener("click", () => {
  saveLst = [];
  saveToChromeStorage(saveLst);
  renderItems(saveLst);
});

editBtn.addEventListener("click", () => {
  if (inputEl.value) {
    inputEditEl.classList.remove("hidden");
    inputEditEl.focus();
  } else {
    inputEl.setAttribute("placeholder", "Add a URL here");
  }
});

function openAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    const openUrls = new Set(tabs.map((tab) => tab.url).filter(Boolean));

    saveLst.forEach((item) => {
      if (!openUrls.has(item.value)) {
        chrome.tabs.create({ url: item.value });
      }
    });
  });
}

function saveAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (!tab.url || tab.title === "New Tab") return;

      if (saveLst.some((item) => item.value === tab.url)) return;
      saveLst.push({
        id: getNextId(),
        customName: tab.title,
        value: tab.url,
      });
    });

    saveToChromeStorage(saveLst);
    renderItems(saveLst);
  });
}

const searchedItems = function () {
  const query = searchEl.value;
  if (query.toLowerCase().trim() === "") {
    renderItems(saveLst);
    return;
  }

  const results = saveLst.filter((item) =>
    item.customName.toLowerCase().includes(query.toLowerCase().trim())
  );
  if (results.length > 0) renderItems(results);
  else {
    let notFoundHtml = `
  <p style="color:red; text-align:center;">
    Could not find anything like '${query}'
  </p>
`;

    itemsContainer.innerHTML = notFoundHtml;
  }
};

searchEl.addEventListener("input", searchedItems);

openAllTabBtn.addEventListener("click", openAllTabs);
saveAllTabBtn.addEventListener("click", saveAllTabs);
