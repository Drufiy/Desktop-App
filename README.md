# Drufiy - Desktop App

This is a Next.js application converted to run as an Electron desktop app.

## Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Running in Development Mode

1. Install dependencies:
```bash
npm install
```

2. Start the development server with Electron:
```bash
npm run electron-dev
```

This will:
- Start the Next.js development server on port 3000
- Wait for the server to be ready
- Launch the Electron app

### Building for Production

1. Build the Next.js app and create Electron distribution:
```bash
npm run electron-dist
```

This will:
- Build the Next.js app to static files
- Package everything into an Electron app
- Create installers in the `dist` folder

### Available Scripts

- `npm run dev` - Start Next.js development server only
- `npm run build` - Build Next.js app for production
- `npm run start` - Start Next.js production server
- `npm run electron` - Run Electron app (requires built app)
- `npm run electron-dev` - Run in development mode with hot reload
- `npm run electron-pack` - Build and package for distribution
- `npm run electron-dist` - Build and create installers

## Project Structure

```
├── app/                 # Next.js app directory
├── components/          # React components
├── electron/           # Electron main process files
│   ├── main.js        # Main Electron process
│   └── preload.js     # Preload script for security
├── public/            # Static assets
├── out/               # Built Next.js app (generated)
└── dist/              # Electron distribution (generated)
```

## Customization

### App Icon
Replace `public/icon.png` with your own icon (256x256 pixels recommended).

### App Configuration
Edit `electron/main.js` to customize:
- Window size and properties
- Menu structure
- App behavior

### Build Configuration
Edit the `build` section in `package.json` to customize:
- App ID and name
- Build targets (Windows, macOS, Linux)
- Installer settings

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**: Make sure no other Next.js app is running on port 3000.

2. **Build errors**: Ensure all dependencies are installed with `npm install`.

3. **Electron not launching**: Check that the main.js file path is correct in package.json.

4. **Static export issues**: The Next.js config is set to export static files. Some server-side features may not work.

## Security Notes

- The app uses context isolation for security
- Node integration is disabled
- Remote content is blocked
- Only necessary APIs are exposed through the preload script

## License

This project is private and proprietary. 