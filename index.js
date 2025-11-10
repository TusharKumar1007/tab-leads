const inputEl = document.querySelector("#input-el");
const itemsContainer = document.querySelector(".savedItems");
const saveBtn = document.querySelector(".save-btn");
const tabBtn = document.querySelector(".tab-btn");
const delBtn = document.querySelector(".del-btn");
const editBtn = document.querySelector(".edit");
const inputEditEl = document.querySelector(".input-edit-el");

inputEditEl.classList.add("hidden");

let saveLst = [];

// Load data from chrome.storage
chrome.storage.local.get(["myList"], (result) => {
  if (result.myList) {
    saveLst = result.myList;
    renderItems(saveLst);
  }
});

function saveToLocalStorage(lst) {
  chrome.storage.local.set({ myList: lst });
}

function saveInput() {
  const link = inputEl.value;

  if (link.trim() === "") {
    inputEl.setAttribute("placeholder", "Paste Your Link Here");
    return;
  }

  saveLst.push({
    id: saveLst.length === 0 ? 1 : saveLst.length + 1,
    customName: inputEditEl.value,
    value: inputEl.value,
  });

  inputEl.value = "";
  inputEditEl.value = "";
  inputEditEl.classList.add("hidden");

  saveToLocalStorage(saveLst);
  renderItems(saveLst);
}

tabBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    saveLst.push({
      id: saveLst.length === 0 ? 1 : saveLst.length + 1,
      value: activeTab.url,
    });
    saveToLocalStorage(saveLst);
    renderItems(saveLst);
  });
});

function renderItems(itemsLst) {
  itemsContainer.innerHTML = "";
  let listItems = "";
  itemsLst.forEach((item) => {
    listItems += `
      <li>
        <button class='bin' data-id='${item.id}'>🗑️</button>
        <a id='editableLink-${item.id}' href='${item.value}' target='_blank'>
          ${item.customName ? item.customName : item.value}
        </a>
        <button class='edit_text' data-id='${item.id}' title='Name your link'>✏️</button>
      </li>`;
  });
  itemsContainer.innerHTML = listItems;

  itemsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("bin")) {
      const itemId = parseInt(e.target.dataset.id, 10);
      deleteItem(itemId);
    } else if (e.target.classList.contains("edit_text")) {
      const itemId = parseInt(e.target.dataset.id, 10);
      editItemText(itemId);
    }
  });
}

function deleteItem(id) {
  saveLst = saveLst.filter((item) => item.id !== id);
  saveToLocalStorage(saveLst);
  renderItems(saveLst);
}

function editItemText(id) {
  const anchor = document.getElementById(`editableLink-${id}`);
  if (!anchor) return;

  const input = document.createElement("input");
  input.type = "text";
  input.value = anchor.textContent;
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
        item.customName = input.value;
        saveToLocalStorage(saveLst);
        renderItems(saveLst);
      }
    }
  });
}

saveBtn.addEventListener("click", saveInput);

delBtn.addEventListener("click", () => {
  saveLst = [];
  saveToLocalStorage(saveLst);
  renderItems();
});

editBtn.addEventListener("click", () => {
  if (inputEl.value) {
    inputEditEl.classList.remove("hidden");
    inputEditEl.focus();
  } else {
    inputEl.setAttribute("placeholder", "Add a url here");
  }
});   