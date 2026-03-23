// ==============================
// INIT
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  initializeUser(currentUser);
  setupLogout();

  // Koppla knappar till funktioner
  document.getElementById("startBtn").addEventListener("click", startGame);
  document.getElementById("hitBtn").addEventListener("click", hit);
  document.getElementById("standBtn").addEventListener("click", stand);
  document.getElementById("playAgainBtn").addEventListener("click", playAgain);
});

// ==============================
// USER INTERFACE
// ==============================
function initializeUser(user) {
  const usernameDisplay = document.getElementById("usernameDisplay");
  const balanceDisplay = document.getElementById("balanceDisplay");

  usernameDisplay.textContent = user.username;
  balanceDisplay.textContent = user.balance;
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  });
}

// ==============================
// BLACKJACK LOGIC
// ==============================

let deck;
let playerHand;
let dealerHand;
let currentBet = 0;

function createHand() {
  return [];
}

function calculateHandValue(hand) {
  let total = 0;
  let aces = 0;

  for (let card of hand) {
    total += card.value;

    if (card.rank === "A") {
      aces++;
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

function addCardToHand(card, containerId) {
  // 1. Hitta rätt div (playerCards eller dealerCards)
  const container = document.getElementById(containerId);

  // 2. Skapa ett nytt <img>-element
  const img = document.createElement("img");

  img.src = getCardImage(card);

  // 4. Ge bilden en CSS-klass så vi kan styla den senare
  img.classList.add("card");

  // 5. Lägg till bilden i rätt div
  container.appendChild(img);
}

function getCardImage(card) {
  // Om kortet är dolt, visa baksidan
  if (card.rank === "back") {
    return "PNG-cards/back.png";
  }
  return `PNG-cards/${card.rank}_of_${card.suit}.png`;
}

function hit() {
  const card = drawCard(deck);
  playerHand.push(card);
  addCardToHand(card, "playerCards");

  const playerValue = calculateHandValue(playerHand);
  document.getElementById("playerScore").textContent = `(${playerValue})`;

  if (playerValue > 21) {
    endRound("bust");
  } else if (playerValue === 21) {
    stand();
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function stand() {
  // Visa dealerns dolda kort
  const dealerCardsDiv = document.getElementById("dealerCards");
  dealerCardsDiv.innerHTML = "";
  addCardToHand(dealerHand[0], "dealerCards");
  addCardToHand(dealerHand[1], "dealerCards");

  const dealerInitialValue = calculateHandValue(dealerHand);
  document.getElementById("dealerScore").textContent =
    `(${dealerInitialValue})`;

  // Dealer drar till minst 17
  while (calculateHandValue(dealerHand) < 17) {
    await sleep(600);
    const card = drawCard(deck);
    dealerHand.push(card);
    addCardToHand(card, "dealerCards");

    const dealerValue = calculateHandValue(dealerHand);
    document.getElementById("dealerScore").textContent = `(${dealerValue})`;
  }

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  document.getElementById("playerScore").textContent = `(${playerValue})`;
  document.getElementById("dealerScore").textContent = `(${dealerValue})`;

  if (dealerValue > 21) {
    endRound("win");
  } else if (playerValue > dealerValue) {
    endRound("win");
  } else if (playerValue < dealerValue) {
    endRound("lose");
  } else {
    endRound("push");
  }
}

function endRound(result) {
  const messageEl = document.getElementById("gameMessage");
  const user = getCurrentUser();

  if (result === "win") {
    messageEl.textContent = "Du vann!";
    user.balance += currentBet;
  } else if (result === "lose" || result === "bust") {
    messageEl.textContent = "Du förlorade!";
    user.balance -= currentBet;
  } else {
    messageEl.textContent = "Oavgjort!";
  }

  // Uppdatera saldo i UI och localstorage
  document.getElementById("balanceDisplay").textContent = user.balance;
  setCurrentUser(user);

  // Stäng av Hit/Stand, visa spela igen
  document.getElementById("actionButtons").style.display = "none";
  document.getElementById("playAgainBtn").style.display = "block";
}

function startGame() {
  const user = getCurrentUser();

  // Läs in insatsen från inputfältet
  const betInput = document.getElementById("betAmount");
  const bet = parseInt(betInput.value);

  // Validera insatsen
  if (!bet || bet <= 0) {
    alert("Ange en giltig insats!");
    return;
  }

  if (bet > user.balance) {
    alert("Du har inte tillräckligt med saldo!");
    return;
  }

  // Spara insatsen
  currentBet = bet;

  // Rensa kortdivarna från föregående runda
  document.getElementById("playerCards").innerHTML = "";
  document.getElementById("dealerCards").innerHTML = "";
  document.getElementById("gameMessage").textContent = "";

  // Skapa och blanda kortlek
  deck = createDeck();
  shuffleDeck(deck);

  //Skapa tomma händer
  playerHand = createHand();
  dealerHand = createHand();

  // Dela ut 2 kort vardera
  playerHand.push(drawCard(deck));
  dealerHand.push(drawCard(deck));
  playerHand.push(drawCard(deck));
  dealerHand.push(drawCard(deck));

  // Visa spelarens kort
  addCardToHand(playerHand[0], "playerCards");
  addCardToHand(playerHand[1], "playerCards");

  // Visa dealerns kort, bara ett, andra dolt
  addCardToHand(dealerHand[0], "dealerCards");
  addCardToHand({ rank: "back", suit: "" }, "dealerCards"); // Dolt

  const playerValue = calculateHandValue(playerHand);
  document.getElementById("playerScore").textContent = `(${playerValue})`;

  const dealerVisibleValue = calculateHandValue([dealerHand[0]]);
  document.getElementById("dealerScore").textContent =
    `(${dealerVisibleValue})`;

  // Visa Hit/Stand, dölj satsa-knappen
  document.getElementById("actionButtons").style.display = "block";
  document.getElementById("betArea").style.display = "none";
  document.getElementById("playAgainBtn").style.display = "none";
}

function playAgain() {
  document.getElementById("playerCards").innerHTML = "";
  document.getElementById("dealerCards").innerHTML = "";
  document.getElementById("gameMessage").textContent = "";
  document.getElementById("playerScore").textContent = "";
  document.getElementById("dealerScore").textContent = "";

  document.getElementById("actionButtons").style.display = "none";
  document.getElementById("betArea").style.display = "flex";
  document.getElementById("playAgainBtn").style.display = "none";

  currentBet = 0;
}
