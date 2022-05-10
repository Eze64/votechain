import { hexToString } from '@polkadot/util'
import { useState, useEffect } from 'react'
import { Container, Grid, Form, Table } from 'semantic-ui-react'

import { useSubstrateState } from '../substrate-lib'

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
  const { api } = useSubstrateState()

  const [formState, setFormState] = useState({
    electionOptions: [],
    candidatesList: [],
    votesList: [],
    electionId: '',
  })

  const { electionOptions, candidatesList, votesList, electionId } = formState

  const onElectionChange = (_, data) => {
    const { value } = data

    setFormState(prev => ({ ...prev, electionId: value }))
  }

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
      let votesList = await api.query.votechain.electionVotes(electionId)
      votesList = votesList.toHuman()

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

      setFormState(prev => ({ ...prev, candidatesList, votesList }))
    }

    fetchCandidates()
  }, [electionId, api])

  return (
    <>
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
            {candidatesList &&
              candidatesList.map(cand => {
                return (
                  <Table.Row key={cand.key}>
                    <Table.Cell>{cand.text}</Table.Cell>
                    <Table.Cell>
                      {votesList
                        ? votesList.filter(x => x.candidateId === cand.key)
                            .length
                        : '0'}
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            <Table.Row>
              <Table.Cell>Total:</Table.Cell>
              <Table.Cell>{votesList ? votesList.length : '0'}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      )}
    </>
  )
}

export default ElectionResult
