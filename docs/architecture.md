---
summary: "Overview of the technical architecture of Tudu, explaining how Electron, Vite, and SQLite interact."
read_when:
  - You want to understand the high-level design of the application.
  - You are curious about how the main and renderer processes communicate.
title: "Architecture Overview"
---

# Architecture Overview

Tudu is built as a cross-platform desktop application using **Electron**. It follows a standard Electron architecture with a separation between the **Main Process** and the **Renderer Process**.

## Main Process

The Main Process (`electron/main.ts`) manages the application lifecycle, window management, and native system integrations. It also handles the **SQLite database** operations using `better-sqlite3`.

Key responsibilities:
- Window creation and management.
- Protocol handling and deep linking (if applicable).
- Database persistence and migrations.
- Responding to IPC (Inter-Process Communication) requests from the renderer.

## Renderer Process

The Renderer Process is the frontend of the application, built with **React** and **Vite**. It handles the user interface and user interactions.

Key components:
- **React**: Component-based UI logic.
- **Tailwind CSS**: Styling and layout.
- **Lucide**: Icon sets.
- **Vite**: Ultra-fast build tool and dev server.

## Inter-Process Communication (IPC)

Communication between the Renderer and Main processes is handled through a **Preload Script** (`electron/preload.ts`). This script exposes a safe, restricted API to the renderer via `contextBridge`.

Example flow:
1.  **Renderer**: Calls `window.electronAPI.getCards()`.
2.  **Preload**: Sends an IPC message to the Main process.
3.  **Main**: Executes the SQL query and returns the results.
4.  **Renderer**: Receives the data and updates the React state.

## Tech Stack Summary

- **Framework**: Electron
- **Frontend Logic**: React (with Hooks)
- **Bundler**: Vite
- **Database**: SQLite (via `better-sqlite3`)
- **Styling**: Tailwind CSS + Shadcn UI
