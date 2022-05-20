import { useState, useEffect } from 'react'
import { Container, Grid, Form } from 'semantic-ui-react'

import { TxButton } from '../substrate-lib/components'
import { useVotechainContext } from './VotechainContext'

import Events from '../Events'

// Vote component, tela responsavel pela votação
const Vote = () => {
  return (
    <>
      <Container>
        <h3>Vote</h3>
        <Grid>
          <Grid.Row>
            <Grid.Column width="8">
              <VoteForm />
            </Grid.Column>
            <Grid.Column width="8">
              <Events />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    </>
  )
}

// formulario
const VoteForm = () => {
  const { elections, candidates, fetchElections, fetchCandidates } =
    useVotechainContext()

  const [status, setStatus] = useState(null)
  const [formState, setFormState] = useState({
    electionId: '',
    candidateId: '',
  })

  const { electionId, candidateId } = formState

  const onChange = (_, data) => {
    setFormState(prev => ({ ...prev, [data.state]: data.value }))
  }

  useEffect(() => {
    fetchElections()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchCandidates(electionId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionId])

  return (
    <Form>
      <Form.Field>
        <Form.Select
          fluid
          label="Election"
          state="electionId"
          onChange={onChange}
          options={elections}
          placeholder="Select the election"
        />
      </Form.Field>
      <Form.Field>
        <Form.Select
          fluid
          label="Candidates"
          state="candidateId"
          onChange={onChange}
          options={candidates}
          placeholder="Select the candidate"
        />
      </Form.Field>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          label="Submit"
          type="SIGNED-TX"
          setStatus={setStatus}
          attrs={{
            palletRpc: 'votechain',
            callable: 'createVote',
            inputParams: [candidateId, electionId],
            paramFields: [true, true],
          }}
        />
      </Form.Field>
      <div style={{ overflowWrap: 'break-word' }}>{status}</div>
    </Form>
  )
}

export default Vote
