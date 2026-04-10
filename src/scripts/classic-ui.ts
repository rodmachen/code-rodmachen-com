// classic-ui.ts — client-side interactivity for the classic Mac OS interface

// Window controls: zoom (maximize) and shade (collapse)
const win = document.getElementById('main-window');
const pane = document.getElementById('window-pane');
const btnZoom = document.getElementById('btn-zoom');
const btnShade = document.getElementById('btn-shade');

if (win && pane && btnZoom && btnShade) {
  btnZoom.addEventListener('click', () => {
    win.classList.toggle('maximized');
  });

  btnShade.addEventListener('click', () => {
    win.classList.toggle('shaded');
    // Use CSS class instead of inline style once .shaded is in classic.css
    pane.style.display = win.classList.contains('shaded') ? 'none' : '';
  });
}

// Clock: update every second
function updateClock(): void {
  const clock = document.getElementById('menu-clock');
  if (clock) {
    const now = new Date();
    clock.innerText = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}

setInterval(updateClock, 1000);
updateClock();
