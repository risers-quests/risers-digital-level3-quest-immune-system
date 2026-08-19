/* Lets more than one kid share the same computer/browser without seeing
   each other's progress. Everything is still just localStorage — no
   accounts, no server — but every progress key is namespaced under
   whichever name is currently "checked in" on this browser. */
(function () {
  var ACTIVE_KEY = 'imm-active-player';

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function safeRemove(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function getPlayer() { return safeGet(ACTIVE_KEY) || ''; }

  function setPlayer(name) {
    name = String(name || '').trim().slice(0, 40);
    if (!name) return false;
    safeSet(ACTIVE_KEY, name);
    document.dispatchEvent(new CustomEvent('player-changed'));
    return true;
  }

  function clearPlayer() {
    safeRemove(ACTIVE_KEY);
    document.dispatchEvent(new CustomEvent('player-changed'));
  }

  function pkey(base) {
    var p = getPlayer();
    return p ? (base + '::' + p) : base;
  }

  function pGet(base) { return safeGet(pkey(base)); }
  function pSet(base, val) { safeSet(pkey(base), val); }

  window.Player = {
    getPlayer: getPlayer,
    setPlayer: setPlayer,
    clearPlayer: clearPlayer,
    pkey: pkey,
    pGet: pGet,
    pSet: pSet
  };
})();
