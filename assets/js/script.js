'use strict';

const sidebar = document.querySelector('[data-sidebar]');
const sidebarButton = document.querySelector('[data-sidebar-btn]');
const sidebarDetails = document.querySelector('#profile-details');
const desktopLayout = window.matchMedia('(min-width: 1250px)');

function updateSidebar() {
  const expanded = desktopLayout.matches || sidebar.classList.contains('active');
  sidebarButton.setAttribute('aria-expanded', String(expanded));
  sidebarDetails.inert = !expanded;
}
sidebarButton.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  updateSidebar();
});
desktopLayout.addEventListener('change', updateSidebar);
updateSidebar();

const pages = document.querySelectorAll('[data-page]');
const navigationLinks = document.querySelectorAll('[data-nav-link]');

document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  document.querySelector('#main-content').focus({ preventScroll: true });
  document.querySelector('#main-content').scrollIntoView({ block: 'start' });
});

function showPage(name, focus = false) {
  if (![...pages].some(page => page.dataset.page === name)) name = 'about';
  pages.forEach(page => {
    const active = page.dataset.page === name;
    page.classList.toggle('active', active);
    page.hidden = !active;
  });
  navigationLinks.forEach(link => {
    const active = link.dataset.navLink === name;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (focus) document.querySelector('#main-content').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.dispatchEvent(new Event('portfolio:pagechange'));
}
function navigate(name) {
  if (location.hash === '#' + name) showPage(name, true);
  else location.hash = name;
}
navigationLinks.forEach(link => link.addEventListener('click', () => navigate(link.dataset.navLink)));
document.querySelectorAll('[data-open-page]').forEach(link => {
  link.addEventListener('click', () => navigate(link.dataset.openPage));
});
window.addEventListener('hashchange', () => showPage(location.hash.slice(1), true));
showPage(location.hash.slice(1));

const projectItems = document.querySelectorAll('#all-projects [data-filter-item]');
const filterButtons = document.querySelectorAll('[data-filter]');
const categorySelect = document.querySelector('#category-select');
function filterProjects(category) {
  document.querySelectorAll('[data-portfolio-video]').forEach(video => video.pause());
  let count = 0;
  projectItems.forEach(item => {
    const visible = category === 'all' || item.dataset.category === category;
    item.hidden = !visible;
    item.classList.toggle('active', visible);
    if (visible) count++;
  });
  filterButtons.forEach(button => {
    const active = button.dataset.filter === category;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  categorySelect.value = category;
  const label = categorySelect.selectedOptions[0].textContent;
  document.querySelector('#project-count').textContent = label + ' · ' + count + ' 个作品';
  document.querySelector('#portfolio-empty').hidden = count !== 0;
}
filterButtons.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
categorySelect.addEventListener('change', () => filterProjects(categorySelect.value));
document.querySelector('[data-reset-filter]').addEventListener('click', () => filterProjects('all'));

// Keep dialogue from following the visitor into another project or page.
const portfolioVideos = document.querySelectorAll('[data-portfolio-video]');
portfolioVideos.forEach(video => {
  video.addEventListener('play', () => {
    portfolioVideos.forEach(other => { if (other !== video) other.pause(); });
  });
  const error = video.parentElement.querySelector('.ae-video-error');
  video.addEventListener('error', () => { error.hidden = false; });
  video.parentElement.querySelector('[data-portfolio-retry]').addEventListener('click', () => {
    error.hidden = true;
    video.load();
    video.play().catch(() => {});
  });
});
document.addEventListener('portfolio:pagechange', () => {
  if (document.querySelector('#page-portfolio').hidden) portfolioVideos.forEach(video => video.pause());
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) portfolioVideos.forEach(video => video.pause());
});

// Load and animate only visible AE previews; hidden pages never keep playing.
const aePage = document.querySelector('#page-ae');
const aeVideos = document.querySelectorAll('[data-ae-video]');
const aeToggle = document.querySelector('[data-ae-toggle]');
const aeVisible = new Set();
let aePaused = false;

function syncAePlayback() {
  aeToggle.textContent = aePaused ? '开启循环' : '暂停循环';
  aeToggle.setAttribute('aria-pressed', String(aePaused));
  aeVideos.forEach(video => {
    const visible = !aePage.hidden && !document.hidden && aeVisible.has(video);
    if (visible && !video.getAttribute('src')) {
      video.src = video.dataset.src;
      video.preload = 'metadata';
      video.muted = true;
    }
    if (visible && !aePaused) video.play().catch(() => {});
    else video.pause();
  });
}

const aeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) aeVisible.add(entry.target);
    else aeVisible.delete(entry.target);
  });
  syncAePlayback();
}, { threshold: 0.25 });

aeVideos.forEach(video => {
  aeObserver.observe(video);
  const error = video.parentElement.querySelector('.ae-video-error');
  video.addEventListener('error', () => { error.hidden = false; });
  video.parentElement.querySelector('[data-ae-retry]').addEventListener('click', () => {
    error.hidden = true;
    video.load();
    syncAePlayback();
  });
});
aeToggle.addEventListener('click', () => {
  aePaused = !aePaused;
  syncAePlayback();
});
document.addEventListener('visibilitychange', syncAePlayback);
document.addEventListener('portfolio:pagechange', () => {
  if (!aePage.hidden) aePaused = false;
  syncAePlayback();
});
syncAePlayback();
