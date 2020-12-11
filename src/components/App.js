import React from 'react'
import Login from './Login'
import useLocalStorage from '../hooks/useLocalStorage'
import Dashboard from './Dashboard'
import { ContactsProvider } from '../contexts/ContactsProvider'
import { ConversationsProvider } from '../contexts/ConversationsProvider'
import { SocketProvider } from '../contexts/SocketProvider'
import { GameProvider } from '../contexts/GameProvider'
import { v4 as uuidV4 } from 'uuid'
import '../App.css';


function App() {
  const [user, setUser] = useLocalStorage('user', {
    id: uuidV4(),
    name: ""
  })

  function handleSubmitForm(name) {
    setUser({
      id: user.id,
      name
    })
  }

  const dashboard = (
    <SocketProvider id={user.id}>
      <ContactsProvider>
        <ConversationsProvider id={user.id}>
          <GameProvider user={user} setUser={setUser}>
            <Dashboard user={user}/>
          </GameProvider>
        </ConversationsProvider>
      </ContactsProvider>
    </SocketProvider>
  )

  return (
    user.name ? dashboard : <Login onIdSubmit={handleSubmitForm}/>
  )
}

export default App;
