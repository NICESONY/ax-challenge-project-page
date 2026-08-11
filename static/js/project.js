document.addEventListener('DOMContentLoaded', () => {
  setupReveal();
  setupLightbox();
  setupComparisonSlots();
});

function setupReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.08,
  });

  items.forEach((item) => observer.observe(item));
}

function setupLightbox() {
  const dialog = document.getElementById('lightbox');
  if (!dialog) return;

  const dialogImage = dialog.querySelector('img');
  const dialogCaption = dialog.querySelector('p');
  const closeButton = dialog.querySelector('button');

  document.querySelectorAll('[data-lightbox]').forEach((figure) => {
    const previewImage = figure.querySelector('img');
    figure.setAttribute('tabindex', '0');
    figure.setAttribute('role', 'button');
    figure.setAttribute('aria-label', `${previewImage?.alt || '연구 그림'} 크게 보기`);

    const open = () => {
      const image = figure.querySelector('img');
      if (!image) return;
      dialogImage.src = image.currentSrc || image.src;
      dialogImage.alt = image.alt || '';
      dialogCaption.textContent = figure.querySelector('figcaption')?.textContent.trim() || '';
      if (typeof dialog.showModal === 'function') dialog.showModal();
    };

    figure.addEventListener('click', open);
    figure.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });
}

async function setupComparisonSlots() {
  const cards = document.querySelectorAll('[data-comparison-src]');
  await Promise.all(Array.from(cards, async (card) => {
    const source = card.dataset.comparisonSrc;
    const video = card.querySelector('video');
    if (!source || !video || window.location.protocol === 'file:') return;

    try {
      const response = await fetch(source, { method: 'HEAD', cache: 'no-store' });
      if (!response.ok) return;
      video.src = source;
      card.classList.add('has-video');
      video.load();
      if (video.autoplay) video.play().catch(() => {});
    } catch (_) {
      // The explicit placeholder is the intended state until a matched A/B video exists.
    }
  }));
}
