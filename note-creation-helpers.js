import { notewrapper, nonotetext, deletedmsg } from "./config.js";
import { updatePinnedNotesVisibility } from "./note-utilities.js";
import { checkIfWrapperIsEmpty } from "./note-colors-pinning.js";
import { saveNotesToStorage } from "./storage.js";

export function openNote(note) {
  const timestamp = new Date();
  const dateElement = note.querySelector("small");
  // Check if note is already expanded
  if (note.classList.contains("expanded")) {
    return; // Exit if note is already open
  }

  note.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
      const newDate = new Date();
      note.dataset.createdAt = newDate.toISOString();
      dateElement.textContent = newDate.toLocaleString("en-US", {
        hour12: true, // 12-hour format (AM/PM)
        year: "numeric", // e.g., "2023"
        month: "numeric", // e.g., "8" (or 'short' → "Aug")
        day: "numeric", // e.g., "6"
        hour: "numeric", // e.g., "3" (or '2-digit' → "03")
        minute: "numeric", // e.g., "45"
        second: "numeric", // e.g., "30" (optional)
      });
    }
  });

  const placeholder = document.createElement("div");
  placeholder.classList.add("note-placeholder");
  note.parentNode.insertBefore(placeholder, note);

  // Add expanded class
  note.classList.add("expanded");
  note.placeholder = placeholder;

  // Show backdrop
  const backdrop = document.getElementById("backdrop");
  backdrop.style.display = "block";

  document.body.classList.add("backdrop-visible");

  // Make content editable ONLY when expanded
  const titleElement = note.querySelector("h3");
  const contentElement = note.querySelector(".note-content p");
  titleElement.contentEditable = note.classList.contains("expanded");
  contentElement.contentEditable = note.classList.contains("expanded");
  // if (note.classList.contains("expanded")) {
  //   document.querySelector(".backgroundChangerDiv").style.top = "240px";
  // }

  // Find the first p element if it exists and add paragraph class
  const firstParagraph = contentElement.querySelector("p:first-child");
  if (firstParagraph && !firstParagraph.classList.contains("paragraph")) {
    firstParagraph.classList.add("paragraph");
  }

  // Also make all checkbox texts editable
  note.querySelectorAll(".checkbox-text").forEach((checkboxText) => {
    checkboxText.contentEditable = true;
  });

  note.querySelectorAll(".paragraph").forEach((para) => {
    para.contentEditable = true;
  });

  // Close when clicking backdrop
  backdrop.onclick = () => {
    // Save edited content
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
  };
  saveNotesToStorage();
}

export function sortNotesByDate(order = "desc") {
  const wrapper = document.getElementById("notewrapper");
  // Only select notes that are direct children of notewrapper
  const notes = Array.from(wrapper.querySelectorAll(".note"));

  notes.sort((a, b) => {
    const dateA = new Date(a.dataset.createdAt);
    const dateB = new Date(b.dataset.createdAt);
    return order === "desc" ? dateB - dateA : dateA - dateB;
  });

  // Re-append notes in sorted order
  notes.forEach((note) => wrapper.appendChild(note));
  saveNotesToStorage();
}

export function handleDeleteNote(noteToDelete) {
  noteToDelete.classList.add("animate__animated", "animate__backOutUp");
  // Wait for animation to complete before removing
  noteToDelete.addEventListener(
    "animationend",
    () => {
      const pinnedtext = document.getElementById("pinnedtext");
      const pinnedWrapper = document.getElementById("pinned-notes-wrapper");

      if (notewrapper.contains(noteToDelete)) {
        notewrapper.removeChild(noteToDelete);
      } else if (pinnedWrapper.contains(noteToDelete)) {
        pinnedWrapper.removeChild(noteToDelete);
      }

      if (pinnedWrapper.children.length === 0) {
        pinnedtext.style.display = "none";
      }

      const placeholder = document.querySelector(".note-placeholder");
      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }

      document.getElementById("backdrop").style.display = "none";
      checkIfWrapperIsEmpty();
      updatePinnedNotesVisibility();
    },
    { once: true }
  );
  deletedmsg.style.display = "block";
  setTimeout(() => {
    deletedmsg.style.display = "none";
  }, 4000);
  saveNotesToStorage();
}
