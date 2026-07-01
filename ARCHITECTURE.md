# My Learning OS — Architecture & Developer Guide

Welcome to the Developer Guide for **My Learning OS**. This document serves as the complete technical manual for developers looking to understand the codebase end-to-end. It details the tech stack, core design patterns, runtime flows, database schemas, and contains a file-by-file breakdown explaining **what** each file does, **why** it exists, and **how** it works.

---

## 1. Tech Stack & Rationale

My Learning OS is built as a unified monorepo using **npm workspaces** to split code cleanly into `client`, `server`, and `shared` modules.

### Frontend (`client/`)
- **React 19 & Vite**: Chosen for modern declarative UI rendering and sub-second Hot Module Replacement (HMR) during development.
- **TanStack Query (React Query) v5**: Manages asynchronous server state, handle caching, request deduplication, and automatic refetching.
- **React Hook Form & Zod**: React Hook Form handles input states efficiently without trigger-heavy re-renders, while Zod handles schema-level form validation in perfect sync with the backend.
- **Recharts**: Declarative canvas/SVG charting library used to build the responsive Analytics graphs.
- **Web Audio API**: Browser-level audio synthesizer used to dynamically generate white, pink, and brown noise frequencies (for rain, wind, and ticking soundscapes) without requiring external audio assets.

### Backend (`server/`)
- **Express**: Lightweight, robust routing framework for Node.js REST APIs.
- **Mongoose & MongoDB**: Object Data Modeling (ODM) library mapping Javascript objects to MongoDB documents with built-in validation.
- **JWT (JsonWebToken) & BcryptJS**: JSON Web Tokens for stateless, signed sessions, and bcryptjs for secure, salted password hashing.
- **Multer**: Middleware for handling `multipart/form-data` file uploads, storing media attachments locally on the disk.

### Shared (`shared/`)
- **Zod Schemas & Constants**: Shared package containing raw configuration variables, resource type definitions, and request body validation schemas, ensuring complete schema parity between the client and server.

---

## 2. End-to-End Project Flow

The runtime flow of a user action follows a structured layers architecture:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant ReactUI as React Page / Form (Client)
    participant Query as TanStack Query / Axios
    participant Router as Express Router (Server)
    participant Validator as Zod Schema Validator
    participant Auth as JWT Auth Middleware
    participant Controller as Controller Layer
    participant Service as Service Layer
    participant Repo as Repository Layer (Mongo/Memory)
    database DB as MongoDB / JS Memory Array

    User->>ReactUI: Triggers form submission / page click
    ReactUI->>ReactUI: Local form checks (Zod resolver)
    ReactUI->>Query: Invokes mutation / fetch hook
    Query->>Router: Sends HTTP Request (with JWT Header)
    Router->>Validator: Validates request body
    alt Invalid Input
        Validator-->>Router: Rejects with 400 Bad Request
        Router-->>ReactUI: Displays field-level errors
    end
    Router->>Auth: Decodes JWT & attaches req.user
    alt Unauthorized / Expired
        Auth-->>Router: Rejects with 401 Unauthorized
        Router-->>ReactUI: Redirects to Login / displays alert
    end
    Router->>Controller: Invokes endpoint handler method
    Controller->>Service: Invokes business logic function
    Service->>Repo: Performs query / update on resource type
    Repo->>DB: Executes Mongo query or manipulates JS Array
    DB-->>Repo: Returns raw database records
    Repo-->>Service: Maps to application model objects
    Service-->>Controller: Returns computed/processed data
    Controller-->>Router: Packages response in Standard JSON envelope
    Router-->>Query: Sends HTTP 200/201 Success Response
    Query->>ReactUI: Invalidate cache & refresh UI state
    ReactUI-->>User: Renders updated view (with micro-animations)
