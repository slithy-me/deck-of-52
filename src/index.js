import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import './style'

const createSuite = (suite) => {
  const cardSuite = []
  const nameOf = {
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
    14: 'Ace',
  }
  const nameOfSuite = suite.charAt(0).toUpperCase() + suite.slice(1)

  for (let i = 0; i < 13; i++) {
    const value = i + 2
    cardSuite.push({
      description: `${nameOf[value]} of ${nameOfSuite}`,
      suite,
      value,
    })
  }

  return cardSuite
}

const DeckContext = createContext()

const DeckOfCards = ({
  children,
  suites = ['clubs', 'diamonds', 'hearts', 'spades'],
}) => {
  const [deck, setDeck] = useState([])
  const [discardPile, setDiscardPile] = useState([])
  const [drawPile, setDrawPile] = useState([])

  const buildDeck = () => {
    let builtDeck = []
    suites.forEach(suite => {
      const cardSuite = createSuite(suite)
      builtDeck = builtDeck.concat(cardSuite)
    })
    return builtDeck
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

  const shuffleDeck = () => setDrawPile(shuffle(buildDeck()))

  useEffect(() => {
    shuffleDeck()
  }, [])

  return (
    <DeckContext.Provider value={{
      discardPile,
      drawPile,
      shuffleDeck,
    }}>
      {children}
    </DeckContext.Provider>
  )
}

const useDeckOfCards = () => {
  return useContext(DeckContext)
}

const Component = () => {
  const { discardPile, drawPile, shuffleDeck } = useDeckOfCards()

  if (discardPile.length === 0 && drawPile.length === 0) {
    return (
      <p>Building deck ...</p>
    )
  }

  return (
    <>
      <h1>Number of Cards: {drawPile.length}</h1>
      <p>{drawPile[0].description}</p>
      <p><button onClick={shuffleDeck} type="button">Shuffle</button></p>
    </>
  )
}

export {
  Component,
  DeckContext,
  DeckOfCards,
  useDeckOfCards,
}
