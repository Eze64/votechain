import React, { useContext, useReducer } from 'react'
import { useSubstrateState } from '../substrate-lib'
import { hexToString } from '@polkadot/util'

const initialState = {
  elections: [],
  candidates: [],
  votes: [],
}

const reducer = (state, action) => {
  if (action.type === 'FETCH_ELECTIONS') {
    return { ...state, elections: action.payload }
  }

  if (action.type === 'FETCH_CANDIDATES') {
    return { ...state, candidates: action.payload }
  }

  if (action.type === 'FETCH_VOTES') {
    return { ...state, votes: action.payload }
  }

  throw new Error(`No Matching "${action.type}" - action type`)
}

const VotechainContext = React.createContext()

export const VotechainProvider = ({ children }) => {
  const { api } = useSubstrateState()
  const [state, dispatch] = useReducer(reducer, initialState)

  const fetchElections = async () => {
    let electionsList = await api.query.votechain.elections.entries()

    electionsList = electionsList.map(([id, desc]) => {
      const elecId = id.toHuman()[0]
      // const elecName = desc.toHuman().description
      const elecName = hexToString(desc.toHuman().description)

      return {
        key: elecId,
        value: elecId,
        text: elecName,
      }
    })

    dispatch({ type: 'FETCH_ELECTIONS', payload: electionsList })
  }

  const fetchCandidates = async electionId => {
    let candidatesList = await api.query.votechain.candidates.entries()

    candidatesList = candidatesList.reduce((acc, curr) => {
      const [id, desc] = curr
      const candId = id.toHuman()[0]
      const { candidateName: candName, electionId: elecId } = desc.toHuman()

      if (elecId === electionId) {
        return [
          ...acc,
          {
            key: candId,
            value: candId,
            text: candName,
          },
        ]
      }

      return acc
    }, [])

    dispatch({ type: 'FETCH_CANDIDATES', payload: candidatesList })
  }

  const fetchVotes = async electionId => {
    let votesList = await api.query.votechain.electionVotes(electionId)
    votesList = votesList.toHuman()

    dispatch({ type: 'FETCH_VOTES', payload: votesList })
  }

  return (
    <VotechainContext.Provider
      value={{ ...state, fetchElections, fetchCandidates, fetchVotes }}
    >
      {children}
    </VotechainContext.Provider>
  )
}
// make sure use
export const useVotechainContext = () => {
  return useContext(VotechainContext)
}
