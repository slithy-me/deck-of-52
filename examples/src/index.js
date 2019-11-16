import React from 'react'
import { render } from 'react-dom'
import { Component, DeckOfCards } from '../../src'

const App = () => (
  <DeckOfCards>
    <Component />
  </DeckOfCards>
)

render(<App />, document.getElementById('root'))
