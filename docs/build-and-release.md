---
summary: "Guide on building Tudu for production and the release process, including macOS notarization."
read_when:
  - You are preparing a new release of the application.
  - You need to troubleshoot build issues or notarization errors.
title: "Build and Release"
---

# Build and Release

Tudu uses `electron-builder` to package the application for production. The primary target is macOS (`.dmg` and `.zip`).

## Build Workflow

The build process is defined in `package.json` under the `build` script. It involves:
1.  **Building the Renderer**: Compiling the React/Vite frontend.
2.  **Building the Main Process**: Compiling the Electron entry points.
3.  **Packaging**: Using `electron-builder` to create the final artifacts.

```bash
npm run build
```

## macOS Notarization

To distribute the app outside of the Mac App Store, it must be signed and notarized by Apple.

### Prerequisites
You need an Apple Developer ID certificate and the following environment variables set in a `.env` file:

- `APPLE_ID`: Your Apple ID email.
- `APPLE_APP_SPECIFIC_PASSWORD`: An app-specific password (generated at appleid.apple.com).
- `APPLE_TEAM_ID`: Your 10-character Team ID.

### Automated Process
The `electron-builder` configuration is set up to automatically trigger the notarization process during the build if these environment variables are present.

## Artifacts
Final build artifacts are placed in the `dist/` directory:
- `Tudu-X.Y.Z-arm64.dmg`: Apple Silicon installer.
- `Tudu-X.Y.Z-arm64-mac.zip`: Portable Apple Silicon binary.

## Continuous Integration
Future releases may be automated via GitHub Actions, using the `.github/workflows/bash` configurations (if available).
