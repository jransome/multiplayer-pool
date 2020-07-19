import React, { useEffect } from 'react';
import P5 from 'p5';
import socket from '../socket';
import gameState from '../gameState';
import { TABLE_LENGTH, TABLE_WIDTH, POCKET_PROPERTIES, BALL_PROPERTIES } from '../constants';

/* eslint-disable no-param-reassign */
const initGameRenderer = domNode => new P5((sketch) => {
  const renderTargetingLine = (cuePosition, directionVector) => {
    sketch.stroke('white');
    sketch.strokeWeight(2);
    const endPoint = {
      x: cuePosition.x + directionVector.x * 1200,
      y: cuePosition.y + directionVector.y * 1200,
    };
    sketch.line(cuePosition.x, cuePosition.y, endPoint.x, endPoint.y);
  };

  const renderPocket = (pocketPosition) => {
    sketch.fill(POCKET_PROPERTIES.COLOUR);
    sketch.stroke(POCKET_PROPERTIES.COLOUR);
    sketch.strokeWeight(2);
    sketch.circle(pocketPosition.x, pocketPosition.y, POCKET_PROPERTIES.VISIBLE_RADIUS * 2);

    // for debugging colliders
    // sketch.fill(30, 100, 100);
    // sketch.stroke(30, 100, 100);
    // sketch.strokeWeight(1);
    // sketch.circle(pos.x, pos.y, POCKET_PROPERTIES.COLLISION_RADIUS * 2);
  };

  const renderCushion = (vertices) => {
    sketch.fill(0, 0, 60);
    sketch.stroke(0, 0, 60);
    sketch.strokeWeight(1);
    sketch.beginShape();
    vertices.forEach(v => sketch.vertex(v.x, v.y));
    sketch.endShape(sketch.CLOSE);
  };

  const renderBall = (ballState) => {
    const { position, colour } = ballState;
    sketch.fill(colour);
    sketch.stroke(colour);
    sketch.strokeWeight(1);
    sketch.circle(position.x, position.y, BALL_PROPERTIES.RADIUS * 2);
  };

  const mousePressedOrDragged = (event) => {
    if (event.target !== sketch.canvas) return;
    socket.emit('setTargetDirection', { x: sketch.mouseX, y: sketch.mouseY });
  };

  sketch.setup = () => {
    sketch.createCanvas(TABLE_LENGTH, TABLE_WIDTH);
    sketch.colorMode(sketch.HSB);
  };

  sketch.draw = () => {
    sketch.background(233, 85, 78);
    const { targetVector, balls, cushions } = gameState;
    if (targetVector) renderTargetingLine(balls[0].position, targetVector);
    POCKET_PROPERTIES.POSITIONS.forEach(p => renderPocket(p));
    cushions.forEach(c => renderCushion(c.vertices));
    balls.forEach(b => renderBall(b));
  };

  sketch.keyReleased = ({ key }) => {
    if (key === 'r') {
      socket.emit('resetCue');
      return;
    }

    const desiredForce = +key;
    if (desiredForce > 0) socket.emit('fireCue', desiredForce);
  };

  sketch.mouseDragged = mousePressedOrDragged;
  sketch.mousePressed = mousePressedOrDragged;
}, domNode);

const GameView = () => {
  const elementRef = React.createRef();
  useEffect(() => { initGameRenderer(elementRef.current); });

  return (<div ref={elementRef} />);
};

export default GameView;
