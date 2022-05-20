import { useState, useEffect } from 'react'
import { Container, Grid, Form, Input } from 'semantic-ui-react'

import { TxButton } from '../substrate-lib/components'
import { useVotechainContext } from './VotechainContext'
import Events from '../Events'

// AddCandidates component, tela responsavel por adicionar um candidato a eleição
const AddCandidates = () => {
  return (
    <>
      <Container>
        <h3>Add Candidates</h3>
        <Grid>
          <Grid.Row>
            <Grid.Column width="8">
              <AddCandidatesForm />
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
const AddCandidatesForm = () => {
  const { elections, fetchElections } = useVotechainContext()

  const [status, setStatus] = useState(null)
  const [formState, setFormState] = useState({
    candidateName: '',
    electionId: '',
  })

  const { candidateName, electionId } = formState

  const onChange = (_, data) => {
    setFormState(prev => ({ ...prev, [data.state]: data.value }))
  }

  useEffect(() => {
    fetchElections()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        <Input
          label="Candidate Name"
          type="text"
          placeholder="type here..."
          state="candidateName"
          onChange={onChange}
          value={candidateName}
        />
      </Form.Field>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          label="Submit"
          type="SUDO-TX"
          setStatus={setStatus}
          attrs={{
            palletRpc: 'votechain',
            callable: 'createCandidate',
            inputParams: [candidateName, electionId],
            paramFields: [true, true],
          }}
        />
      </Form.Field>
      <div style={{ overflowWrap: 'break-word' }}>{status}</div>
    </Form>
  )
}

export default AddCandidates
