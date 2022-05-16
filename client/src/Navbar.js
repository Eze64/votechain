import React, { useState, useEffect } from 'react'
import { Menu, Modal, Button, Header, Input, Message } from 'semantic-ui-react'
import { Link, useLocation } from 'react-router-dom'
import { menuItens } from './votechain'

import { useSubstrate } from './substrate-lib'

const Navbar = () => {
  const [currentPage, setCurrentPage] = useState('home')
  const [openModal, setOpenModal] = useState(false)
  const [isSudo, setIsSudo] = useState(false)
  const { pathname } = useLocation()

  const {
    setCurrentAccount,
    state: { api, keyring, currentAccount },
  } = useSubstrate()

  const checkSudo = acctPair => {
    ;(async function () {
      if (!api || !api.query.sudo) {
        setIsSudo(false)
      }

      const sudoKey = await api.query.sudo.key()

      if (!sudoKey || !acctPair) {
        setIsSudo(false)
      }

      setIsSudo(acctPair.address === sudoKey.toString())
    })()
  }

  useEffect(() => {
    if (pathname.length > 1) {
      setCurrentPage(pathname.substring(1))
    } else {
      setCurrentPage('home')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onClick = (_, { state }) => setCurrentPage(state)

  return (
    <>
      <Menu
        attached="top"
        pointing
        secondary
        style={{
          backgroundColor: '#fff',
          borderColor: '#fff',
          paddingTop: '1em',
          paddingBottom: '1em',
        }}
      >
        {menuItens.map(item => {
          if (!isSudo && item.sudo) {
            return
          }
          return (
            <Menu.Item
              key={item.state}
              as={Link}
              to={item.to}
              active={currentPage === item.state}
              state={item.state}
              onClick={onClick}
              name={item.name}
            />
          )
        })}
        <Menu.Menu position="right">
          {currentAccount ? (
            <Menu.Item
              as={Link}
              to={'/'}
              name="Logout"
              onClick={() => {
                setCurrentAccount(null)
                setIsSudo(false)
                setCurrentPage('home')
              }}
            />
          ) : (
            <Menu.Item name="login" onClick={() => setOpenModal(true)} />
          )}
        </Menu.Menu>
      </Menu>
      {openModal && (
        <LoginModal
          openModal={openModal}
          setOpenModal={setOpenModal}
          setCurrentAccount={setCurrentAccount}
          keyring={keyring}
          checkSudo={checkSudo}
        />
      )}
    </>
  )
}

const LoginModal = ({
  openModal,
  setOpenModal,
  setCurrentAccount,
  checkSudo,
  keyring,
}) => {
  const [key, setKey] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = () => {
    try {
      const keyringKey = keyring.getPair(key)
      setCurrentAccount(keyringKey)
      setErrorMsg('')
      setOpenModal(false)
      checkSudo(keyringKey)
    } catch (error) {
      setErrorMsg('Fail to Login')
    }
  }

  return (
    <Modal
      onClose={() => setOpenModal(false)}
      onOpen={() => setOpenModal(true)}
      open={openModal}
    >
      <Modal.Header>Login</Modal.Header>
      <Modal.Description style={{ padding: '2rem 1.5rem' }}>
        <Header>Enter your Key</Header>
        <Input
          label="My Key"
          type="text"
          placeholder="type here..."
          state="electionName"
          onChange={(_, data) => setKey(data.value)}
          value={key}
        />
        {errorMsg && <Message error content={errorMsg} />}
      </Modal.Description>
      <Modal.Actions>
        <Button
          secondary
          content="Cancel"
          onClick={() => setOpenModal(false)}
        />
        <Button primary content="Login" onClick={handleLogin} />
      </Modal.Actions>
    </Modal>
  )
}

export default Navbar
