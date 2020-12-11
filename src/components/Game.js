import React, { useRef, useEffect } from 'react'
import { useGame } from '../contexts/GameProvider'
import { Button } from 'react-bootstrap'

export default function Game() {

  const { gamedata, newGame, exit, checkWinner, groupBroked, quadrantGroup, opAvailable, activeTurn } = useGame()

  const canvasRef = useRef(null)
  const wscreen = Math.max(window.screen.width, window.innerWidth) - 5;
  const box_width = wscreen > 800 ? 800 : wscreen;
  const xl = box_width / 9;
  const yl = box_width / 9;

  const jcolors = {
    bg: ["#7fb5b5", "#db5856", "#fdfd96", "#efefef", "#690000"],
    txt: ["#689494", "#ad4544"]
  };

  const fontFam = "Arial";

  const drawGrid = (ctx, obj) => {
    const arr = obj.game;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.font = String(xl) + "px " + fontFam;

    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        const b = groupBroked(quadrantGroup(i, j));
        const bw = !b ? null : b.w;
        ctx.beginPath();
        if (arr[i][j] === 1) {
          ctx.fillStyle = bw === null ? jcolors.bg[1] : jcolors.bg[bw];
          ctx.fillRect(i*xl, j*yl, xl, yl);
          ctx.fillStyle = bw === null ? "black" : jcolors.txt[bw];
          ctx.fillText("x", i*xl + xl/4, (j+1)*yl - yl/4);
        } else if (arr[i][j] === 0) {
          ctx.fillStyle = bw === null ? jcolors.bg[0] : jcolors.bg[bw];
          ctx.fillRect(i*xl, j*yl, xl, yl);
          ctx.fillStyle = bw === null ? "black" : jcolors.txt[bw];
          ctx.fillText("o", i*xl + xl/4, (j+1)*yl - yl/4);
        } else if (opAvailable(i, j)) {
          ctx.fillStyle = activeTurn(obj) ? jcolors.bg[2] : jcolors.bg[4];
          ctx.fillRect(i*xl, j*yl, xl, yl);
        } else if (!opAvailable(i, j)) {
          ctx.fillStyle = bw === null ? jcolors.bg[3] : jcolors.bg[bw];
          ctx.fillRect(i*xl, j*yl, xl, yl);
        }
        ctx.strokeStyle = bw === null ? "black" : jcolors.txt[bw];
        ctx.rect(i*xl, j*yl, xl, yl);
        ctx.stroke();
      }
    }

    ctx.lineWidth = 3;
    for (i = 0; i < obj.finished.length; i++) {
      if (![0, 1].includes(obj.finished[i].w)) continue;
      ctx.strokeStyle = jcolors.txt[obj.finished[i].w];
      if (obj.finished[i].d === 'h') {
        ctx.beginPath();
        ctx.moveTo(obj.finished[i].c[0]*xl, obj.finished[i].c[1]*yl + yl/2);
        ctx.lineTo(obj.finished[i].c[0]*xl + 3*xl, obj.finished[i].c[1]*yl + yl/2);
        ctx.stroke();
      } else if (obj.finished[i].d === 'v') {
        ctx.beginPath();
        ctx.moveTo(obj.finished[i].c[0]*xl + xl/2, obj.finished[i].c[1]*yl);
        ctx.lineTo(obj.finished[i].c[0]*xl + xl/2, obj.finished[i].c[1]*yl + 3*yl);
        ctx.stroke();
      } else if (obj.finished[i].d === 'n') {
        ctx.beginPath();
        ctx.moveTo(obj.finished[i].c[0]*xl, obj.finished[i].c[1]*yl);
        ctx.lineTo(obj.finished[i].c[0]*xl + 3*xl, obj.finished[i].c[1]*yl + 3*yl);
        ctx.stroke();
      } else if (obj.finished[i].d === 'p') {
        ctx.beginPath();
        ctx.moveTo(obj.finished[i].c[0]*xl + xl, obj.finished[i].c[1]*yl);
        ctx.lineTo(obj.finished[i].c[0]*xl - 2*xl, obj.finished[i].c[1]*yl + 3*yl);
        ctx.stroke();
      }
      ctx.fillStyle = "black";
      ctx.font = String(3*xl) + "px " + fontFam;
      var ox = obj.finished[i].o[0];
      var oy = obj.finished[i].o[1];
      ctx.fillText((obj.finished[i].w ? "x" : "o"), ox*xl + 2*xl/3, oy*yl + 2*yl + yl/3);
    }

    ctx.fillStyle = "black";
    ctx.lineWidth = 5;
    for (i = 0; i < box_width; i += 3*xl) {
      ctx.beginPath();
      ctx.strokeStyle = "black";
      ctx.moveTo(0, i);
      ctx.lineTo(box_width, i);
      ctx.stroke();
    }
    for (j = 0; j < box_width; j += 3*yl) {
      ctx.beginPath();
      ctx.strokeStyle = "black";
      ctx.moveTo(j, 0);
      ctx.lineTo(j, box_width);
      ctx.stroke();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d');
    canvas.width = box_width;
    canvas.height = box_width;

    const mouseClick = (e) => {
      var mouseX, mouseY;
  
      if(e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
      } else if(e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
      }
      var gridX = Math.floor(mouseX / xl);
      var gridY = Math.floor(mouseY / yl);
      
      checkWinner(gamedata, gridX, gridY);
      drawGrid(ctx, gamedata);
    }

    drawGrid(ctx, gamedata)

    canvas.addEventListener('mousedown', mouseClick)
    return () => {
      window.removeEventListener("mousedown", mouseClick)
    }
  })

  return (
    <div style={{ paddingTop: 5, textAlign: 'center', margin: '0 auto' }}>
      <div className="d-flex py-2">
        <div className="d-flex flex-column flex-grow-1">
          <h3 className={gamedata.turn % 2 ? 'text-primary' : ''}>{gamedata.players[0].name}</h3>
          <span>{ gamedata.points[0]}</span>
        </div>
        <div className="d-flex flex-column flex-grow-1">
          <h3 className={gamedata.turn % 2 ? '' : 'text-primary'}>{gamedata.players[1].name}</h3>
          <span>{ gamedata.points[1]}</span>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <canvas ref={ canvasRef }></canvas>
        <div className={'game py-2' + ([0, 1].includes(gamedata.winner) || gamedata.finished.length === 9 ? ' finished' : '')}>
          <div className="winner text-white">
            { [0, 1].includes(gamedata.winner) ? 'GANADOR: ' + gamedata.players[gamedata.winner].name : 'EMPATE!' }
            </div>
          <Button className="mr-4" style={{ display: [0, 1].includes(gamedata.winner) || gamedata.finished.length === 9 ? 'inline-block' : 'none'}} 
            type="button" size="lg" onClick={newGame}>Nuevo juego</Button>
          <Button type="button" size="lg" variant="danger" onClick={exit}>Salir</Button>
        </div>
      </div>
    </div>
  )
}
