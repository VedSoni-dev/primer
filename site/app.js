/* primer — site behaviour. No dependencies, no network calls. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── reveal on scroll ──────────────────────────────── */
  var revealables = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        revealer.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* ── record readout: lines print one at a time ─────── */
  var record = document.querySelector('[data-record]');
  if (record) {
    var lines = record.querySelectorAll('[data-line]');
    var printed = false;
    var print = function () {
      if (printed) return;
      printed = true;
      if (reduced) {
        lines.forEach(function (l) { l.classList.add('in'); });
        return;
      }
      lines.forEach(function (l, i) {
        setTimeout(function () { l.classList.add('in'); }, i * 260);
      });
    };
    if (!('IntersectionObserver' in window)) {
      print();
    } else {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          print();
          obs.disconnect();
        });
      }, { threshold: 0.3 }).observe(record);
    }
  }

  /* ── scale block: counters + swarm of dots ─────────── */
  var scale = document.querySelector('[data-scale]');
  if (scale) {
    var swarm = scale.querySelector('.grid-swarm');
    var DOTS = 620;
    if (swarm) {
      var frag = document.createDocumentFragment();
      for (var i = 0; i < DOTS; i++) frag.appendChild(document.createElement('i'));
      swarm.appendChild(frag);
    }

    var fmt = function (n) {
      if (n >= 1000000) return (n / 1000000).toFixed(n >= 10000000 ? 0 : 1).replace(/\.0$/, '') + 'M';
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    var run = function () {
      var counters = scale.querySelectorAll('[data-count-to]');
      counters.forEach(function (el) {
        var target = parseInt(el.getAttribute('data-count-to'), 10);
        if (reduced) { el.textContent = fmt(target); return; }
        var start = performance.now();
        var dur = 1600;
        var step = function (now) {
          var p = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });

      if (!swarm) return;
      var dots = swarm.querySelectorAll('i');
      if (reduced) {
        dots.forEach(function (d) { d.classList.add('on', 'hot'); });
        return;
      }
      dots.forEach(function (d, idx) {
        setTimeout(function () {
          d.classList.add('on');
          setTimeout(function () { d.classList.add('hot'); }, 900 + Math.random() * 1400);
        }, idx * 3.2);
      });
    };

    var started = false;
    var kick = function () { if (!started) { started = true; run(); } };
    if (!('IntersectionObserver' in window)) {
      kick();
    } else {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          kick();
          obs.disconnect();
        });
      }, { threshold: 0.25 }).observe(scale);
    }
  }

  /* ── hero install line: click to copy ──────────────── */
  var code = document.querySelector('.hero-code');
  if (code && navigator.clipboard) {
    code.style.cursor = 'copy';
    code.title = 'click to copy';
    code.addEventListener('click', function () {
      navigator.clipboard.writeText(code.textContent.trim()).then(function () {
        var was = code.textContent;
        code.textContent = '# copied';
        setTimeout(function () { code.textContent = was; }, 1200);
      }).catch(function () { /* clipboard blocked; leave the text alone */ });
    });
  }
})();
