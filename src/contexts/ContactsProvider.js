import React, { useContext } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const ContactsContext = React.createContext()

export function useContacts() {
  return useContext(ContactsContext)
}

export function ContactsProvider({ children }) {
  const [contacts, setContacts] = useLocalStorage('contacts', [])

  function createContact(id, name) {
    setContacts(prevContacts => {
      let madeChange = false
      const contacts = prevContacts.map(contact => {
        if (contact.id === id) {
          madeChange = true
          contact.name = name
        }
        return contact
      })
      if (madeChange) {
        return contacts
      } else {
        return [...prevContacts, { id, name }]
      }
    })
  }
  return (
    <ContactsContext.Provider value={{ contacts, createContact}}>
      { children }
    </ContactsContext.Provider>
  )
}
