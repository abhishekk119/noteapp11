import { saveNotesToStorage } from "./storage.js";

export function updatePinnedNotesVisibility() {
  const pinnedNotesArea = document.getElementById("pinned-notes-wrapper");
  const pinnedNotesDiv = document.getElementById("pinned-notes");
  const pinnedtext = document.getElementById("pinnedtext");

  if (pinnedNotesArea.children.length === 0) {
    pinnedtext.style.display = "none";
    pinnedNotesDiv.style.opacity = "0";
    pinnedNotesArea.style.display = "none";
  } else {
    pinnedtext.style.display = "block";
    pinnedNotesDiv.style.opacity = "1";
    pinnedNotesArea.style.display = "flex";
  }
  saveNotesToStorage();
}

export function handleImageBackground(note) {
  const icons = note.querySelectorAll(
    ".fa-palette, .fa-thumbtack, .fa-trash-alt, .fa-link-slash, .fa-square-check"
  );
  icons.forEach((icon) => {
    icon.style.color = "white";
  });
  saveNotesToStorage();
}

export function handleCheckboxAdding(notebody) {
  // Only proceed if the note is expanded
  const note = notebody.closest(".note");
  if (!note || !note.classList.contains("expanded")) return;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "note-checkbox";
  checkbox.checked = false;

  const checkboxDiv = document.createElement("div");
  const textspan = document.createElement("span");
  textspan.textContent = "";
  textspan.contentEditable = note.classList.contains("expanded");
  textspan.className = "checkbox-text";

  checkboxDiv.appendChild(checkbox);
  checkboxDiv.appendChild(textspan);
  notebody.appendChild(checkboxDiv);

  // Add change handler that saves state
  checkbox.addEventListener("change", function () {
    if (this.checked) {
      textspan.classList.add("checked-item");
    } else {
      textspan.classList.remove("checked-item");
    }
    saveNotesToStorage(); // Save immediately on change
  });

  textspan.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const paragraph = document.createElement("p");
      paragraph.contentEditable = note.classList.contains("expanded");
      paragraph.textContent = "";
      paragraph.classList.add("paragraph");

      checkboxDiv.parentNode.insertBefore(paragraph, checkboxDiv.nextSibling);
      setTimeout(() => paragraph.focus(), 0);
    }
  });

  // Focus the new checkbox text
  setTimeout(() => textspan.focus(), 0);
  saveNotesToStorage();
}
