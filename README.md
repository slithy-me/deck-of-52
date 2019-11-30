# Deck of 52

A generic deck of cards, fashioned as a React context, with a hooks-based interface.

The context generates a deck, and keeps track of cards as they move through the course of playing a game. The particulars of game logic or players are of no concern to the deck itself.

On initializing a game, the deck is built, then shuffled to create the _draw_ collection.

Using utility methods, the game may create additional collections to represent hands, piles, stacks, etc., and may move cards between them.

For example, a card may be dealt from the _draw_ pile, into a player's _hand_. Later, that card may be move from the players _hand_, into the _discard_ pile. Eventually, the _discard_ pile might be shuffled back into _draw_ to replenish the game. In the abstract, in each case we are moving a card from one collection to another.

***

## Usage

To get started, wrap your application, or just the game logic, in the **DeckOfCards** context.

```js
import { DeckOfCards } from ...

const App = () => (
  <DeckOfCards>
    <Game />
  </DeckOfCards>
)
```

In the game logic, import the **useDeckOfCards** hook to access the deck's utility methods. Then initialize the deck in a _useEffect_.

To kick the game off, interact with the the _draw_ collection.

```js
import React, { useEffect } from 'react'
import { useDeckOfCards } from ...

const Game = (props) => {
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

  useEffect(() => {
    if (deck.length === 0) {
      buildDeck()
    }
  }, [deck])

  return (
    <div>
      <h1>My Card Game</h1>
      <p>
        Top Card:<br/>
        {collections.draw[0].description}
      </p>
    </div>
  )
}
```

***

## The State of the Deck

The deck maintains two items in state, _deck_ and _collections_.

```js
const initialState = {
  deck: [],
  collections: {
    discard: [],
    draw: [],
  },
}
```

Initially, two collections are predefined, _discard_ and _draw_. Additional collections may be created to represent hands, piles, stacks, etc. as necessitated by the game.

As one might expect, the _draw_ pile contains unplayed cards. Deal cards from the _draw_ collection into in-play collections, such as player hands, or stacks on the table.

A card, having been played, should be moved into the _discard_ pile. A utility method exists to replenish the _draw_ pile from _discard_.

Under normal circumstances, the total cards in all collections should be equal to the number of cards in the _deck_. If cards are somehow lost, however, the deck can be shuffled back into play.

***

## Building the Deck, and the Shape of Cards

The deck is built using the _buildDeck_ method:

  buildDeck()

This method optionally accepts an options object, and a callback.

  buildDeck({}, deck => deck)

Omitting these, the deck will be built using the standard suits: clubs, diamonds, hearts, spades. In verbose form, this is:

  buildDeck({
    suits: ['clubs', 'diamonds', 'hearts', 'spades'],
  })

Each suit is built to contain 13 cards, ranging in value from 1 (Ace) to 13 (King). Specifically, this:

```js
{
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
```

In the resulting deck, each card is an object of the following shape.

```js
{
  description: 'Two of Hearts',
  id: 'hearts-2',
  suit: 'hearts',
  value: 2,
}
```

As an example, you might wish to create a custom deck for a fantasy card game. Let's use the four elements as suits, limit royalty cards to a value of 10, and add a fourth royalty.

```js
buildDeck({
  suits: ['earth', 'fire', 'water', 'wind'],
}, (deck, options) => {
  // Set all royalty cards' value to 10
  const newDeck = deck.map(card => {
    // Set all royalty cards' value to 10
    if (card.value > 10) {
      card.value = 10
    }
    return card
  })
  // Add a new 'Lord' royalty card for each suit
  const newRoyalty = options.suits.map(suit => {
    return {
      description: `${suit.charAt(0).toUpperCase() + suit.slice(1)} Elemental`,
      id: `${suit}-14`,
      suit,
      value: 11,
    }
  })

  // Return the modified deck + Lord cards
  return newDeck.concat(newRoyalty)
})
```

And so, we have the potential to draw a "Fire Elemental" with a numeric value of 11, whatever that means for your game. And, with the extra royalty cards added, our deck is 56 cards.

***

## Methods

Listed alphabetically.

### addCollection
  addCollection( string )

Creates a new collection, using the string as key; accessible as _collections[ string ]_.

The value of the collection is an array, containing cards; on creation, the array is empty.

### buildDeck
  buildDeck( options, callback )

Used to initialize a new deck for play.

On its own -- _buildDeck()_ -- will create a standard deck of 52 cards, using the suits clubs, diamonds, hearts and spades. Use options to define different or additional suits, and the callback to manipulate the deck or add custom cards.

```js
buildDeck({
  suits: ['clubs', 'diamonds', 'hearts', 'spades'],
  wildcards: ['Red Joker', 'Blue Joker'],
}, (deck, options) => {
  // ... do things with deck ...
  return deck
})
```

### drawCards
  drawCards( collection, count = 1 )

Moves a number of cards (_count_), into the specified _collection_. Draws a single card by default; the collection name is required.

### moveCard
  moveCard( card, collection )

Moves a card into the designated collection. To use, pass the entire card object into the card parameter; or, at least an object with a card id.

### recycleDiscards
  recycleDiscards()

Moves all cards from _discard_ back into _draw_, then shuffles the _draw_ collection.

### removeCollection
  removeCollection( collection )

Removes the named collection, and sends any cards therein to _discard_.

### updateCollection
  updateCollection( collection, callback )

Runs the callback on the named collection. For example:

```js
updateCollection(collection, (collection) => {
  return collection.sort((a, b) => a.value - b.value)
})
```

***
