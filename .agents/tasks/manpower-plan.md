# Implementation Plan — Manpower Roster Feature

**Project:** CSO Portal (SSSG Solutions)
**Build command:** `npm run lint` (`npx tsc --noEmit`), `npm run build` (`vite build`)
**Dev server:** `npm run dev` (`tsx server.ts`) — do NOT restart if running
**Stack:** React 19 + TypeScript, Tailwind CSS v4, lucide-react, MongoDB, Express, XLSX (already installed)
**No new npm packages allowed.**

---

## Codebase facts discovered during exploration

- `src/types/survey.ts` — all shared TypeScript interfaces live here; add `ManpowerEntry` here.
- `server.ts` — single-file Express server; collections declared at module scope (`let rosters`, `let questions`…); new `manpower` collection follows the exact same pattern.
- `src/db/initializeDB.ts` — `initializeCollections()` returns a `DBCollections` object; must add `manpower` to this return type and init function.
- `src/db/schemas.ts` — `COLLECTION_NAMES` constant + validation schemas; must add `MANPOWER = 'manpower'` and a validation schema.
- `src/utils/excelParser.ts` — `parseCSOExcelFile` and `downloadSampleExcelRoster` are the existing patterns; `normalizeHeader` and `extractTenDigitMobile` helpers are already in scope and will be reused.
- `src/api/client.ts` — all API calls use `fetch` against `/api`; follow the existing function signature style with `handleError`.
- `src/components/admin/AdminPanel.tsx` — three tabs (`survey_progress`, `assessments`, `excel_roster`); the `activeAdminTab` state union and the tab bar both need a 4th value `manpower_roster`.
- `src/components/CentreOverview.tsx` — receives `csoProfile` (has `centreCode`); add manpower section at the bottom, fetch on mount, show table or empty state.
- `src/App.tsx` — `CentreOverview` already receives `csoProfile` which has `centreCode`; no additional prop wiring needed.

---

## Implementation Plan

- [ ] 1. **Add `ManpowerEntry` type and extend `COLLECTION_NAMES`**

  Add the `ManpowerEntry` interface to `src/types/survey.ts` (after `SurveyRecord`). Add `MANPOWER: 'manpower'` to the `COLLECTION_NAMES` constant in `src/db/schemas.ts`. Add a `ManpowerValidationSchema` object in `src/db/schemas.ts` with `bsonType: 'object'`, required `['centreCode', 'designation']`, and optional properties for every field in `ManpowerEntry`. Use `validationAction: 'warn'` so it never blocks inserts.

  Files:
  - `src/types/survey.ts`
  - `src/db/schemas.ts`

  Verify: `npm run lint` — zero TypeScript errors.

---

- [ ] 2. **Initialize the `manpower` collection in `initializeDB.ts`**

  In `src/db/initializeDB.ts`:
  - Import `ManpowerValidationSchema` and `COLLECTION_NAMES.MANPOWER` from `./schemas`.
  - Add `manpower: Collection` to the `DBCollections` interface.
  - Add a new private async function `initializeManpower(db: Db)` following the exact pattern of `initializeSubmissions` (same try/catch, `collMod` validator update, `validationAction: 'warn'`). Create indexes: `{ centreCode: 1 }` (not unique) and `{ centreCode: 1, designation: 1 }`.
  - Call `initializeManpower(db)` inside `initializeCollections` and include `manpower: db.collection(COLLECTION_NAMES.MANPOWER)` in the returned object.

  Files:
  - `src/db/initializeDB.ts`

  Verify: `npm run lint` — zero TypeScript errors.

---

