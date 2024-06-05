const selectors = {
  boardContainer: document.querySelector(".board-container"),
  board: document.querySelector(".board"),
  moves: document.querySelector(".moves"),
  timer: document.querySelector(".timer"),
  start: document.querySelector("button"),
  win: document.querySelector(".win"),
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

const generateGame = () => {
  const dimensions = selectors.board.getAttribute("data-dimension");

  if (dimensions % 2 !== 0) {
    throw new Error("The dimension of the board must be an even number.");
  }

  // const emojis = ["🥔", "🍒", "🥑", "🌽", "🥕", "🍇", "🍉", "🍌", "🥭", "🍍"];
  const images = [
    "assets/SVG/Asset1.svg",
    "assets/SVG/Asset2.svg",
    "assets/SVG/Asset3.svg",
    "assets/SVG/Asset4.svg",
    "assets/SVG/Asset5.svg",
    "assets/SVG/Asset6.svg",
    "assets/SVG/Asset7.svg",
    "assets/SVG/Asset8.svg",
    "assets/SVG/Asset9.svg",
    "assets/SVG/Asset10.svg",
  ];
  const picks = pickRandom(images, (dimensions * dimensions) / 2);
  const items = shuffle([...picks, ...picks]);
  const cards = `
    <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
      ${items
        .map((item, index) => {
          return `
          <div class="card" data-value="${item}">
            <div class="card-front"></div>
            <div class="card-back"><img src="${item}" alt="Card Image"></div>
          </div>
        `;
        })
        .join("")}
    </div>
  `;

  const parser = new DOMParser().parseFromString(cards, "text/html");
  selectors.board.replaceWith(parser.querySelector(".board"));
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

    if (flippedCards[0].dataset.value === flippedCards[1].dataset.value) {
      flippedCards[0].classList.add("matched");
      flippedCards[1].classList.add("matched");
    }

    setTimeout(() => {
      flipBackCards();
    }, 1000);
  }

  // If there are no more cards that we can flip, we won the game
  if (!document.querySelectorAll(".card:not(.flipped)").length) {
    setTimeout(() => {
      selectors.boardContainer.classList.add("flipped");
      selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    under <span class="highlight">${state.totalTime}</span> seconds
                </span>
            `;

      clearInterval(state.loop);
    }, 1000);
  }
};

const restartButton = document.getElementById("restart");

const attachEventListeners = () => {
  document.addEventListener("click", (event) => {
    const eventTarget = event.target;
    const eventParent = eventTarget.parentElement;

    if (
      eventTarget.className.includes("card") &&
      !eventParent.className.includes("flipped")
    ) {
      flipCard(eventParent);
    } else if (
      eventTarget.nodeName === "BUTTON" &&
      !eventTarget.className.includes("disabled")
    ) {
      startGame();
    }
  });

  restartButton.addEventListener("click", () => {
    window.location.reload();
  });

  // Check for board container flip and show restart button
  const boardContainer = document.querySelector(".board-container");
  const showRestartButton = () => {
    if (boardContainer.classList.contains("flipped")) {
      restartButton.style.display = "block";
    } else {
      restartButton.style.display = "none";
    }
  };

  showRestartButton(); // Call initially to check on page load
  boardContainer.addEventListener("transitionend", showRestartButton); // Update on transition
};

generateGame();
attachEventListeners();
