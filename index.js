const inputEl = document.querySelector("#input-el");
const itemsContainer = document.querySelector(".savedItems");
// const showBtn = document.querySelector(".show-btn");
const saveBtn = document.querySelector(".save-btn");
const tabBtn = document.querySelector(".tab-btn");
const delBtn = document.querySelector(".del-btn");
const editBtn = document.querySelector(".edit");
const inputEditEl = document.querySelector(".input-edit-el");
const editTextBtn = document.querySelector(".edit_text");

inputEditEl.classList.add("hidden");

let saveLst = [];

const lstDataFromLocalStorage = JSON.parse(localStorage.getItem("myList"));
// console.log(lstDataFromLocalStorage);

if (lstDataFromLocalStorage) {
  saveLst = lstDataFromLocalStorage;
  renderItems(saveLst);
}
// itemsContainer.classList.add("hidden");

function saveToLocalStorage(lst) {
  localStorage.setItem("myList", JSON.stringify(lst));
}

function saveInput() {
  const link = inputEl.value;

  if (link.trim() === "") {
    inputEl.setAttribute("placeholder", "Paste Your Link Here");
    return;
  }

  if (link.trim() !== "") {
    saveLst.push({
      id: saveLst.length === 0 ? 1 : saveLst.length + 1,
      customName: inputEditEl.value,
      value: inputEl.value,
    });
    inputEl.value = "";
    inputEditEl.value = "";
    inputEditEl.classList.add("hidden");

    // localStorage.setItem("myList", JSON.stringify(saveLst));
    saveToLocalStorage(saveLst);

    renderItems(saveLst);
  }
}

tabBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let activeTab = tabs[0];
    console.log(activeTab);

    saveLst.push({
      id: saveLst.length === 0 ? 1 : saveLst.length + 1,
      value: activeTab.url,
    });
    localStorage.setItem("myList", JSON.stringify(saveLst));
    renderItems(saveLst);
  });
});

function renderItems(itemsLst) {
  itemsContainer.innerHTML = "";
  let listItems = "";
  itemsLst.map((item) => {
    listItems += `<li><button class='bin' data-id='${
      item.id
    }'>🗑️</button><a id='editableLink-${item.id}' href='${
      item.value
    }' target='_blank'>${
      item.customName ? item.customName : item.value
    }</a><button class='edit_text' data-id='${
      item.id
    } title='Name your link'>✏️</button></li> `;
  });
  itemsContainer.innerHTML += listItems;

  itemsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("bin")) {
      const itemId = parseInt(e.target.dataset.id, 10); // Convert to number
      deleteItem(itemId);
    } else if (e.target.classList.contains("edit_text")) {
      const itemId = parseInt(e.target.dataset.id, 10);
      editItemText(itemId);
    }
  });
}

function deleteItem(id) {
  saveLst = saveLst.filter((item) => item.id != id);
  itemsContainer.innerHTML = "";
  saveToLocalStorage(saveLst);
  renderItems(saveLst);
}

function editItemText(id) {
  // console.log(id);

  const anchor = document.getElementById(`editableLink-${id}`);
  if (!anchor) return; // safety check

  const input = document.createElement("input");
  input.type = "text";
  input.value = anchor.textContent;
  input.id = `tempInput-${id}`;
  input.spellcheck = false;

  anchor.replaceWith(input);
  input.focus();
  input.select();

  input.addEventListener("keypress", function (event) {
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
  localStorage.clear();
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
