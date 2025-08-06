import { notewrapper, nonotetext, addButton } from "./config.js";
import { handleColorSelection } from "./note-colors-pinning.js";
import { handleNotePinning } from "./note-colors-pinning.js";
import { handleCheckboxAdding } from "./note-utilities.js";
import { handleDeleteNote } from "./note-creation-helpers.js";
import { openNote } from "./note-creation-helpers.js";
import { sortNotesByDate } from "./note-creation-helpers.js";
import { handleImageBackground } from "./note-utilities.js";
import { saveNotesToStorage } from "./storage.js";
import { loadNotesFromStorage } from "./storage.js";
import { updatePinnedNotesVisibility } from "./note-utilities.js";

// Add this after your existing imports
document.addEventListener("DOMContentLoaded", () => {
  const gradients = document.querySelectorAll(".gradient");
  gradients.forEach((gradient) => {
    gradient.addEventListener("click", (e) => {
      e.stopPropagation();
      const color1 = e.currentTarget.dataset.color1;
      const color2 = e.currentTarget.dataset.color2;
      const backgroundChanger = document.querySelector(
        '.backgroundChangerDiv[style*="display: flex"]'
      );
      const activeNote = backgroundChanger?.closest(".note");
      if (activeNote) {
        changeBackground(color1, color2, activeNote);
      }
    });
  });
});

loadNotesFromStorage();

addButton.addEventListener("click", function () {
  addANote();
  sortNotesByDate("desc");
  document.activeElement.blur();
});

