/* Kid-friendly quiz engine: mcq, tf, fill, match.
   First try right -> done immediately.
   First try wrong -> revise your pick, then explain your thinking in an
   open box (not graded, just needs to be filled in) to finish the question.
   Every question must be finished before the next section unlocks. */
(function () {
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(s) {
    return String(s).trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  class Quiz {
    constructor(container, questions, meta) {
      this.container = container;
      this.questions = questions;
      this.meta = meta || {};
      this.state = questions.map(() => ({ selected: null, solved: false, revising: false }));
      this.matchState = questions.map((q) =>
        q.type === 'match'
          ? { order: shuffle(q.pairs.map((_, i) => i)), selectedTerm: null, matched: new Set() }
          : null
      );
      this._fbEls = [];
      this._wrapEls = [];
      this._btnEls = [];
      this._reflectEls = [];
      this.build();
    }

    isAlreadyDone() {
      if (!this.meta.storageKey) return false;
      return !!(window.Player ? Player.pGet(this.meta.storageKey) : localStorage.getItem(this.meta.storageKey));
    }

    build() {
      if (this.isAlreadyDone()) this.buildCompletedSummary();
      else this.buildQuiz();
    }

    buildCompletedSummary() {
      this.container.innerHTML = '';
      this.container.appendChild(el('div', 'quiz-title', this.icon() + (this.meta.title || 'Show what you know!')));

      const done = el('div', 'quiz-complete show');
      done.appendChild(el('div', 'quiz-complete-msg', '✅ You already finished this checkpoint! Nice work — no need to redo it.'));
      if (this.meta.nextId || this.meta.nextHref) {
        const nextBtn = el('button', 'btn btn-primary', (this.meta.nextLabel ? 'Continue to ' + this.meta.nextLabel : 'Continue') + ' →');
        nextBtn.type = 'button';
        nextBtn.addEventListener('click', () => {
          if (this.meta.nextId) {
            var nextEl = document.getElementById(this.meta.nextId);
            if (nextEl) nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (this.meta.nextHref) {
            window.location.href = this.meta.nextHref;
          }
        });
        done.appendChild(nextBtn);
      }
      const redoBtn = el('button', 'btn btn-ghost', '🔁 Redo for practice');
      redoBtn.type = 'button';
      redoBtn.style.marginLeft = '10px';
      redoBtn.addEventListener('click', () => this.buildQuiz(true));
      done.appendChild(redoBtn);

      this.container.appendChild(done);
    }

    progressKey() {
      return this.meta.storageKey ? this.meta.storageKey + '::progress' : null;
    }

    saveQuestionProgress() {
      const key = this.progressKey();
      if (!key) return;
      const val = JSON.stringify(this.state.map((s) => !!s.solved));
      if (window.Player) Player.pSet(key, val);
      else { try { localStorage.setItem(key, val); } catch (e) {} }
    }

    loadQuestionProgress() {
      const key = this.progressKey();
      if (!key) return null;
      let raw;
      if (window.Player) raw = Player.pGet(key);
      else { try { raw = localStorage.getItem(key); } catch (e) { raw = null; } }
      if (!raw) return null;
      try {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : null;
      } catch (e) {
        return null;
      }
    }

    buildQuiz(reset) {
      this.state = this.questions.map(() => ({ selected: null, solved: false, revising: false }));
      this.matchState = this.questions.map((q) =>
        q.type === 'match'
          ? { order: shuffle(q.pairs.map((_, i) => i)), selectedTerm: null, matched: new Set() }
          : null
      );
      this._fbEls = [];
      this._wrapEls = [];
      this._btnEls = [];
      this._reflectEls = [];

      if (reset) {
        this.saveQuestionProgress();
      } else {
        const saved = this.loadQuestionProgress();
        if (saved) {
          saved.forEach((solved, i) => {
            if (solved && this.state[i]) this.state[i].solved = true;
          });
        }
      }

      this.container.innerHTML = '';
      this.container.appendChild(el('div', 'quiz-title', this.icon() + (this.meta.title || 'Show what you know!')));
      this.container.appendChild(el('div', 'quiz-sub', this.meta.sub || 'Answer every question. Get one wrong? No problem — just try again and tell us your thinking!'));

      const progress = el('div', 'quiz-progress');
      const bar = el('div', 'quiz-progress-bar');
      const fill = el('div', 'quiz-progress-fill');
      bar.appendChild(fill);
      const label = el('div', 'quiz-progress-label');
      progress.appendChild(bar);
      progress.appendChild(label);
      this.container.appendChild(progress);
      this.progressFill = fill;
      this.progressLabel = label;

      this.questions.forEach((q, i) => this.container.appendChild(this.renderQuestion(q, i)));

      const complete = el('div', 'quiz-complete');
      const msg = el('div', 'quiz-complete-msg', '🎉 Awesome! You finished every question!');
      complete.appendChild(msg);
      if (this.meta.nextId || this.meta.nextHref) {
        const nextBtn = el('button', 'btn btn-primary', (this.meta.nextLabel ? 'Continue to ' + this.meta.nextLabel : 'Continue') + ' →');
        nextBtn.type = 'button';
        nextBtn.addEventListener('click', () => {
          if (this.meta.nextId) {
            var nextEl = document.getElementById(this.meta.nextId);
            if (nextEl) setTimeout(() => nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
          } else if (this.meta.nextHref) {
            window.location.href = this.meta.nextHref;
          }
        });
        complete.appendChild(nextBtn);
      }
      this.container.appendChild(complete);
      this.completeBox = complete;

      this.updateProgress();
    }

    icon() {
      return '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4"></path><line x1="12" y1="17" x2="12.01" y2="17"></line><circle cx="12" cy="12" r="10"></circle></svg>';
    }

    renderQuestion(q, i) {
      const wrap = el('div', 'q-item');
      wrap.dataset.index = i;
      wrap.appendChild(el('div', 'q-num', 'Question ' + (i + 1) + ' · ' + this.typeLabel(q.type)));
      wrap.appendChild(el('div', 'q-prompt', q.q || ''));
      this._wrapEls[i] = wrap;

      if (this.state[i].solved) {
        this.renderAlreadyAnswered(wrap, i);
        return wrap;
      }

      if (q.type === 'mcq') wrap.appendChild(this.renderChoices(q, i, q.choices));
      else if (q.type === 'tf') wrap.appendChild(this.renderChoices(q, i, ['True', 'False'], 'tf-row'));
      else if (q.type === 'fill') wrap.appendChild(this.renderFill(q, i));
      else if (q.type === 'match') wrap.appendChild(this.renderMatch(q, i));

      const fb = el('div', 'q-feedback');
      wrap.appendChild(fb);
      this._fbEls[i] = fb;

      if (q.type === 'mcq' || q.type === 'tf' || q.type === 'fill') {
        const btn = el('button', 'btn btn-check', 'Check');
        btn.type = 'button';
        btn.addEventListener('click', () => this.checkOne(i));
        wrap.appendChild(btn);
        this._btnEls[i] = btn;
      }

      return wrap;
    }

    renderAlreadyAnswered(wrap, i) {
      wrap.classList.add('solved');
      const num = wrap.querySelector('.q-num');
      if (num && !num.querySelector('.solved-check')) {
        num.appendChild(el('span', 'solved-check', ' ✅'));
      }
      const fb = el('div', 'q-feedback show right', '✅ You already answered this one in a previous session.');
      wrap.appendChild(fb);
      this._fbEls[i] = fb;
    }

    typeLabel(t) {
      return { mcq: 'Multiple choice', tf: 'True or False', fill: 'Fill in the blank', match: 'Match it' }[t] || '';
    }

    renderChoices(q, i, choices, extraCls) {
      const box = el('div', 'q-choices' + (extraCls ? ' ' + extraCls : ''));
      choices.forEach((c, ci) => {
        const item = el('div', 'q-choice');
        item.appendChild(el('span', 'dot'));
        item.appendChild(el('span', null, c));
        item.addEventListener('click', () => {
          if (this.state[i].solved) return;
          this.state[i].selected = ci;
          box.querySelectorAll('.q-choice').forEach((n) => n.classList.remove('selected', 'incorrect'));
          item.classList.add('selected');
        });
        box.appendChild(item);
      });
      return box;
    }

    renderFill(q, i) {
      const box = el('div', 'fill-row');
      const input = el('input');
      input.type = 'text';
      input.placeholder = q.placeholder || 'Type your answer…';
      input.addEventListener('input', () => { this.state[i].selected = input.value; });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); if (!this.state[i].revising) this.checkOne(i); }
      });
      box.appendChild(input);
      return box;
    }

    renderMatch(q, i) {
      const st = this.matchState[i];
      const box = el('div', 'match-cols');
      const termsCol = el('div', 'match-col');
      const defsCol = el('div', 'match-col');
      const defOrder = st.order;
      const statusLine = el('div', 'match-status', 'Matched 0 of ' + q.pairs.length);

      const updateStatus = () => {
        statusLine.textContent = 'Matched ' + st.matched.size + ' of ' + q.pairs.length;
        if (st.matched.size === q.pairs.length) {
          statusLine.textContent = '✅ All matched — nice work!';
          this.state[i].solved = true;
          this.markSolved(i);
          this.updateProgress();
        }
      };

      q.pairs.forEach((pair, ti) => {
        const t = el('div', 'match-item', pair[0]);
        t.dataset.term = ti;
        t.addEventListener('click', () => {
          if (st.matched.has(ti)) return;
          termsCol.querySelectorAll('.match-item').forEach((n) => n.classList.remove('selected'));
          t.classList.add('selected');
          st.selectedTerm = ti;
        });
        termsCol.appendChild(t);
      });

      defOrder.forEach((di) => {
        const d = el('div', 'match-item', q.pairs[di][1]);
        d.dataset.def = di;
        d.addEventListener('click', () => {
          if (st.selectedTerm === null) return;
          if (st.matched.has(Number(d.dataset.def))) return;
          const chosenTerm = st.selectedTerm;
          if (chosenTerm === Number(d.dataset.def)) {
            st.matched.add(chosenTerm);
            const termEl = termsCol.querySelector('[data-term="' + chosenTerm + '"]');
            termEl.classList.remove('selected');
            termEl.classList.add('matched');
            d.classList.add('matched');
            st.selectedTerm = null;
            updateStatus();
          } else {
            d.classList.add('shake');
            const termEl = termsCol.querySelector('[data-term="' + chosenTerm + '"]');
            termEl.classList.add('shake');
            setTimeout(() => { d.classList.remove('shake'); termEl.classList.remove('shake'); termEl.classList.remove('selected'); }, 350);
            st.selectedTerm = null;
          }
        });
        defsCol.appendChild(d);
      });

      box.appendChild(termsCol);
      box.appendChild(defsCol);
      const outer = el('div');
      outer.appendChild(box);
      outer.appendChild(statusLine);
      return outer;
    }

    isCorrect(q, i) {
      const s = this.state[i];
      if (q.type === 'mcq') return s.selected === q.answer;
      if (q.type === 'tf') return (s.selected === 0) === (q.answer === true);
      if (q.type === 'fill') {
        if (s.selected == null) return false;
        const val = normalize(s.selected);
        return q.answer.some((a) => normalize(a) === val);
      }
      if (q.type === 'match') return this.matchState[i].matched.size === q.pairs.length;
      return false;
    }

    checkOne(i) {
      const q = this.questions[i];
      const wrap = this._wrapEls[i];
      const fb = this._fbEls[i];
      const s = this.state[i];
      if (s.solved) return;

      if ((q.type === 'mcq' || q.type === 'tf') && s.selected == null) {
        fb.className = 'q-feedback show wrong';
        fb.textContent = '👉 Pick an answer first!';
        return;
      }
      if (q.type === 'fill' && (s.selected == null || String(s.selected).trim() === '')) {
        fb.className = 'q-feedback show wrong';
        fb.textContent = '👉 Type an answer first!';
        return;
      }

      const ok = this.isCorrect(q, i);

      if (q.type === 'mcq' || q.type === 'tf') {
        const choiceNodes = wrap.querySelectorAll('.q-choice');
        choiceNodes.forEach((n, ci) => {
          n.classList.remove('correct', 'incorrect');
          if (ok && ci === s.selected) n.classList.add('correct');
          if (!ok && ci === s.selected) n.classList.add('incorrect');
        });
      }
      if (q.type === 'fill') {
        const input = wrap.querySelector('input');
        input.style.borderColor = ok ? 'var(--green)' : 'var(--red)';
        if (!ok) { wrap.classList.add('shake'); setTimeout(() => wrap.classList.remove('shake'), 350); }
      }

      if (ok) {
        s.solved = true;
        this.markSolved(i);
        fb.className = 'q-feedback show right';
        fb.textContent = '✓ That\'s it! ' + (q.explain || '');
        this.updateProgress();
      } else {
        s.revising = true;
        fb.className = 'q-feedback show wrong';
        fb.textContent = '🤔 Not quite! Pick again if you\'d like to change your mind, then tell us your thinking below.';
        const btn = this._btnEls[i];
        if (btn) btn.style.display = 'none';
        this.renderReflection(i);
      }
    }

    renderReflection(i) {
      if (this._reflectEls[i]) return;
      const wrap = this._wrapEls[i];
      const box = el('div', 'reflect-box');
      box.appendChild(el('div', 'reflect-label', '💭 Why do you think you changed your answer? Tell us in your own words.'));
      const textarea = document.createElement('textarea');
      textarea.className = 'reflect-input';
      textarea.placeholder = 'Type your thinking here…';
      const submitBtn = el('button', 'btn btn-reflect-submit', 'Submit My Answer');
      submitBtn.type = 'button';
      submitBtn.disabled = true;
      textarea.addEventListener('input', () => {
        submitBtn.disabled = textarea.value.trim().length === 0;
      });
      submitBtn.addEventListener('click', () => this.submitReflection(i));
      box.appendChild(textarea);
      box.appendChild(submitBtn);
      wrap.appendChild(box);
      this._reflectEls[i] = { box, textarea, submitBtn };
      textarea.focus();
    }

    submitReflection(i) {
      const s = this.state[i];
      if (s.solved) return;
      const r = this._reflectEls[i];
      if (!r || r.textarea.value.trim().length === 0) return;
      s.solved = true;
      this.markSolved(i);
      const fb = this._fbEls[i];
      fb.className = 'q-feedback show right';
      fb.textContent = '✏️ Thanks for sharing your thinking — nice work sticking with it!';
      this.updateProgress();
    }

    markSolved(i) {
      const wrap = this._wrapEls[i];
      wrap.classList.add('solved');
      const num = wrap.querySelector('.q-num');
      if (num && !num.querySelector('.solved-check')) {
        const chk = el('span', 'solved-check', ' ✅');
        num.appendChild(chk);
      }
      const btn = this._btnEls[i];
      if (btn) { btn.disabled = true; btn.style.display = 'none'; }
      const r = this._reflectEls[i];
      if (r) { r.textarea.disabled = true; r.submitBtn.disabled = true; r.submitBtn.style.display = 'none'; }
      wrap.querySelectorAll('input').forEach((n) => (n.disabled = true));
      this.saveQuestionProgress();
    }

    updateProgress() {
      const solvedCount = this.state.filter((s) => s.solved).length;
      const total = this.questions.length;
      const pct = Math.round((solvedCount / total) * 100);
      this.progressFill.style.width = pct + '%';
      this.progressLabel.textContent = solvedCount + ' of ' + total + ' done';

      if (solvedCount === total) {
        this.completeBox.classList.add('show');
        if (this.meta.storageKey) {
          if (window.Player) Player.pSet(this.meta.storageKey, '1');
          else { try { localStorage.setItem(this.meta.storageKey, '1'); } catch (e) {} }
          document.dispatchEvent(new CustomEvent('quiz-passed', { detail: { key: this.meta.storageKey } }));
        }
      } else {
        this.completeBox.classList.remove('show');
      }
    }
  }

  window.mountQuiz = function (containerId, questions, meta) {
    const container = document.getElementById(containerId);
    if (!container) return;
    new Quiz(container, questions, meta);
  };
})();
