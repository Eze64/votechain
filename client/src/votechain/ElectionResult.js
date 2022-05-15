// import { hexToString } from '@polkadot/util'
import { useState, useEffect } from 'react'
import { Container, Grid, Form, Table } from 'semantic-ui-react'

import { useVotechainContext } from './VotechainContext'

const ElectionResult = () => {
  return (
    <>
      <Container>
        <h3>Result</h3>
        <Grid>
          <Grid.Row>
            <Grid.Column width="8">
              <ElectionResultForm />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    </>
  )
}

const ElectionResultForm = () => {
  const {
    elections,
    candidates,
    votes,
    fetchElections,
    fetchCandidates,
    fetchVotes,
  } = useVotechainContext()

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

  useEffect(() => {
    fetchCandidates(electionId)
    fetchVotes(electionId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionId])

  return (
    <>
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
      </Form>
      {electionId && (
        <Table celled padded>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Candicates</Table.HeaderCell>
              <Table.HeaderCell>Votes</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {candidates &&
              candidates.map(cand => {
                return (
                  <Table.Row key={cand.key}>
                    <Table.Cell>{cand.text}</Table.Cell>
                    <Table.Cell>
                      {votes
                        ? votes.filter(x => x.candidateId === cand.key).length
                        : '0'}
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            <Table.Row>
              <Table.Cell>Total:</Table.Cell>
              <Table.Cell>{votes ? votes.length : '0'}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      )}
    </>
  )
}

export default ElectionResult
