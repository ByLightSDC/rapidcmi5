# Features Folder Structure

The `features` folder structure organizes the application by business domain or feature area instead of by technical type. This approach keeps related code together and makes the codebase easier to scale, maintain, and reason about over time.

Rather than having large global folders such as:

We can do this

├── features/
│ ├── quizBank/
│ │ ├── components/
│ │ ├── hooks/
│ │ └── index.ts
│ │
│ └── scenarios/
│ ├── components/
│ ├── hooks/
│ └── index.ts

Clear Ownership

Each feature owns its:

UI components
hooks
state management
types
utilities
routes

This reduces confusion about where new code should live.
