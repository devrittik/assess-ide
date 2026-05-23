# Assess IDE

A browser-based sandbox IDE built using React, WebContainers, Monaco Editor, xterm.js, Zustand, Express, and MongoDB.

Assess IDE allows users to create, edit, persist, and run frontend projects directly in the browser with a VSCode-inspired developer experience.

---

# Features

## Core Features

- Browser-based code editor

- Monaco Editor integration

- Sandboxed execution using WebContainers

- Live preview iframe

- Interactive terminal using xterm.js

- File & folder CRUD operations

- Persistent project storage with MongoDB

- Auto project restoration on refresh

- Resizable IDE panels

- VSCode-inspired UI

---

# Tech Stack

## Frontend

- React

- Vite

- TailwindCSS

- Monaco Editor

- Zustand

- xterm.js

- react-resizable-panels

## Backend

- Node.js

- Express.js

- MongoDB

- Mongoose

## Runtime / Sandbox

- StackBlitz WebContainers

---

# Architecture Overview

```txt

React UI

  ├── Monaco Editor

  ├── File Explorer

  ├── Preview Panel

  └── Terminal

        ↓

Zustand Store

        ↓

WebContainer Runtime

        ↓

MongoDB Persistence
```

* * * * *

Why WebContainers?
==================

WebContainers allow Node.js applications to run directly inside the browser using WebAssembly and Service Workers.

Advantages:

-   No Docker setup required
-   Sandboxed execution
-   Fast startup
-   Browser-native environment
-   Ideal for lightweight browser IDEs

* * * * *

Folder Structure
================

```
client/
server/

client/src/
  components/
  services/
  store/
  styles/
  templates/
  utils/

server/
  config/
  controllers/
  middleware/
  routes/
  models/
```

* * * * *

Key Technical Decisions
=======================

Zustand as Source of Truth
--------------------------

The application state is managed through Zustand stores. The MongoDB persistence layer and WebContainer filesystem are synchronized from Zustand state.

Sandboxed Runtime
-----------------

WebContainers were chosen over Docker containers to keep the application lightweight and browser-native.

Persistence Strategy
--------------------

Only source files and project metadata are persisted. `node_modules` are intentionally not stored and are reinstalled on fresh runtime initialization.

* * * * *

Persistence Flow
================

```
User Action   
↓
Zustand Store Update
↓
MongoDB Save
↓
WebContainer Filesystem Sync
```

* * * * *

Local Setup
===========

1\. Clone Repository
--------------------

```
git clone <repo-url>
```

* * * * *

2\. Install Dependencies
---------------------------------

```
npm run install:all
```

* * * * *

3\. Configure Environment Variables
-----------------------------------

### Client (.env)

```
VITE_API_URL=/api
VITE_API_PROXY=http://localhost:5000
```

### Server (.env)

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

* * * * *

4\. Run Backend
---------------

```
cd server
npm run dev
```

* * * * *

6\. Run Frontend
----------------

```
cd client
npm run dev
```

* * * * *

Deployment
==========

Frontend
--------

-   Vercel

Backend
-------

-   Render

Database
-------

-   MongoDB Atlas

* * * * *

Important Deployment Notes
==========================

WebContainers require the following headers:

```
Cross-Origin-Opener-Policy: same-originCross-Origin-Embedder-Policy: require-corp
```

These headers are configured for both development and production environments.

* * * * *

Known Limitations
=================

-   Only optimized for JavaScript/TypeScript frontend projects
-   `node_modules` are not persisted
-   Terminal shell behavior may vary across browsers
-   No authentication system
-   No multi-user collaboration

* * * * *

Future Improvements
===================

-   Integrate Preview console/devtools
-   GitHub integration
-   Multi-language runtime support
-   Terminal improvements

* * * * *

AI Usage Disclosure
===================

AI tools were used to assist with:

-   architectural brainstorming
-   debugging guidance
-   UI refinement
-   project planning

All implementation, integration, debugging, and final architectural decisions were manually reviewed and adapted.

* * * * *

Assignment Goals Covered
========================

-   Sandboxed execution
-   File system management
-   Live preview
-   Terminal integration
-   Persistent projects
-   Responsive IDE layout
-   Browser-native runtime

* * * * *

Screenshots
===========



* * * * *

Author
======

Rittik Chakraborty