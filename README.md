![SearchScout Icon](icons/icon128.png)

# SearchScout

Search selected text across multiple engines.

A Chrome extension that adds a right-click context menu to search selected text across multiple customizable search engines.

## Features

- **Right-click search**: Select any text on a webpage and search it instantly
- **Smart menu**: Automatically uses single top-level item for one site, nested menu for multiple
- **Pre-configured defaults**: Google, DuckDuckGo, Bing, Wikipedia, GitHub, Stack Overflow, YouTube
- **Fully customizable**: Add your own search sites with `%s` placeholder for search terms
- **Enable/disable sites**: Toggle visibility of any search engine
- **Drag-and-drop reordering**: Arrange search sites in your preferred order
- **Cross-device sync**: Settings sync across your Chrome browsers

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the extension folder

## Usage

### Searching

1. Select any text on a webpage
2. Right-click to open the context menu
3. Click your search option:
   - **One enabled site**: Direct top-level item (e.g., "Search Google for...")
   - **Multiple enabled sites**: Nested submenu under "Search for..."

### Managing Search Sites

1. Click the extension icon in the toolbar
2. From the popup, you can:
   - **Add**: Click the + button to add a new search site
   - **Edit**: Click the pencil icon to modify a site
   - **Delete**: Click the X icon to remove custom sites (defaults cannot be deleted)
   - **Toggle**: Use the switch to enable/disable a site
   - **Reorder**: Drag and drop sites to change their order

### Smart Menu Behavior

The extension automatically adapts the context menu structure:
- **1 enabled site**: Shows as a single top-level menu item (cleanest UX, no nesting)
- **2+ enabled sites**: Groups them under a "Search for..." submenu

**Note for Edge users**: Microsoft Edge automatically groups extension menu items under the extension name, adding one level of nesting regardless of this behavior.

### Adding Custom Search Sites

When adding a new search site, you need:

- **Name**: A display name for the context menu (e.g., "Reddit")
- **URL**: The search URL with `%s` as placeholder for the search term

Example URLs:
- Reddit: `https://www.reddit.com/search/?q=%s`
- Amazon: `https://www.amazon.com/s?k=%s`
- MDN: `https://developer.mozilla.org/en-US/search?q=%s`

## Development

### Project Structure

```
chrome-extension-searchscope/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for context menus
├── popup/
│   ├── popup.html         # Popup UI
│   ├── popup.css          # Popup styling
│   └── popup.js           # Popup logic
├── modules/
│   ├── storage.js         # Storage abstraction
│   └── defaults.js        # Default search engines
└── icons/                 # Extension icons
```

### Technologies

- Manifest V3
- Chrome Storage Sync API
- Chrome Context Menus API
- ES6 Modules

## Attribution

<a href="https://www.flaticon.com/free-icons/binoculars" title="binoculars icons">Extension icon created by smashingstocks - Flaticon</a>

## License

MIT
