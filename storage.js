import { notewrapper, nonotetext, addButton, deletedmsg } from "./config.js";
import { handleColorSelection } from "./note-colors-pinning.js";
import { handleNotePinning } from "./note-colors-pinning.js";
import { checkIfWrapperIsEmpty } from "./note-colors-pinning.js";
import { handleCheckboxAdding } from "./note-utilities.js";
import { handleImageBackground } from "./note-utilities.js";
import { updatePinnedNotesVisibility } from "./note-utilities.js";
import { handleDeleteNote } from "./note-creation-helpers.js";
import { openNote } from "./note-creation-helpers.js";
import { sortNotesByDate } from "./note-creation-helpers.js";
import { closeNote } from "./note-creation.js";

function setIconColors(note) {
  // Get the computed background color and image
  const bgColor = window.getComputedStyle(note).backgroundColor;
  const bgImage = window.getComputedStyle(note).backgroundImage;
  const bgGradient = window.getComputedStyle(note).background;

  const icons = note.querySelectorAll(
    ".fa-palette, .fa-thumbtack, .fa-trash-alt, .fa-link-slash, .fa-square-check, .closebutton"
  );

  // Check for background gradient or image first
  if (bgImage !== "none" || bgGradient.includes("gradient")) {
    icons.forEach((icon) => {
      icon.style.color = "white";
    });
    return;
  }

  // Check for light backgrounds that need black icons
  const lightColors = [
    "rgb(255, 244, 117)", // #fff475
    "rgb(204, 255, 144)", // #ccff90
    "rgb(203, 240, 248)", // #cbf0f8
    "rgb(255, 255, 255)", // white
    "#fff475",
    "#ccff90",
    "#cbf0f8",
    "white",
  ];

  if (lightColors.includes(bgColor.toLowerCase())) {
    icons.forEach((icon) => {
      icon.style.color = "black";
    });
  } else {
    icons.forEach((icon) => {
      icon.style.color = "white";
    });
  }
}