```

### Flow 1: Interactive Audio Synthesis Flow (Focus Timer)
1. The user selects a soundscape (e.g., "Soft Rain") and clicks **Start Focus**.
2. If `AudioContext` does not exist, the browser instantiates it on user gesture.
3. For noise-based soundscapes (Brown Noise, Rain, Forest Wind), a custom 2-second audio buffer of random white noise values is generated programmatically.
4. For **Rain**: The buffer is connected to a `BiquadFilterNode` configured as a low-pass filter (800Hz) to cut high frequencies and mimic rain patter.
5. For **Forest Wind**: The buffer is connected to a bandpass filter (500Hz) with frequency modulation driven by a slow Low-Frequency Oscillator (LFO, 0.08Hz) to mimic rising and falling gusts.
6. For **Zen Tick**: On every 1-second countdown decrement, a short 0.04-second sinusoidal wave is generated, decaying exponentially in pitch and volume to synthesize a mechanical clock tick.
7. For **Zen Chime**: Upon timer completion, four sinusoidal oscillator nodes corresponding to a C major chord (C4, E4, G4, C5) are triggered simultaneously with a slow release envelope.

---

## 3. Directory & File-by-File Breakdown

### Shared Workspace (`shared/`)
Contains code and schemas shared by both the React frontend and Express backend.

#### [shared/package.json](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/shared/package.json)
- **What**: Configuration package registering the `@learning-os/shared` package name and its workspace exports.
- **Why**: Allows both client and server to declare it as a dependency.
- **How**: Declares `exports` mapping `.` to `index.js`, using `"type": "module"`.

#### [shared/index.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/shared/index.js)
- **What**: The main entry point of the shared workspace.
- **Why**: Re-exports all constants and schemas so they can be consumed via a single package import statement.
- **How**: Performs standard ES Module `export *` from sub-directories.

#### [shared/constants/index.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/shared/constants/index.js)
- **What**: Defines application-wide constant values, such as resource types, task priorities, and status lists.
- **Why**: Guarantees that the backend database validation matches what the frontend displays.
- **How**: Exports immutable arrays and frozen key-value objects representing resources (e.g., `tasks`, `goals`, `roadmaps`, `checklists`).

#### [shared/schemas/index.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/shared/schemas/index.js)
- **What**: Zod validation schemas for registration, login, and resource schemas.
- **Why**: Prevents invalid schemas from reaching database storage. Used by React Hook Form on the frontend and custom middleware on the backend.
- **How**: Defines schemas such as `loginSchema`, `registerSchema`, `taskSchema`, `noteSchema` using Zod chaining APIs.

---

### Server Workspace (`server/`)
The Express REST API server providing routes, business logic, file storage, and database connectors.

#### [server/package.json](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/package.json)
- **What**: Configures scripts (`dev`, `start`, `test`, `seed`) and dependency lists for the backend.
- **Why**: Dictates server package requirements (e.g., Express, Mongoose, JsonWebToken, Multer).
- **How**: Declares standard npm scripts and specific version ranges for Express, MongoDB, and Testing packages.

#### [server/src/server.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/server.js)
- **What**: Executable entry point of the API server.
- **Why**: Establishes database connection, checks or creates the default demo user account, and binds the Express server to a network port.
- **How**: Imports Mongoose to connect to `MONGODB_URI`, seeds the demo account, builds the app instance, and calls `app.listen()`.

#### [server/src/app.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/app.js)
- **What**: Express application instantiation and middleware pipeline registration.
- **Why**: Decouples port listening from application building, which is crucial for integration testing using supertest.
- **How**: Configures standard middlewares (Helmet, CORS, Rate Limit, Express JSON), sets up static file hosting for file uploads, initializes the data repositories, and registers root routing.

#### [server/src/config/env.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/config/env.js)
- **What**: Environment variable loader and strict schema validator.
- **Why**: Prevents the application from starting if required configurations (e.g., JWT secret, ports) are missing or type-mismatched.
- **How**: Loads `.env` via `dotenv` and parses `process.env` against a Zod schema containing `PORT`, `MONGODB_URI`, and `JWT_SECRET`.

#### [server/src/middleware/auth.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/middleware/auth.js)
- **What**: Middleware for authenticating requests and extracting the logged-in user.
- **Why**: Secures private endpoints and allows resource isolation based on user identities.
- **How**: Inspects the `Authorization` header, decodes the bearer JWT token, verifies its signature against `JWT_SECRET`, and attaches the decrypted token payload (`user`) to the `req` object.

#### [server/src/middleware/errors.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/middleware/errors.js)
- **What**: Global error catching middleware and 404 handler.
- **Why**: Ensures that any server exception is caught and formatted as a JSON response instead of crashing the process or leaking stack traces.
- **How**: Translates instances of `HttpError` or general errors into corresponding HTTP status codes with a consistent `{ success: false, message: ... }` response structure.

#### [server/src/middleware/validate.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/middleware/validate.js)
- **What**: Middleware factory that validates request body payloads against a specified Zod schema.
- **Why**: Rejects invalid payloads before they reach controllers or service models.
- **How**: Exposes a function that accepts a Zod schema, parses `req.body`, and, if parsing fails, formats error messages and sends a 400 Bad Request response.

#### [server/src/controllers/auth-controller.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/controllers/auth-controller.js)
- **What**: Route handlers managing registration, sign-in, and auth checking.
- **Why**: Controls access and handles authentication logic.
- **How**:
  - `login`: Compares the requested credentials with passwords stored in the repository, and, if valid, signs a JWT token.
  - `register`: Validates user signup inputs, hashes passwords, and saves the user record to the repository.
  - `me`: Returns current user details.

#### [server/src/controllers/resource-controller.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/controllers/resource-controller.js)
- **What**: Generic controller handling CRUD operations for notes, tasks, roadmaps, goals, resources, etc.
- **Why**: Standardizes CRUD logic across all resource types instead of repeating controller code.
- **How**: Maps request parameters to repository queries, filters resources to ensure users only access their own data, and handles sub-resource actions (like adding steps to roadmaps or tasks to lists).

#### [server/src/controllers/upload-controller.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/controllers/upload-controller.js)
- **What**: Controller handling file uploads and attachments.
- **Why**: Enables users to upload PDFs, images, or cheatsheets to goals/resources.
- **How**: Configures Multer to store incoming files in the `uploads/` directory, and returns the path URL to the client.

#### [server/src/controllers/insight-controller.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/controllers/insight-controller.js)
- **What**: Controller computing dashboard analytics, metrics, and streaks.
- **Why**: Aggregates raw tables/collections to construct clean, queryable analytics data.
- **How**: Processes checklists, goals, and study sessions to calculate:
  - Total study time grouped by date and topic.
  - Active and longest study streaks.
  - Completed vs. total items ratio for tasks and goals.

#### [server/src/models/index.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/models/index.js)
- **What**: Declares Mongoose model schemas for Mongo database execution.
- **Why**: Defines the layout, fields, and indices of each document collection.
- **How**: Uses mongoose `Schema` objects specifying types, defaults, and relations (e.g. referencing user ID).

#### [server/src/repositories/base-repository.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/repositories/base-repository.js)
- **What**: Abstract interface definition for the repository pattern.
- **Why**: Enforces consistent query signatures regardless of whether the server uses in-memory lists or MongoDB.
- **How**: Defines base methods (`all`, `find`, `create`, `update`, `delete`) that subclasses must implement.

#### [server/src/repositories/memory-repository.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/repositories/memory-repository.js)
- **What**: Implementation of the base repository using plain JavaScript arrays stored in server memory.
- **Why**: Serves as a zero-setup fallback database and high-speed mock for unit testing.
- **How**: Implements queries by performing array filter, find, and splice operations.

#### [server/src/repositories/mongo-repository.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/repositories/mongo-repository.js)
- **What**: Implementation of the base repository using the MongoDB/Mongoose database.
- **Why**: Provides persistent, production-ready storage for the application.
- **How**: Wraps standard Mongoose query helpers like `find()`, `findByIdAndUpdate()`, and `deleteOne()`.

#### [server/src/repositories/seed.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/repositories/seed.js)
- **What**: Generates Mock data for in-memory mode.
- **Why**: Populates the UI with realistic notes, roadmaps, goals, and tasks on start.
- **How**: Exports structured objects matching the schema requirements of the memory repository.

#### [server/src/repositories/seed-mongo.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/repositories/seed-mongo.js)
- **What**: CLI script to seed a local or remote MongoDB instance with demo data.
- **Why**: Allows users using persistent Mongo DB storage to start with pre-populated data.
- **How**: Connects to the database, drops collections, and populates mock data under the demo user.

#### [server/src/routes/index.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/routes/index.js)
- **What**: Express routing configuration mapping URL paths to controllers and middlewares.
- **Why**: Serves as the traffic controller for the entire API server.
- **How**: Configures endpoints like `/auth`, `/analytics`, `/upload`, and dynamic `/resources/:type` paths.

#### [server/src/services/resource-service.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/services/resource-service.js)
- **What**: Intermediary service layer handling business logic and authorization logic.
- **Why**: Decouples endpoint controller routing from the core business calculations.
- **How**: Contains business checks (e.g., verifying if the resource belongs to the requesting user before performing updates).

#### [server/src/utils/async-handler.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/utils/async-handler.js)
- **What**: Utility wrapper that intercepts rejected promises in Express controllers.
- **Why**: Eliminates the need to wrap every async controller endpoint in verbose `try/catch` blocks.
- **How**: Returns a wrapper function that passes caught errors directly to the Express `next()` error chain.

#### [server/src/utils/http-error.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/utils/http-error.js)
- **What**: Custom Error subclass representing specific HTTP exceptions.
- **Why**: Allows throwing errors with custom HTTP status codes (e.g. 404, 401) anywhere inside controllers or services.
- **How**: Extends the global JS `Error` class and appends a `statusCode` field.

#### [server/src/utils/response.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/server/src/utils/response.js)
- **What**: Utility formatting standardized JSON success responses.
- **Why**: Ensures the frontend always receives data in a consistent container format.
- **How**: Exports helper functions wrapping objects in `{ success: true, data }` envelopes.

---

### Client Workspace (`client/`)
The React + Vite frontend SPA.

#### [client/package.json](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/client/package.json)
- **What**: Configurations, development dependencies, and build pipelines for the React app.
- **Why**: Lists React, Vite, TanStack Query, Recharts, and routing dependencies.
- **How**: Configures standard vite dev, build, and lint commands.

#### [client/src/main.jsx](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/client/src/main.jsx)
- **What**: Main JavaScript entry point of the Single Page App (SPA).
- **Why**: Mounts the main React application tree onto the DOM.
- **How**: Locates `#root` in `index.html` and renders the React tree inside a `StrictMode` container.

