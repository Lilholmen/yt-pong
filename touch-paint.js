document.addEventListener('DOMContentLoaded', startup);

const ongoingTouches = [];

function startup() {
  CANVAS.addEventListener('touchstart', handleStart);
  CANVAS.addEventListener('touchend', handleEnd);
  CANVAS.addEventListener('touchcancel', handleCancel);
  CANVAS.addEventListener('touchmove', handleMove);
  console.log('Initialized.');
}

function handleStart(event) {
  event.preventDefault();
  const touches = event.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    //console.log(`touch start: ${i}`);
    ongoingTouches.push(copyTouch(touches[i]));
    const color = colorForTouch(touches[i]);
    let touchCords = getTouchCords(touches[i]);

    context.beginPath();
    context.arc(touchCords.x, touchCords.y, 4, 0, Math.PI * 2, false);

    context.fillStyle = color;
    context.fill();
  }
}

function handleMove(event) {
  event.preventDefault();

  const touches = event.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const color = colorForTouch(touches[i]);
    const idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      //console.log(`continuing touch: ${idx}`);
      context.beginPath();

      let touchCords = getTouchCords(touches[i]);
      let ongoingTouchCords = getTouchCords(ongoingTouches[idx]);

      context.moveTo(ongoingTouchCords.x, ongoingTouchCords.y);
      context.lineTo(touchCords.x, touchCords.y);
      context.lineWidth = 4;
      context.strokeStyle = color;
      context.stroke();

      ongoingTouches.splice(idx, 1, copyTouch(touches[i]));
    }
  }
}

function handleCancel(event) {
  if (event.cancelable) event.preventDefault();

  const touches = event.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    let idx = ongoingTouchIndexById(touches[i].identifier);
    ongoingTouches.splice(idx, 1);
  }
}

function handleEnd(event) {
  event.preventDefault();

  const touches = event.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const color = colorForTouch(touches[i]);
    let idx = ongoingTouchIndexById(touches[i].identifier);

    let touchCords = getTouchCords(touches[i]);
    let ongoingTouchCords = getTouchCords(ongoingTouches[idx]);

    if (idx >= 0) {
      context.lineWidth = 4;
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(ongoingTouchCords.x, ongoingTouchCords.y);
      context.lineTo(touchCords.x, touchCords.y);
      context.fillRect(touchCords.x - 4, touchCords.y - 4, 8, 8);

      ongoingTouches.splice(idx, 1);
    }
  }
}

function colorForTouch(touch) {
  let r = 12 - (touch.identifier % 16);
  let g = 5 - (Math.floor(touch.identifier / 3) % 16);
  let b = 5 - (Math.floor(touch.identifier / 7) % 16);
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);
  const color = `#${r}${g}${b}`;
  return color;
}

function ongoingTouchIndexById(searchId) {
  for (let i = 0; ongoingTouches.length; i++) {
    const id = ongoingTouches[i].identifier;

    if (id === searchId) {
      return i;
    }
  }

  return -1;
}
