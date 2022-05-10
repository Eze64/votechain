import { useState, useEffect } from 'react'
import { Container, Grid, Form, Input } from 'semantic-ui-react'
import { hexToString } from '@polkadot/util'

import { TxButton } from '../substrate-lib/components'
import { useSubstrateState } from '../substrate-lib'
import Events from '../Events'

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

const AddCandidatesForm = () => {
  const { api } = useSubstrateState()

  const [status, setStatus] = useState(null)
  const [formState, setFormState] = useState({
    electionOptions: [],
    candidateName: '',
    electionId: '',
  })

  useEffect(() => {
    const fetchElections = async () => {
      let electionsList = await api.query.votechain.elections.entries()

      electionsList = electionsList.map(([id, desc]) => {
        const elecId = id.toHuman()[0]
        const elecName = hexToString(desc.toHuman().description)
        // const elecName = desc.toHuman().description
        return {
          key: elecId,
          value: elecId,
          text: elecName,
        }
      })

      setFormState(prev => ({ ...prev, electionOptions: electionsList }))
    }

    fetchElections()
  }, [api])

  const onChange = (_, data) => {
    setFormState(prev => ({ ...prev, [data.state]: data.value }))
  }

  const onChangeSelect = (_, data) => {
    const { value } = data

    setFormState(prev => ({ ...prev, electionId: value }))
  }

  const { electionOptions, candidateName, electionId } = formState

  return (
    <Form>
      <Form.Field>
        <Form.Select
          fluid
          label="Election"
          onChange={onChangeSelect}
          options={electionOptions}
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
