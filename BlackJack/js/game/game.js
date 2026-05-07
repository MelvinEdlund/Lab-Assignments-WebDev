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
  document.getElementById("splitBtn").addEventListener("click", splitHand);
  document.getElementById("doubleBtn").addEventListener("click", doubleDown);
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
let playerHands = [];
let activeHandIndex = 0;
let handBets = [];
let handStates = []; // { isComplete, isSplitAces, hasDoubled }
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

function isBlackjack(hand) {
  if (!hand || hand.length !== 2) return false;
  const hasAce = hand.some((card) => card.rank === "A");
  const hasTenValue = hand.some(
    (card) =>
      card.rank === "10" ||
      card.rank === "J" ||
      card.rank === "Q" ||
      card.rank === "K",
  );
  return hasAce && hasTenValue;
}

function getHandDisplayValue(hand) {
  let total = 0;
  let aces = 0;

  for (let card of hand) {
    total += card.value;
    if (card.rank === "A") {
      aces++;
    }
  }

  // Compute the minimum value (all aces as 1)
  const minValue = total - aces * 10;
  const hasSoftTotal = aces > 0 && minValue + 10 <= 21;

  if (hasSoftTotal && minValue !== minValue + 10) {
    return `${minValue}/${minValue + 10}`;
  }

  return `${calculateHandValue(hand)}`;
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
  const hand = playerHands[activeHandIndex];
  const card = drawCard(deck);
  hand.push(card);
  renderHand(activeHandIndex);

  const value = calculateHandValue(hand);
  if (value > 21) {
    handStates[activeHandIndex].isComplete = true;
    goToNextHandOrDealer();
  } else if (value === 21) {
    handStates[activeHandIndex].isComplete = true;
    goToNextHandOrDealer();
  } else if (handStates[activeHandIndex].isSplitAces) {
    handStates[activeHandIndex].isComplete = true;
    goToNextHandOrDealer();
  }

  updateActionButtons();
}

