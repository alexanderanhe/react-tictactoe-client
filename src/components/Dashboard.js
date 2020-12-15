import React from 'react'
import OpenConversation from './OpenConversation'
import Sidebar from './Sidebar'
import { useConversations } from '../contexts/ConversationsProvider'
import Game from './Game'

export default function Dashboard({user}) {
  const { selectedConversation } = useConversations()

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <div style={{display: 'none'}}>
        <Sidebar id={user.id}/>
        { selectedConversation && <OpenConversation /> }
      </div>
      <Game/>
    </div>
  )
}