export function addANote() {
  const noteTitle = document.getElementById("title-area").value.trim();
  const noteBody = document.getElementById("take-a-note-textarea").value;
  //check if the note is empty
  if (noteBody === "") {
    return;
  }

  // Remove empty state message if it exists
  nonotetext.style.display = "none";
  //create note div
  const note = document.createElement("div");
  note.classList.add("note", "animate__animated", "animate__rubberBand");
  note.classList.add("note");
  note.style.backgroundColor = "white";
  note.setAttribute("tabindex", "0");
  note.style.backgroundSize = "cover";
  note.style.backgroundRepeat = "no-repeat"; // Prevents tiling
  note.style.backgroundPosition = "center"; // Centers the image

  // Add timestamp as data attribute
  const timestamp = new Date();
  note.dataset.createdAt = timestamp.toISOString();
  const dateElement = document.createElement("small");
  dateElement.textContent = timestamp.toLocaleString("en-US", {
    hour12: true, // 12-hour format (AM/PM)
    year: "numeric", // e.g., "2023"
    month: "numeric", // e.g., "8" (or 'short' → "Aug")
    day: "numeric", // e.g., "6"
    hour: "numeric", // e.g., "3" (or '2-digit' → "03")
    minute: "numeric", // e.g., "45"
    second: "numeric", // e.g., "30" (optional)
  });
  dateElement.style.display = "block";
  dateElement.style.marginBottom = "8px";
  dateElement.style.opacity = "0.7";

  //create h3 element for title
  const titleElement = document.createElement("h3");
  titleElement.textContent = noteTitle || "Untitled Note";

  //create p element for notebody
  const bodyElement = document.createElement("p");
  bodyElement.innerHTML = noteBody
    .replace(/\n/g, "<br>")
    .replace(/ /g, "&nbsp;"); //

  const topdiv = document.createElement("div");
  topdiv.classList.add("topdiv");

  const closebutton = document.createElement("button");
  closebutton.classList.add("closebutton");
  closebutton.textContent = "X";

  topdiv.appendChild(titleElement);
  topdiv.appendChild(closebutton);

  //create contentDiv to hold bodyElement
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("note-content");

  //add (append) titleElement and dateElement to note div
  note.appendChild(topdiv);
  note.appendChild(dateElement);
  //append bodyElement to contentDiv
  contentDiv.appendChild(bodyElement);
  //append contentDiv to note
  note.appendChild(contentDiv);

  //create noteoptions div
  const noteOptionsDiv = document.createElement("div");
  noteOptionsDiv.classList.add("noteoptions");

  //background changine div
  const backgroundChangerDiv = document.createElement("div");
  backgroundChangerDiv.classList.add("backgroundChangerDiv");
  backgroundChangerDiv.style.display = "none";

  //colorSelectDiv for handling color slection pop up
  const colorSelectDiv = document.createElement("div");
  colorSelectDiv.classList.add("colorSelectDiv");
  //colorSelectDiv.style.display = "none";

  const color1 = document.createElement("div");
  color1.style.height = "30px";
  color1.style.width = "30px";
  color1.style.borderRadius = "50%";
  color1.style.backgroundColor = "#5d4037";
  color1.style.border = "2px solid white";
  color1.onclick = function (e) {
    e.stopPropagation();
    handleColorSelection("#5d4037");
  };

  const color2 = document.createElement("div");
  color2.style.height = "30px";
  color2.style.width = "30px";
  color2.style.borderRadius = "50%";
  color2.style.backgroundColor = "#1a1a1a";
  color2.style.border = "2px solid white";
  color2.onclick = function (e) {
    e.stopPropagation();
    handleColorSelection("#1a1a1a");
  };

  const color3 = document.createElement("div");
  color3.style.height = "30px";
  color3.style.width = "30px";
  color3.style.borderRadius = "50%";
  color3.style.backgroundColor = "#fff475";
  color3.style.border = "2px solid white";
  color3.onclick = function (e) {
    e.stopPropagation();
    handleColorSelection("#fff475");
  };

  const color4 = document.createElement("div");
  color4.style.height = "30px";
  color4.style.width = "30px";
  color4.style.borderRadius = "50%";
  color4.style.backgroundColor = "#ccff90";
  color4.style.border = "2px solid white";
  color4.onclick = function (e) {
    e.stopPropagation();
    handleColorSelection("#ccff90");
  };

  const color5 = document.createElement("div");
  color5.style.height = "30px";
  color5.style.width = "30px";
  color5.style.borderRadius = "50%";
  color5.style.backgroundColor = "#cbf0f8";
  color5.style.border = "2px solid white";
  color5.onclick = function (e) {
    e.stopPropagation();
    handleColorSelection("#cbf0f8");
  };

  const color6 = document.createElement("div");
  color6.style.height = "30px";
  color6.style.width = "30px";
  color6.style.borderRadius = "50%";
  color6.style.backgroundColor = "#a25d5dff";
  color6.style.border = "2px solid white";
  color6.onclick = function (e) {
    e.stopPropagation();
    handleColorSelection("#a25d5dff");
  };

  const color7 = document.createElement("div");
  color7.style.height = "30px";
  color7.style.width = "30px";
  color7.style.borderRadius = "50%";
  color7.style.backgroundColor = "#7070bcff";
  color7.style.border = "2px solid white";
  color7.onclick = function (e) {
    e.stopPropagation();
    handleColorSelection("#7070bcff");
  };

  const color8 = document.createElement("div");
  color8.style.height = "30px";
  color8.style.width = "30px";
  color8.style.borderRadius = "50%";
  color8.style.backgroundColor = "#8855acff";
  color8.style.border = "2px solid white";
  color8.onclick = function (e) {
    e.stopPropagation();
    handleColorSelection("#8855acff");
  };

  colorSelectDiv.appendChild(color1);
  colorSelectDiv.appendChild(color2);
  colorSelectDiv.appendChild(color3);
  colorSelectDiv.appendChild(color4);
  colorSelectDiv.appendChild(color5);
  colorSelectDiv.appendChild(color6);
  colorSelectDiv.appendChild(color7);
  colorSelectDiv.appendChild(color8);

  const backwrapper = document.createElement("div");
  backwrapper.classList.add("background-wrapper");
  backwrapper.style.display = "none";

  // Then add your gradients to this new backwrapper (copy the gradient creation code from your HTML)
  const gradients = [
    { color1: "#000046", color2: "#1CB5E0" },
    { color1: "#007991", color2: "#78ffd6" },
    { color1: "#56ccf2", color2: "#2f80ed" },
    { color1: "#f2994a", color2: "#f2c94c" },
    { color1: "#4ac29a", color2: "#bdfff3" },
    { color1: "#44A08D", color2: "#093637" },
    { color1: "#c33764", color2: "#1d2671" },
    { color1: "#6190e8", color2: "#a7bfe8" },
  ];

  gradients.forEach((gradient) => {
    const gradientDiv = document.createElement("div");
    gradientDiv.classList.add("gradient");
    gradientDiv.dataset.color1 = gradient.color1;
    gradientDiv.dataset.color2 = gradient.color2;
    gradientDiv.style.background = `linear-gradient(to right, ${gradient.color1}, ${gradient.color2})`;
    gradientDiv.addEventListener("click", (e) => {
      e.stopPropagation();
      changeBackground(gradient.color1, gradient.color2, note);
    });
    backwrapper.appendChild(gradientDiv);
  });

  // Then add it to your backgroundChangerDiv
  backgroundChangerDiv.appendChild(colorSelectDiv);
  backgroundChangerDiv.appendChild(backwrapper);

  //document.body.appendChild(backgroundChangerDiv);

  //create color selector button
  const colorSelectorButton = document.createElement("button");
  colorSelectorButton.style.background = "none";
  colorSelectorButton.style.border = "none";
  colorSelectorButton.style.cursor = "pointer";
  colorSelectorButton.classList.add("animate");
  const colorIcon = document.createElement("i");
  colorIcon.className = "fas fa-palette"; // Palette icon
  colorIcon.style.fontSize = "20px";
  colorSelectorButton.appendChild(colorIcon);

  //delete note button option
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.type = "button"; // Prevent form submission
  const deleteIcon = document.createElement("i");
  deleteIcon.className = "fas fa-trash-alt"; // Trash icon
  deleteIcon.style.fontSize = "20px";
  //deleteIcon.classList.add("delete-icon");
  deleteButton.appendChild(deleteIcon);

  //pinned note button
  const pinnedButton = document.createElement("button");
  pinnedButton.classList.add("pin-button");
  pinnedButton.style.background = "none";
  pinnedButton.style.border = "none";
  pinnedButton.style.cursor = "pointer";
  const pinImg = document.createElement("i");
  pinImg.className = "fas fa-thumbtack"; // Thumbtack/pin icon
  pinImg.style.fontSize = "20px";
  pinnedButton.appendChild(pinImg);

  //checkbox button
  const checkboxButton = document.createElement("button");
  checkboxButton.classList.add("checkbox-button");
  checkboxButton.style.background = "none";
  checkboxButton.style.border = "none";
  checkboxButton.style.cursor = "pointer";
  const checkboxImg = document.createElement("i");
  checkboxImg.className = "fa-regular fa-square-check";
  checkboxImg.style.fontSize = "20px";
  checkboxButton.appendChild(checkboxImg);

  //append colorSelectorButton and deleteButton to noteOptionsDiv
  noteOptionsDiv.appendChild(pinnedButton);
  noteOptionsDiv.appendChild(checkboxButton);
  noteOptionsDiv.appendChild(colorSelectorButton);
  noteOptionsDiv.appendChild(deleteButton);
  noteOptionsDiv.appendChild(backgroundChangerDiv);
  //append noteOptionsDiv to note
  //note.appendChild(backgroundChangerDiv);
  note.appendChild(noteOptionsDiv);
  //append note to notewrapper
  notewrapper.appendChild(note);

  note.addEventListener(
    "animationend",
    () => {
      note.classList.remove("animate__animated", "animate__rubberBand");
    },
    { once: true }
  );

  deleteButton.onclick = function (e) {
    e.stopPropagation();
    handleDeleteNote(note);
  };

  note.addEventListener("click", function () {
    openNote(note);
  });

  // Replace the colorSelectorButton click event handler with this:
  colorSelectorButton.addEventListener("click", function (e) {
    e.stopPropagation();
    backwrapper.style.display = "flex";
    document.querySelectorAll(".backgroundChangerDiv").forEach((div) => {
      if (div !== backgroundChangerDiv) {
        div.style.display = "none";
      }
    });

    if (backgroundChangerDiv.style.display === "none") {
      backgroundChangerDiv.style.display = "flex";
      //backgroundChangerDiv.classList.remove("animate__wobble"); // reset in case
      void backgroundChangerDiv.offsetWidth; // reflow to restart animation
      //backgroundChangerDiv.classList.add("animate__wobble");
    } else {
      backgroundChangerDiv.style.display = "none";
    }
  });

  pinnedButton.addEventListener("click", function (e) {
    e.stopPropagation();
    handleNotePinning(note);
  });

  checkboxButton.addEventListener("click", function (e) {
    e.stopPropagation();
    handleCheckboxAdding(contentDiv, note);
  });

  closebutton.addEventListener("click", function (e) {
    e.stopPropagation();
    closeNote(note);
  });

  //make the title and note taking area clear
  document.getElementById("title-area").value = "";
  document.getElementById("take-a-note-textarea").value = "";
  saveNotesToStorage();

  return note;
}

