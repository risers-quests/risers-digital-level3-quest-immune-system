/* Shared helpers for all three Level 3 Quest pages: materials-pool -> printable
   slip, the print trigger, and small random-event helpers for the Day 2
   decision workshops. No progress-locking, no scoring, no localStorage state
   — evaluation here is the decision log itself, not a graded mechanic. */
(function () {
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

  /* Materials pool: clicking a pool card toggles its checkbox and live-updates
     both the on-screen "what I'm bringing" preview and the isolated printable slip. */
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

  window.QuestUI = { el: el, shuffle: shuffle, pickRandom: pickRandom, initMaterialsPool: initMaterialsPool, initPrintSlip: initPrintSlip };

  document.addEventListener('DOMContentLoaded', function () {
    initMaterialsPool();
    initPrintSlip();
  });
})();
