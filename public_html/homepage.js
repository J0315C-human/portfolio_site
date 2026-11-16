/* Native horizontal scrolling; the background retains its vertical scroll handler. */
(function () {
  var track = document.getElementById('project-gallery');
  if (!track) return;
  var controls = document.querySelector('.gallery-buttons');
  var previous = controls.querySelector('[data-gallery-direction="-1"]');
  var next = controls.querySelector('[data-gallery-direction="1"]');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var scheduled = false;

  function updateControls() {
    var end = Math.max(0, track.scrollWidth - track.clientWidth);
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= end - 2;
    scheduled = false;
  }

  function move(direction) {
    var card = track.querySelector('.gallery-item');
    var step = card.getBoundingClientRect().width + 20;
    track.scrollBy({
      left: direction * step,
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  }

  controls.addEventListener('click', function (event) {
    var button = event.target.closest('button');
    if (button) move(Number(button.getAttribute('data-gallery-direction')));
  });
  track.addEventListener('keydown', function (event) {
    if (event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  track.addEventListener('scroll', function () {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(updateControls);
    }
  }, { passive: true });
  window.addEventListener('resize', updateControls);
  controls.hidden = false;
  updateControls();
})();