export function closeNote(note) {
  const titleElement = note.querySelector("h3");
  const contentElement = note.querySelector(".note-content p");
  note.querySelector("h3").textContent = titleElement.textContent;
  note.querySelector(".note-content p").innerHTML =
    contentElement.innerHTML.replace(/\n/g, "<br>");

  note.classList.remove("expanded");
  backdrop.style.display = "none";

  document.body.classList.remove("backdrop-visible");

  // Remove placeholder if it exists
  if (note.placeholder && note.placeholder.parentNode) {
    note.placeholder.parentNode.removeChild(note.placeholder);
  }

  // Make content non-editable again
  titleElement.contentEditable = false;
  contentElement.contentEditable = false;

  // Also make all checkbox texts non-editable
  note.querySelectorAll(".checkbox-text").forEach((checkboxText) => {
    checkboxText.contentEditable = false;
  });

  note.querySelectorAll(".paragraph").forEach((para) => {
    para.contentEditable = false;
  });

  // Check pinned notes visibility
  updatePinnedNotesVisibility();
  sortNotesByDate();
}

export function changeBackground(val1, val2, note) {
  note.style.backgroundColor = "";
  note.style.backgroundImage = "";
  note.style.background = `linear-gradient(to right, ${val1}, ${val2})`;
  note.style.color = "white";
  const icons = note.querySelectorAll(
    ".fa-palette, .fa-thumbtack, .fa-trash-alt, .fa-link-slash, .fa-square-check, .closebutton"
  );
  icons.forEach((icon) => {
    icon.style.color = "white";
  });
  note.querySelector(".backgroundChangerDiv").style.display = "none";
}
