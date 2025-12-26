# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SearchScout is a Chrome extension (Manifest V3) that adds right-click context menu search functionality. Users can select text and search it across multiple configurable search engines.

## Development

No build step required - this is vanilla JavaScript with ES6 modules. To test changes:

1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked" and select the project folder
4. After code changes, click the refresh icon on the extension card

## Architecture

**Data Flow**: Storage changes trigger context menu rebuilds automatically via `chrome.storage.onChanged`.

**Key Components**:

- [background.js](background.js) - Service worker that manages context menus. Creates either a single top-level menu item (1 enabled site) or nested submenu (2+ sites). Listens for storage changes to rebuild menus dynamically.

- [modules/storage.js](modules/storage.js) - Chrome Storage Sync API wrapper. All CRUD operations for search sites. Sites have `id`, `name`, `url`, `enabled`, `isDefault`, and `order` properties.

- [modules/defaults.js](modules/defaults.js) - Predefined search engines (Google, DuckDuckGo, Bing, Wikipedia, GitHub, Stack Overflow, YouTube). Default sites cannot be deleted via UI.

- [popup/popup.js](popup/popup.js) - Popup UI logic with drag-and-drop reordering, modal forms for add/edit, and toggle switches for enable/disable.

**Search URL Format**: URLs use `%s` as placeholder for the search term (e.g., `https://google.com/search?q=%s`).

## Extension Permissions

- `contextMenus` - Right-click menu creation
- `storage` - Chrome sync storage for cross-device settings

## Packaging

To package the extension for Chrome Web Store distribution:

```powershell
.\package.ps1
```

Creates `SearchScout-1.0.0.zip` with only runtime files (excludes development files, screenshots, etc.). When updating the version, ensure the version number matches in both [manifest.json](manifest.json#L4) and [package.ps1](package.ps1#L5).

## Store Listing Images

To generate promotional screenshots for the Chrome Web Store:

```bash
python create-store-images.py
```

Processes raw screenshots from `screenshots/` directory and creates polished 1280x800px images in `screenshots/store-listing/` with gradients, shadows, rounded corners, and annotations. Requires Python 3 with Pillow (PIL).
