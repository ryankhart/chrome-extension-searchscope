import { DEFAULT_SEARCH_SITES } from './defaults.js';

const STORAGE_KEY = 'searchSites';

/**
 * Get all search sites from storage
 * @returns {Promise<Array>} Array of search site objects
 */
export async function getSearchSites() {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    return result[STORAGE_KEY] || [];
  } catch (error) {
    console.error('Error getting search sites:', error);
    return [];
  }
}

/**
 * Save all search sites to storage
 * @param {Array} sites - Array of search site objects
 * @returns {Promise<void>}
 */
export async function saveSearchSites(sites) {
  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: sites });
  } catch (error) {
    console.error('Error saving search sites:', error);
    throw error;
  }
}

/**
 * Add a new search site
 * @param {Object} site - Search site object (without id)
 * @returns {Promise<Object>} The created site with generated id
 */
export async function addSearchSite(site) {
  const sites = await getSearchSites();
  const newSite = {
    ...site,
    id: crypto.randomUUID(),
    isDefault: false,
    order: sites.length
  };
  sites.push(newSite);
  await saveSearchSites(sites);
  return newSite;
}

/**
 * Update an existing search site
 * @param {string} id - Site id to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated site or null if not found
 */
export async function updateSearchSite(id, updates) {
  const sites = await getSearchSites();
  const index = sites.findIndex(site => site.id === id);
  if (index === -1) return null;

  sites[index] = { ...sites[index], ...updates };
  await saveSearchSites(sites);
  return sites[index];
}

/**
 * Delete a search site
 * @param {string} id - Site id to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteSearchSite(id) {
  const sites = await getSearchSites();
  const index = sites.findIndex(site => site.id === id);
  if (index === -1) return false;

  sites.splice(index, 1);
  // Reorder remaining sites
  sites.forEach((site, i) => site.order = i);
  await saveSearchSites(sites);
  return true;
}

/**
 * Initialize storage with default search sites if empty
 * @returns {Promise<void>}
 */
export async function initializeStorage() {
  const sites = await getSearchSites();
  if (sites.length === 0) {
    await saveSearchSites([...DEFAULT_SEARCH_SITES]);
  }
}

/**
 * Get only enabled search sites, sorted by order
 * @returns {Promise<Array>} Array of enabled search sites
 */
export async function getEnabledSearchSites() {
  const sites = await getSearchSites();
  return sites
    .filter(site => site.enabled)
    .sort((a, b) => a.order - b.order);
}
