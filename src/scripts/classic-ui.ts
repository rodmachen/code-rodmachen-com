// classic-ui.ts — client-side interactivity for the classic Mac OS interface

// ─── Window controls ─────────────────────────────────────────────────────────

const win = document.getElementById('main-window');
const pane = document.getElementById('window-pane');
const btnZoom = document.getElementById('btn-zoom');
const btnShade = document.getElementById('btn-shade');

function setMaximized(maximized: boolean): void {
  if (!win) return;
  win.classList.toggle('maximized', maximized);
  // Sync View menu checkmarks
  syncViewCheckmarks();
}

if (win && pane && btnZoom && btnShade) {
  btnZoom.addEventListener('click', () => {
    win.classList.toggle('maximized');
    syncViewCheckmarks();
  });

  btnShade.addEventListener('click', () => {
    win.classList.toggle('shaded');
    pane.style.display = win.classList.contains('shaded') ? 'none' : '';
  });
}

function syncViewCheckmarks(): void {
  const isMaximized = win?.classList.contains('maximized') ?? false;
  const fullWidthBtn = document.getElementById('view-full-width');
  const normalBtn = document.getElementById('view-normal');
  if (fullWidthBtn) {
    fullWidthBtn.setAttribute('aria-checked', String(isMaximized));
    fullWidthBtn.classList.toggle('checked', isMaximized);
  }
  if (normalBtn) {
    normalBtn.setAttribute('aria-checked', String(!isMaximized));
    normalBtn.classList.toggle('checked', !isMaximized);
  }
}

// Initialize checkmarks
syncViewCheckmarks();

// ─── Menu bar dropdowns ───────────────────────────────────────────────────────

let activeMenuBtn: HTMLElement | null = null;

function openMenu(btn: HTMLElement): void {
  closeMenu();
  const menuName = btn.dataset.menu;
  const dropdown = document.querySelector<HTMLElement>(`[data-dropdown="${menuName}"]`);
  if (!dropdown) return;
  dropdown.hidden = false;
  btn.classList.add('active');
  btn.setAttribute('aria-expanded', 'true');
  activeMenuBtn = btn;
}

function closeMenu(): void {
  if (!activeMenuBtn) return;
  const menuName = activeMenuBtn.dataset.menu;
  const dropdown = document.querySelector<HTMLElement>(`[data-dropdown="${menuName}"]`);
  if (dropdown) dropdown.hidden = true;
  activeMenuBtn.classList.remove('active');
  activeMenuBtn.setAttribute('aria-expanded', 'false');
  activeMenuBtn = null;
}

// Attach click handlers to all menu buttons
document.querySelectorAll<HTMLElement>('.menu-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeMenuBtn === btn) {
      closeMenu();
    } else {
      openMenu(btn);
    }
  });
});

// Click outside closes menu
document.addEventListener('click', () => {
  closeMenu();
});

// Escape closes menu
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (activeMenuBtn) {
      const trigger = activeMenuBtn;
      closeMenu();
      trigger.focus();
    } else {
      closeModal();
    }
  }
});

// View menu: Full Width / Normal
document.getElementById('view-full-width')?.addEventListener('click', () => {
  setMaximized(true);
  closeMenu();
});
document.getElementById('view-normal')?.addEventListener('click', () => {
  setMaximized(false);
  closeMenu();
});

// ─── Modal sub-windows ────────────────────────────────────────────────────────

let modalTrigger: HTMLElement | null = null;

export function openModal(id: string): void {
  const modal = document.getElementById(id);
  if (!modal) return;
  const backdrop = document.getElementById('modal-backdrop');
  modal.hidden = false;
  if (backdrop) backdrop.hidden = false;
  win?.classList.add('inactive');
  // Focus the close button (first focusable element in modal)
  const focusable = modal.querySelector<HTMLElement>(
    '[data-close-modal], button, [href], input, [tabindex]:not([tabindex="-1"])'
  );
  focusable?.focus();
}

export function closeModal(): void {
  const openModalEl = document.querySelector<HTMLElement>('.sub-window:not([hidden])');
  if (!openModalEl) return;
  openModalEl.hidden = true;
  const backdrop = document.getElementById('modal-backdrop');
  if (backdrop) backdrop.hidden = true;
  win?.classList.remove('inactive');
  // Restore focus to trigger
  modalTrigger?.focus();
  modalTrigger = null;
}

// Wire up data-modal triggers (desktop icons + menu items)
document.querySelectorAll<HTMLElement>('[data-modal]').forEach((trigger) => {
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenu();
    modalTrigger = trigger;
    openModal(trigger.dataset.modal!);
  });
});

// Wire up close buttons inside sub-windows
document.querySelectorAll<HTMLElement>('[data-close-modal]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
  });
});

// ─── Clock ────────────────────────────────────────────────────────────────────

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
