import React, { useContext, useState, useEffect, useCallback } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { useContacts } from './ContactsProvider'
import { useSocket } from './SocketProvider'

const ConversationsContext = React.createContext()

export function useConversations() {
  return useContext(ConversationsContext)
}

export function ConversationsProvider({ id, children }) {
  const [conversations, setConversations] = useLocalStorage('conversations', [])
  const [ selectedConversationIndex, setSelectedConversationIndex] = useState(0)
  const [ openchat, setOpenchat] = useState(false)
  const [ notification, setNotification] = useState(0)
  const { contacts } = useContacts()
  const socket = useSocket()

  function createConversation(recipients) {
    setConversations(prevConversations => {
      let madeChange = false
      const conversations = prevConversations.map((conversation, index) => {
        if (recipients[0] === conversation.recipients[0]) {
          madeChange = true
          setSelectedConversationIndex(index)
        }
        return conversation
      })
      if (madeChange) {
        return conversations
      } else {
        setSelectedConversationIndex(conversations.length)
        return [...prevConversations, { recipients, messages: [] }]
      }
    })
  }

  const addMessageToConversation = useCallback(({ recipients, text, sender}) => {
    setConversations(prevConversations => {
      let madeChange = false
      const newMessage = { sender, text }
      const newConversations = prevConversations.map(conversation => {
        if (arrayEquality(conversation.recipients, recipients)) {
          madeChange = true
          return {
            ...conversation,
            messages: [ ...conversation.messages, newMessage ]
          }
        }

        return conversation
      })

      if (madeChange ) {
        return newConversations
      } else {
        return [
          ...prevConversations,
          { recipients, messages: [newMessage] }
        ]
      }
    })
  }, [setConversations])

  useEffect(() => {
    setConversations(prevConversations => {
      const conversations = prevConversations.filter(conversation => {
        return contacts.some(contact => {
          return conversation.recipients.includes(contact.id)
        })
      })
      return conversations
    })
    
    if (socket == null) return

    socket.on('receive-message', ({ recipients, text, sender}) => {
      if (!openchat && sender !== id) {
        setNotification(prev => prev + 1)
      }
      addMessageToConversation({ recipients, text, sender })
    })
    return () => socket.off('receive-message')
  }, [socket, addMessageToConversation, notification, setNotification, contacts, openchat, id])

  function sendMessage(recipients, text) {
    socket.emit('send-message', { recipients, text })
    addMessageToConversation({ recipients, text, sender: id})
  }

  const formattedConversations = conversations.map((conversation, index) => {
    const recipients = conversation.recipients.map(recipient => {
      const contact = contacts.find(contact => {
        return contact.id === recipient
      })
      const name = (contact && contact.name) || recipient
      return { id: recipient, name }
    })

    const messages = conversation.messages.map(message => {
      const contact = contacts.find(contact => {
        return contact.id === message.sender
      })
      const name = (contact && contact.name) || message.sender
      const fromMe = id === message.sender
      return { ...message, senderName: name, fromMe }
    })

    const selected = index === selectedConversationIndex
    return { ...conversation, messages, recipients, selected }
  })

  const value = {
    conversations: formattedConversations,
    selectedConversation: formattedConversations[selectedConversationIndex],
    sendMessage,
    selectConversationIndex: setSelectedConversationIndex,
    openchat,
    setOpenchat,
    notification,
    setNotification,
    createConversation
  }

  return (
    <ConversationsContext.Provider value={value}>
      { children }
    </ConversationsContext.Provider>
  )
}

function arrayEquality(a, b) {
  if (a.length !== b.length) return false

  a.sort()
  b.sort()

  return a.every((element, index) => {
    return element === b[index]
  })
}