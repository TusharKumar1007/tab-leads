const inputEl = document.querySelector("#input-el");
const itemsContainer = document.querySelector(".savedItems");
const saveBtn = document.querySelector(".save-btn");
const tabBtn = document.querySelector(".tab-btn");
const delBtn = document.querySelector(".del-btn");
const editBtn = document.querySelector(".edit");
const inputEditEl = document.querySelector(".input-edit-el");

const darkModeArr = ['#0D1117', '#121212', '#2B1E1E', '#000', '#1B263B'];
const lightModeArr = ['#FAF0E6', '#F0EAD6', '#F5F5DC', '#fff', '#F8E9D2'];

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
    console.log("Saved theme:", mode, color);
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




console.log("Using chrome.storage.local for Chrome Extension data!");

inputEditEl.classList.add("hidden");

let saveLst = [];


chrome.storage.local.get("myList", (result) => {
  if (result.myList) {
    saveLst = result.myList;
    renderItems(saveLst);
  }
});


function saveToChromeStorage(lst) {
  chrome.storage.local.set({ myList: lst }, () => {
    console.log("List saved to chrome.storage.local");
  });
}

inputEl.addEventListener("keypress", (event) => {
  if (event.key === "Enter") saveInput();
});

function saveInput() {
  const link = inputEl.value.trim();

  if (link === "") {
    inputEl.setAttribute("placeholder", "Paste Your Link Here");
    return;
  }

  saveLst.push({
    id: saveLst.length === 0 ? 1 : saveLst[saveLst.length - 1].id + 1,
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
      saveLst.push({
        id: saveLst.length === 0 ? 1 : saveLst[saveLst.length - 1].id + 1,
        customName: activeTab.title,
        value: activeTab.url,
      });
      saveToChromeStorage(saveLst);
      renderItems(saveLst);
    }
  });
});

function renderItems(itemsLst) {
  itemsContainer.innerHTML = "";
  let listItems = "";
  itemsLst.forEach((item) => {
    listItems += `
      <li>
        <button class='bin' data-id='${item.id}' title='Delete'>🗑️</button>
        <a id='editableLink-${item.id}' href='${item.value}' target='_blank'>
          ${item.customName ? item.customName : item.value}
        </a>
        <button class='edit_link' data-id='${item.id}' title='Edit link'>🔗</button>
        <button class='edit_text' data-id='${item.id}' title='Rename link'>✏️</button>
      </li>`;
  });
  itemsContainer.innerHTML = listItems;

  itemsContainer.addEventListener("click", handleItemAction);
}

function handleItemAction(e) {
  if (e.target.classList.contains("bin")) {
    const itemId = parseInt(e.target.dataset.id, 10);
    deleteItem(itemId);
  } else if (e.target.classList.contains("edit_text")) {
    const itemId = parseInt(e.target.dataset.id, 10);
    editItemText(itemId);
  } else if (e.target.classList.contains("edit_link")) {
    const itemId = parseInt(e.target.dataset.id, 10);
    editItemLink(itemId);
  }
}

function deleteItem(id) {
  saveLst = saveLst.filter((item) => item.id !== id);
  saveToChromeStorage(saveLst);
  renderItems(saveLst);
}

function editItemText(id) {
  const anchor = document.getElementById(`editableLink-${id}`);
  if (!anchor) return;

  const input = document.createElement("input");
  input.type = "text";
  input.value = anchor.textContent.trim();
  input.id = `tempInput-${id}`;
  input.spellcheck = false;

  anchor.replaceWith(input);
  input.focus();
  input.select();

  input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      const newAnchor = document.createElement("a");
      newAnchor.href = "#";
      newAnchor.id = `editableLink-${id}`;
      newAnchor.textContent = input.value;
      input.replaceWith(newAnchor);

      const item = saveLst.find((item) => item.id === id);
      if (item) {
        item.customName = input.value.trim();
        saveToChromeStorage(saveLst);
        renderItems(saveLst);
      }
    }
  });
}

function editItemLink(id) {
  const anchor = document.getElementById(`editableLink-${id}`);
  if (!anchor) return;

  const item = saveLst.find((item) => item.id === id);

  const input = document.createElement("input");
  input.type = "text";
  input.value = item.value.trim();
  input.id = `tempInput-${id}`;
  input.spellcheck = false;

  anchor.replaceWith(input);
  input.focus();
  input.select();

  input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      const newAnchor = document.createElement("a");
      newAnchor.href = "#";
      newAnchor.id = `editableLink-${id}`;
      newAnchor.textContent = input.value;
      input.replaceWith(newAnchor);

      if (item) {
        item.value = input.value.trim();
        saveToChromeStorage(saveLst);
        renderItems(saveLst);
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
