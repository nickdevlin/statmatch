/* ---------------- DATA ---------------- */

const correctOrder = [
  "p13","p15","p5","p3",
  "p14","p1","p6","p11",
  "p2","p9","p8","p10",
  "p4","p12","p7","p16"
];

const categories = [
  "Career WAR",
  "Career Innings Pitched",
  "Career Home Runs",
  "All-Star Games"
];

// 🔹 Hard-coded slot values (edit these anytime)
const slotValues = [
  [0.7, 7.8, 41.9, 111.2],
  [1, 471.1, 2156.2, 4494.2],
  [0, 187, 280, 609],
  [0, 7, 8, 15]
];

// 🔹 Player names (replace later)
const playerNames = {
  p1: "José Fernández",
  p2: "Terrance Gore",
  p3: "Rickey Henderson",
  p4: "Matt Murton",
  p5: "Curt Flood",
  p6: "Cliff Lee",
  p7: "Satchel Paige",
  p8: "Shohei Ohtani",
  p9: "Turkey Stearnes",
  p10: "Sammy Sosa",
  p11: "Eppa Rixey",
  p12: "Dave Stieb",
  p13: "Brooks Kieschnick",
  p14: "Mark Grace",
  p15: "Spencer Strider",
  p16: "Tony Gwynn"
};

const imageMap = {
  p1:"fernandez.jpg",
  p2:"gore.jpg",
  p3:"henderson.jpg",
  p4:"murton.jpg",
  p5:"flood.jpg",
  p6:"lee.jpg",
  p7:"paige.jpg",
  p8:"ohtani.jpg",
  p9:"stearnes.jpg",
  p10:"sosa.jpg",
  p11:"rixey.jpg",
  p12:"stieb.jpg",
  p13:"kieschnick.jpg",
  p14:"grace.jpg",
  p15:"strider.jpg",
  p16:"gwynn.jpg"
};

const tray = document.getElementById("tray");
const board = document.getElementById("board");
const result = document.getElementById("result");

function updateCardLabel(card, slot) {

  const nameDiv = card.querySelector(".card-name");
  const baseName = playerNames[card.dataset.value];

  if (slot && slot.classList.contains("slot")) {
    const slotNumber = slot.querySelector(".slot-number").textContent;
    nameDiv.textContent = `${baseName} - ${slotNumber}`;
  } else {
    nameDiv.textContent = baseName;
  }
}

let turnsRemaining = 5;
const turnDisplay = document.getElementById("turn-display");
const checkButton = document.getElementById("check");

function updateTurnDisplay() {
  turnDisplay.textContent = `Turns Remaining: ${turnsRemaining}`;
}

let dragged = null;
const slots = [];

/* ---------------- BUILD BOARD ---------------- */

for (let row = 0; row < 4; row++) {

  const label = document.createElement("div");
  label.className = "row-label";
  label.textContent = categories[row];
  board.appendChild(label);

  for (let col = 0; col < 4; col++) {

    const slot = document.createElement("div");
    slot.className = "slot";

    const numberDisplay = document.createElement("div");
    numberDisplay.className = "slot-number";
    numberDisplay.textContent = slotValues[row][col];
    slot.appendChild(numberDisplay);

    board.appendChild(slot);
    slots.push(slot);

    slot.addEventListener("dragover", e => e.preventDefault());

    slot.addEventListener("drop", e => {
      e.preventDefault();
      if (!dragged) return;

      const from = dragged.parentElement;
      const previousSlot = from.classList.contains("slot") ? from : null;

      // 🟡 Store whether it WAS yellow before we modify anything
      const wasRowMatch = previousSlot && previousSlot.classList.contains("row-match");

      const existingCard = slot.querySelector(".card");
      
      if (existingCard && !existingCard.classList.contains("locked")) {
        from.appendChild(existingCard);
        updateCardLabel(existingCard, from.classList.contains("slot") ? from : null);
      }

      slot.appendChild(dragged);
      slot.classList.add("filled");

      updateCardLabel(dragged, slot);

      // Clean up old slot
      if (previousSlot) {
        previousSlot.classList.remove("correct", "row-match");
  
      if (!previousSlot.querySelector(".card")) {
        previousSlot.classList.remove("filled");
        }
      }

      // 🟡 Reapply yellow if same row
      if (wasRowMatch && previousSlot) {

        const oldRow = Math.floor(slots.indexOf(previousSlot) / 4);
        const newRow = Math.floor(slots.indexOf(slot) / 4);

        if (oldRow === newRow) {
          slot.classList.add("row-match");
        }
      }
    });

  }
}

