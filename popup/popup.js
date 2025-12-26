import { getSearchSites, saveSearchSites, addSearchSite, updateSearchSite, deleteSearchSite, getSettings, saveSettings } from '../modules/storage.js';

// DOM Elements
const sitesList = document.getElementById('sitesList');
const emptyState = document.getElementById('emptyState');
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const siteForm = document.getElementById('siteForm');
const siteName = document.getElementById('siteName');
const siteUrl = document.getElementById('siteUrl');
const errorMsg = document.getElementById('errorMsg');
const cancelBtn = document.getElementById('cancelBtn');
const flatMenuToggle = document.getElementById('flatMenuToggle');

let editingId = null;
let draggedItem = null;

/**
 * Initialize popup
 */
async function init() {
  await loadSites();
  await loadSettings();
  setupEventListeners();
}

/**
 * Load and render all sites
 */
async function loadSites() {
  const sites = await getSearchSites();

  if (sites.length === 0) {
    sitesList.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  sitesList.classList.remove('hidden');
  emptyState.classList.add('hidden');

  // Sort by order
  sites.sort((a, b) => a.order - b.order);

  sitesList.innerHTML = '';
  sites.forEach(site => {
    sitesList.appendChild(createSiteElement(site));
  });
}

/**
 * Load and apply settings
 */
async function loadSettings() {
  const settings = await getSettings();
  flatMenuToggle.checked = settings.useFlatMenu || false;
}

/**
 * Handle flat menu toggle change
 */
async function handleFlatMenuToggle() {
  const settings = await getSettings();
  settings.useFlatMenu = flatMenuToggle.checked;
  await saveSettings(settings);
}

/**
 * Create DOM element for a site
 */
function createSiteElement(site) {
  const div = document.createElement('div');
  div.className = 'site-item';
  div.dataset.id = site.id;
  div.draggable = true;

  div.innerHTML = `
    <span class="drag-handle" title="Drag to reorder">&#8942;&#8942;</span>
    <div class="site-info">
      <div class="site-name">${escapeHtml(site.name)}</div>
      <div class="site-url">${escapeHtml(site.url)}</div>
    </div>
    <div class="site-actions">
      <label class="toggle" title="${site.enabled ? 'Disable' : 'Enable'}">
        <input type="checkbox" ${site.enabled ? 'checked' : ''}>
        <span class="toggle-slider"></span>
      </label>
      <button class="btn-action edit" title="Edit">&#9998;</button>
      <button class="btn-action delete" title="Delete" ${site.isDefault ? 'disabled' : ''}>&#10005;</button>
    </div>
  `;

  // Event listeners
  const toggle = div.querySelector('.toggle input');
  toggle.addEventListener('change', () => handleToggle(site.id, toggle.checked));

  const editBtn = div.querySelector('.edit');
  editBtn.addEventListener('click', () => openEditModal(site));

  const deleteBtn = div.querySelector('.delete');
  if (!site.isDefault) {
    deleteBtn.addEventListener('click', () => handleDelete(site.id, site.name));
  }

  // Drag and drop
  div.addEventListener('dragstart', handleDragStart);
  div.addEventListener('dragend', handleDragEnd);
  div.addEventListener('dragover', handleDragOver);
  div.addEventListener('drop', handleDrop);

  return div;
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
  addBtn.addEventListener('click', openAddModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  siteForm.addEventListener('submit', handleSubmit);
  flatMenuToggle.addEventListener('change', handleFlatMenuToggle);
}

/**
 * Open modal for adding new site
 */
function openAddModal() {
  editingId = null;
  modalTitle.textContent = 'Add Search Site';
  siteName.value = '';
  siteUrl.value = '';
  hideError();
  modal.classList.remove('hidden');
  siteName.focus();
}

/**
 * Open modal for editing existing site
 */
function openEditModal(site) {
  editingId = site.id;
  modalTitle.textContent = 'Edit Search Site';
  siteName.value = site.name;
  siteUrl.value = site.url;
  hideError();
  modal.classList.remove('hidden');
  siteName.focus();
}

/**
 * Close modal
 */
function closeModal() {
  modal.classList.add('hidden');
  editingId = null;
}

/**
 * Handle form submission
 */
async function handleSubmit(e) {
  e.preventDefault();

  const name = siteName.value.trim();
  const url = siteUrl.value.trim();

  // Validate
  const error = validateSite(name, url);
  if (error) {
    showError(error);
    return;
  }

  try {
    if (editingId) {
      await updateSearchSite(editingId, { name, url });
    } else {
      await addSearchSite({ name, url, enabled: true });
    }
    closeModal();
    await loadSites();
  } catch (err) {
    showError('Failed to save. Please try again.');
  }
}

/**
 * Validate site data
 */
function validateSite(name, url) {
  if (!name) return 'Name is required.';
  if (name.length > 50) return 'Name must be 50 characters or less.';
  if (!url) return 'URL is required.';

  // Check URL format
  try {
    new URL(url);
  } catch {
    return 'Please enter a valid URL.';
  }

  // Check for http/https
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'URL must start with http:// or https://';
  }

  // Check for %s placeholder
  const placeholderCount = (url.match(/%s/g) || []).length;
  if (placeholderCount === 0) {
    return 'URL must contain %s placeholder for search term.';
  }
  if (placeholderCount > 1) {
    return 'URL should contain only one %s placeholder.';
  }

  return null;
}

/**
 * Handle toggle enable/disable
 */
async function handleToggle(id, enabled) {
  await updateSearchSite(id, { enabled });
}

/**
 * Handle delete
 */
async function handleDelete(id, name) {
  if (confirm(`Delete "${name}"?`)) {
    await deleteSearchSite(id);
    await loadSites();
  }
}

/**
 * Drag and drop handlers
 */
function handleDragStart(e) {
  draggedItem = e.currentTarget;
  draggedItem.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd() {
  if (draggedItem) {
    draggedItem.classList.remove('dragging');
    draggedItem = null;
  }
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

async function handleDrop(e) {
  e.preventDefault();
  const target = e.currentTarget;

  if (!draggedItem || draggedItem === target) return;

  const items = [...sitesList.querySelectorAll('.site-item')];
  const draggedIndex = items.indexOf(draggedItem);
  const targetIndex = items.indexOf(target);

  if (draggedIndex < targetIndex) {
    target.after(draggedItem);
  } else {
    target.before(draggedItem);
  }

  // Update order in storage
  await updateOrder();
}

/**
 * Update order after drag and drop
 */
async function updateOrder() {
  const items = [...sitesList.querySelectorAll('.site-item')];
  const sites = await getSearchSites();

  items.forEach((item, index) => {
    const site = sites.find(s => s.id === item.dataset.id);
    if (site) site.order = index;
  });

  await saveSearchSites(sites);
}

/**
 * Show error message
 */
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError() {
  errorMsg.classList.add('hidden');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
