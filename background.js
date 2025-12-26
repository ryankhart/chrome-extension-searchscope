import { initializeStorage, getEnabledSearchSites } from './modules/storage.js';

const PARENT_MENU_ID = 'custom-search-parent';

/**
 * Create context menu with all enabled search sites
 */
async function createContextMenu() {
  // Remove all existing menus first
  await chrome.contextMenus.removeAll();

  // Create parent menu item
  chrome.contextMenus.create({
    id: PARENT_MENU_ID,
    title: 'Search for "%s"',
    contexts: ['selection']
  });

  // Get enabled search sites and create child menu items
  const sites = await getEnabledSearchSites();
  for (const site of sites) {
    chrome.contextMenus.create({
      id: site.id,
      parentId: PARENT_MENU_ID,
      title: site.name,
      contexts: ['selection']
    });
  }
}

/**
 * Handle context menu click
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.parentMenuItemId !== PARENT_MENU_ID) return;

  const sites = await getEnabledSearchSites();
  const site = sites.find(s => s.id === info.menuItemId);

  if (site && info.selectionText) {
    const searchText = encodeURIComponent(info.selectionText);
    const searchUrl = site.url.replace('%s', searchText);
    chrome.tabs.create({ url: searchUrl });
  }
});

/**
 * Initialize on extension install/update
 */
chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorage();
  await createContextMenu();
});

/**
 * Rebuild context menu when storage changes
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.searchSites) {
    createContextMenu();
  }
});

// Also create menu on service worker startup (in case it was terminated)
createContextMenu();
