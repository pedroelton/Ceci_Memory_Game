// Selectors for various elements in the DOM
const selectors = {
  boardContainer: document.querySelector(".board-container"),
  board: document.querySelector(".board"),
  moves: document.querySelector(".moves"),
  timer: document.querySelector(".timer"),
  start: document.querySelector("button"),
  win: document.querySelector(".win"),
  themeSelector: document.getElementById("theme-selector"), // Theme dropdown
};

// Initial state of the game
const state = {
  gameStarted: false,
  flippedCards: 0,
  totalFlips: 0,
  totalTime: 0,
  loop: null,
};

// Function to shuffle an array (Fisher-Yates algorithm)
const shuffle = (array) => {
  const clonedArray = [...array];
  for (let index = clonedArray.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const original = clonedArray[index];
    clonedArray[index] = clonedArray[randomIndex];
    clonedArray[randomIndex] = original;
  }
  return clonedArray;
};

// Function to pick a specified number of random items from an array
const pickRandom = (array, items) => {
  const clonedArray = [...array];
  const randomPicks = [];
  for (let index = 0; index < items; index++) {
    const randomIndex = Math.floor(Math.random() * clonedArray.length);
    randomPicks.push(clonedArray[randomIndex]);
    clonedArray.splice(randomIndex, 1);
  }
  return randomPicks;
};

// Function to generate the game board
const generateGame = (theme = "MrF") => {
  const dimensions = 4; // Assuming default dimensions

  if (dimensions % 2 !== 0) {
    throw new Error("The dimension of the board must be an even number.");
  }

  // Base path for the images, appending the selected theme
  const basePath = `assets/SVG/${theme}`;
  // Array of image paths for the selected theme
  const images = Array.from(
    { length: 10 },
    (_, i) => `${basePath}/Asset${i + 1}.svg`
  );
  // Pick half the number of images required and then duplicate them
  const picks = pickRandom(images, (dimensions * dimensions) / 2);
  const items = shuffle([...picks, ...picks]);

  // Generate the HTML for the game board with cards
  const cardsHTML = items
    .map(
      (item) => `
    <div class="card" data-value="${item}">
      <div class="card-front"></div>
      <div class="card-back"><img src="${item}" alt="Card Image"></div>
    </div>
  `
    )
    .join("");

  // Replace the current board with the new one
  selectors.board.innerHTML = cardsHTML;

  // Reset game state
  state.gameStarted = false;
  state.flippedCards = 0;
  state.totalFlips = 0;
  state.totalTime = 0;
  clearInterval(state.loop);
  selectors.moves.innerText = `0 moves`;
  selectors.timer.innerText = `time: 0 sec`;
  selectors.start.classList.remove("disabled");
  selectors.win.style.display = "none"; // Hide the win message
  selectors.boardContainer.classList.remove("flipped");

  // Reattach event listeners
  attachEventListeners();
};

// Function to start the game and timer
const startGame = () => {
  state.gameStarted = true;
  selectors.start.classList.add("disabled");

  // Start the game timer
  state.loop = setInterval(() => {
    state.totalTime++;
    selectors.moves.innerText = `${state.totalFlips} moves`;
    selectors.timer.innerText = `time: ${state.totalTime} sec`;
  }, 1000);
};

// Function to flip back unmatched cards
const flipBackCards = () => {
  document.querySelectorAll(".card:not(.matched)").forEach((card) => {
    card.classList.remove("flipped");
  });
  state.flippedCards = 0;
};

// Function to handle card flips
const flipCard = (card) => {
  // Ensure card is not undefined
  if (!card) return;

  state.flippedCards++;
  state.totalFlips++;

  if (!state.gameStarted) {
    startGame();
  }

  if (state.flippedCards <= 2) {
    card.classList.add("flipped");
  }

  if (state.flippedCards === 2) {
    const flippedCards = document.querySelectorAll(".flipped:not(.matched)");

    // Ensure flippedCards has at least 2 elements
    if (flippedCards.length === 2) {
      if (flippedCards[0].dataset.value === flippedCards[1].dataset.value) {
        flippedCards[0].classList.add("matched");
        flippedCards[1].classList.add("matched");
      }

      setTimeout(() => {
        flipBackCards();
      }, 1000);
    }
  }

  // Check if all cards are matched to end the game
  if (document.querySelectorAll(".card:not(.matched)").length === 0) {
    setTimeout(() => {
      selectors.boardContainer.classList.add("flipped");
      selectors.win.innerHTML = `
        <span class="win-text">
          You won!<br />
          with <span class="highlight">${state.totalFlips}</span> moves<br />
          under <span class="highlight">${state.totalTime}</span> seconds
        </span>
      `;
      selectors.win.style.display = "block"; // Show the win message
      clearInterval(state.loop);
    }, 1000);
  }
};

// Restart button functionality
const restartButton = document.getElementById("restart");

// Function to attach event listeners to the elements
const attachEventListeners = () => {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      if (
        !card.classList.contains("flipped") &&
        !card.classList.contains("matched")
      ) {
        flipCard(card);
      }
    });
  });

  document.addEventListener("click", (event) => {
    const eventTarget = event.target;
    const eventParent = eventTarget.parentElement;

    // Handle restart button click
    if (
      eventTarget.nodeName === "BUTTON" &&
      !eventTarget.className.includes("disabled")
    ) {
      startGame();
    }
  });

  // Restart button click event
  restartButton.addEventListener("click", () => {
    window.location.reload();
  });

  // Handle theme selection change
  selectors.themeSelector.addEventListener("change", (event) => {
    const selectedTheme = event.target.value;
    generateGame(selectedTheme); // Generate the game with the selected theme
  });
};

// Initial game generation with 'MrF' theme
generateGame("MrF");