function stand() {
  handStates[activeHandIndex].isComplete = true;
  goToNextHandOrDealer();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function revealDealerHand() {
  const dealerCardsDiv = document.getElementById("dealerCards");
  dealerCardsDiv.innerHTML = "";
  addCardToHand(dealerHand[0], "dealerCards");
  addCardToHand(dealerHand[1], "dealerCards");

  document.getElementById("dealerScore").textContent =
    `(${getHandDisplayValue(dealerHand)})`;
}

function resolveBlackjackIfNeeded() {
  const user = getCurrentUser();
  const playerHasBlackjack = isBlackjack(playerHands[0]);
  if (!playerHasBlackjack) return false;

  revealDealerHand();

  const dealerHasBlackjack = isBlackjack(dealerHand);
  const messageEl = document.getElementById("gameMessage");

  if (dealerHasBlackjack) {
    messageEl.textContent = "Blackjack! Oavgjort.";
  } else {
    const payout = handBets[0] * 1.5;
    user.balance += payout;
    messageEl.textContent = `Blackjack! Du vann ${payout} kr.`;
  }

  document.getElementById("balanceDisplay").textContent = user.balance;
  setCurrentUser(user);

  document.getElementById("actionButtons").style.display = "none";
  document.getElementById("playAgainBtn").style.display = "block";
  return true;
}

async function runDealerAndResolve() {
  // Visa dealerns dolda kort
  revealDealerHand();

  // Dealer drar till minst 17
  while (calculateHandValue(dealerHand) < 17) {
    await sleep(600);
    const card = drawCard(deck);
    dealerHand.push(card);
    addCardToHand(card, "dealerCards");

    document.getElementById("dealerScore").textContent =
      `(${getHandDisplayValue(dealerHand)})`;
  }

  resolveHands();
}

function resolveHands() {
  const messageEl = document.getElementById("gameMessage");
  const user = getCurrentUser();
  const dealerValue = calculateHandValue(dealerHand);
  const results = [];

  playerHands.forEach((hand, index) => {
    const handValue = calculateHandValue(hand);
    const bet = handBets[index];

    if (handValue > 21) {
      user.balance -= bet;
      results.push(`Hand ${index + 1}: förlust`);
      return;
    }

    if (dealerValue > 21 || handValue > dealerValue) {
      user.balance += bet;
      results.push(`Hand ${index + 1}: vinst`);
      return;
    }

    if (handValue < dealerValue) {
      user.balance -= bet;
      results.push(`Hand ${index + 1}: förlust`);
      return;
    }

    results.push(`Hand ${index + 1}: oavgjort`);
  });

  messageEl.textContent = results.join(" | ");

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
  document.getElementById("playerHand0").innerHTML = "";
  document.getElementById("playerHand1").innerHTML = "";
  document.getElementById("playerScore0").textContent = "";
  document.getElementById("playerScore1").textContent = "";
  document.getElementById("dealerCards").innerHTML = "";
  document.getElementById("gameMessage").textContent = "";

  // Skapa och blanda kortlek
  deck = createDeck();
  shuffleDeck(deck);

  //Skapa tomma händer
  playerHands = [createHand()];
  activeHandIndex = 0;
  handBets = [currentBet];
  handStates = [{ isComplete: false, isSplitAces: false, hasDoubled: false }];
  dealerHand = createHand();

  // Dela ut 2 kort vardera
  playerHands[0].push(drawCard(deck));
  dealerHand.push(drawCard(deck));
  playerHands[0].push(drawCard(deck));
  dealerHand.push(drawCard(deck));

  // Visa spelarens kort
  renderHand(0);

  // Visa dealerns kort, bara ett, andra dolt
  addCardToHand(dealerHand[0], "dealerCards");
  addCardToHand({ rank: "back", suit: "" }, "dealerCards"); // Dolt

  document.getElementById("dealerScore").textContent =
    `(${getHandDisplayValue([dealerHand[0]])})`;

  document.getElementById("playerHandRow1").classList.add("hidden");
  setActiveHandUI();
  updateActionButtons();

  // Visa Hit/Stand, dölj satsa-knappen
  document.getElementById("actionButtons").style.display = "block";
  document.getElementById("betArea").style.display = "none";
  document.getElementById("playAgainBtn").style.display = "none";

  if (resolveBlackjackIfNeeded()) {
    return;
  }
}

function playAgain() {
  document.getElementById("playerHand0").innerHTML = "";
  document.getElementById("playerHand1").innerHTML = "";
  document.getElementById("playerScore0").textContent = "";
  document.getElementById("playerScore1").textContent = "";
  document.getElementById("dealerCards").innerHTML = "";
  document.getElementById("gameMessage").textContent = "";
  document.getElementById("dealerScore").textContent = "";

  document.getElementById("actionButtons").style.display = "none";
  document.getElementById("betArea").style.display = "flex";
  document.getElementById("playAgainBtn").style.display = "none";

  document.getElementById("playerHandRow1").classList.add("hidden");

  currentBet = 0;
}

function getHandContainerId(index) {
  return index === 0 ? "playerHand0" : "playerHand1";
}

function getScoreId(index) {
  return index === 0 ? "playerScore0" : "playerScore1";
}

function renderHand(index) {
  const hand = playerHands[index];
  const containerId = getHandContainerId(index);
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  for (let card of hand) {
    addCardToHand(card, containerId);
  }
  document.getElementById(getScoreId(index)).textContent =
    `(${getHandDisplayValue(hand)})`;
}

function setActiveHandUI() {
  const row0 = document.getElementById("playerHandRow0");
  const row1 = document.getElementById("playerHandRow1");
  row0.classList.toggle("active-hand", activeHandIndex === 0);
  row1.classList.toggle("active-hand", activeHandIndex === 1);
}

function getTotalBets() {
  return handBets.reduce((total, bet) => total + bet, 0);
}

function canSplit() { 
  const hand = playerHands[activeHandIndex];
  if (!hand || hand.length !== 2) return false;
  if (playerHands.length > 1) return false;
  if (hand[0].value !== hand[1].value) return false;
  const user = getCurrentUser();
  const additionalBet = handBets[activeHandIndex];
  return user.balance >= getTotalBets() + additionalBet;
}

function canDouble() {
  const hand = playerHands[activeHandIndex];
  if (!hand || hand.length !== 2) return false;
  const user = getCurrentUser();
  const additionalBet = handBets[activeHandIndex];
  return user.balance >= getTotalBets() + additionalBet;
}

function updateActionButtons() {
  const splitBtn = document.getElementById("splitBtn");
  const doubleBtn = document.getElementById("doubleBtn");
  const betValue = handBets[activeHandIndex] ?? currentBet;

  splitBtn.disabled = !canSplit();
  doubleBtn.disabled = !canDouble();
  doubleBtn.textContent = `Double (+${betValue})`;
}

function splitHand() {
  if (!canSplit()) return;

  const hand = playerHands[activeHandIndex];
  const secondCard = hand.pop();

  const newHand = [secondCard];
  playerHands.push(newHand);

  handBets.push(handBets[activeHandIndex]);
  handStates.push({ isComplete: false, isSplitAces: false, hasDoubled: false });

  hand.push(drawCard(deck));
  newHand.push(drawCard(deck));

  if (hand[0].rank === "A") {
    handStates[0].isSplitAces = true;
    handStates[1].isSplitAces = true;
  }

  document.getElementById("playerHandRow1").classList.remove("hidden");
  renderHand(0);
  renderHand(1);
  setActiveHandUI();
  updateActionButtons();
}

function doubleDown() {
  if (!canDouble()) return;

  handBets[activeHandIndex] *= 2;
  const card = drawCard(deck);
  playerHands[activeHandIndex].push(card);

  renderHand(activeHandIndex);

  handStates[activeHandIndex].hasDoubled = true;
  handStates[activeHandIndex].isComplete = true;

  goToNextHandOrDealer();
}

function goToNextHandOrDealer() {
  if (
    activeHandIndex === 0 &&
    playerHands.length > 1 &&
    !handStates[1].isComplete
  ) {
    activeHandIndex = 1;
    setActiveHandUI();
    updateActionButtons();
    return;
  }

  if (
    playerHands.length === 1 ||
    (handStates[0].isComplete && handStates[1].isComplete)
  ) {
    runDealerAndResolve();
  }
}
