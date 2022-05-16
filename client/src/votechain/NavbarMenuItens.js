const menuItens = [
  {
    to: '/',
    state: 'home',
    name: 'home',
    sudo: false,
  },
  {
    to: '/createelection',
    state: 'createelection',
    name: 'create election',
    sudo: true,
  },
  {
    to: '/closeelection',
    state: 'closeelection',
    name: 'close election',
    sudo: true,
  },
  {
    to: '/addcandidate',
    state: 'addcandidate',
    name: 'add candidate',
    sudo: true,
  },
  {
    to: '/vote',
    state: 'vote',
    name: 'vote',
    sudo: false,
  },
  {
    to: '/result',
    state: 'result',
    name: 'result',
    sudo: false,
  },
  {
    to: '/blocks',
    state: 'blocks',
    name: 'blocks',
    sudo: true,
  },
]

export default menuItens
