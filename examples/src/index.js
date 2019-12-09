import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'
import { DeckOfCards, useDeckOfCards } from '../../src'

const Component = () => {
  const {
    addCollection,
    buildDeck,
    collections,
    deck,
    drawCards,
    moveCard,
    recycleDiscards,
    removeCollection,
    updateCollection,
  } = useDeckOfCards()

  const [playerCounter, setPlayerCounter] = useState(0)
  const [players, setPlayers] = useState({})

  const handleAddPlayer = () => {
    addCollection(`player-${playerCounter}`)
    setPlayers({
      ...players,
      [playerCounter]: {
        hand: `player-${playerCounter}`,
      },
    })
    setPlayerCounter(playerCounter + 1)
  }

  const handleRemovePlayer = (player) => {
    removeCollection(`player-${player}`)
    const nextPlayers = {
      ...players,
    }
    delete nextPlayers[player]
    setPlayers(nextPlayers)
  }

  const handleDraw = (collection) => {
    drawCards(collection)
  }

  const handleMove = (card) => {
    moveCard(card, 'discard')
  }

  const handleMoveHand = (cards) => {
    cards.forEach(card => moveCard(card, 'discard'))
  }

  const handleUpdateCollection = (collection) => {
    updateCollection(collection, (collection) => {
      return collection.sort((a, b) => a.value - b.value)
    })
  }

  useEffect(() => {
    if (deck.length === 0) {
      buildDeck(
        {
          // wildcards: ['Red Joker', 'Blue Joker'],
        },
        (deck) => deck.map(card => {
          // Set all royalty cards' value to 10
          if (card.value > 10) {
            card.value = 10
          }
          return card
        })
      )
    }
  }, [deck])

  if (collections.draw.length === 0) {
    return null
  }

  return (
    <>
      <h1>Deck contains {deck.length} cards</h1>
      <p>On top of the deck is the <strong>{collections.draw[0].description}</strong>.</p>
      <p>
        {collections.draw.length} remaining cards; {collections.discard.length} in discard. <button onClick={recycleDiscards} type="button">Recycle</button>
      </p>

      <div>
        <button onClick={handleAddPlayer} type="button">Add Player</button>
        {Object.keys(players).map(key => (
          <div key={key}>
            <p>
              <strong>Player {key}</strong> (total: {collections[`player-${key}`] ? collections[`player-${key}`].reduce((acc, card) => acc + card.value, 0) : 0}) <button
                onClick={() => handleDraw(`player-${key}`)}
                type="button">
                  Draw
              </button> <button
                onClick={() => handleRemovePlayer(key)}
                type="button"
              >
                Remove
              </button> <button
                onClick={() => handleUpdateCollection(`player-${key}`)}
                type="button"
              >Sort</button> <button
                onClick={() => handleMoveHand(collections[players[key].hand])}
                type="button"
              >Discard Hand</button>
            </p>
            <ul>
              {collections[players[key].hand] && collections[players[key].hand].map(card => (
                <li key={card.id}>
                  {card.description} <button onClick={() => handleMove(card)} type="button">X</button>
                </li>
              ))}
            </ul>
            <button type="button"
              onClick={() => moveCard({
                id: 'hearts-4',
              }, 'player-0')}
            >Move 4 of Hearts</button>
          </div>
        ))}
      </div>

    </>
  )
}

const App = () => (
  <DeckOfCards>
    <Component />
  </DeckOfCards>
)

render(<App />, document.getElementById('root'))
