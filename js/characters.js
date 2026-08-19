/* Hand-coded cartoon cell mascots for Mac (a macrophage) and Ana (a
   lymphocyte). Returned as inline SVG markup so they can be dropped into
   any container and scale cleanly from a 40px avatar to a big hero card. */
(function () {
  const MAC = `
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mac">
  <circle cx="60" cy="60" r="58" fill="#e6fffb"/>
  <path d="M60 14 C82 10 104 22 111 44 C118 64 112 84 96 98 C82 110 60 114 42 106 C22 98 8 80 9 58 C10 38 24 18 46 13 C50 12 56 13 60 14 Z" fill="#2dd4bf" stroke="#0f766e" stroke-width="4"/>
  <circle cx="34" cy="46" r="7" fill="#5eead4" opacity=".6"/>
  <circle cx="90" cy="70" r="9" fill="#5eead4" opacity=".5"/>
  <circle cx="70" cy="38" r="5" fill="#5eead4" opacity=".5"/>
  <ellipse cx="46" cy="60" rx="9" ry="11" fill="#fff"/>
  <ellipse cx="76" cy="60" rx="9" ry="11" fill="#fff"/>
  <circle cx="48" cy="62" r="4.2" fill="#083344"/>
  <circle cx="78" cy="62" r="4.2" fill="#083344"/>
  <circle cx="49.4" cy="59.6" r="1.3" fill="#fff"/>
  <circle cx="79.4" cy="59.6" r="1.3" fill="#fff"/>
  <circle cx="36" cy="72" r="6" fill="#f9a8c9" opacity=".55"/>
  <circle cx="88" cy="72" r="6" fill="#f9a8c9" opacity=".55"/>
  <path d="M48 82 Q61 92 74 82" fill="none" stroke="#0f766e" stroke-width="3.2" stroke-linecap="round"/>
  <ellipse cx="61" cy="102" rx="9" ry="6" fill="#84cc16" stroke="#4d7c0f" stroke-width="2"/>
  <path d="M56 102 q5 -4 10 0" fill="none" stroke="#4d7c0f" stroke-width="1.4"/>
</svg>`.trim();

  const ANA = `
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ana">
  <circle cx="60" cy="60" r="58" fill="#fdf2ff"/>
  <circle cx="60" cy="64" r="44" fill="#e9d5ff" stroke="#a855f7" stroke-width="3"/>
  <g stroke="#a855f7" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M22 40 L14 28 M22 40 L14 34"/>
    <path d="M98 40 L106 28 M98 40 L106 34"/>
    <path d="M22 92 L14 100 M22 92 L14 96"/>
    <path d="M98 92 L106 100 M98 92 L106 96"/>
  </g>
  <circle cx="60" cy="62" r="33" fill="#7e22ce"/>
  <ellipse cx="48" cy="58" rx="8.6" ry="10.6" fill="#fff"/>
  <ellipse cx="72" cy="58" rx="8.6" ry="10.6" fill="#fff"/>
  <circle cx="50" cy="60" r="4" fill="#2e1065"/>
  <circle cx="74" cy="60" r="4" fill="#2e1065"/>
  <circle cx="51.3" cy="57.7" r="1.2" fill="#fff"/>
  <circle cx="75.3" cy="57.7" r="1.2" fill="#fff"/>
  <circle cx="40" cy="70" r="5.4" fill="#f0abfc" opacity=".55"/>
  <circle cx="82" cy="70" r="5.4" fill="#f0abfc" opacity=".55"/>
  <path d="M49 78 Q60 87 71 78" fill="none" stroke="#f5d0fe" stroke-width="3" stroke-linecap="round"/>
</svg>`.trim();

  window.CHAR_SVG = { mac: MAC, ana: ANA };
})();
