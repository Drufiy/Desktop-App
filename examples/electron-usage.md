# Using Electron APIs in React Components

## Basic Setup

First, extend the preload script to expose the APIs you need:

```javascript
// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (data) => ipcRenderer.invoke('dialog:saveFile', data),
  
  // App information
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  // Window operations
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('notification:show', title, body),
});
```

## Using in React Components

```tsx
// components/FileHandler.tsx
import { useState } from 'react';

export function FileHandler() {
  const [filePath, setFilePath] = useState<string>('');

  const handleOpenFile = async () => {
    try {
      const result = await window.electronAPI.openFile();
      if (result) {
        setFilePath(result.filePath);
      }
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  };

  const handleSaveFile = async () => {
    try {
      const data = 'Hello from Electron!';
      await window.electronAPI.saveFile(data);
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  return (
    <div>
      <button onClick={handleOpenFile}>Open File</button>
      <button onClick={handleSaveFile}>Save File</button>
      {filePath && <p>Selected: {filePath}</p>}
    </div>
  );
}
```

## Window Controls

```tsx
// components/WindowControls.tsx
export function WindowControls() {
  const handleMinimize = () => {
    window.electronAPI.minimize();
  };

  const handleMaximize = () => {
    window.electronAPI.maximize();
  };

  return (
    <div className="window-controls">
      <button onClick={handleMinimize}>Minimize</button>
      <button onClick={handleMaximize}>Maximize</button>
    </div>
  );
}
```

## App Information

```tsx
// components/AppInfo.tsx
import { useState, useEffect } from 'react';

export function AppInfo() {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    const getVersion = async () => {
      const appVersion = await window.electronAPI.getAppVersion();
      setVersion(appVersion);
    };
    getVersion();
  }, []);

  return (
    <div>
      <p>App Version: {version}</p>
    </div>
  );
}
```

## TypeScript Support

Add type definitions for the Electron API:

```typescript
// types/electron.d.ts
export interface ElectronAPI {
  openFile: () => Promise<{ filePath: string } | null>;
  saveFile: (data: string) => Promise<void>;
  getAppVersion: () => Promise<string>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  showNotification: (title: string, body: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

## Main Process Handlers

Add these handlers to your `electron/main.js`:

```javascript
const { ipcMain, dialog, app, BrowserWindow } = require('electron');

// File dialog handlers
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile']
  });
  return result.canceled ? null : result;
});

ipcMain.handle('dialog:saveFile', async (event, data) => {
  const result = await dialog.showSaveDialog({
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  });
  if (!result.canceled) {
    // Save file logic here
    require('fs').writeFileSync(result.filePath, data);
  }
});

// App info handlers
ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

// Window handlers
ipcMain.handle('window:minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.minimize();
});

ipcMain.handle('window:maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});
```

## Best Practices

1. **Always use `ipcRenderer.invoke()`** for request-response patterns
2. **Handle errors gracefully** in your React components
3. **Keep the preload script minimal** - only expose what you need
4. **Use TypeScript** for better type safety
5. **Test thoroughly** - desktop APIs can behave differently than web APIs

## Security Notes

- Never expose `require()` or `process` to the renderer
- Always validate input data from the renderer
- Use context isolation (already configured)
- Keep Node integration disabled (already configured) 