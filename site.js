const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');
function closeMenu() {
  mainNav?.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  mainNav.classList.toggle('is-open', open);
});
mainNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.nav')) closeMenu();
});

const artDialog = document.querySelector('.art-dialog');
let lastArtLink;
if (artDialog && typeof artDialog.showModal === 'function') {
  document.querySelectorAll('.art-open').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    lastArtLink = link;
    const image = artDialog.querySelector('.dialog-image');
    image.src = link.querySelector('img').currentSrc || link.querySelector('img').src;
    image.alt = link.querySelector('img').alt;
    artDialog.querySelector('#art-dialog-title').textContent = link.dataset.artTitle;
    const description = artDialog.querySelector('#jewelry-dialog-description');
    if (description) description.textContent = link.dataset.artDescription || '';
    const status = artDialog.querySelector('.jewelry-copy-status');
    if (status) status.textContent = '';
    artDialog.classList.remove('is-zoomed');
    const zoomButton = artDialog.querySelector('.jewelry-zoom');
    if (zoomButton) { zoomButton.setAttribute('aria-pressed', 'false'); zoomButton.textContent = '細部を拡大'; }
    artDialog.showModal();
    artDialog.scrollTop = 0;
  }));
  artDialog.querySelector('.dialog-close').addEventListener('click', () => artDialog.close());
  artDialog.addEventListener('click', event => {
    if (event.target !== artDialog) return;
    const bounds = artDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) artDialog.close();
  });
  artDialog.addEventListener('close', () => lastArtLink?.focus({ preventScroll: true }));
}

const jewelryFilters = document.querySelector('.jewelry-filters');
if (artDialog?.classList.contains('jewelry-dialog')) {
  const zoomButton = document.createElement('button');
  zoomButton.type = 'button';
  zoomButton.className = 'jewelry-zoom dialog-close';
  zoomButton.textContent = '細部を拡大';
  zoomButton.setAttribute('aria-pressed', 'false');
  zoomButton.addEventListener('click', () => {
    const zoomed = artDialog.classList.toggle('is-zoomed');
    zoomButton.setAttribute('aria-pressed', String(zoomed));
    zoomButton.textContent = zoomed ? '全体を表示' : '細部を拡大';
    artDialog.scrollTop = 0;
  });
  artDialog.querySelector('.dialog-bar').insertBefore(zoomButton, artDialog.querySelector('.dialog-close'));
}
if (jewelryFilters) {
  jewelryFilters.hidden = false;
  const cards = [...document.querySelectorAll('.jewelry-card')];
  jewelryFilters.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.jewelryFilter;
    jewelryFilters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach(card => { card.hidden = selected !== 'all' && card.dataset.jewelryCategory !== selected; });
    const count = cards.filter(card => !card.hidden).length;
    document.querySelector('.collection-count').textContent = selected === 'all' ? `全${count}作品` : `${button.childNodes[0].textContent} · ${count}作品`;
  }));
}
document.querySelector('.jewelry-copy-title')?.addEventListener('click', async () => {
  const title = artDialog.querySelector('#art-dialog-title');
  const status = artDialog.querySelector('.jewelry-copy-status');
  try {
    await navigator.clipboard.writeText(title.textContent);
    status.textContent = '作品名をコピーしました。Instagramのメッセージに添えてお使いください。';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(title);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = '作品名を選択しました。端末のコピー操作をご利用ください。';
  }
});

// A small deterrent, not access control: never disable text selection, browser
// shortcuts, zoom, or context menus elsewhere on the site.
document.querySelectorAll('img[src*="assets/gallery/"]').forEach(image => {
  image.classList.add('artwork-image');
  image.draggable = false;
});
for (const eventName of ['contextmenu', 'dragstart']) {
  document.addEventListener(eventName, event => {
    if (event.target instanceof Element && event.target.closest('.artwork-image, .art-open, .gallery-teaser, .hero-art a, .original-art')) event.preventDefault();
  });
}

const serviceSelect = document.querySelector('#inquiry-service');
const message = document.querySelector('#inquiry-message');
const copyButton = document.querySelector('#copy-message');
const copyStatus = document.querySelector('.copy-status');
const requestTopics = {
  jewelry: ['天然石アクセサリー', '気になっている作品・色', 'サイズやご用途'],
  'pet-portrait': ['ペット肖像画', 'お名前・頭数', 'お写真や背景のご希望'],
  'aura-session': ['オーラセッション', 'ご相談したいこと', 'ご希望の日時・参加方法'],
  'oracle-cards': ['オラクルカード', '知りたいこと', '気になっている作品'],
  art: ['作品について', '作品名', 'ご相談したいこと']
};
function setInquiryTemplate() {
  const [name, first, second] = requestTopics[serviceSelect.value];
  message.value = `こんにちは。${name}について相談したく、ご連絡しました。\n\n・${first}：\n・${second}：\n・ご希望の時期やご予算（あれば）：\n\n詳しいご案内をいただけますと幸いです。`;
  copyStatus.textContent = '';
}
if (serviceSelect) {
  const selected = new URLSearchParams(location.search).get('service');
  if (Object.hasOwn(requestTopics, selected)) serviceSelect.value = selected;
  setInquiryTemplate();
  serviceSelect.addEventListener('change', setInquiryTemplate);
  copyButton.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(message.value);
      copyStatus.textContent = 'コピーしました。Instagramのメッセージに貼り付けてお使いください。';
    } catch {
      message.focus();
      message.select();
      copyStatus.textContent = '文章を選択しました。端末のコピー操作でコピーしてください。';
    }
  });
}
