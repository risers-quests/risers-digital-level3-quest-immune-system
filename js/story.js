/* Interactive story: two characters take turns teaching each other. Click
   through a few panels; each panel is shown by one of the two characters. */
(function () {
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function mountStory(containerId, opts) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const chars = opts.chars;
    const panels = opts.panels || [];
    let idx = 0;

    const card = el('div', 'story-card');

    if (opts.title) card.appendChild(el('div', 'story-title', opts.title));

    const charsRow = el('div', 'story-chars');
    const chipA = el('div', 'story-chip');
    const chipB = el('div', 'story-chip');
    [['a', chipA], ['b', chipB]].forEach(([key, chip]) => {
      const c = chars[key];
      const av = el('div', 'story-chip-avatar', (window.CHAR_SVG && window.CHAR_SVG[c.art]) || c.emoji || '');
      av.style.borderColor = c.color;
      chip.appendChild(av);
      chip.appendChild(el('div', 'story-chip-name', c.name));
    });
    charsRow.appendChild(chipA);
    charsRow.appendChild(el('div', 'story-chip-vs', '&'));
    charsRow.appendChild(chipB);
    card.appendChild(charsRow);

    const sceneBox = el('div', 'story-scene');
    const emojiEl = el('div', 'story-emoji');
    const bubble = el('div', 'story-bubble');
    const speakerTag = el('div', 'story-speaker');
    const textEl = el('div', 'story-text');
    bubble.appendChild(speakerTag);
    bubble.appendChild(textEl);
    sceneBox.appendChild(emojiEl);
    sceneBox.appendChild(bubble);

    const dots = el('div', 'story-dots');
    const dotEls = panels.map(() => {
      const d = el('span', 'story-dot');
      dots.appendChild(d);
      return d;
    });

    const nav = el('div', 'story-nav');
    const backBtn = el('button', 'btn btn-ghost story-back', '← Back');
    const nextBtn = el('button', 'btn btn-primary story-next', 'Next →');
    backBtn.type = 'button';
    nextBtn.type = 'button';
    nav.appendChild(backBtn);
    nav.appendChild(nextBtn);

    card.appendChild(sceneBox);
    card.appendChild(dots);
    card.appendChild(nav);
    container.appendChild(card);

    function render() {
      const p = panels[idx];
      const speaker = chars[p.who];
      emojiEl.textContent = p.emoji || '';
      speakerTag.textContent = speaker.name + ' says:';
      speakerTag.style.color = speaker.color;
      textEl.textContent = p.text || '';
      bubble.style.borderColor = speaker.color;
      chipA.classList.toggle('active', p.who === 'a');
      chipB.classList.toggle('active', p.who === 'b');
      dotEls.forEach((d, i) => d.classList.toggle('active', i === idx));
      backBtn.style.visibility = idx === 0 ? 'hidden' : 'visible';
      nextBtn.textContent = idx === panels.length - 1 ? (opts.endLabel || "Got it! →") : 'Next →';
    }

    backBtn.addEventListener('click', () => { if (idx > 0) { idx--; render(); } });
    nextBtn.addEventListener('click', () => {
      if (idx < panels.length - 1) { idx++; render(); }
      else if (opts.onEnd) { opts.onEnd(); }
    });

    render();
  }

  window.mountStory = mountStory;
})();
