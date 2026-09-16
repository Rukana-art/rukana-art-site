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
    artDialog.showModal();
  }));
  artDialog.querySelector('.dialog-close').addEventListener('click', () => artDialog.close());
  artDialog.addEventListener('click', event => {
    if (event.target !== artDialog) return;
    const bounds = artDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) artDialog.close();
  });
  artDialog.addEventListener('close', () => lastArtLink?.focus({ preventScroll: true }));
}

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
