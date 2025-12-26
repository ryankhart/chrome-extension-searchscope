import { initializeStorage, getEnabledSearchSites, getSettings } from './modules/storage.js';

const PARENT_MENU_ID = 'custom-search-parent';

/**
 * Create context menu with all enabled search sites
 */
async function createContextMenu() {
  // Remove all existing menus first
  await chrome.contextMenus.removeAll();

  const settings = await getSettings();
  const sites = await getEnabledSearchSites();

  if (settings.useFlatMenu) {
    // Flat mode: Each site as top-level menu item
    for (const site of sites) {
      chrome.contextMenus.create({
        id: site.id,
        title: `Search ${site.name} for "%s"`,
        contexts: ['selection']
      });
    }
  } else {
    // Nested mode: Sites under parent menu
    chrome.contextMenus.create({
      id: PARENT_MENU_ID,
      title: 'Search for "%s"',
      contexts: ['selection']
    });

    for (const site of sites) {
      chrome.contextMenus.create({
        id: site.id,
        parentId: PARENT_MENU_ID,
        title: site.name,
        contexts: ['selection']
      });
    }
  }
}

/**
 * Handle context menu click
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const settings = await getSettings();

  // In flat mode, items have no parent. In nested mode, check parent.
  if (!settings.useFlatMenu && info.parentMenuItemId !== PARENT_MENU_ID) return;

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
  if (areaName === 'sync' && (changes.searchSites || changes.settings)) {
    createContextMenu();
  }
});

/**
 * Recreate menu when browser starts (extension already installed)
 */
chrome.runtime.onStartup.addListener(() => {
  createContextMenu();
});
