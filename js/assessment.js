/* Final assessment engine: unlike the per-section practice quizzes, this
   grades everything at once and requires a real passing score to earn
   the certificate. No reflection shortcut — you either know it, or you
   study up and try the whole thing again. */
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

  class Assessment {
    constructor(container, questions, opts) {
      this.container = container;
      this.questions = questions;
      this.opts = opts || {};
      this.passPct = this.opts.passPct || 0.8;
      this.build();
    }

    isAlreadyDone() {
      if (!this.opts.storageKey) return false;
      return !!(window.Player ? Player.pGet(this.opts.storageKey) : localStorage.getItem(this.opts.storageKey));
    }

    build() {
      if (this.isAlreadyDone()) this.buildCompletedSummary();
      else this.buildAssessment();
    }

    buildCompletedSummary() {
      this.container.innerHTML = '';
      this.container.appendChild(el('div', 'quiz-title', this.icon() + (this.opts.title || 'Final Assessment')));
      const box = el('div', 'assessment-score pass');
      box.appendChild(el('div', 'assessment-score-num', '🏆'));
      box.appendChild(el('div', 'assessment-score-msg', 'You already beat this challenge! No need to retake it.'));
      const redoBtn = el('button', 'btn btn-ghost', '🔁 Retake for practice');
      redoBtn.type = 'button';
      redoBtn.addEventListener('click', () => this.buildAssessment());
      box.appendChild(redoBtn);
      this.container.appendChild(box);
    }

    buildAssessment() {
      this.state = this.questions.map(() => ({ selected: null }));
      this.matchState = this.questions.map((q) =>
        q.type === 'match'
          ? { order: shuffle(q.pairs.map((_, i) => i)), selectedTerm: null, matched: new Set() }
          : null
      );
      this.submitted = false;

      this.container.innerHTML = '';
      this.container.appendChild(el('div', 'quiz-title', this.icon() + (this.opts.title || 'Final Assessment')));
      this.container.appendChild(el('div', 'quiz-sub', this.opts.sub || ''));

      this.questions.forEach((q, i) => this.container.appendChild(this.renderQuestion(q, i)));

      const actions = el('div', 'assessment-actions');
      const submitBtn = el('button', 'btn btn-primary', 'Submit Final Assessment');
      submitBtn.type = 'button';
      submitBtn.addEventListener('click', () => this.submit());
      actions.appendChild(submitBtn);
      this.container.appendChild(actions);
      this.submitBtn = submitBtn;

      const result = el('div', 'assessment-result');
      this.container.appendChild(result);
      this.resultBox = result;
    }

    icon() {
      return '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/><path d="M9 19l-2 3M15 19l2 3"/></svg>';
    }

    renderQuestion(q, i) {
      const wrap = el('div', 'q-item');
      wrap.dataset.index = i;
      wrap.appendChild(el('div', 'q-num', 'Question ' + (i + 1) + ' of ' + this.questions.length));
      wrap.appendChild(el('div', 'q-prompt', q.q || ''));

      if (q.type === 'mcq') wrap.appendChild(this.renderChoices(q, i, q.choices));
      else if (q.type === 'tf') wrap.appendChild(this.renderChoices(q, i, ['True', 'False'], 'tf-row'));
      else if (q.type === 'fill') wrap.appendChild(this.renderFill(q, i));
      else if (q.type === 'match') wrap.appendChild(this.renderMatch(q, i));

      const fb = el('div', 'q-feedback');
      wrap.appendChild(fb);
      this._fbEls = this._fbEls || [];
      this._fbEls[i] = fb;
      this._wrapEls = this._wrapEls || [];
      this._wrapEls[i] = wrap;
      return wrap;
    }

    renderChoices(q, i, choices, extraCls) {
      const box = el('div', 'q-choices' + (extraCls ? ' ' + extraCls : ''));
      choices.forEach((c, ci) => {
        const item = el('div', 'q-choice');
        item.appendChild(el('span', 'dot'));
        item.appendChild(el('span', null, c));
        item.addEventListener('click', () => {
          if (this.submitted) return;
          this.state[i].selected = ci;
          box.querySelectorAll('.q-choice').forEach((n) => n.classList.remove('selected'));
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
      box.appendChild(input);
      return box;
    }

    renderMatch(q, i) {
      const st = this.matchState[i];
      const box = el('div', 'match-cols');
      const termsCol = el('div', 'match-col');
      const defsCol = el('div', 'match-col');
      const statusLine = el('div', 'match-status', 'Matched 0 of ' + q.pairs.length);

      const updateStatus = () => {
        statusLine.textContent = st.matched.size === q.pairs.length
          ? '✅ All matched!'
          : 'Matched ' + st.matched.size + ' of ' + q.pairs.length;
      };

      q.pairs.forEach((pair, ti) => {
        const t = el('div', 'match-item', pair[0]);
        t.dataset.term = ti;
        t.addEventListener('click', () => {
          if (this.submitted || st.matched.has(ti)) return;
          termsCol.querySelectorAll('.match-item').forEach((n) => n.classList.remove('selected'));
          t.classList.add('selected');
          st.selectedTerm = ti;
        });
        termsCol.appendChild(t);
      });

      st.order.forEach((di) => {
        const d = el('div', 'match-item', q.pairs[di][1]);
        d.dataset.def = di;
        d.addEventListener('click', () => {
          if (this.submitted || st.selectedTerm === null || st.matched.has(Number(d.dataset.def))) return;
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

    submit() {
      let correct = 0;
      this.questions.forEach((q, i) => {
        const wrap = this._wrapEls[i];
        const fb = this._fbEls[i];
        const ok = this.isCorrect(q, i);
        if (ok) correct++;

        if (q.type === 'mcq' || q.type === 'tf') {
          const correctIdx = q.type === 'tf' ? (q.answer === true ? 0 : 1) : q.answer;
          wrap.querySelectorAll('.q-choice').forEach((n, ci) => {
            if (ci === correctIdx) n.classList.add('correct');
            else if (n.classList.contains('selected')) n.classList.add('incorrect');
          });
        }
        if (q.type === 'fill') {
          const input = wrap.querySelector('input');
          input.style.borderColor = ok ? 'var(--green)' : 'var(--red)';
          input.disabled = true;
        }

        fb.classList.add('show', ok ? 'right' : 'wrong');
        if (ok) {
          fb.textContent = '✓ Correct. ' + (q.explain || '');
        } else {
          let correctText = '';
          if (q.type === 'mcq') correctText = 'Correct answer: ' + q.choices[q.answer] + '. ';
          if (q.type === 'tf') correctText = 'Correct answer: ' + (q.answer ? 'True' : 'False') + '. ';
          if (q.type === 'fill') correctText = 'Correct answer: ' + q.answer[0] + '. ';
          fb.textContent = '✗ Not quite. ' + correctText + (q.explain || '');
        }
        wrap.classList.add(ok ? 'solved' : 'assess-missed');
      });

      this.submitted = true;
      this.submitBtn.style.display = 'none';

      const total = this.questions.length;
      const pct = Math.round((correct / total) * 100);
      const passed = correct / total >= this.passPct;

      this.resultBox.innerHTML = '';
      const box = el('div', 'assessment-score ' + (passed ? 'pass' : 'fail'));
      box.appendChild(el('div', 'assessment-score-num', correct + ' / ' + total + ' (' + pct + '%)'));
      box.appendChild(el('div', 'assessment-score-msg',
        passed
          ? '🎉 You passed! Great work — your certificate is ready below.'
          : 'So close! You need at least ' + Math.round(this.passPct * 100) + '% to earn your certificate. Review Day 1 &amp; 2, then try again.'
      ));
      if (!passed) {
        const retryBtn = el('button', 'btn btn-primary', 'Try Again');
        retryBtn.type = 'button';
        retryBtn.addEventListener('click', () => this.build());
        box.appendChild(retryBtn);
      }
      this.resultBox.appendChild(box);
      this.resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      if (passed && this.opts.storageKey) {
        if (window.Player) Player.pSet(this.opts.storageKey, '1');
        else { try { localStorage.setItem(this.opts.storageKey, '1'); } catch (e) {} }
        document.dispatchEvent(new CustomEvent('quiz-passed', { detail: { key: this.opts.storageKey } }));
      }
    }
  }

  window.mountAssessment = function (containerId, questions, opts) {
    const container = document.getElementById(containerId);
    if (!container) return;
    new Assessment(container, questions, opts);
  };
})();