/* ---------------- BUILD CARDS ---------------- */

function shuffle(arr){
  return arr
    .map(v => ({v, r: Math.random()}))
    .sort((a,b)=>a.r-b.r)
    .map(o=>o.v);
}

shuffle([...correctOrder]).forEach(key => {

  const card = document.createElement("div");
  card.className = "card";
  card.draggable = true;
  card.dataset.value = key;

  const img = document.createElement("img");
  img.src = imageMap[key];
  img.draggable = false;

  const nameOverlay = document.createElement("div");
  nameOverlay.className = "card-name";
  nameOverlay.textContent = playerNames[key];

  card.appendChild(img);
  card.appendChild(nameOverlay);

  card.addEventListener("dragstart", (e) => {

  if (card.classList.contains("locked")) {
    e.preventDefault();
    return;
  }

  dragged = card;
  card.classList.add("dragging");
});

  card.addEventListener("dragend", () => {
    dragged = null;
    card.classList.remove("dragging");
  });

  tray.appendChild(card);
  updateCardLabel(card, null);
});

/* ---------------- CHECK ---------------- */

document.getElementById("check").addEventListener("click", () => {

  if (turnsRemaining <= 0) return;

  slots.forEach(slot => {
    slot.classList.remove("correct", "row-match");
  });

  let allCorrect = true;

  for (let row = 0; row < 4; row++) {

    const expectedRowPlayers = correctOrder.slice(row * 4, row * 4 + 4);

    for (let col = 0; col < 4; col++) {

      const slotIndex = row * 4 + col;
      const slot = slots[slotIndex];
      const card = slot.querySelector(".card");

      if (!card) {
        allCorrect = false;
        continue;
      }

      const placedKey = card.dataset.value;

      if (placedKey === correctOrder[slotIndex]) {
        slot.classList.add("correct");
      
        card.draggable = false;
        card.classList.add("locked");
      }
      else if (expectedRowPlayers.includes(placedKey)) {
        slot.classList.add("row-match");
        allCorrect = false;
      }
      else {
        allCorrect = false;
      }
    }
  }

  if (allCorrect) {
    result.textContent = "🏆 You Win!";
    checkButton.disabled = true;
    return;
  }

  setTimeout(() => {
    // 🔁 Remove incorrect cards from board
    slots.forEach(slot => {
    
      const card = slot.querySelector(".card");
    
      if (!card) return;
    
      const isCorrect = slot.classList.contains("correct");
      const isRowMatch = slot.classList.contains("row-match");
    
      if (!isCorrect && !isRowMatch) {
        tray.appendChild(card);
        updateCardLabel(card, null);
        slot.classList.remove("filled");
      }
    });
  }, 300);
  
  turnsRemaining--;
  updateTurnDisplay();

  if (turnsRemaining === 0) {
    result.textContent = "❌ Game Over! You've used all five turns.";
    checkButton.disabled = true;
  } else {
    result.textContent = "Keep adjusting...";
  }
});

/* ---------------- RESET ---------------- */

document.getElementById("reset").addEventListener("click", () => {

  slots.forEach(slot => {

    const card = slot.querySelector(".card");
    if (card) {
      tray.appendChild(card);
      updateCardLabel(card, null);
      card.draggable = true;
      card.classList.remove("locked");
    }

    // 🔴 Remove ALL state classes
    slot.classList.remove("filled", "correct", "row-match");
  });

  turnsRemaining = 5;
  updateTurnDisplay();
  checkButton.disabled = false;

  result.textContent = "";
});
