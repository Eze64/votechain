import React, { useState, useEffect } from 'react'
import { Menu, Modal, Button, Header, Input, Message } from 'semantic-ui-react'
import { Link, useLocation } from 'react-router-dom'

import { useSubstrate } from './substrate-lib'

const Navbar = () => {
  const [currentPage, setCurrentPage] = useState('home')
  const [openModal, setOpenModal] = useState(false)
  const { pathname } = useLocation()

  const {
    setCurrentAccount,
    state: { keyring, currentAccount },
  } = useSubstrate()

  useEffect(() => {
    if (pathname.length > 1) {
      setCurrentPage(pathname.substring(1))
    } else {
      setCurrentPage('home')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onClick = (_, { name }) => setCurrentPage(name)
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
        <Menu.Item
          as={Link}
          to={'/'}
          active={currentPage === 'home'}
          onClick={onClick}
          name="home"
        />
        <Menu.Item
          as={Link}
          to={'/createelection'}
          active={currentPage === 'create election'}
          onClick={onClick}
          name="create election"
        />
        <Menu.Item
          as={Link}
          to={'/addcandidates'}
          active={currentPage === 'add candidate'}
          onClick={onClick}
          name="add candidate"
        />
        <Menu.Item
          as={Link}
          to={'/vote'}
          active={currentPage === 'vote'}
          onClick={onClick}
          name="vote"
        />
        <Menu.Item
          as={Link}
          to={'/results'}
          active={currentPage === 'results'}
          onClick={onClick}
          name="results"
        />
        <Menu.Menu position="right">
          {currentAccount ? (
            <Menu.Item
              as={Link}
              to={'/'}
              name="Logout"
              onClick={() => {
                setCurrentAccount(null)
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
        />
      )}
    </>
  )
}

const LoginModal = ({
  openModal,
  setOpenModal,
  setCurrentAccount,
  keyring,
}) => {
  const [key, setKey] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = () => {
    try {
      const keyringKey = keyring.getPair(key)
      console.log('keyringKey', keyringKey)
      setCurrentAccount(keyringKey)
      setErrorMsg('')
      setOpenModal(false)
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
