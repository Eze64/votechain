import React, { createRef } from 'react'
import { Dimmer, Loader, Grid, Message, Sticky } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import { Routes, Route } from 'react-router-dom'

import { SubstrateContextProvider, useSubstrateState } from './substrate-lib'
import Navbar from './Navbar'
import Substrate from './Substrate'
import {
  AddCandidates,
  CreateElection,
  ElectionResult,
  Vote,
} from './votechain'

function Main() {
  const { apiState, apiError, keyringState } = useSubstrateState()

  const loader = text => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  )

  const message = errObj => (
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message
          negative
          compact
          floating
          header="Error Connecting to Substrate"
          content={`Connection to websocket '${errObj.target.url}' failed.`}
        />
      </Grid.Column>
    </Grid>
  )

  if (apiState === 'ERROR') return message(apiError)
  else if (apiState !== 'READY') return loader('Connecting to Substrate')

  if (keyringState !== 'READY') {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    )
  }

  const contextRef = createRef()

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <Navbar />
      </Sticky>
      <Routes>
        <Route exact path="/" element={<h1>Votechain</h1>} />
        <Route exact path="/createelection" element={<CreateElection />} />
        <Route exact path="/addcandidates" element={<AddCandidates />} />
        <Route exact path="/vote" element={<Vote />} />
        <Route exact path="/results" element={<ElectionResult />} />
        <Route path="/substrate" element={<Substrate />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  )
}
