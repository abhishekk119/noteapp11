import { notewrapper, nonotetext } from "./config.js";
import { sortNotesByDate } from "./note-creation-helpers.js";
import { updatePinnedNotesVisibility } from "./note-utilities.js";
import { saveNotesToStorage } from "./storage.js";

export function checkIfWrapperIsEmpty() {
  const pinnedWrapper = document.getElementById("pinned-notes-wrapper");

  // Check if both wrappers are empty
  if (
    notewrapper.children.length === 0 &&
    pinnedWrapper.children.length === 0
  ) {
    nonotetext.style.display = "block";
  }
  saveNotesToStorage();
}

export function handleColorSelection(colorCode) {
  console.log("triggered");
  // Find the active note (where background changer is visible)
  const backgroundChanger = document.querySelector(
    '.backgroundChangerDiv[style*="display: flex"]'
  );
  const activeNote = backgroundChanger?.closest(".note");

  // If no active note found, exit the function
  if (!activeNote) {
    console.warn("No active note found for color selection");
    return;
  }

  // Apply the color changes
  try {
    // Reset background image if changing to solid color
    activeNote.style.background = "none";
    activeNote.style.backgroundImage = "none";
    activeNote.style.transition =
      "background-color 0.5s ease, border-color 0.5s ease, color 0.5s ease";
    activeNote.style.backgroundColor = colorCode;

    // Hide the color picker
    backgroundChanger.style.display = "none";

    // Set appropriate text and icon colors based on background
    const textColor =
      colorCode === "#fff475" ||
      colorCode === "#ccff90" ||
      colorCode === "#cbf0f8"
        ? "black"
        : "white";

    activeNote.style.color = textColor;

    // Set icon colors
    const icons = activeNote.querySelectorAll(
      ".fa-palette, .fa-thumbtack, .fa-trash-alt, .fa-link-slash, .fa-square-check"
    );
    // icons.forEach((icon) => {
    //   icon.style.color = textColor;
    // });
    if (
      colorCode === "#fff475" ||
      colorCode === "#ccff90" ||
      colorCode === "#cbf0f8" ||
      colorCode === "white"
    ) {
      icons.forEach((icon) => (icon.style.color = "black"));
    } else {
      icons.forEach((icon) => (icon.style.color = "white"));
    }
  } catch (error) {
    console.error("Error applying color:", error);
  }
  saveNotesToStorage();
}

export function handleNotePinning(note) {
  // Add animation and handle its completion
  function applyPinningAnimation(noteElement) {
    noteElement.classList.add("animate__animated", "animate__jello");
    noteElement.addEventListener(
      "animationend",
      () => {
        noteElement.classList.remove("animate__animated", "animate__jello");
      },
      { once: true }
    );
  }

  // Animation function for unpinning (backInDown)
  function applyUnpinningAnimation(noteElement) {
    noteElement.classList.add("animate__animated", "animate__slideOutRight");
    noteElement.addEventListener(
      "animationend",
      () => {
        noteElement.classList.remove(
          "animate__animated",
          "animate__slideOutRight"
        );
      },
      { once: true }
    );
  }

  function applySlideInAnimation(noteElement) {
    noteElement.classList.add("animate__animated", "animate__slideInLeft");
    noteElement.addEventListener(
      "animationend",
      () => {
        noteElement.classList.remove(
          "animate__animated",
          "animate__slideInLeft"
        );
      },
      { once: true }
    );
  }

  const pinnedNotesDiv = document.getElementById("pinned-notes");
  const pinnedtext = document.getElementById("pinnedtext");
  const pinnedNotesArea = document.getElementById("pinned-notes-wrapper");

  if (note.parentNode.id === "pinned-notes-wrapper") {
    applyUnpinningAnimation(note);

    // Wait for animation to complete before moving the note
    note.addEventListener(
      "animationend",
      () => {
        const noteWrapper = document.getElementById("notewrapper");

        noteWrapper.appendChild(note);
        applySlideInAnimation(note);

        sortNotesByDate("desc");

        // Restore pin button
        const pinButton = note.querySelector(".pin-button");
        if (pinButton) pinButton.style.display = "block";

        // Remove unpin button if it exists
        const unpinButton = note.querySelector(".unpin-button");
        if (unpinButton) unpinButton.remove();

        updatePinnedNotesVisibility();
      },
      { once: true }
    );
  } else {
    // Pinning logic - keep the animation here
    pinnedNotesDiv.style.opacity = "1";
    pinnedNotesArea.style.display = "flex";
    pinnedNotesArea.appendChild(note);
    pinnedtext.style.display = "block";
    applyPinningAnimation(note); // Animation only happens when pinning

    const pinButton = note.querySelector(".pin-button");
    if (pinButton) {
      pinButton.style.display = "none";

      const unpinButton = document.createElement("button");
      unpinButton.classList.add("unpin-button");
      unpinButton.style.background = "none";
      unpinButton.style.border = "none";
      unpinButton.style.cursor = "pointer";
      const unpin = document.createElement("i");
      unpin.className = "fa-solid fa-link-slash";
      unpin.style.fontSize = "20px";
      unpinButton.appendChild(unpin);

      const bgHex = note.style.backgroundColor;
      unpin.style.color =
        bgHex === "rgb(255, 244, 117)" ||
        bgHex === "rgb(204, 255, 144)" ||
        bgHex === "rgb(203, 240, 248)" ||
        bgHex === "white"
          ? "#000000"
          : "#FFFFFF";

      const div = document.querySelector(".note");
      const bgImage = window.getComputedStyle(div).backgroundImage;

      if (bgImage && bgImage !== "none") {
        unpin.style.color = "white";
      }

      pinButton.parentNode.insertBefore(unpinButton, pinButton);

      unpinButton.addEventListener("click", function unpinHandler(e) {
        e.stopPropagation();
        handleNotePinning(note, unpin);
      });
    }
  }
  saveNotesToStorage();
}
