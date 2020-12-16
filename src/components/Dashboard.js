import React from 'react'
import OpenConversation from './OpenConversation'
// import Sidebar from './Sidebar'
import { useConversations } from '../contexts/ConversationsProvider'
import Game from './Game'

export default function Dashboard({user}) {
  const { selectedConversation } = useConversations()

  return (
    <div>
      {/* <Sidebar id={user.id}/> */}
      { selectedConversation && <OpenConversation /> }
      <Game/>
    </div>
  )
}
