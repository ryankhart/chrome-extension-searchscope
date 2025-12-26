import { initializeStorage, getEnabledSearchSites } from './modules/storage.js';
import { PARENT_MENU_ID } from './modules/config.js';

let isCreatingMenu = false;
let createMenuTimeout = null;

/**
 * Create context menu with all enabled search sites
 */
async function createContextMenu() {
  if (isCreatingMenu) {
    console.log('Menu creation already in progress, skipping');
    return;
  }
  isCreatingMenu = true;

  // Remove all existing menus first - use callback to ensure completion
  await new Promise((resolve) => {
    chrome.contextMenus.removeAll(() => {
      console.log('Removed all context menus');
      resolve();
    });
  });

  const sites = await getEnabledSearchSites();
  console.log('Creating context menu with', sites.length, 'enabled sites');

  if (sites.length === 0) {
    console.log('No enabled sites, skipping menu creation');
    return;
  }

  if (sites.length === 1) {
    // Single site: Create one top-level menu item
    console.log('Creating single top-level menu item');
    const site = sites[0];
    chrome.contextMenus.create({
      id: site.id,
      title: `Search ${site.name} for "%s"`,
      contexts: ['selection']
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to create context menu:', chrome.runtime.lastError);
      }
    });
  } else {
    // Multiple sites: Create nested menu
    console.log('Creating nested menu with', sites.length, 'items');
    chrome.contextMenus.create({
      id: PARENT_MENU_ID,
      title: 'Search for "%s"',
      contexts: ['selection']
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to create parent menu:', chrome.runtime.lastError);
      }
    });

    for (const site of sites) {
      chrome.contextMenus.create({
        id: site.id,
        parentId: PARENT_MENU_ID,
        title: site.name,
        contexts: ['selection']
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Failed to create menu item:', chrome.runtime.lastError);
        }
      });
    }
  }

  isCreatingMenu = false;
}

/**
 * Handle context menu click
 */
chrome.contextMenus.onClicked.addListener(async (info) => {
  // For nested menus, only handle clicks on child items
  // For single site, the item has no parent
  if (info.parentMenuItemId === PARENT_MENU_ID || !info.parentMenuItemId) {
    const sites = await getEnabledSearchSites();
    const site = sites.find(s => s.id === info.menuItemId);

    if (site && info.selectionText) {
      const searchText = encodeURIComponent(info.selectionText);
      const searchUrl = site.url.replace('%s', searchText);
      chrome.tabs.create({ url: searchUrl }, () => {
        if (chrome.runtime.lastError) {
          console.error('Failed to open search tab:', chrome.runtime.lastError);
        }
      });
    }
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
 * Rebuild context menu when storage changes (debounced to prevent race conditions)
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.searchSites) {
    // Debounce menu creation to handle rapid storage changes
    clearTimeout(createMenuTimeout);
    createMenuTimeout = setTimeout(() => {
      createContextMenu();
    }, 300);
  }
});

/**
 * Recreate menu when browser starts (extension already installed)
 */
chrome.runtime.onStartup.addListener(() => {
  createContextMenu();
});
