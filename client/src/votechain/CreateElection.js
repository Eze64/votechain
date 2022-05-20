import { useState } from 'react'
import { Container, Grid, Form, Input } from 'semantic-ui-react'
import { TxButton } from '../substrate-lib/components'
import Events from '../Events'

// CreateElection component, tela responsavel por criar uma eleição
const CreateElection = () => {
  return (
    <>
      <Container>
        <h3>Create Election</h3>
        <Grid>
          <Grid.Row>
            <Grid.Column width="8">
              <CreateElectionForm />
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
const CreateElectionForm = () => {
  const [status, setStatus] = useState(null)
  const [formState, setFormState] = useState({ electionName: '' })

  const onChange = (_, data) => {
    setFormState(prev => ({ ...prev, [data.state]: data.value }))
  }

  const { electionName } = formState

  return (
    <Form>
      <Form.Field>
        <Input
          label="Election Name"
          type="text"
          placeholder="type here..."
          state="electionName"
          onChange={onChange}
          value={electionName}
        />
      </Form.Field>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          label="Submit"
          type="SUDO-TX"
          setStatus={setStatus}
          attrs={{
            palletRpc: 'votechain',
            callable: 'createElection',
            inputParams: [electionName],
            paramFields: [true],
          }}
        />
      </Form.Field>
      <div style={{ overflowWrap: 'break-word' }}>{status}</div>
    </Form>
  )
}

export default CreateElection
