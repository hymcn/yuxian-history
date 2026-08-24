/* 影印图谱：灯箱放大 + 关键字检索（纯前端，无依赖） */
(function () {
  var base = document.documentElement.getAttribute('data-base-url') || '';
  if (base && base.charAt(base.length - 1) !== '/') base += '/';

  /* ---------- 灯箱 ---------- */
  function openLightbox(src) {
    var ov = document.getElementById('lk-overlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'lk-overlay';
      ov.innerHTML = '<div class="lk-close">×</div><img class="lk-img" alt="">';
      document.body.appendChild(ov);
      ov.addEventListener('click', function () { ov.classList.remove('open'); });
    }
    ov.querySelector('.lk-img').src = src;
    ov.classList.add('open');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href$=".jpg"]');
    if (a && a.querySelector('img')) {
      e.preventDefault();
      openLightbox(a.getAttribute('href'));
    }
  });

  /* ---------- 仅图谱页启用检索 ---------- */
  if (location.pathname.indexOf('/图谱') === -1) return;

  var box = document.createElement('div');
  box.className = 'gallery-search';
  box.innerHTML = '<input type="search" placeholder="检索影印页 OCR 文字（如：代王城、玉皇阁）" />' +
                  '<span class="gallery-count"></span>';
  var content = document.querySelector('.md-content article') || document.querySelector('.md-typeset');
  if (content) content.insertBefore(box, content.firstChild);

  var input = box.querySelector('input');
  var count = box.querySelector('.gallery-count');

  /* 拉取 OCR 索引 */
  fetch(base + 'assets/scan/index.json').then(function (r) { return r.json(); }).then(function (data) {
    var map = {};
    data.forEach(function (d) { map[d.p] = d.ocr || ''; });
    var links = Array.prototype.slice.call(document.querySelectorAll('a[href$=".jpg"]'));
    links.forEach(function (a) {
      var m = a.getAttribute('href').match(/full\/(\d+)\.jpg$/);
      var p = m ? parseInt(m[1], 10) : 0;
      a.setAttribute('data-ocr', (map[p] || '').toLowerCase());
      a.setAttribute('data-page', 'P' + ('00' + p).slice(-3));
    });

    function apply(q) {
      q = q.trim().toLowerCase();
      var shown = 0;
      links.forEach(function (a) {
        var hit = !q || a.getAttribute('data-ocr').indexOf(q) !== -1 || a.getAttribute('data-page').toLowerCase().indexOf(q) !== -1;
        a.style.display = hit ? '' : 'none';
        if (hit) shown++;
      });
      count.textContent = q ? ('命中 ' + shown + ' 页') : '';
    }
    input.addEventListener('input', function () { apply(input.value); });
    apply('');
  });
})();
