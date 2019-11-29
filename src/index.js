import React, { createContext, useContext, useEffect, useReducer, useState } from 'react'

const DeckContext = createContext()

const buildDeck = (options, callback) => {
  const { suits, wildcards } = options
  let builtDeck = []

  suits.forEach(suit => {
    const cardSuit = createSuit(suit)
    builtDeck = builtDeck.concat(cardSuit)
  })

  wildcards.forEach((description, index) => {
    const wildcard = createWildcard(description, index)
    builtDeck = builtDeck.concat(wildcard)
  })

  if (callback) {
    builtDeck = callback(builtDeck)
  }

  return builtDeck
}

const createSuit = (suit) => {
  const cardSuit = []
  const nameOf = {
    1: 'Ace',
    2: 'Two',
    3: 'Three',
    4: 'Four',
    5: 'Five',
    6: 'Six',
    7: 'Seven',
    8: 'Eight',
    9: 'Nine',
    10: 'Ten',
    11: 'Jack',
    12: 'Queen',
    13: 'King',
  }
  const nameOfSuit = suit.charAt(0).toUpperCase() + suit.slice(1)
  for (let i = 0; i < 13; i++) {
    const value = i + 1
    cardSuit.push({
      description: `${nameOf[value]} of ${nameOfSuit}`,
      id: `${suit}-${value}`,
      suit,
      value,
    })
  }
  return cardSuit
}

const createWildcard = (description, index) => {
  return [{
    description,
    id: `wildcard-${index}`,
    suit: 'wildcards',
    value: 0,
  }]
}

const shuffle = (cards) => {
  const shuffledCards = cards
  // the Fisher-Yates Algorithm
  for (let i = shuffledCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    const temp = shuffledCards[i]
    shuffledCards[i] = shuffledCards[j]
    shuffledCards[j] = temp
  }
  return shuffledCards
}

const initialState = {
  deck: [],
  collections: {
    discard: [],
    draw: [],
  },
}

const reducer = (state, action) => {
  const { deck, collections } = state
  const drawPile = collections.draw

  switch (action.type) {
    case 'addCollection': return {
      ...state,
      collections: {
        ...collections,
        [action.collection]: [],
      },
    }

    case 'buildDeck': return {
      ...initialState,
      deck: buildDeck(action.options, action.callback),
    }

    case 'drawCards':
      const drawnCards = drawPile.splice(0, action.count)
      return {
        ...state,
        collections: {
          ...collections,
          draw: drawPile,
          [action.collection]: collections[action.collection].concat(drawnCards),
        },
      }

    case 'moveCard':
      let foundCard = false
      for (const key in collections) {
        if (foundCard) {
          break
        }
        const index = collections[key].findIndex(card => {
          return card.id === action.card.id
        })
        if (index !== -1) {
          foundCard = collections[key].splice(index, 1)
        }
      }
      if (foundCard) {
        return {
          ...state,
          collections: {
            ...collections,
            [action.collection]: collections[action.collection].concat(action.card)
          },
        }
      }
      return {
        ...state,
      }

    case 'recycleDiscards': return {
      ...state,
      collections: {
        ...collections,
        discard: [],
        draw: shuffle(collections.draw.concat(collections.discard)),
      },
    }

    case 'removeCollection':
      const discards = collections[action.collection]
      delete collections[action.collection]
      return {
        ...state,
        collections: {
          ...collections,
          discard: collections.discard.concat(discards),
        }
      }

    case 'shuffleDeck': return {
      ...state,
      collections: {
        ...collections,
        draw: shuffle([].concat(deck)),
      },
    }

    case 'updateCollection': return {
      ...state,
      collections: {
        ...collections,
        [action.collection]: action.callback(collections[action.collection]),
      },
    }

    default:
      return state
  }
}

const DeckOfCards = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { deck, collections } = state

  const addCollection = (collection) => dispatch({ collection, type: 'addCollection' })

  const buildDeck = (opts, callback) => {
    const options = {
      suits: ['clubs', 'diamonds', 'hearts', 'spades'],
      wildcards: [],
      ...opts,
    }
    dispatch({ type: 'buildDeck', options, callback })
  }

  const drawCards = (collection, count = 1) => dispatch({ collection, count, type: 'drawCards' })

  const moveCard = (card, collection) => dispatch({ card, collection, type: 'moveCard' })

  const recycleDiscards = () => dispatch({ type: 'recycleDiscards' })

  const removeCollection = (collection) => dispatch({ collection, type: 'removeCollection' })

  const shuffleDeck = () => dispatch({
    type: 'shuffleDeck',
  })

  const updateCollection = (collection, callback) => dispatch({
    collection,
    callback,
    type: 'updateCollection',
  })

  useEffect(() => {
    if (deck.length > 0) {
      shuffleDeck()
    }
  }, [deck])

  return (
    <DeckContext.Provider value={{
      addCollection,
      buildDeck,
      collections,
      deck,
      drawCards,
      moveCard,
      recycleDiscards,
      removeCollection,
      updateCollection,
    }}>
      {children}
    </DeckContext.Provider>
  )
}

const useDeckOfCards = () => {
  return useContext(DeckContext)
}


// ----










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
                >Sort</button>
            </p>
            <ul>
              {collections[players[key].hand] && collections[players[key].hand].map(card => (
                <li key={card.id}>
                  {card.description} <button onClick={() => handleMove(card)} type="button">X</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

    </>
  )
}










// ----


export {
  Component,
  DeckContext,
  DeckOfCards,
  useDeckOfCards,
}