export function saveNotesToStorage() {
  const notes = [];
  const noteElements = document.querySelectorAll(".note");

  noteElements.forEach((note) => {
    const contentDiv = note.querySelector(".note-content");
    const noteData = {
      id:
        note.id ||
        `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: note.querySelector("h3").textContent,
      body: contentDiv.innerHTML, // Save the entire content HTML
      createdAt: note.dataset.createdAt,
      backgroundColor: note.style.backgroundColor || "white",
      background: note.style.background,
      color: note.style.color || "black",
      isPinned: note.parentNode.id === "pinned-notes-wrapper",
    };
    notes.push(noteData);
  });

  try {
    localStorage.setItem("notes", JSON.stringify(notes));
  } catch (error) {
    console.error("Error saving notes to localStorage:", error);
  }
}

function restoreCheckboxes(contentDiv) {
  if (!contentDiv) return;

  // Get all checkboxes in the content
  const checkboxes = Array.from(
    contentDiv.querySelectorAll("input.note-checkbox")
  );

  // Only proceed if there are any checkboxes
  if (checkboxes.length === 0) return;

  // Restore functionality for all checkboxes
  checkboxes.forEach((checkbox) => {
    const textspan = checkbox.nextElementSibling;

    if (textspan && textspan.classList.contains("checkbox-text")) {
      // Restore checkbox change handler
      checkbox.addEventListener("change", function () {
        if (this.checked) {
          textspan.classList.add("checked-item");
        } else {
          textspan.classList.remove("checked-item");
        }
        saveNotesToStorage();
      });

      // Restore checked state if needed
      if (textspan.classList.contains("checked-item")) {
        checkbox.checked = true;
      }
    }
  });

  // Get the last checkbox and its parent div
  const lastCheckbox = checkboxes[checkboxes.length - 1];
  const lastCheckboxDiv = lastCheckbox.parentNode;
  const note = contentDiv.closest(".note");

  // Only create a new paragraph if there isn't one already after the last checkbox
  if (
    !lastCheckboxDiv.nextElementSibling ||
    !lastCheckboxDiv.nextElementSibling.classList.contains("paragraph")
  ) {
    const paragraph = document.createElement("p");
    paragraph.contentEditable = note?.classList.contains("expanded") || false;
    paragraph.textContent = "...";
    paragraph.classList.add("paragraph");

    // Insert the paragraph after the last checkbox's div
    lastCheckboxDiv.parentNode.insertBefore(
      paragraph,
      lastCheckboxDiv.nextSibling
    );
  }
}

export function loadNotesFromStorage() {
  try {
    const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    if (!notes || !Array.isArray(notes)) return;

    const notewrapper = document.getElementById("notewrapper");
    const pinnedNotesWrapper = document.getElementById("pinned-notes-wrapper");
    const nonotetext = document.getElementById("no-note-text");
    const pinnedtext = document.getElementById("pinnedtext");

    // Clear existing notes
    notewrapper.innerHTML = "";
    pinnedNotesWrapper.innerHTML = "";

    notes.forEach((noteData) => {
      const note = document.createElement("div");
      note.classList.add("note");
      note.id = noteData.id;
      note.dataset.createdAt = noteData.createdAt;
      if (noteData.background && noteData.background !== "none") {
        note.style.background = noteData.background;
        //note.style.backgroundColor = "";
      } else {
        note.style.backgroundColor = noteData.backgroundColor || "white";
        note.style.background = "none";
      }
      note.style.color = noteData.color;
      note.style.backgroundSize = "cover";
      note.style.backgroundRepeat = "no-repeat";
      note.style.backgroundPosition = "center";
      setTimeout(() => {
        setIconColors(note);
      }, 10);

      // Create title
      const titleElement = document.createElement("h3");
      titleElement.textContent = noteData.title || "Untitled Note";

      const topdiv = document.createElement("div");
      topdiv.classList.add("topdiv");

      const closebutton = document.createElement("button");
      closebutton.classList.add("closebutton");
      closebutton.textContent = "X";

      topdiv.appendChild(titleElement);
      topdiv.appendChild(closebutton);

      // Create date
      const dateElement = document.createElement("small");
      dateElement.textContent = new Date(noteData.createdAt).toLocaleString();
      dateElement.style.display = "block";
      dateElement.style.marginBottom = "8px";
      dateElement.style.opacity = "0.7";

      // Create content
      const contentDiv = document.createElement("div");
      contentDiv.classList.add("note-content");

      const bodyElement = document.createElement("p");
      //restoreCheckboxes(contentDiv, noteData.body);
      bodyElement.innerHTML = noteData.body;
      //bodyElement.contentEditable = "true";
      contentDiv.appendChild(bodyElement);
      restoreCheckboxes(bodyElement);

      // Create note options (similar to addANote())
      const noteOptionsDiv = document.createElement("div");
      noteOptionsDiv.classList.add("noteoptions");

      // Background changer div (hidden by default)
      const backgroundChangerDiv = document.createElement("div");
      backgroundChangerDiv.classList.add("backgroundChangerDiv");
      backgroundChangerDiv.style.display = "none";

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
      //backwrapper.style.display = "none";

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

      backgroundChangerDiv.appendChild(colorSelectDiv);
      backgroundChangerDiv.appendChild(backwrapper);

      // Color selector buttons (simplified for brevity)
      const colorSelectorButton = document.createElement("button");
      colorSelectorButton.style.background = "none";
      colorSelectorButton.style.border = "none";
      colorSelectorButton.style.cursor = "pointer";
      const colorIcon = document.createElement("i");
      colorIcon.className = "fas fa-palette";
      colorIcon.style.fontSize = "20px";
      colorSelectorButton.appendChild(colorIcon);

      // Delete button
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-button");
      const deleteIcon = document.createElement("i");
      deleteIcon.className = "fas fa-trash-alt";
      deleteIcon.style.fontSize = "20px";
      deleteButton.appendChild(deleteIcon);

      // Pin button
      const pinnedButton = document.createElement("button");
      pinnedButton.classList.add("pin-button");
      pinnedButton.style.background = "none";
      pinnedButton.style.border = "none";
      pinnedButton.style.cursor = "pointer";
      // const pinImg = document.createElement("i");
      // pinImg.className = "fas fa-thumbtack";
      // pinImg.style.fontSize = "20px";
      // pinnedButton.appendChild(pinImg);

      //**********************************************************/
      if (noteData.isPinned) {
        // Create unpin button for pinned notes
        pinnedButton.classList.add("unpin-button");
        const unpinImg = document.createElement("i");
        unpinImg.className = "fas fa-link-slash";
        unpinImg.style.fontSize = "20px";
        pinnedButton.appendChild(unpinImg);

        // Set icon color based on note background
        const bgHex = note.style.backgroundColor;
        unpinImg.style.color =
          bgHex === "rgb(255, 244, 117)" ||
          bgHex === "rgb(204, 255, 144)" ||
          bgHex === "rgb(203, 240, 248)" ||
          bgHex === "white"
            ? "#000000"
            : "#FFFFFF";
      } else {
        // Create regular pin button for unpinned notes
        pinnedButton.classList.add("pin-button");
        const pinImg = document.createElement("i");
        pinImg.className = "fas fa-thumbtack";
        pinImg.style.fontSize = "20px";
        pinnedButton.appendChild(pinImg);
      }

      //**********************************************************/

      // Checkbox button (optional)
      const checkboxButton = document.createElement("button");
      checkboxButton.classList.add("checkbox-button");
      checkboxButton.style.background = "none";
      checkboxButton.style.border = "none";
      checkboxButton.style.cursor = "pointer";
      const checkboxImg = document.createElement("i");
      checkboxImg.className = "fa-regular fa-square-check";
      checkboxImg.style.fontSize = "20px";
      checkboxButton.appendChild(checkboxImg);

      // Append buttons to noteOptionsDiv
      noteOptionsDiv.appendChild(pinnedButton);
      noteOptionsDiv.appendChild(checkboxButton);
      noteOptionsDiv.appendChild(colorSelectorButton);
      noteOptionsDiv.appendChild(deleteButton);
      noteOptionsDiv.appendChild(backgroundChangerDiv);

      // Append all elements to note
      //contentDiv.appendChild(bodyElement);
      note.appendChild(topdiv);
      note.appendChild(dateElement);
      note.appendChild(contentDiv);
      note.appendChild(noteOptionsDiv);

      colorSelectorButton.onclick = function (e) {
        e.stopPropagation();
        if (backgroundChangerDiv.style.display === "none") {
          backgroundChangerDiv.style.display = "flex";
        } else {
          backgroundChangerDiv.style.display = "none";
        }
      };

      checkboxButton.onclick = function (e) {
        e.stopPropagation();
        handleCheckboxAdding(contentDiv);
      };

      // Reattach event listeners
      deleteButton.onclick = function (e) {
        e.stopPropagation();
        handleDeleteNote(note);
      };

      pinnedButton.onclick = function (e) {
        e.stopPropagation();
        handleNotePinning(note);
      };

      note.addEventListener("click", function () {
        openNote(note);
      });

      closebutton.addEventListener("click", function (e) {
        e.stopPropagation();
        closeNote(note);
      });

      // Append to appropriate wrapper
      if (noteData.isPinned) {
        pinnedNotesWrapper.appendChild(note);
        pinnedtext.style.display = "block";
        pinnedNotesWrapper.style.display = "block";
      } else {
        notewrapper.appendChild(note);
      }
    });

    if (notes.length === 0) {
      nonotetext.style.display = "block";
    } else {
      nonotetext.style.display = "none";
    }

    updatePinnedNotesVisibility();
  } catch (error) {
    console.error("Error loading notes from localStorage:", error);
  }
}

function deleteNoteFromStorage(noteId) {
  try {
    const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  } catch (error) {
    console.error("Error deleting note from localStorage:", error);
  }
}
