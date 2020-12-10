import React, { useContext, useEffect, useRef } from 'react'
import { Container, Form, Button, Image } from 'react-bootstrap'
import { useSocket } from '../contexts/SocketProvider'
import useLocalStorage from '../hooks/useLocalStorage'
import logo from '../logo.png'

const GameContext = React.createContext()

export function useGame() {
  return useContext(GameContext)
}

export function GameProvider({ children, user }) {
  const idRef = useRef();
  const socket = useSocket()

  const [gamedata, setGamedata] = useLocalStorage('game', {
    game: Array(9).fill(null).map(() => Array(9).fill(null)),
    turn: Math.floor(Math.random() * 2),
    pq: [],
    points: [0, 0],
    players: [],
    finished: [],
    winner: null
  })

  function quadrantGroup(x, y) {
    const a = [
      [ [0, 1, 2], [0, 1, 2] ],
      [ [0, 1, 2], [3, 4, 5] ],
      [ [0, 1, 2], [6, 7, 8] ],
      [ [3, 4, 5], [0, 1, 2] ],
      [ [3, 4, 5], [3, 4, 5] ],
      [ [3, 4, 5], [6, 7, 8] ],
      [ [6, 7, 8], [0, 1, 2] ],
      [ [6, 7, 8], [3, 4, 5] ],
      [ [6, 7, 8], [6, 7, 8] ]
    ]

    for (var i = 0; i < a.length; i++) {
      if (a[i][0].includes(y) && a[i][1].includes(x)) {
        return i + 1
      }
    }
  }

  function groupBroked(block) {
    return gamedata.finished.find( e => e.g === block )
  }

  function opAvailable(x, y) {
    const current = quadrantGroup(x, y);
    return (!gamedata.pq[gamedata.pq.length-1] || gamedata.pq[gamedata.pq.length-1] === current 
      || groupBroked(gamedata.pq[gamedata.pq.length-1])) && !groupBroked(current) && ![0, 1].includes(gamedata.winner);
  }

  function playerTurn(game) {
    setGamedata(prevGame => {
      return {
        game: game.game,
        turn: game.turn,
        pq: game.pq,
        points: game.points,
        players: game.players,
        finished: game.finished,
        winner: game.winner
      }
    })
  }

  function newGame() {
    setGamedata(prevGame => {
      const settings = {
        game: Array(9).fill(null).map(() => Array(9).fill(null)),
        turn: prevGame.turn,
        pq: [],
        points: prevGame.points,
        players: prevGame.players,
        finished: [],
        winner: null
      }
      socket.emit('join-game', settings)
      return settings
    })
  }

  function exit() {
    setGamedata(prevGame => {
      return {
        game: Array(9).fill(null).map(() => Array(9).fill(null)),
        turn: Math.floor(Math.random() * 2),
        pq: [],
        points: [0, 0],
        players: [],
        finished: [],
        winner: null
      }
    })
  }

  function activeTurn(obj) {
    const pt = obj.turn % 2 ? 0 : 1;
    return obj.players[pt].id === user.id
  }
  function checkWinner(obj, gridX, gridY) {
    const arr = obj.game;

    if (!activeTurn(obj) || !(opAvailable(gridX, gridY) && ![0, 1].includes(arr[gridX][gridY]))) {
      return
    }
    const quadrant = (x, y) => {
      const a = [
        [ [0, 3, 6], [0, 3, 6] ],
        [ [0, 3, 6], [1, 4, 7] ],
        [ [0, 3, 6], [2, 5, 8] ],
        [ [1, 4, 7], [0, 3, 6] ],
        [ [1, 4, 7], [1, 4, 7] ],
        [ [1, 4, 7], [2, 5, 8] ],
        [ [2, 5, 8], [0, 3, 6] ],
        [ [2, 5, 8], [1, 4, 7] ],
        [ [2, 5, 8], [2, 5, 8] ]
      ]
  
      for (var i = 0; i < a.length; i++) {
        if (a[i][0].includes(y) && a[i][1].includes(x)) {
          return i + 1
        }
      }
    };
  
    const addFinished = (x, y, ox, oy, d, w) => {
      obj.finished.push({
        g: quadrantGroup(x, y),
        c: [x, y],
        o: [ox, oy],
        d, w
      });
    }

    obj.game[gridX][gridY] = ((obj.turn++)+1)%2
    obj.pq.push(quadrant(gridX, gridY))

    const a = [
      [[0, 0], [1, 0], [2, 0]], // type: r | h
      [[0, 1], [1, 1], [2, 1]], // type: r
      [[0, 2], [1, 2], [2, 2]], // type: r
      [[0, 0], [0, 1], [0, 2]], // type: d | v
      [[1, 0], [1, 1], [1, 2]], // type: d
      [[2, 0], [2, 1], [2, 2]], // type: d
      [[0, 0], [1, 1], [2, 2]], // type: -
      [[2, 0], [1, 1], [0, 2]]  // type: +
    ]

    for (var i = 0; i < 9; i += 3) {
      for (var j = 0; j < 9; j += 3) {
        if (groupBroked(quadrantGroup(i, j))) continue;
        var f = false;
        for (var k = 0; k < a.length; k++) {
          if (arr[i+a[k][0][0]][j+a[k][0][1]] != null && arr[i+a[k][0][0]][j+a[k][0][1]] === arr[i+a[k][1][0]][j+a[k][1][1]]
            && arr[i+a[k][0][0]][j+a[k][0][1]] === arr[i+a[k][2][0]][j+a[k][2][1]]) {
              const type = k < 3 ? 'h' : (k < 6 ? 'v' : (k===6 ? 'n' : 'p'));
              addFinished(i+a[k][0][0], j+a[k][0][1], i, j, type, arr[i+a[k][0][0]][j+a[k][0][1]]);
              f = true;
            }
        }
        if (!f && arr[i][j] != null && arr[i+1][j] != null && arr[i+2][j] != null && 
          arr[i][j+1] != null && arr[i+1][j+1] != null && arr[i+2][j+1] != null && 
          arr[i][j+2] != null && arr[i+1][j+2] != null && arr[i+2][j+2] != null) {
            addFinished(i, j, i, j, null, null);
        }
      }
    }

    const v = [
      [1, 2, 3], [4, 5, 6], [7, 8, 9],
      [1, 4, 7], [2, 5, 8], [3, 6, 9],
      [1, 5, 9], [3, 5, 7]
    ];

    for (let t = 0; t < v.length; t++) {
      for (let p = 0; p < 2; p++) {
        const w = obj.finished.filter(e => v[t].includes(e.g) && e.w === p).length === 3;
        if (w) {
          obj.winner = p;
          obj.turn -= 1;
          obj.points[obj.winner] += 1;
          break;
        }
      }
    }
    
    const pt = obj.turn % 2 ? 0 : 1;
    const turn_label = "TURNO: " + obj.players[pt].name;
    console.log('score', turn_label)

    if ([0, 1].includes(obj.winner)) {
      const winner_label = "GANADOR " + obj.players[obj.winner].name;
      console.log('messages', winner_label)
    }

    
    socket.emit('join-game', obj, conf => {
      console.log('sended', obj)
      playerTurn(obj)
    })
  }

  const value = {
    gamedata,
    newGame,
    exit,
    checkWinner,
    groupBroked,
    quadrantGroup,
    opAvailable,
    activeTurn
  }

  // FORM
  function handleSubmit(e) {
    e.preventDefault()
    
    const new_game = {
      game: Array(9).fill(null).map(() => Array(9).fill(null)),
      turn: gamedata.turn,
      pq: [],
      points: gamedata.points,
      players: [
        { id: user.id, name: user.name },
        { id: idRef.current.value, name: ''},
      ],
      finished: [],
      winner: null
    }

    socket.emit('join-game', new_game)
    // playerTurn(new_game)
  }

  useEffect(() => {
    if (socket == null) return

    socket.on('send-request-game', req => {
      if (req.players[1].id === user.id) {
        req.players[1] = user;
        socket.emit('join-game', req)
      }
      playerTurn(req)
    })

    return () => socket.off('send-request-game')
  }, [socket, gamedata])


  const connForm = (
    <Container className="align-items-center d-flex" style={{ height: '100vh'}}>
      <Form onSubmit={handleSubmit} className="w-100">
        <Form.Group>
          <Image src={logo} fluid className="App-logo" style={{margin: '0 auto', display: 'block'}}/>
        </Form.Group>
        <Form.Group>
          <Form.Label><strong>{ user.name }</strong>, share your Id: <br/><a href={'https://wa.me/?text=' + user.id} className="text-muted">{ user.id }</a></Form.Label>
        </Form.Group>
        <Form.Group>
          <Form.Label>or enter Your Friend`s Id</Form.Label>
          <Form.Control type="text" ref={idRef} autofocus required />
          <Form.Text className="text-success">
            Listening for a host . . .
          </Form.Text>
        </Form.Group>
        <Button type="submit">Continue</Button>
      </Form>
    </Container>
  )

  return (
    !gamedata.players.length ? connForm :
    ( <GameContext.Provider value={value}>
      { children }
    </GameContext.Provider> )
  )
}