- [ ] 3. **Add manpower API endpoints to `server.ts`**

  At the top of `server.ts`, alongside the other `let` declarations, add:
  ```ts
  let manpower: Collection;
  ```
  Inside `initializeMongoDB()`, after `submissions = collections.submissions;`, add:
  ```ts
  manpower = collections.manpower;
  ```

  Add four route handlers immediately after the `app.post('/api/reset-all', …)` block and before the Vite section:

  **GET /api/manpower** — admin view, returns all entries:
  ```
  const all = await manpower.find({}).toArray();
  res.json({ success: true, entries: all, count: all.length });
  ```

  **GET /api/manpower/:centreCode** — CSO view, returns entries for one centre:
  ```
  const entries = await manpower.find({ centreCode: req.params.centreCode.trim() }).toArray();
  res.json({ success: true, entries, count: entries.length });
  ```

  **POST /api/manpower** — upsert entries (body: `{ entries: ManpowerEntry[], mode: 'replace'|'append' }`):
  - Validate `Array.isArray(entries)`.
  - If `mode === 'replace'`: `await manpower.deleteMany({ centreCode: { $in: [...new Set(entries.map(e => e.centreCode))] } })` then upsert loop.
  - For each entry: `const { _id, ...doc } = e as any;` then `await manpower.updateOne({ centreCode: doc.centreCode, designation: doc.designation }, { $set: doc }, { upsert: true })`.
  - Return `{ success: true, count: await manpower.countDocuments(), upsertedCount }`.

  **DELETE /api/manpower/:centreCode** — delete all entries for a centre:
  ```
  await manpower.deleteMany({ centreCode: req.params.centreCode.trim() });
  res.json({ success: true });
  ```

  Files:
  - `server.ts`

  Verify: `npm run lint` — zero TypeScript errors. (Runtime test: start server and hit `GET /api/manpower` with curl/browser — should return `{ success: true, entries: [], count: 0 }`.)

---

- [ ] 4. **Add manpower Excel parser and template downloader to `excelParser.ts`**

  Add to `src/utils/excelParser.ts`:

  **`ManpowerImportResult` interface** (at the top of the file, after existing interfaces):
  ```ts
  export interface ManpowerImportResult {
    success: boolean;
    entries: ManpowerEntry[];
    count: number;
    errors: string[];
  }
  ```
  Import `ManpowerEntry` from `'../types/survey'`.

  **`parseManpowerExcelFile(file: File): Promise<ManpowerImportResult>`**

  Follow the same pattern as `parseCSOExcelFile`:
  - Read `arrayBuffer`, use `XLSX.read`, get first sheet, convert with `{ header: 1, defval: '' }`.
  - Header scan loop (first 10 rows): match with `normalizeHeader()`:
    - `centrecode` / `centercode` → `centreCode`
    - `district` → `district`
    - `servicename` / `service` → `serviceName`
    - `designation` → `designation`
    - `staffcount` / `staff` / `count` → `staffCount` (parse as number)
    - `contactname` / `contact` → `contactName`
    - `contactphone` / `phone` / `mobile` → `contactPhone` (use `extractTenDigitMobile`)
    - `status` → `status`
    - `confirmationstatus` / `confirmation` → `confirmationStatus`
    - `notes` / `remarks` → `notes`
  - Require at least `centreCode` + `designation` columns found; otherwise return failure.
  - For each data row: skip if `centreCode` and `designation` are both empty. Build a `ManpowerEntry` object. Parse `staffCount` with `parseInt`; fall back to `0`.
  - Return `{ success: entries.length > 0, entries, count: entries.length, errors }`.

  **`downloadManpowerTemplate()`**

  Follow the pattern of `downloadSampleExcelRoster`:
  - Create `sampleData` array with 3 rows, columns: `Centre Code`, `District`, `Service Name`, `Designation`, `Staff Count`, `Contact Name`, `Contact Phone`, `Status`, `Confirmation Status`, `Notes`.
  - Sample values (use realistic UP exam data): row 1 Invigilator, row 2 Peon, row 3 Centre Superintendent.
  - Set `!cols` widths, append sheet named `'Manpower_Roster'`, write file as `'Manpower_Roster_Template.xlsx'`.

  Files:
  - `src/utils/excelParser.ts`

  Verify: `npm run lint` — zero TypeScript errors.

---

