import { useState, useEffect } from 'react'
import { Container, Grid, Form } from 'semantic-ui-react'

import { TxButton } from '../substrate-lib/components'
import { useVotechainContext } from './VotechainContext'
import Events from '../Events'

// CloseElection component, tela responsavel por finalizar uma eleição
const CloseElection = () => {
  return (
    <>
      <Container>
        <h3>Close election</h3>
        <Grid>
          <Grid.Row>
            <Grid.Column width="8">
              <CloseElectionForm />
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
const CloseElectionForm = () => {
  const { elections, fetchElections } = useVotechainContext()

  const [status, setStatus] = useState(null)
  const [formState, setFormState] = useState({
    electionId: '',
  })

  const { electionId } = formState

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

      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          label="Close"
          type="SUDO-TX"
          setStatus={setStatus}
          attrs={{
            palletRpc: 'votechain',
            callable: 'closeElection',
            inputParams: [electionId],
            paramFields: [true],
          }}
        />
      </Form.Field>
      <div style={{ overflowWrap: 'break-word' }}>{status}</div>
    </Form>
  )
}

export default CloseElection