#### [client/src/App.jsx](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/client/src/App.jsx)
- **What**: The core client configuration file.
- **Why**: Configures globally available context providers (React Query client, custom routers, Auth hooks).
- **How**: Wraps child routes in `QueryClientProvider` and manages global authentication states.

#### [client/src/styles/global.css](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/client/src/styles/global.css)
- **What**: Global stylesheets mapping the organic earth-tone palette and typography variables.
- **Why**: Guarantees a cohesive, beautiful Japandi design look across all pages.
- **How**: Declares root custom properties (e.g. `--clay-brown`, `--warm-ivory`), styles elements using semantic tag selectors, and establishes layout grids.

#### [client/src/routes/app-routes.jsx](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/client/src/routes/app-routes.jsx)
- **What**: Route declarations mapping page URLs to React components.
- **Why**: Manages page transitions and route isolation for logged-in and logged-out views.
- **How**: Imports React Router routes, checks for active user tokens, and redirects unauthenticated users to the Login panel.

#### [client/src/pages/login-page.jsx](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/client/src/pages/login-page.jsx)
- **What**: Authentication page rendering the Sign In and Sign Up options.
- **Why**: Allows users to log in with the pre-filled demo account or sign up a new account.
- **How**: Uses React Hook Form + Zod validation resolver, sending logins/signups to api authentication services.

