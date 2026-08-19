/* Shared helpers for all three Level 3 Quest pages:
   - materials-pool -> printable slip, and the print trigger
   - small random-event helpers for the Day 2 decision workshops
   - a per-kid access gate (name check -> unlock this page's content)
   - a text highlighter + side notes drawer
   No progress-locking, no scoring — evaluation here is the decision log
   itself, not a graded mechanic. The kid-gate is a soft, distraction-reducing
   check (localStorage-based), not real access control. */
(function () {
  var KID_KEY = 'imm-l3-kid';

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function loadJSON(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  /* ---- Materials pool: clicking a pool card toggles its checkbox and live-updates
     both the on-screen "what I'm bringing" preview and the isolated printable slip. ---- */
  function initMaterialsPool() {
    var items = document.querySelectorAll('.pool-item');
    var previewList = document.getElementById('slip-list-preview');
    var printList = document.getElementById('slip-list-print');
    var slipEmpty = document.getElementById('slip-empty');

    function refresh() {
      var picked = [];
      items.forEach(function (item) {
        var cb = item.querySelector('input[type=checkbox]');
        item.classList.toggle('picked', cb.checked);
        if (cb.checked) picked.push(item.querySelector('.pool-name').textContent.trim());
      });
      var html = picked.map(function (p) { return '<li>' + p + '</li>'; }).join('');
      if (previewList) previewList.innerHTML = html;
      if (printList) printList.innerHTML = html;
      if (slipEmpty) slipEmpty.style.display = picked.length ? 'none' : 'block';
    }

    // Each .pool-item is a <label> wrapping its checkbox, so a click anywhere
    // in the label already toggles the checkbox natively — listening for
    // 'change' (not 'click') avoids double-toggling that click would cause.
    items.forEach(function (item) {
      var cb = item.querySelector('input[type=checkbox]');
      cb.addEventListener('change', refresh);
    });
    refresh();
  }

  function initPrintSlip() {
    var btn = document.getElementById('print-slip-btn');
    if (btn) btn.addEventListener('click', function () { window.print(); });
  }

  /* ---- Per-kid access gate ----
     Each kid page calls initKidGate('Shalom'). If this browser's checked-in
     name (localStorage) matches, the page unlocks immediately (a blocking
     inline <script>/<style> in <head> already hid <main> before first paint,
     so there's no flash of someone else's content). If it doesn't match, a
     blocking screen stays up with a name box scoped to THIS page's kid only. */
  function initKidGate(expectedName, hubPath) {
    hubPath = hubPath || '../index.html';
    var current = null;
    try { current = localStorage.getItem(KID_KEY); } catch (e) {}

    function unlock() {
      document.documentElement.classList.remove('gate-locked');
      var block = document.getElementById('quest-gate-block');
      if (block) block.classList.remove('show');
    }

    function showBlocked() {
      var block = document.getElementById('quest-gate-block');
      if (!block) return;
      block.classList.add('show');
      var form = document.getElementById('gate-name-form');
      var input = document.getElementById('gate-name-input');
      var msg = document.getElementById('gate-name-msg');
      if (form && !form.dataset.wired) {
        form.dataset.wired = '1';
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var val = (input.value || '').trim();
          if (val && val.toLowerCase() === expectedName.toLowerCase()) {
            try { localStorage.setItem(KID_KEY, expectedName); } catch (err) {}
            unlock();
          } else {
            msg.textContent = "That name doesn't match this quest. Check with your facilitator.";
          }
        });
      }
    }

    if (current && current.toLowerCase() === expectedName.toLowerCase()) {
      unlock();
    } else {
      showBlocked();
    }

    var switchBtn = document.getElementById('switch-quest-btn');
    if (switchBtn) {
      switchBtn.addEventListener('click', function () {
        try { localStorage.removeItem(KID_KEY); } catch (e) {}
        window.location.href = hubPath;
      });
    }
  }

  /* ---- Highlighter ----
     Select any text inside <main> (p/li), a small "Highlight" button appears
     near the selection. Highlights are stored as {block, start, end} plain-
     text offsets within their containing block (auto-tagged data-hl-block),
     so they survive reload and reapply regardless of nested <strong>/<em>. */
  function getTextOffset(root, node, offset) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var total = 0, n;
    while ((n = walker.nextNode())) {
      if (n === node) return total + offset;
      total += n.textContent.length;
    }
    return total;
  }

  function wrapRange(root, start, end, markClass, hlId) {
    if (end <= start || !root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var pos = 0, node, targets = [];
    while ((node = walker.nextNode())) {
      var len = node.textContent.length;
      var nodeStart = pos, nodeEnd = pos + len;
      if (nodeEnd > start && nodeStart < end) {
        targets.push({ node: node, sliceStart: Math.max(0, start - nodeStart), sliceEnd: Math.min(len, end - nodeStart) });
      }
      pos = nodeEnd;
      if (pos >= end) break;
    }
    targets.forEach(function (t) {
      var text = t.node.textContent;
      var before = text.slice(0, t.sliceStart);
      var mid = text.slice(t.sliceStart, t.sliceEnd);
      var after = text.slice(t.sliceEnd);
      if (!mid) return;
      var mark = el('mark', markClass, null);
      mark.dataset.hlId = hlId;
      mark.textContent = mid;
      var frag = document.createDocumentFragment();
      if (before) frag.appendChild(document.createTextNode(before));
      frag.appendChild(mark);
      if (after) frag.appendChild(document.createTextNode(after));
      t.node.parentNode.replaceChild(frag, t.node);
    });
  }

  function initHighlighter(pageKey) {
    var blocks = document.querySelectorAll('main p, main li');
    blocks.forEach(function (b, i) { if (!b.dataset.hlBlock) b.dataset.hlBlock = 'hl-' + i; });

    var storageKey = 'imm-l3-hl::' + pageKey;
    var highlights = loadJSON(storageKey, []);

    function persist() { saveJSON(storageKey, highlights); }

    function applyAll() {
      var byBlock = {};
      highlights.forEach(function (h) { (byBlock[h.block] = byBlock[h.block] || []).push(h); });
      Object.keys(byBlock).forEach(function (blockId) {
        var root = document.querySelector('[data-hl-block="' + blockId + '"]');
        if (!root) return;
        byBlock[blockId]
          .sort(function (a, b) { return a.start - b.start; })
          .forEach(function (h) { wrapRange(root, h.start, h.end, 'user-hl', h.id); });
      });
    }

    function renderCollectedList() {
      var listEl = document.getElementById('hl-collected-list');
      var emptyEl = document.getElementById('hl-collected-empty');
      if (!listEl) return;
      listEl.innerHTML = '';
      if (!highlights.length) { if (emptyEl) emptyEl.style.display = 'block'; return; }
      if (emptyEl) emptyEl.style.display = 'none';
      highlights.forEach(function (h) {
        var li = el('li');
        var span = el('span', 'hlc-text', null);
        span.textContent = h.text;
        var btn = el('button', 'hlc-remove', '&times;');
        btn.type = 'button';
        btn.title = 'Remove highlight';
        btn.addEventListener('click', function () { removeHighlight(h.id); });
        li.appendChild(span);
        li.appendChild(btn);
        listEl.appendChild(li);
      });
    }

    function removeHighlight(id) {
      document.querySelectorAll('mark.user-hl[data-hl-id="' + id + '"]').forEach(function (m) {
        var textNode = document.createTextNode(m.textContent);
        var parent = m.parentNode;
        parent.replaceChild(textNode, m);
        if (parent.normalize) parent.normalize();
      });
      highlights = highlights.filter(function (h) { return h.id !== id; });
      persist();
      renderCollectedList();
    }

    var popup = el('div', 'hl-popup', '<button type="button">🖍 Highlight</button>');
    popup.style.display = 'none';
    document.body.appendChild(popup);
    var pending = null;

    document.addEventListener('mouseup', function (e) {
      if (popup.contains(e.target)) return;
      setTimeout(function () {
        var sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) { popup.style.display = 'none'; return; }
        var range = sel.getRangeAt(0);
        var text = range.toString().trim();
        if (!text) { popup.style.display = 'none'; return; }
        var container = range.commonAncestorContainer;
        var contEl = container.nodeType === 1 ? container : container.parentElement;
        var block = contEl && contEl.closest && contEl.closest('[data-hl-block]');
        if (!block) { popup.style.display = 'none'; return; }
        var start = getTextOffset(block, range.startContainer, range.startOffset);
        var end = getTextOffset(block, range.endContainer, range.endOffset);
        if (end <= start) { popup.style.display = 'none'; return; }
        pending = { block: block.dataset.hlBlock, start: start, end: end, text: text };
        var rect = range.getBoundingClientRect();
        popup.style.left = (rect.left + rect.width / 2 + window.scrollX) + 'px';
        popup.style.top = (rect.top + window.scrollY) + 'px';
        popup.style.display = 'flex';
      }, 0);
    });

    popup.querySelector('button').addEventListener('click', function () {
      if (!pending) return;
      var id = 'h' + Date.now() + Math.random().toString(36).slice(2, 6);
      var root = document.querySelector('[data-hl-block="' + pending.block + '"]');
      wrapRange(root, pending.start, pending.end, 'user-hl', id);
      highlights.push({ id: id, block: pending.block, start: pending.start, end: pending.end, text: pending.text });
      persist();
      renderCollectedList();
      window.getSelection().removeAllRanges();
      popup.style.display = 'none';
      pending = null;
    });

    document.addEventListener('mousedown', function (e) {
      if (!popup.contains(e.target)) popup.style.display = 'none';
    });

    document.addEventListener('click', function (e) {
      var mark = e.target.closest && e.target.closest('mark.user-hl');
      if (mark) removeHighlight(mark.dataset.hlId);
    });

    applyAll();
    renderCollectedList();
  }

  /* ---- Reflection checks ----
     Each open-ended callout question gets a "Check my thinking" button.
     The check is a plain keyword search, not real grading: cfg.groups is a
     list of concept-groups, each an array of interchangeable words/phrases,
     and the answer needs at least one hit from EVERY group to count as
     having the key idea. No visible score, no "wrong" — just "not quite
     yet" and a nudge to revise. Only after 3 checks without the key idea
     does a pointer back to the reading appear (cfg.reread: {anchor, label}),
     sending them to re-read the exact section that has the answer, rather
     than handing over the answer itself. State (attempts/success/text)
     persists per kid/page so a reload doesn't reset progress or re-hide an
     earned pointer. */
  function checkKeywordGroups(text, groups) {
    var lower = text.toLowerCase();
    return groups.every(function (group) {
      return group.some(function (kw) { return lower.indexOf(kw.toLowerCase()) !== -1; });
    });
  }

  function initReflectionChecks(pageKey, configs) {
    configs.forEach(function (cfg) {
      var textarea = document.getElementById(cfg.id);
      if (!textarea) return;

      var storageKey = 'imm-l3-reflect::' + pageKey + '::' + cfg.id;
      var state = loadJSON(storageKey, { attempts: 0, success: false, text: '' });
      if (state.text) textarea.value = state.text;

      var controls = el('div', 'reflect-controls');
      var btn = el('button', 'btn btn-primary reflect-check-btn', 'Check my thinking');
      btn.type = 'button';
      var feedback = el('div', 'reflect-feedback');
      controls.appendChild(btn);
      controls.appendChild(feedback);

      var hint = el('div', 'reflect-hint');
      hint.innerHTML = '📖 Take another look: <a href="#' + cfg.reread.anchor + '">' + cfg.reread.label + ' →</a>';

      textarea.insertAdjacentElement('afterend', hint);
      textarea.insertAdjacentElement('afterend', controls);

      function persist() { saveJSON(storageKey, state); }

      function render() {
        if (state.success) {
          feedback.className = 'reflect-feedback hit';
          feedback.textContent = "✅ Nice — you've got the key idea.";
          hint.style.display = 'none';
        } else if (state.attempts >= 3) {
          feedback.className = 'reflect-feedback retry';
          feedback.textContent = "🤔 Still missing something — here's where to look below.";
          hint.style.display = 'block';
        } else if (state.attempts > 0) {
          feedback.className = 'reflect-feedback retry';
          feedback.textContent = '🤔 Not quite the full picture yet — revise and check again.';
        }
      }
      render();

      btn.addEventListener('click', function () {
        var text = textarea.value.trim();
        if (!text) {
          feedback.className = 'reflect-feedback retry';
          feedback.textContent = '👉 Write your thinking first, then check it.';
          return;
        }
        state.attempts++;
        state.text = text;
        state.success = checkKeywordGroups(text, cfg.groups);
        persist();
        render();
      });
    });
  }

  /* ---- Side notes drawer: a free-text scratchpad, auto-saved per kid/page,
     plus the highlighter's collected-words list rendered at its top. ---- */
  function initNotesDrawer(pageKey) {
    var toggleBtn = document.getElementById('notes-toggle-btn');
    var drawer = document.getElementById('notes-drawer');
    var backdrop = document.getElementById('notes-backdrop');
    var closeBtn = document.getElementById('notes-drawer-close');
    var textarea = document.getElementById('notes-textarea');
    var savedMsg = document.getElementById('notes-saved-msg');
    if (!drawer || !textarea) return;

    var storageKey = 'imm-l3-notes::' + pageKey;
    textarea.value = localStorage.getItem(storageKey) || '';

    function open() { drawer.classList.add('open'); if (backdrop) backdrop.classList.add('show'); }
    function close() { drawer.classList.remove('open'); if (backdrop) backdrop.classList.remove('show'); }

    if (toggleBtn) toggleBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    textarea.addEventListener('input', function () {
      try { localStorage.setItem(storageKey, textarea.value); } catch (e) {}
      if (savedMsg) {
        savedMsg.textContent = '✓ Saved';
        clearTimeout(textarea._saveTimer);
        textarea._saveTimer = setTimeout(function () { savedMsg.textContent = ''; }, 1200);
      }
    });
  }

  window.QuestUI = {
    el: el, shuffle: shuffle, pickRandom: pickRandom,
    initMaterialsPool: initMaterialsPool, initPrintSlip: initPrintSlip,
    initKidGate: initKidGate, initHighlighter: initHighlighter, initNotesDrawer: initNotesDrawer,
    initReflectionChecks: initReflectionChecks,
    KID_KEY: KID_KEY
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMaterialsPool();
    initPrintSlip();
  });
})();
