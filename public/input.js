const registerInputListeners = (socket) => {
  let isMouseDown = false;

  const calculateCanvasPosition = (canvasElement, { clientX, clientY }) => ({
    x: clientX - canvasElement.offsetLeft,
    y: clientY - canvasElement.offsetTop,
  })

  window.addEventListener('mousedown', ({ toElement, clientX, clientY }) => {
    if (toElement.id !== 'canvas') return;
    socket.emit('setTargetDirection', calculateCanvasPosition(toElement, { clientX, clientY }));
    isMouseDown = true;
  });

  window.addEventListener('mouseup', () => {
    isMouseDown = false;
  });

  window.addEventListener('mousemove', ({ toElement, clientX, clientY }) => {
    if (!isMouseDown) return;
    if (toElement.id !== 'canvas') return;
    socket.emit('setTargetDirection', calculateCanvasPosition(toElement, { clientX, clientY }));
  });

  window.addEventListener('keydown', (event) => {
    const desiredForce = +event.key;
    if (desiredForce < 0) return;
    socket.emit('fireCue', desiredForce);
  });
}
