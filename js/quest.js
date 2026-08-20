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
     both the on-screen "what I'm bringing" preview and the isolated printable slip.
     Picks persist per kid/page, so returning to Day 2 later shows the same kit
     instead of resetting to the HTML defaults. ---- */
  function initMaterialsPool(pageKey) {
    var items = document.querySelectorAll('.pool-item');
    if (!items.length) return;
    var previewList = document.getElementById('slip-list-preview');
    var printList = document.getElementById('slip-list-print');
    var slipEmpty = document.getElementById('slip-empty');
    var storageKey = 'imm-l3-materials::' + pageKey;
    var saved = loadJSON(storageKey, null);

    if (saved) {
      items.forEach(function (item, i) {
        var cb = item.querySelector('input[type=checkbox]');
        if (saved[i] !== undefined) cb.checked = !!saved[i];
      });
    }

    function refresh() {
      var picked = [];
      var state = [];
      items.forEach(function (item) {
        var cb = item.querySelector('input[type=checkbox]');
        item.classList.toggle('picked', cb.checked);
        state.push(cb.checked);
        if (cb.checked) picked.push(item.querySelector('.pool-name').textContent.trim());
      });
      saveJSON(storageKey, state);
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

  /* ---- Build checklist: the Day 2 numbered steps. Checking one turns it
     green/struck-through and persists per kid/page. ---- */
  function initBuildChecklist(pageKey) {
    var items = document.querySelectorAll('.build-check-item');
    if (!items.length) return;
    var storageKey = 'imm-l3-build::' + pageKey;
    var state = loadJSON(storageKey, {});

    items.forEach(function (item, i) {
      var cb = item.querySelector('input[type=checkbox]');
      if (!cb) return;
      if (state[i]) { cb.checked = true; item.classList.add('checked'); }
      cb.addEventListener('change', function () {
        item.classList.toggle('checked', cb.checked);
        state[i] = cb.checked;
        saveJSON(storageKey, state);
      });
    });
  }

  /* ---- Generic field autosave: every other free-text input/textarea in
     <main> (the material-justification table, the Results table) — anything
     NOT already handled by a dedicated system (reflections, notes, gate).
     Fields are keyed by DOM order, which is stable since this is a static
     page, so a reload restores exactly what was typed without needing ids
     on every table cell. ---- */
  function initFieldAutosave(pageKey) {
    var storageKey = 'imm-l3-fields::' + pageKey;
    var skipIds = /^(refl-\d+|notes-textarea|gate-name-input|hub-name-input|sync-code-in)$/;
    var fields = Array.prototype.filter.call(
      document.querySelectorAll('main input[type=text], main input:not([type]), main textarea'),
      function (f) { return !(f.id && skipIds.test(f.id)); }
    );
    if (!fields.length) return;

    var saved = loadJSON(storageKey, {});
    fields.forEach(function (f, i) {
      f.dataset.fieldIdx = i;
      if (saved[i] !== undefined) f.value = saved[i];
    });

    fields.forEach(function (f) {
      f.addEventListener('input', function () {
        var data = loadJSON(storageKey, {});
        data[f.dataset.fieldIdx] = f.value;
        saveJSON(storageKey, data);
      });
    });
  }

  /* ---- Progress summary: a 3-segment bar (Day 1 / Day 2 / Day 3) shown right
     under the header, so coming back later shows real progress instead of a
     page that looks blank. Reads straight from each subsystem's own saved
     state rather than tracking anything separately, so it can never drift
     out of sync with what's actually been filled in. ---- */
  function initProgressBar(pageKey) {
    var fill1 = document.getElementById('progress-day1-fill');
    var fill2 = document.getElementById('progress-day2-fill');
    var fill3 = document.getElementById('progress-day3-fill');
    var label1 = document.getElementById('progress-day1-label');
    var label2 = document.getElementById('progress-day2-label');
    if (!fill1) return;

    function reflectFilled(id) {
      var s = loadJSON('imm-l3-reflect::' + pageKey + '::' + id, null);
      return !!(s && s.text && s.text.trim());
    }

    function recompute() {
      var day1Done = ['refl-1', 'refl-2', 'refl-3', 'refl-4'].filter(reflectFilled).length;
      var buildState = loadJSON('imm-l3-build::' + pageKey, {});
      var buildDone = Object.keys(buildState).filter(function (k) { return buildState[k]; }).length;
      var day2Done = buildDone + (reflectFilled('refl-5') ? 1 : 0);

      fill1.style.width = Math.round((day1Done / 4) * 100) + '%';
      fill2.style.width = Math.round((day2Done / 6) * 100) + '%';
      if (fill3) fill3.style.width = (day2Done >= 6 ? 100 : 0) + '%';
      if (label1) label1.textContent = day1Done + '/4';
      if (label2) label2.textContent = day2Done + '/6';
    }

    recompute();
    document.addEventListener('input', recompute);
    document.addEventListener('change', recompute);
    // Reflection state and the build checklist only actually save on a button
    // click (not on every keystroke/change), so the bar also needs to recompute
    // on click — otherwise it visibly lags a full step behind what's saved
    // until the kid happens to type or toggle something else afterward.
    document.addEventListener('click', recompute);
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

  /* ---- Device-to-device progress code ----
     There's no backend, so there's no way for two browsers to know about
     each other automatically — the honest fix for "different device each
     day" is a code the kid copies off one device and pastes into the next,
     carrying every imm-l3-* key for their name in one shot. Everything is
     already namespaced by pageKey (either "imm-l3-x::<kid>" or
     "imm-l3-x::<kid>::<sub-id>"), so collecting it is just: every key whose
     second "::"-segment is this kid's pageKey, plus the un-namespaced
     imm-l3-kid gate value itself. */
  function progressKeys(pageKey) {
    var keys = [KID_KEY];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (!k || k === KID_KEY || k.indexOf('imm-l3-') !== 0) continue;
      if (k.split('::')[1] === pageKey) keys.push(k);
    }
    return keys;
  }

  function exportProgress(pageKey) {
    var data = {};
    progressKeys(pageKey).forEach(function (k) {
      var v = localStorage.getItem(k);
      if (v !== null) data[k] = v;
    });
    var json = JSON.stringify({ v: 1, kid: pageKey, data: data });
    try { return btoa(unescape(encodeURIComponent(json))); } catch (e) { return btoa(json); }
  }

  // Decodes and validates a pasted code but does NOT write anything —
  // callers decide whether the kid it belongs to matches where it's being
  // applied before calling applyProgress, so a code pasted on the wrong
  // kid's page can't silently overwrite that page's own gate/progress.
  function decodeProgress(code) {
    var json;
    try { json = decodeURIComponent(escape(atob((code || '').trim()))); }
    catch (e) { return { ok: false, error: "That code looks broken — check you copied the whole thing." }; }
    var bundle;
    try { bundle = JSON.parse(json); } catch (e) { bundle = null; }
    if (!bundle || !bundle.data || !bundle.kid) return { ok: false, error: "That doesn't look like a progress code." };
    return { ok: true, kid: bundle.kid, data: bundle.data };
  }

  function applyProgress(data) {
    Object.keys(data).forEach(function (k) {
      try { localStorage.setItem(k, data[k]); } catch (e) {}
    });
  }

  function showCodeModal(code) {
    var backdrop = el('div', 'code-modal-backdrop');
    var box = el('div', 'code-modal');
    var closeBtn = el('button', 'code-modal-close', '✕');
    closeBtn.type = 'button';
    var heading = el('h3', null, '📋 Your progress code');
    var lead = el('p', null,
      "Copy this somewhere you can get to on your next device — a notes app, or message it to yourself. " +
      "Paste it back in there to pick up exactly where you left off.");
    var ta = document.createElement('textarea');
    ta.className = 'code-modal-textarea';
    ta.readOnly = true;
    ta.value = code;
    var copyBtn = el('button', 'btn btn-primary', '📋 Copy to clipboard');
    copyBtn.type = 'button';
    var status = el('div', 'code-modal-status');
    copyBtn.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(function () {
          status.textContent = '✓ Copied!';
        }).catch(function () {
          ta.focus(); ta.select();
          status.textContent = 'Selected it for you — press Ctrl/Cmd+C.';
        });
      } else {
        ta.focus(); ta.select();
        status.textContent = 'Selected it for you — press Ctrl/Cmd+C.';
      }
    });
    closeBtn.addEventListener('click', function () { backdrop.remove(); });
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) backdrop.remove(); });
    box.appendChild(closeBtn);
    box.appendChild(heading);
    box.appendChild(lead);
    box.appendChild(ta);
    box.appendChild(copyBtn);
    box.appendChild(status);
    backdrop.appendChild(box);
    document.body.appendChild(backdrop);
    ta.focus();
    ta.select();
  }

  // Wires a "paste a code" box shared by both the hub and each kid's own
  // gate screen. onSuccess(result, msg) decides what a valid decode actually
  // does — a kid page checks result.kid against its own pageKey before
  // applying anything; the hub doesn't know a pageKey yet, so it applies
  // and routes off whatever kid the code says it belongs to.
  function wireRestore(toggle, panel, input, btn, msg, onSuccess) {
    if (!toggle || !panel || !input || !btn) return;
    toggle.addEventListener('click', function () {
      panel.style.display = panel.style.display === 'none' || !panel.style.display ? 'block' : 'none';
    });
    btn.addEventListener('click', function () {
      var result = decodeProgress(input.value);
      if (!result.ok) { msg.textContent = '⚠ ' + result.error; return; }
      onSuccess(result, msg);
    });
  }

  // Wires the "copy my code" button (in the unlocked header) and the
  // "paste a code" restore box (in the locked gate screen) on one kid page.
  function initProgressSync(pageKey) {
    var copyBtn = document.getElementById('copy-progress-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        showCodeModal(exportProgress(pageKey));
      });
    }

    wireRestore(
      document.getElementById('gate-restore-toggle'),
      document.getElementById('gate-restore-box'),
      document.getElementById('gate-restore-input'),
      document.getElementById('gate-restore-btn'),
      document.getElementById('gate-restore-msg'),
      function (result, msg) {
        if (result.kid !== pageKey) {
          msg.textContent = "⚠ That code is from a different quest (" + result.kid + "'s) — nothing was changed here.";
          return;
        }
        applyProgress(result.data);
        msg.textContent = '✓ Restored — reloading…';
        setTimeout(function () { window.location.reload(); }, 500);
      }
    );
  }

  /* ---- Highlighter ----
     Select any text inside <main> (p/li), a small "Highlight" button appears
     near the selection. Highlights are stored as {block, start, end} plain-
     text offsets within their containing block (auto-tagged data-hl-block),
     so they survive reload and reapply regardless of nested <strong>/<em>. */
  function getTextOffset(root, node, offset) {
    // A selection boundary isn't always a text node + char offset — dragging to
    // exactly the start/end of a block (very common: selecting "the whole
    // sentence") often resolves to the parent element + a child index instead.
    // Building a Range from the true start of root to the boundary and reading
    // its string length handles both cases correctly, using the same text
    // serialization the browser itself uses for range.toString().
    try {
      var r = document.createRange();
      r.setStart(root, 0);
      r.setEnd(node, offset);
      return r.toString().length;
    } catch (e) {
      return root.textContent.length;
    }
  }

  function wrapRange(root, start, end, markClass, hlId, bg) {
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
      if (bg) mark.style.backgroundColor = bg;
      mark.textContent = mid;
      var frag = document.createDocumentFragment();
      if (before) frag.appendChild(document.createTextNode(before));
      frag.appendChild(mark);
      if (after) frag.appendChild(document.createTextNode(after));
      t.node.parentNode.replaceChild(frag, t.node);
    });
  }

  // Fixed highlighter palette — a real highlighter pen has a handful of colors,
  // not an unlimited picker. `name` is what gets persisted; `bg` is the actual
  // CSS color, applied as an inline style so it survives independent of theme.
  var HL_COLORS = [
    { name: 'yellow', bg: '#fde68a' },
    { name: 'green', bg: '#bbf7d0' },
    { name: 'blue', bg: '#bfdbfe' },
    { name: 'pink', bg: '#fbcfe8' },
    { name: 'orange', bg: '#fed7aa' }
  ];
  function hlColorBg(name) {
    var match = HL_COLORS.filter(function (c) { return c.name === name; })[0];
    return match ? match.bg : HL_COLORS[0].bg;
  }

  function initHighlighter(pageKey) {
    // Anything a kid might reasonably try to select: paragraphs and list items
    // cover almost all reading prose, plus the specific caption/label elements
    // used by the diagram and animation components (those are <div>s, not <p>).
    var blocks = document.querySelectorAll(
      'main p, main li, main .diagram-sub, main .diagram-title, main .ps-caption, main .ps-sub, main .diagram-legend-item'
    );
    blocks.forEach(function (b, i) { if (!b.dataset.hlBlock) b.dataset.hlBlock = 'hl-' + i; });

    var storageKey = 'imm-l3-hl::' + pageKey;
    var highlights = loadJSON(storageKey, []);

    function persist() { saveJSON(storageKey, highlights); }

    // Each highlight is one or more {block, start, end} spans sharing one id —
    // a real selection often crosses a paragraph/heading boundary (e.g. from
    // the end of one paragraph into the start of the next), so a highlight
    // has to be able to span more than one tagged block.
    function applyAll() {
      highlights.forEach(function (h) {
        (h.spans || []).forEach(function (s) {
          var root = document.querySelector('[data-hl-block="' + s.block + '"]');
          if (root) wrapRange(root, s.start, s.end, 'user-hl', h.id, hlColorBg(h.color));
        });
      });
    }

    // Find every tagged block the current selection touches, and the local
    // text-offset span within each one. Blocks the selection only partially
    // covers (the first/last one) still resolve correctly since block.contains()
    // tells us whether that block actually holds the range's start/end point.
    function findSpans(range) {
      var spans = [];
      blocks.forEach(function (block) {
        if (!range.intersectsNode(block)) return;
        var start = block.contains(range.startContainer) ? getTextOffset(block, range.startContainer, range.startOffset) : 0;
        var end = block.contains(range.endContainer) ? getTextOffset(block, range.endContainer, range.endOffset) : block.textContent.length;
        if (end > start) spans.push({ block: block.dataset.hlBlock, start: start, end: end });
      });
      return spans;
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
        var dot = el('span', 'hlc-dot', null);
        dot.style.background = hlColorBg(h.color);
        var span = el('span', 'hlc-text', null);
        span.textContent = h.text;
        var btn = el('button', 'hlc-remove', '&times;');
        btn.type = 'button';
        btn.title = 'Remove highlight';
        btn.addEventListener('click', function () { removeHighlight(h.id); });
        li.appendChild(dot);
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

    // One popup, two modes: picking a color for a fresh selection ("new" mode),
    // or picking a new color / removing for a highlight the kid just tapped
    // ("edit" mode, .hl-popup-editing shows the extra Remove button).
    var popup = el('div', 'hl-popup', null);
    HL_COLORS.forEach(function (c) {
      var swatch = el('button', 'hl-swatch', null);
      swatch.type = 'button';
      swatch.dataset.color = c.name;
      swatch.style.background = c.bg;
      swatch.title = 'Highlight in ' + c.name;
      popup.appendChild(swatch);
    });
    var removeBtn = el('button', 'hl-remove-btn', '✕ Remove');
    removeBtn.type = 'button';
    removeBtn.title = 'Remove this highlight';
    popup.appendChild(removeBtn);
    popup.style.display = 'none';
    document.body.appendChild(popup);

    var pending = null;   // {spans, text} — a fresh, not-yet-colored selection
    var editingId = null; // hlId of an existing highlight the kid just tapped

    function positionPopupAt(rect) {
      popup.style.left = (rect.left + rect.width / 2 + window.scrollX) + 'px';
      popup.style.top = (rect.top + window.scrollY) + 'px';
      popup.style.display = 'flex';
    }

    function hidePopup() {
      popup.style.display = 'none';
      popup.classList.remove('hl-popup-editing');
      pending = null;
      editingId = null;
    }

    function openEditPopup(mark) {
      pending = null;
      editingId = mark.dataset.hlId;
      popup.classList.add('hl-popup-editing');
      positionPopupAt(mark.getBoundingClientRect());
    }

    // The one thing that actually decides "does the selection right now deserve
    // a highlight popup". Called from pointerup for instant response (works for
    // mouse, touch, and pen alike — Pointer Events unify all three), and from a
    // debounced selectionchange listener as a fallback that catches everything
    // else (native mobile selection-handle drags, which don't reliably fire
    // pointerup at the right moment, and keyboard selection).
    function trySelection() {
      if (editingId) return; // an edit popup is open — a stray selection shouldn't steal it
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) { hidePopup(); return; }
      var range = sel.getRangeAt(0);
      var text = range.toString().trim();
      if (!text) { hidePopup(); return; }
      var spans = findSpans(range);
      if (!spans.length) { hidePopup(); return; }
      var rect = range.getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) { hidePopup(); return; }
      pending = { spans: spans, text: text };
      popup.classList.remove('hl-popup-editing');
      positionPopupAt(rect);
    }

    function applyPending(color) {
      if (!pending) return;
      var id = 'h' + Date.now() + Math.random().toString(36).slice(2, 6);
      pending.spans.forEach(function (s) {
        var root = document.querySelector('[data-hl-block="' + s.block + '"]');
        wrapRange(root, s.start, s.end, 'user-hl', id, hlColorBg(color));
      });
      highlights.push({ id: id, spans: pending.spans, text: pending.text, color: color });
      persist();
      renderCollectedList();
      window.getSelection().removeAllRanges();
    }

    function recolorHighlight(id, color) {
      document.querySelectorAll('mark.user-hl[data-hl-id="' + id + '"]').forEach(function (m) {
        m.style.backgroundColor = hlColorBg(color);
      });
      highlights.forEach(function (h) { if (h.id === id) h.color = color; });
      persist();
    }

    // Pointer Events fire for mouse, touch, and pen/stylus alike, so this one
    // pair of listeners is all three input types at once — no separate
    // mouse/touch branches to keep in sync.
    document.addEventListener('pointerup', function (e) {
      if (popup.contains(e.target)) return;
      var mark = e.target.closest && e.target.closest('mark.user-hl');
      if (mark) { openEditPopup(mark); return; }
      setTimeout(trySelection, 0);
    });

    document.addEventListener('pointerdown', function (e) {
      if (!popup.contains(e.target)) hidePopup();
    });

    var selChangeTimer = null;
    document.addEventListener('selectionchange', function () {
      clearTimeout(selChangeTimer);
      selChangeTimer = setTimeout(trySelection, 220);
    });

    popup.addEventListener('click', function (e) {
      var swatch = e.target.closest && e.target.closest('.hl-swatch');
      if (swatch) {
        var color = swatch.dataset.color;
        if (editingId) recolorHighlight(editingId, color);
        else applyPending(color);
        hidePopup();
        return;
      }
      if (e.target.closest && e.target.closest('.hl-remove-btn') && editingId) {
        removeHighlight(editingId);
        hidePopup();
      }
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

  /* ---- Day 1 game: a term-matching game wrapping up the whole reading.
     Framed as play, not evaluation — the "score" is moves taken, there's no
     pass/fail, and a wrong guess just shakes and resets the pick. Progress
     (which pairs are already matched, and the move count) persists per
     kid/page/game so coming back later shows where they left off. ---- */
  function initMatchGame(containerId, pairs, opts) {
    var container = document.getElementById(containerId);
    if (!container) return;
    opts = opts || {};
    var storageKey = 'imm-l3-game::' + (opts.pageKey || '') + '::' + containerId;
    var saved = loadJSON(storageKey, null);
    var matched = (saved && saved.matched) || {};
    var moves = (saved && saved.moves) || 0;
    var selectedTerm = null;

    function persist() { saveJSON(storageKey, { matched: matched, moves: moves }); }

    var wrap = el('div', 'match-game');
    var status = el('div', 'match-game-status');
    var cols = el('div', 'match-cols');
    var termsCol = el('div', 'match-col');
    var defsCol = el('div', 'match-col');
    var termEls = {};

    function updateStatus() {
      var count = Object.keys(matched).filter(function (k) { return matched[k]; }).length;
      if (count === pairs.length) {
        status.textContent = '🎉 All matched in ' + moves + ' move' + (moves === 1 ? '' : 's') + '!';
        status.classList.add('done');
      } else {
        status.textContent = 'Matched ' + count + ' of ' + pairs.length + ' · ' + moves + ' move' + (moves === 1 ? '' : 's');
        status.classList.remove('done');
      }
    }

    shuffle(pairs.map(function (_, i) { return i; })).forEach(function (i) {
      var t = el('div', 'match-item', pairs[i][0]);
      if (matched[i]) t.classList.add('matched');
      t.addEventListener('click', function () {
        if (matched[i]) return;
        Object.keys(termEls).forEach(function (k) { termEls[k].classList.remove('selected'); });
        t.classList.add('selected');
        selectedTerm = i;
      });
      termsCol.appendChild(t);
      termEls[i] = t;
    });

    shuffle(pairs.map(function (_, i) { return i; })).forEach(function (i) {
      var d = el('div', 'match-item', pairs[i][1]);
      if (matched[i]) d.classList.add('matched');
      d.addEventListener('click', function () {
        if (matched[i] || selectedTerm === null) return;
        moves++;
        var chosen = selectedTerm;
        if (chosen === i) {
          matched[i] = true;
          termEls[i].classList.remove('selected');
          termEls[i].classList.add('matched');
          d.classList.add('matched');
          selectedTerm = null;
          updateStatus();
        } else {
          d.classList.add('shake');
          termEls[chosen].classList.add('shake');
          setTimeout(function () {
            d.classList.remove('shake');
            if (termEls[chosen]) termEls[chosen].classList.remove('shake', 'selected');
          }, 350);
          selectedTerm = null;
        }
        persist();
      });
      defsCol.appendChild(d);
    });

    cols.appendChild(termsCol);
    cols.appendChild(defsCol);
    wrap.appendChild(status);
    wrap.appendChild(cols);
    container.appendChild(wrap);
    updateStatus();
  }

  window.QuestUI = {
    el: el, shuffle: shuffle, pickRandom: pickRandom,
    initMaterialsPool: initMaterialsPool, initPrintSlip: initPrintSlip,
    initKidGate: initKidGate, initHighlighter: initHighlighter, initNotesDrawer: initNotesDrawer,
    initReflectionChecks: initReflectionChecks, initBuildChecklist: initBuildChecklist,
    initFieldAutosave: initFieldAutosave, initProgressBar: initProgressBar,
    initMatchGame: initMatchGame, initProgressSync: initProgressSync,
    exportProgress: exportProgress, decodeProgress: decodeProgress,
    applyProgress: applyProgress, wireRestore: wireRestore,
    KID_KEY: KID_KEY
  };

  document.addEventListener('DOMContentLoaded', function () {
    initPrintSlip();
  });
})();