#### [client/src/pages/dashboard-page.jsx](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/client/src/pages/dashboard-page.jsx)
- **What**: Home dashboard displaying daily statistics and active goals.
- **Why**: Acts as a central command station summarizing critical learning statuses at a glance.
- **How**: Queries insights endpoints via TanStack Query and builds card grids displaying streak milestones and pending tasks.

#### [client/src/pages/focus-page.jsx](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/client/src/pages/focus-page.jsx)
- **What**: The Focus Timer page featuring the progress ring and soundscape synthesizer.
- **Why**: Provides a high-immersion zone for Pomodoro study sessions.
- **How**:
  - Implements SVG rings mapping the progress fraction to `strokeDashoffset` coordinates.
  - Instantiates Web Audio APIs generating custom filtered sound waves (Rain, Breeze, Brown Noise, Ticks, and Zen Chimes).

#### [client/src/pages/calendar-page.jsx](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/client/src/pages/calendar-page.jsx)
- **What**: Calendar matrix view plotting tasks, study sessions, and goals.
- **Why**: Allows users to plan study schedules over weekly or monthly timelines.
- **How**: Renders a standard grid of dates, fetches deadlines, and groups events dynamically under their calendar cell index.

#### [client/src/pages/analytics-page.jsx](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/client/src/pages/analytics-page.jsx)
- **What**: Analytics dashboard displaying learning statistics.
- **Why**: Displays visual trends of learning performance (e.g., study volume, topic mastery) over time.
- **How**: Binds server metrics into Recharts charts (Area, Bar, and Pie components) styled with custom palette tones.

