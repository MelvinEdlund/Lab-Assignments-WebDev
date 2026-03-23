function createCard(suit, rank) {
  let value;

  if (rank === "J" || rank === "Q" || rank === "K") {
    value = 10;
  } else if (rank === "A") {
    value = 11;
  } else {
    value = parseInt(rank);
  }

  return { suit, rank, value };
}

function createDeck() {
  let deck = [];

  for (let suit of suits) {
    for (let rank of ranks) {
      let card = createCard(suit, rank);
      deck.push(card);
    }
  }

  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function drawCard(deck) {
  return deck.pop();
}

const suits = ["hearts", "diamonds", "clubs", "spades"];

const ranks = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
