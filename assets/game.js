const selectors = {
  boardContainer: document.querySelector(".board-container"),
  board: document.querySelector(".board"),
  moves: document.querySelector(".moves"),
  timer: document.querySelector(".timer"),
  start: document.querySelector("button"),
  win: document.querySelector(".win"),
  themeSelector: document.getElementById("theme-selector"),
  loadingOverlay: document.querySelector(".loading-overlay"), // Add this line
};

const state = {
  gameStarted: false,
  flippedCards: 0,
  totalFlips: 0,
  totalTime: 0,
  loop: null,
};

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

const generateGame = (theme = "MrF") => {
  const dimensions = 4;

  if (dimensions % 2 !== 0) {
    throw new Error("The dimension of the board must be an even number.");
  }

  const basePath = `assets/SVG/${theme}`;
  const images = Array.from(
    { length: 10 },
    (_, i) => `${basePath}/Asset${i + 1}.svg`
  );
  const picks = pickRandom(images, (dimensions * dimensions) / 2);
  const items = shuffle([...picks, ...picks]);

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

  selectors.board.innerHTML = cardsHTML;

  state.gameStarted = false;
  state.flippedCards = 0;
  state.totalFlips = 0;
  state.totalTime = 0;
  clearInterval(state.loop);
  selectors.moves.innerText = `0 moves`;
  selectors.timer.innerText = `time: 0 sec`;
  selectors.start.classList.remove("disabled");
  selectors.win.style.display = "none";
  selectors.boardContainer.classList.remove("flipped");

  attachEventListeners();

  // Show loading overlay
  selectors.loadingOverlay.style.display = "flex";

  // Wait for all images to load
  const imagesToLoad = document.querySelectorAll(".card-back img");
  let loadedImages = 0;

  imagesToLoad.forEach((img) => {
    img.onload = () => {
      loadedImages++;
      if (loadedImages === imagesToLoad.length) {
        // Hide loading overlay when all images are loaded
        selectors.loadingOverlay.style.display = "none";
      }
    };

    // Handle cases where the image fails to load
    img.onerror = () => {
      loadedImages++;
      if (loadedImages === imagesToLoad.length) {
        selectors.loadingOverlay.style.display = "none";
      }
    };
  });
};

const startGame = () => {
  state.gameStarted = true;
  selectors.start.classList.add("disabled");

  state.loop = setInterval(() => {
    state.totalTime++;
    selectors.moves.innerText = `${state.totalFlips} moves`;
    selectors.timer.innerText = `time: ${state.totalTime} sec`;
  }, 1000);
};

const flipBackCards = () => {
  document.querySelectorAll(".card:not(.matched)").forEach((card) => {
    card.classList.remove("flipped");
  });
  state.flippedCards = 0;
};

const flipCard = (card) => {
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
      selectors.win.style.display = "block";
      clearInterval(state.loop);
    }, 1000);
  }
};

const restartButton = document.getElementById("restart");

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

    if (
      eventTarget.nodeName === "BUTTON" &&
      !eventTarget.className.includes("disabled")
    ) {
      startGame();
    }
  });

  restartButton.addEventListener("click", () => {
    window.location.reload();
  });

  selectors.themeSelector.addEventListener("change", (event) => {
    const selectedTheme = event.target.value;
    generateGame(selectedTheme);
  });

  // Add touchstart listener to prevent double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener(
    "touchend",
    function (event) {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    false
  );
};

generateGame("MrF");
// POP-UP

document.getElementById("openPopup").addEventListener("click", function () {
  document.getElementById("popupContainer").style.display = "flex";
});

document.getElementById("closePopup").addEventListener("click", function () {
  document.getElementById("popupContainer").style.display = "none";
});

document
  .getElementById("popupContainer")
  .addEventListener("click", function (event) {
    if (event.target === this) {
      document.getElementById("popupContainer").style.display = "none";
    }
  });