- [ ] 5. **Add API client functions for manpower in `client.ts`**

  Add to the end of `src/api/client.ts`, after the health check section:

  ```ts
  // ==================== MANPOWER API ====================

  export async function fetchManpowerByCentre(centreCode: string): Promise<ManpowerEntry[]> { … }
  export async function fetchAllManpower(): Promise<ManpowerEntry[]> { … }
  export async function uploadManpower(
    entries: ManpowerEntry[],
    mode: 'replace' | 'append'
  ): Promise<{ success: boolean; count: number }> { … }
  export async function deleteManpowerByCentre(centreCode: string): Promise<{ success: boolean }> { … }
  ```

  Each function follows the existing pattern: `fetch(…)`, check `res.ok`, throw via `handleError`, return the expected shape.
  - `fetchManpowerByCentre`: GET `/api/manpower/${centreCode}` → `data.entries || []`
  - `fetchAllManpower`: GET `/api/manpower` → `data.entries || []`
  - `uploadManpower`: POST `/api/manpower` body `{ entries, mode }` → `{ success, count }`
  - `deleteManpowerByCentre`: DELETE `/api/manpower/${centreCode}` → `{ success: true }`

  Import `ManpowerEntry` from `'../types/survey'` at the top of the file.

  Files:
  - `src/api/client.ts`

  Verify: `npm run lint` — zero TypeScript errors.

---

