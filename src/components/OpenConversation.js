import React, { useState, useCallback } from 'react'
import { Form, InputGroup, Button } from 'react-bootstrap'
import { useConversations } from '../contexts/ConversationsProvider'

export default function OpenConversation() {
  const [text, setText] = useState('')

  const setRef = useCallback(node => {
    if (node) {
      node.scrollIntoView({ smooth: true })
    }
  }, [])
  const { sendMessage, selectedConversation, openchat, setOpenchat } = useConversations()

  function handleSubmit(e) {
    e.preventDefault()

    sendMessage(
      selectedConversation.recipients.map(r => r.id),
      text
    )
    setText('')
  }

  const onEnterPress = (e) => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const openBtn = (
    <div style={{ position: 'fixed', right: 0 }}>
      <Button type="button" variant="primary" onClick={ e => setOpenchat(true) }>DM</Button>
    </div>
  )

  return (
    openchat ? (
      <div className="d-flex" style={{ position: 'fixed', top: 0, backgroundColor: 'rgba(250, 250, 250, 0.8)', zIndex: 2, bottom: 0, right: 0, left: 0 }}>
        <div className="d-flex flex-column flex-grow-1" style={{ maxWidth: '500px', margin: '0 auto', border: '2px solid #777' }}>
          <div className="flex-grow-1 overflow-auto">
            <div className="h-100 d-flex flex-column align-items-start justify-content-end px-3">
              { selectedConversation.messages.map((message, index) => {
                  const lastMessage = selectedConversation.messages.length - 1 === index
                  return (
                    <div
                      ref={lastMessage ? setRef : null}
                      key={index}
                      className={`my-1 d-flex flex-column ${message.fromMe ? 'align-self-end align-items-end' : 'align-items-start'}`}
                    >
                      <div className={`rounded px-2 py-1 ${message.fromMe ? 'bg-primary text-white' : 'bg-white border'}`}>
                        { message.text }
                      </div>
                      <div className={`text-muted small ${message.fromMe ? 'text-right' : ''}`}>
                        { message.fromMe ? 'You' : message.senderName }
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
          <Form onSubmit={ handleSubmit }>
              <Form.Group>
                <InputGroup>
                  <Form.Control
                  as="textarea"
                  required
                  value={text}
                  onChange={e => setText(e.target.value)}
                  style={{ height: '75px', resize:'none' }}
                  onKeyDown={onEnterPress}
                  autoFocus
                />
                <InputGroup.Append>
                  <Button type="submit">Send</Button>
                </InputGroup.Append>
                <InputGroup.Append>
                  <Button type="button" variant="secondary" onClick={ e => setOpenchat(false) }>&times;</Button>
                </InputGroup.Append>
                </InputGroup>
              </Form.Group>
          </Form>
        </div>
      </div>
    ) : openBtn
  )
}
