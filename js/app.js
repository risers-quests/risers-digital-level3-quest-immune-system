(function () {
  var ALL_KEYS = ['imm-p1-s1', 'imm-p1-s2', 'imm-p1-s3', 'imm-p2-s1', 'imm-p2-s2', 'imm-final'];
  var LOCK_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:4px;"><rect x="4" y="11" width="16" height="9" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>';

  function hasKey(k) {
    try { return !!(window.Player ? Player.pGet(k) : localStorage.getItem(k)); } catch (e) { return false; }
  }

  function keysMet(attrVal) {
    if (!attrVal) return true;
    return attrVal.split(',').map(function (s) { return s.trim(); }).filter(Boolean).every(hasKey);
  }

  function completedCount() {
    var n = 0;
    ALL_KEYS.forEach(function (k) { if (hasKey(k)) n++; });
    return n;
  }

  function hasPlayer() {
    return !!(window.Player && Player.getPlayer());
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function refreshProgress() {
    var playerSet = hasPlayer();

    var pill = document.querySelector('[data-progress-pill]');
    if (pill) pill.textContent = completedCount() + ' / ' + ALL_KEYS.length + ' complete';

    document.querySelectorAll('.section[data-requires]').forEach(function (section) {
      section.classList.toggle('locked', !playerSet || !keysMet(section.getAttribute('data-requires')));
    });

    document.querySelectorAll('[data-day-lock]').forEach(function (n) {
      n.style.display = (!playerSet || keysMet(n.getAttribute('data-day-lock'))) ? 'none' : 'flex';
    });

    document.querySelectorAll('.toc a').forEach(function (link) {
      if (!link.dataset.label) link.dataset.label = link.textContent.trim();
      var locked = !playerSet || !keysMet(link.getAttribute('data-requires'));
      var done = link.hasAttribute('data-complete-key') && hasKey(link.getAttribute('data-complete-key'));
      link.classList.toggle('locked', locked);
      link.classList.toggle('done', done && !locked);
      link.innerHTML = (locked ? LOCK_ICON : '') + link.dataset.label + (done && !locked ? ' ✓' : '');
    });

    var gate = document.getElementById('player-gate');
    if (gate) gate.style.display = playerSet ? 'none' : 'flex';

    refreshPlayerBadge();
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('.toc a.locked');
    if (!link) return;
    e.preventDefault();
    link.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }],
      { duration: 300 }
    );
  });

  /* ---- Who's playing? (shares one computer without mixing up progress) ----
     No accounts — just a name "checked in" on this browser that namespaces
     every progress key, so a second kid on the same computer can check in
     under their own name and get a clean slate instead of seeing someone
     else's unlocked missions. This is the very first thing shown on any
     page, and right after naming yourself it shows your name + sync code
     together so there's something to save before the quest even starts —
     see renderCodeStep below. */
  function buildPlayerGate() {
    if (document.getElementById('player-gate')) return;
    var main = document.querySelector('main');
    if (!main) return;

    var gate = el('div', 'player-gate');
    gate.id = 'player-gate';
    var card = el('div', 'player-gate-card');
    gate.appendChild(card);

    if (main.classList.contains('container')) {
      main.prepend(gate);
    } else {
      // index.html's <main> has no .container of its own (each section
      // wraps itself) — give the gate its own so it lines up the same way.
      var wrap = el('div', 'container');
      wrap.appendChild(gate);
      main.prepend(wrap);
    }

    wirePlayerGate(gate, card);
  }

  function wirePlayerGate(gate, card) {
    renderNameStep();

    function renderNameStep() {
      card.innerHTML =
        '<div class="player-gate-title">👋 Who\'s on this quest?</div>' +
        '<p>If someone else uses this device too, typing your name keeps your progress separate from theirs. Used this before? Type the same name to pick up where you left off.</p>' +
        '<div class="sync-row"><input type="text" id="player-name-input" placeholder="Type your name…" maxlength="40"><button type="button" class="btn btn-primary" id="player-name-btn">Let\'s go!</button></div>';

      function submit() {
        var val = document.getElementById('player-name-input').value;
        var trimmed = String(val || '').trim().slice(0, 40);
        if (Player.setPlayer(val)) renderCodeStep(trimmed);
      }
      document.getElementById('player-name-btn').addEventListener('click', submit);
      document.getElementById('player-name-input').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
      });
    }

    function renderCodeStep(name) {
      var code = encodeCode();
      card.innerHTML =
        '<div class="player-gate-title">✅ You\'re checked in, ' + name + '!</div>' +
        '<p>Before you start, save this code somewhere safe — a notes app, a photo of the screen. If this device ever forgets you (a cleared browser, a new computer), pasting it back in brings ' + name + '\'s progress back instantly. It updates as you go, but this one works right now too.</p>' +
        '<label class="player-code-label">' + name + '\'s code</label>' +
        '<div class="sync-row"><input type="text" id="gate-code-out" readonly><button type="button" class="btn btn-ghost" id="gate-code-copy">Copy</button></div>' +
        '<div class="sync-msg" id="gate-code-msg"></div>' +
        '<button type="button" class="btn btn-primary" id="gate-continue-btn">Start the quest →</button>';

      document.getElementById('gate-code-out').value = code;
      document.getElementById('gate-code-copy').addEventListener('click', function () {
        var input = document.getElementById('gate-code-out');
        input.select();
        try {
          navigator.clipboard.writeText(input.value);
          document.getElementById('gate-code-msg').textContent = '✅ Copied! Paste it somewhere safe.';
        } catch (e) {
          document.execCommand && document.execCommand('copy');
          document.getElementById('gate-code-msg').textContent = 'Selected — press Ctrl+C to copy.';
        }
      });
      document.getElementById('gate-continue-btn').addEventListener('click', function () {
        gate.style.display = 'none';
      });

      // Player.setPlayer's 'player-changed' event already ran refreshProgress
      // and hid the gate — force it back open so the code step is seen.
      gate.style.display = 'flex';
    }
  }

  function refreshPlayerBadge() {
    var nav = document.querySelector('.main-nav');
    if (!nav) return;
    var badge = document.getElementById('player-badge');
    var name = window.Player ? Player.getPlayer() : '';

    if (!name) { if (badge) badge.remove(); return; }

    if (!badge) {
      badge = el('button', 'player-badge');
      badge.id = 'player-badge';
      badge.type = 'button';
      var syncBtn = document.getElementById('sync-btn');
      nav.insertBefore(badge, syncBtn || null);
      badge.addEventListener('click', function () {
        if (confirm('Switch to a different player on this computer? (Your progress under "' + Player.getPlayer() + '" stays saved — you can switch back anytime by typing the same name.)')) {
          Player.clearPlayer();
          refreshProgress();
        }
      });
    }
    badge.textContent = '👤 ' + name + ' ▾';
  }

  /* ---- Continue on another device (no login needed) ----
     Progress lives in localStorage, which is tied to one browser on one
     device. This packs the CURRENT player's progress into a short code you
     can copy and paste into the site on a different device/browser to pick
     up where you left off — no account, no server, no shared login. */
  function encodeCode() {
    var name = window.Player ? Player.getPlayer() : '';
    var bits = ALL_KEYS.map(function (k) { return hasKey(k) ? '1' : '0'; }).join('');
    var certName = window.Player ? (Player.pGet('imm-cert-name') || '') : '';
    var payload = bits + '|' + encodeURIComponent(certName) + '|' + encodeURIComponent(name);
    try { return btoa(payload); } catch (e) { return ''; }
  }

  function applyCode(code) {
    try {
      var payload = atob(code.trim());
      var parts = payload.split('|');
      var bits = parts[0] || '';
      var certName = decodeURIComponent(parts[1] || '');
      var playerName = decodeURIComponent(parts[2] || '');
      if (playerName && window.Player) Player.setPlayer(playerName);
      var okAny = false;
      ALL_KEYS.forEach(function (k, i) {
        if (bits[i] === '1') { (window.Player ? Player.pSet(k, '1') : localStorage.setItem(k, '1')); okAny = true; }
      });
      if (certName && window.Player) Player.pSet('imm-cert-name', certName);
      return okAny;
    } catch (e) { return false; }
  }

  function buildSyncWidget() {
    var nav = document.querySelector('.main-nav');
    if (!nav || document.getElementById('sync-btn')) return;

    var btn = el('button', 'sync-btn', '🔄 Restore Session');
    btn.id = 'sync-btn';
    btn.type = 'button';

    var panel = el('div', 'sync-panel');
    panel.innerHTML =
      '<div class="sync-panel-title">🔄 Restore Your Session</div>' +
      '<p>Already have a code — from checking in, or from another device? Paste it below to bring back that name and progress here. No login needed.</p>' +
      '<label>Paste your code here</label>' +
      '<div class="sync-row"><input type="text" id="sync-code-in" placeholder="Paste code…"><button type="button" class="btn btn-primary" id="sync-apply-btn">Restore</button></div>' +
      '<div class="sync-msg" id="sync-msg"></div>' +
      '<label>Or get your code to use somewhere else</label>' +
      '<div class="sync-row"><input type="text" id="sync-code-out" readonly><button type="button" class="btn btn-ghost" id="sync-copy-btn">Copy</button></div>';

    nav.appendChild(btn);
    document.body.appendChild(panel);

    btn.addEventListener('click', function () {
      var showing = panel.classList.toggle('show');
      if (showing) document.getElementById('sync-code-out').value = encodeCode();
    });

    document.addEventListener('click', function (e) {
      if (panel.classList.contains('show') && !panel.contains(e.target) && e.target !== btn) {
        panel.classList.remove('show');
      }
    });

    panel.addEventListener('click', function (e) { e.stopPropagation(); });

    panel.querySelector('#sync-copy-btn').addEventListener('click', function () {
      var input = document.getElementById('sync-code-out');
      input.select();
      try {
        navigator.clipboard.writeText(input.value);
        document.getElementById('sync-msg').textContent = '✅ Copied!';
      } catch (e) {
        document.execCommand && document.execCommand('copy');
        document.getElementById('sync-msg').textContent = 'Selected — press Ctrl+C to copy.';
      }
    });

    panel.querySelector('#sync-apply-btn').addEventListener('click', function () {
      var code = document.getElementById('sync-code-in').value;
      var msg = document.getElementById('sync-msg');
      if (!code.trim()) { msg.textContent = '👉 Paste a code first!'; return; }
      if (applyCode(code)) {
        msg.textContent = '🎉 Progress restored! Reloading…';
        setTimeout(function () { window.location.reload(); }, 700);
      } else {
        msg.textContent = '❌ That code didn\'t work — check it and try again.';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildPlayerGate();
    buildSyncWidget();
    refreshProgress();
  });
  document.addEventListener('quiz-passed', refreshProgress);
  document.addEventListener('player-changed', refreshProgress);
})();