- [ ] 6. **Add 'Manpower Roster' tab to `AdminPanel.tsx`**

  **State additions** (inside the component, alongside existing state):
  ```ts
  const [manpowerEntries, setManpowerEntries] = useState<ManpowerEntry[]>([]);
  const [manpowerUploading, setManpowerUploading] = useState(false);
  const [manpowerFeedback, setManpowerFeedback] = useState<{ success: boolean; message: string; errors?: string[] } | null>(null);
  const [manpowerReplaceMode, setManpowerReplaceMode] = useState(true);
  const [manpowerCentreFilter, setManpowerCentreFilter] = useState('all');
  const [manpowerLoadError, setManpowerLoadError] = useState('');
  const manpowerFileRef = useRef<HTMLInputElement>(null);
  ```

  **`useEffect` for fetching** — add a separate `useEffect` that calls `fetchAllManpower()` on mount and sets `manpowerEntries`. Only runs once (`[]` dependency).

  **Tab state** — extend the `activeAdminTab` type union from `'survey_progress' | 'assessments' | 'excel_roster'` to include `| 'manpower_roster'`.

  **Tab bar** — add a 4th `<button>` after the 'CSO Excel Roster' button, styled identically:
  ```tsx
  <button onClick={() => setActiveAdminTab('manpower_roster')} …>
    <Users className="w-4 h-4" />
    <span>Manpower Roster ({manpowerEntries.length})</span>
  </button>
  ```
  Use `Users` icon (already imported in the file).

  **`handleManpowerUpload` handler**:
  1. Get file from event.
  2. `setManpowerUploading(true)`.
  3. `const result = await parseManpowerExcelFile(file)`.
  4. If `result.success`: call `uploadManpower(result.entries, manpowerReplaceMode ? 'replace' : 'append')`, then `setManpowerEntries(await fetchAllManpower())`, set success feedback.
  5. Else: set error feedback.
  6. `setManpowerUploading(false)`, reset file input.

  **`handleDeleteManpowerForCentre(centreCode)`**:
  - `window.confirm(…)` guard.
  - Call `deleteManpowerByCentre(centreCode)`.
  - Refresh: `setManpowerEntries(await fetchAllManpower())`.

  **Tab 4 JSX** — `{activeAdminTab === 'manpower_roster' && ( … )}`:

  Structure (Tailwind + lucide-react, dark mode classes, matches existing tab panels):

  ```
  <div className="space-y-5 animate-in fade-in duration-200">

    {/* Upload Card */}
    <div className="bg-white dark:bg-slate-900 rounded-2xl border … p-5 space-y-4">
      <h3>Upload Manpower Excel</h3>

      {/* Replace / Append Toggle */}
      <div className="flex items-center gap-3">
        <button onClick={() => setManpowerReplaceMode(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold … ${ manpowerReplaceMode ? 'bg-blue-600 text-white' : '…' }`}>
          Replace
        </button>
        <button onClick={() => setManpowerReplaceMode(false)} …>Append</button>
      </div>

      {/* File Input Row */}
      <div className="flex items-center gap-3">
        <label className="flex-1 …">
          <input ref={manpowerFileRef} type="file" accept=".xlsx,.xls,.csv"
            onChange={handleManpowerUpload} className="hidden" />
          <span className="… cursor-pointer">
            <Upload className="w-4 h-4" /> Choose Excel File
          </span>
        </label>

        <button onClick={downloadManpowerTemplate}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 … text-xs font-semibold flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" /> Download Template
        </button>
      </div>

      {/* Upload loading state */}
      {manpowerUploading && <p className="text-xs text-blue-600 …">Uploading…</p>}

      {/* Feedback Banner */}
      {manpowerFeedback && (
        <div className={`p-3 rounded-xl text-xs … ${ manpowerFeedback.success ? 'bg-emerald-50 … text-emerald-700' : 'bg-rose-50 … text-rose-700' }`}>
          {manpowerFeedback.message}
          {manpowerFeedback.errors?.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}
    </div>

    {/* Filter + Table Card */}
    <div className="bg-white dark:bg-slate-900 rounded-2xl border … overflow-hidden">

      {/* Filter bar */}
      <div className="px-4 py-3 border-b … flex items-center justify-between gap-3">
        <span className="text-xs font-bold …">All Manpower Entries ({manpowerEntries.length})</span>
        <select value={manpowerCentreFilter} onChange={…} className="… text-xs">
          <option value="all">All Centres</option>
          {[...new Set(manpowerEntries.map(e => e.centreCode))].sort().map(code => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filteredEntries.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400">
          No manpower data uploaded yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 …">
              <tr>
                <th>Centre Code</th><th>District</th><th>Service Name</th>
                <th>Designation</th><th>Staff Count</th><th>Contact Name</th>
                <th>Contact Phone</th><th>Status</th><th>Confirmation</th>
                <th>Notes</th><th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y …">
              {filteredEntries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="font-mono …">{entry.centreCode}</td>
                  <td>{entry.district}</td>
                  <td>{entry.serviceName}</td>
                  <td>{entry.designation}</td>
                  <td className="text-center font-mono">{entry.staffCount}</td>
                  <td>{entry.contactName}</td>
                  <td className="font-mono">{entry.contactPhone}</td>
                  <td>
                    {/* Color-coded status badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      entry.status?.toLowerCase().includes('confirm')
                        ? 'bg-emerald-50 … text-emerald-700'
                        : 'bg-amber-50 … text-amber-700'
                    }`}>{entry.status}</span>
                  </td>
                  <td>{entry.confirmationStatus}</td>
                  <td className="max-w-24 truncate">{entry.notes || '—'}</td>
                  <td>
                    <button onClick={() => handleDeleteManpowerForCentre(entry.centreCode)}
                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer" title="Delete all for this centre">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
  ```

  Compute `filteredEntries` as a derived variable above the return:
  ```ts
  const filteredManpowerEntries = manpowerCentreFilter === 'all'
    ? manpowerEntries
    : manpowerEntries.filter(e => e.centreCode === manpowerCentreFilter);
  ```

  Imports to add at the top of `AdminPanel.tsx`:
  - `ManpowerEntry` from `'../../types/survey'`
  - `parseManpowerExcelFile`, `downloadManpowerTemplate` from `'../../utils/excelParser'`
  - `fetchAllManpower`, `uploadManpower`, `deleteManpowerByCentre` from `'../../api/client'`

  Files:
  - `src/components/admin/AdminPanel.tsx`

  Verify: `npm run lint` — zero TypeScript errors; `npm run build` — clean Vite build.

---

- [ ] 7. **Add 'My Centre Manpower' section to `CentreOverview.tsx`**

  **State additions**:
  ```ts
  const [centreManpower, setCentreManpower] = useState<ManpowerEntry[]>([]);
  const [manpowerLoading, setManpowerLoading] = useState(true);
  ```

  **`useEffect` on mount** (depends on `centreCode`):
  ```ts
  useEffect(() => {
    if (!centreCode) { setManpowerLoading(false); return; }
    fetchManpowerByCentre(centreCode)
      .then(entries => setCentreManpower(entries))
      .catch(() => setCentreManpower([]))
      .finally(() => setManpowerLoading(false));
  }, [centreCode]);
  ```

  **New section JSX** — insert after the "Select Assessment Day Questionnaire" section (before the dossier modal), inside the outermost `<div className="space-y-5 …">`:

  ```tsx
  {/* MY CENTRE MANPOWER SECTION */}
  <div className="space-y-3 pt-2">
    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
      My Centre Manpower
    </h2>
    <p className="text-xs text-slate-500 dark:text-slate-400">
      Manpower assigned to your centre (Centre Code: {centreCode})
    </p>

    {manpowerLoading ? (
      <div className="p-6 text-center text-xs text-slate-400">Loading manpower data…</div>
    ) : centreManpower.length === 0 ? (
      <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
        <Users className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Manpower data not uploaded yet.</p>
        <p className="text-[11px] text-slate-400">Admin se contact karein ya baad mein dobara check karein.</p>
      </div>
    ) : (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Group by Service Name */}
        {Array.from(new Set(centreManpower.map(e => e.serviceName))).map(service => {
          const group = centreManpower.filter(e => e.serviceName === service);
          return (
            <div key={service} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {service}
                </span>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {group.map((entry, idx) => (
                  <div key={idx} className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{entry.designation}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        {entry.contactName} · <span className="font-mono">{entry.contactPhone}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        ×{entry.staffCount}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        (entry.status || '').toLowerCase().includes('confirm')
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}>
                        {entry.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
  ```

  Imports to add:
  - `ManpowerEntry` from `'../types/survey'`
  - `fetchManpowerByCentre` from `'../api/client'`
  - `Users` from `'lucide-react'` (check if already imported — it is not currently imported in `CentreOverview.tsx`; add it)

  Files:
  - `src/components/CentreOverview.tsx`

  Verify: `npm run lint` — zero TypeScript errors; `npm run build` — clean build.

---

- [ ] 8. **Final verification pass**

  Run both verification commands back-to-back and confirm both succeed:
  ```
  npm run lint
  npm run build
  ```
  Expected: `npm run lint` exits with code 0 and no diagnostics. `npm run build` produces a `dist/` folder without errors.

  If `tsc` reports a type error in any changed file, fix it before considering the work done. Common pitfalls:
  - `ManpowerEntry` not imported in a file that uses it.
  - `activeAdminTab` type union not extended to include `'manpower_roster'`.
  - `DBCollections.manpower` property missing in the interface but used in `server.ts`.

  Files: none (verification only).
  Verify: `npm run lint && npm run build` both exit 0.

---

## Dependency order summary

```
Step 1 (types + schema constants)
  └─ Step 2 (initializeDB — needs COLLECTION_NAMES.MANPOWER + ManpowerValidationSchema)
       └─ Step 3 (server.ts — needs updated DBCollections.manpower)
Step 1 (ManpowerEntry type)
  └─ Step 4 (excelParser — needs ManpowerEntry)
       └─ Step 5 (api/client — needs ManpowerEntry)
            ├─ Step 6 (AdminPanel — needs parser + client + type)
            └─ Step 7 (CentreOverview — needs client + type)
Step 6 + Step 7 → Step 8 (final build verification)
```

Steps 1–3 (server-side) and Steps 1, 4 (parser) can be worked in parallel since they touch different files. Steps 5, 6, 7 depend on Steps 1 and 4 being done first.
