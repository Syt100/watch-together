# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a "watch together" web application that allows users to synchronize video playback across multiple clients. The project consists of:

- **Client**: Vue 3 + Vite frontend application with video player functionality
- **Server**: Node.js Express server with Socket.IO for real-time communication
- **Docker**: Multi-stage build configuration for production deployment

### Key Components

**Client (`/client`)**:
- Vue 3 with Vite build system
- ArtPlayer for video playback with support for HLS, DASH, and MPEG-TS streams
- Socket.IO client for real-time synchronization
- Pinia for state management with persistence
- Naive UI component library with auto-import
- Git-based build information generation

**Server (`/server`)**:
- Express.js static file serving
- Socket.IO server for broadcasting video control events
- SPA routing support
- Environment-aware debug logging

## Development Commands

### Root Level
- `npm run dev` - Start both client and server concurrently
- `npm run dev:client` - Start client development server only
- `npm run dev:server` - Start server in development mode
- `npm run build` - Build client for production (outputs to server/static)
- `npm run start:server:ts` - Start server using ts-node (TypeScript mode)

### Client (`/client`)
- `npm run dev` - Vite development server
- `npm run build` - Build for production
- `npm run build:server` - Build and output to ../server/static
- `npm run preview` - Preview production build
- `npm run lint` - ESLint with auto-fix

### Server (`/server`)
- `npm run start` - Start production server
- `npm run dev` - Start development server with debug logging

## Key Technical Details

### Real-time Communication
The application uses Socket.IO for synchronizing video controls between clients:
- `video-control` events for play/pause/seek operations
- `sync-subtitle` events for subtitle synchronization
- Server broadcasts all control events to all connected clients

### Build Process
- Client build includes a prebuild step that generates build info from Git
- Vite configuration includes manual chunk splitting for artplayer
- Docker multi-stage build optimizes for production deployment
- Server serves client build from `/static` directory

### Development Environment
- Client development server proxies Socket.IO requests to server on port 2233
- Server runs on port 2233 in both development and production
- Development mode enables debug logging in server

### Video Player Features
- Support for multiple streaming formats (HLS, DASH, MPEG-TS)
- Custom subtitle synchronization
- Advanced player settings and configuration
- Responsive UI with Naive UI components

## Docker Configuration
- Uses Node.js 22 Alpine base image
- Multi-stage build separates build and runtime environments
- Configurable NPM registry for Chinese mirrors
- Security-focused with dedicated app user
- Serves on port 2233

## State Management
- Pinia stores for watch configuration and subtitle settings
- Persistent state using pinia-plugin-persistedstate
- Client-side state synchronized via Socket.IO events