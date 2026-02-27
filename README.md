# Academic Management Dashboard

## Project Overview

- **Dashboard** — Cards for statas, course enrollment bar chart, top students Table
- **Students** — Full CRUD with search, filter by department/status/year, pagination.
- **Courses** — Full CRUD with search, department filter, instructor assignment, enroll
- **Faculty** — Faculty cards with Assign Student, Bulk Enroll, and Bulk Grade Update modals
- **Reports** — Grade  chart, department enrollment donut chart, tabbed Student GPA and Course Enrollment reports with CSV export.


## Setup Instructions

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
# Clone the repository
git clone https://github.com/hituhin/Assignment.git
cd Assignment

# Install dependencies
npm install

# Start the development server
npm run dev



## Architecture & Key Decisions

### 1. In-Memory Store with Reset on Refresh

 Make `data/db.json` for store  json data and `lib/db/store.ts` for deep clone of row data and clean it when browser reload.

**Reset mechanism:** every fresh browser page load via `useEffect`. The app renders only after the reset completes, ensuring SWR fetches always seed data.


### 2. SWR for GET + Axios for Mutations

- **SWR** handles all `GET` requests — provides automatic caching.
- **Axios** handles `POST`, `PUT`, `DELETE` — called inside event handlers, followed by `mutate()` to sync the SWR cache
- Both use `/api` as the base URL — no CORS, no external services

### 3. React Hook Form

All forms use **React Hook Form**.

Dynamic rows use `useFieldArray`, which provides append, remove, and field tracking without uncontrolled component issues.

### 4. ApexCharts with Dynamic Import

ApexCharts requires `window` and cannot render server-side. All chart components use:

```ts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
```

This prevents SSR errors while allowing charts to load after hydration.

### 5. Reusable DataTable Component

`components/ui/DataTable.tsx` is a generic table component that accepts a `columns` config array with typed `render` functions.

### 6. GPA Computed at Read Time

GPA is never stored. It is computed on every API response from the `grades` array using `lib/utils/gpa.ts`. 


## Seed Data

Seed data by using `data/db.json`

---

