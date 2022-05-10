import { useState, useEffect } from 'react'
import { Container, Grid, Form } from 'semantic-ui-react'
import { hexToString } from '@polkadot/util'

import { TxButton } from '../substrate-lib/components'
import { useSubstrateState } from '../substrate-lib'
import Events from '../Events'

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

const VoteForm = () => {
  const { api } = useSubstrateState()

  const [status, setStatus] = useState(null)
  const [formState, setFormState] = useState({
    electionOptions: [],
    candidateOptions: [],
    electionId: '',
    candidateId: '',
  })

  const { electionOptions, candidateOptions, electionId, candidateId } =
    formState

  useEffect(() => {
    const fetchElections = async () => {
      let electionsList = await api.query.votechain.elections.entries()

      electionsList = electionsList.map(([id, desc]) => {
        const elecId = id.toHuman()[0]
        const elecName = hexToString(desc.toHuman().description)
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

  useEffect(() => {
    const fetchCandidates = async () => {
      let candidatesList = await api.query.votechain.candidates.entries()

      // let candidates2 = await api.query.votechain.electionCandidates(electionId)

      // console.log('candidates2', candidates2.toHuman())

      candidatesList = candidatesList
        .map(([id, desc]) => {
          const candId = id.toHuman()[0]
          const { candidateName: candName, electionId: elecId } = desc.toHuman()

          return {
            candId,
            candName,
            elecId,
          }
        })
        .filter(x => x.elecId === electionId)
        .map(({ candId, candName }) => {
          return {
            key: candId,
            value: candId,
            text: candName,
          }
        })

      setFormState(prev => ({ ...prev, candidateOptions: candidatesList }))
    }

    fetchCandidates()
  }, [electionId, api])

  const onElectionChange = (_, data) => {
    const { value } = data

    setFormState(prev => ({ ...prev, electionId: value }))
  }

  const onCandidateChange = (_, data) => {
    const { value } = data

    setFormState(prev => ({ ...prev, candidateId: value }))
  }

  return (
    <Form>
      <Form.Field>
        <Form.Select
          fluid
          label="Election"
          onChange={onElectionChange}
          options={electionOptions}
          placeholder="Select the election"
        />
      </Form.Field>
      <Form.Field>
        <Form.Select
          fluid
          label="Candidates"
          onChange={onCandidateChange}
          options={candidateOptions}
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
