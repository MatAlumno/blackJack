import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [deck, setDeck] = useState("");
  const [hand, setHand] = useState([]);
  const [crupier, setCrupier] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState("");

  useEffect(() => {
    axios
      .get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
      .then((response) => setDeck(response.data.deck_id))
      .catch((error) => console.error("Error fetching deck:", error));
  }, []);

  const start = () => {
    setHand([]);
    setCrupier([]);
    setGameOver(false);
    setWinner("");

    axios
      .get(`https://deckofcardsapi.com/api/deck/${deck}/draw/?count=2`)
      .then((response) => setHand(response.data.cards))
      .catch((error) => console.error("Error fetching player's cards:", error));

    axios
      .get(`https://deckofcardsapi.com/api/deck/${deck}/draw/?count=2`)
      .then((response) => setCrupier(response.data.cards))
      .catch((error) => console.error("Error fetching dealer's cards:", error));
  };

  const points = (cards) => {
    let total = 0;
    cards.map(card => parseInt(card.value)).reduce((total, currentValue) => total + currentValue, 0);
    return total;
  };

  const pedir = () => {
    axios
      .get(`https://deckofcardsapi.com/api/deck/${deck}/draw/?count=1`)
      .then((response) => setHand([...hand, response.data.cards[0]]))
      .catch((error) => console.error("Error fetching player's card:", error));
  };

  const plantarse = () => {
    let crupierTotal = points(crupier);
    while (crupierTotal <= 16) {
      axios
        .get(`https://deckofcardsapi.com/api/deck/${deck}/draw/?count=1`)
        .then((response) => {
          const newCard = response.data.cards[0];
          setCrupier((prevCrupier) => [...prevCrupier, newCard]);
        })
        .catch((error) =>
          console.error("Error fetching dealer's card:", error)
        );
      crupierTotal = points(crupier);
    }
    setGameOver(true);
    win();
  };

  const win = () => {
    const playerPoints = points(hand);
    const crupierPoints = points(crupier);

    if (playerPoints > 21) {
      setWinner("Crupier gana (Jugador se pasó de 21)");
    } else if (crupierPoints > 21 || playerPoints > crupierPoints) {
      setWinner("Jugador gana");
    } else if (playerPoints < crupierPoints) {
      setWinner("Crupier gana");
    } else {
      setWinner("Empate");
    }
  };

  return (
    <>
      <h1>¡Bienvenido al Blackjack!</h1>
      <button onClick={start}>Empezar</button>

      <div>
        <h2>Mano del Crupier:</h2>
        <ul>
          {crupier.map((card, index) => (
            <li key={index}>
              <img
                src={
                  gameOver || index === 0 ? card.image : "/public/yugioh.jpg"
                }
                alt={gameOver || index === 0 ? card.code : "Carta oculta"}
              />
            </li>
          ))}
        </ul>
        <p>Puntuación del crupier: {gameOver ? points(crupier) : "?"}</p>
      </div>

      <div>
        <h2>Tu mano:</h2>
        <ul>
          {hand.map((card, index) => (
            <li key={index}>
              <img src={card.image} alt={card.code} />
              {card.value} of {card.suit}
            </li>
          ))}
        </ul>
        <p>Puntuación del jugador: {points(hand)}</p>
      </div>

      {!gameOver ? (
        <div>
          <button onClick={pedir}>Pedir carta</button>
          <button onClick={plantarse}>Plantarse</button>
        </div>
      ) : (
        <h2>{winner}</h2>
      )}
    </>
  );
};

export default App;
