import React, { useRef } from 'react'
import { Container, Form, Button, Image } from 'react-bootstrap'
import logo from '../logo.png'

export default function Login({ onIdSubmit}) {
  const idRef = useRef();

  function handleSubmit(e) {
    e.preventDefault()
    onIdSubmit(idRef.current.value)
  }

  return (
    <Container className="align-items-center d-flex" style={{ height: '100vh'}}>
      <Form onSubmit={handleSubmit} className="w-100">
        <Form.Group>
          <Image src={logo} fluid className="App-logo" style={{margin: '0 auto', display: 'block'}}/>
        </Form.Group>
        <Form.Group>
          <Form.Label>Enter Your Name</Form.Label>
          <Form.Control type="text" ref={idRef} autofocus required />
        </Form.Group>
        <Button type="submit">Login</Button>
      </Form>
    </Container>
  )
}
