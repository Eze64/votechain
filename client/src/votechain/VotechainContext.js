import React, { useContext, useReducer } from 'react'
import { useSubstrateState } from '../substrate-lib'
import { hexToString } from '@polkadot/util'

const initialState = {
  elections: [],
  candidates: [],
  votes: [],
  blocks: [],
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

  if (action.type === 'FETCH_BLOCKS') {
    return { ...state, blocks: action.payload }
  }

  throw new Error(`No Matching "${action.type}" - action type`)
}

const VotechainContext = React.createContext()

// Context Provider responsavel por centralizar as funções de acesso a votechain e as informações retornadas
export const VotechainProvider = ({ children }) => {
  const { api } = useSubstrateState()
  const [state, dispatch] = useReducer(reducer, initialState)

  // Buscar todas as eleições
  const fetchElections = async () => {
    let electionsList = await api.query.votechain.elections.entries()

    electionsList = electionsList.map(([id, desc]) => {
      const elecId = id.toHuman()[0]

      try {
        const elecName = hexToString(desc.toHuman().description)

        return {
          key: elecId,
          value: elecId,
          text: elecName,
        }
      } catch (error) {
        const elecName = desc.toHuman().description

        return {
          key: elecId,
          value: elecId,
          text: elecName,
        }
      }
    })

    dispatch({ type: 'FETCH_ELECTIONS', payload: electionsList })
  }

  // Buscar todas os candidatos de uma determinada eleições
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

  // Buscar todas os votos de uma determinada eleições
  const fetchVotes = async electionId => {
    let votesList = await api.query.votechain.electionVotes(electionId)
    votesList = votesList.toHuman()

    dispatch({ type: 'FETCH_VOTES', payload: votesList })
  }

  // Buscar as informações de todos os blocks
  const fetchBlocks = async () => {
    let blocksCount = await api.query.system.number()
    let tempBlocks = []

    blocksCount = blocksCount.toNumber()

    for (let i = 0; i < blocksCount; i++) {
      const blockHash = await api.rpc.chain.getBlockHash(i)
      const signedBlock = await api.rpc.chain.getBlock(blockHash)
      const humanBlock = signedBlock.block.toHuman()
      const {
        header: { number: blockNum },
        extrinsics,
      } = humanBlock

      if (extrinsics.length > 1) {
        extrinsics.forEach(ex => {
          if (ex.isSigned) {
            const {
              nonce,
              signer: { Id: signerId },
              signature,
              method: { args, method, section },
            } = ex

            if (args.call) {
              const { call } = args
              tempBlocks.push({
                blockNum,
                blockHash: blockHash.toHuman(),
                nonce,
                signerId,
                signature,
                section: call.section,
                method: call.method,
                args: call.args,
              })
            } else {
              tempBlocks.push({
                blockNum,
                blockHash: blockHash.toHuman(),
                nonce,
                signerId,
                signature,
                section,
                method,
                args,
              })
            }
          }
        })
      }
    }

    dispatch({ type: 'FETCH_BLOCKS', payload: tempBlocks })
  }

  return (
    <VotechainContext.Provider
      value={{
        ...state,
        fetchElections,
        fetchCandidates,
        fetchVotes,
        fetchBlocks,
      }}
    >
      {children}
    </VotechainContext.Provider>
  )
}
// make sure use
export const useVotechainContext = () => {
  return useContext(VotechainContext)
}