#### [client/src/pages/resource-page.jsx](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/client/src/pages/resource-page.jsx)
- **What**: A dynamic page template used to manage list-based resources (notes, checkmarks, tasks).
- **Why**: Standardizes resource views, filters, and creation dialog sheets.
- **How**: Analyzes dynamic URL properties to render lists, sort states, search filters, and edit forms.

#### [client/src/components/layout/app-shell.jsx](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/client/src/components/layout/app-shell.jsx)
- **What**: Global UI Wrapper structure containing the sidebar and navigation headers.
- **Why**: Maintains header consistency and structure across different application pages.
- **How**: Wraps React Router's `<Outlet />` inside layout containers, positioning the sidebar on the left and the main contents on the right.

#### [client/src/components/layout/sidebar.jsx](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/client/src/components/layout/sidebar.jsx)
- **What**: Left navigation panel listing learning sections and features.
- **Why**: Provides navigation links and highlights active page selections.
- **How**: Maps feature configuration lists to navigation buttons decorated with Lucide icons.

#### [client/src/components/ui/button.jsx](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/client/src/components/ui/button.jsx)
- **What**: Standardized button component with class-variance-authority (CVA).
- **Why**: Simplifies button rendering by bundling theme class names (primary, secondary, danger).
- **How**: Implements customizable properties (variants and sizes) and injects global styles.

#### [client/src/services/api.js](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/client/src/services/api.js)
- **What**: Axios HTTP request client.
- **Why**: Consolidates outgoing network requests and injects Bearer JWT authentication headers.
- **How**: Intercepts requests, pulls user tokens from `localStorage`, appends them to headers, and exports wrapper methods (`getItem`, `createItem`, `updateItem`, `deleteItem`).
