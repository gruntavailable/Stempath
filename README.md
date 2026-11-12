# STEM PATH

Mobile-first STEM guidance site for Grade 12 students. The frontend uses plain HTML, CSS, and JavaScript; an API function saves anonymous Stage 2 choices to PostgreSQL and returns aggregate rankings.

## npm commands

From this directory, run `npm install` once, then use:

- `npm run dev` to serve the editable files in `src/` at `http://127.0.0.1:4173`.
- `npm run build` to copy the site into `dist/` for deployment.
- `npm run preview` to serve the built files in `dist/`.

The API uses Neon's serverless PostgreSQL driver.

## Deploy on Vercel

The root `vercel.json` sets the Framework Preset to **Other**, the build command to `npm run build`, and the static output directory to `dist/`.

1. Push this project folder to a Git provider supported by Vercel, then import that repository in Vercel.
2. Use this folder as the project root. The checked-in Vercel config selects **Other** as the Framework Preset.
3. Keep the Build Command as `npm run build` and the Output Directory as `dist` (both are already set in `vercel.json`).
4. Deploy. Later pushes to the connected branch will trigger new deployments.

The API function is in `api/industry-choices.js`. To enable the shared ranking, connect a Neon PostgreSQL database through the Vercel Marketplace and make its connection string available to the project as `DATABASE_URL` in Development, Preview, and Production. The API creates its table on first use. Without `DATABASE_URL`, the static site still loads, but the shared table cannot read or save counts.

For local development, copy `.env.example` to `.env.local`, replace the placeholder with the Neon connection string, then run `npm run dev`. `.env.local` is ignored by Git. Do not put a real database URL in frontend code or commit it.

If you push the parent `nckh_stempath` folder instead, set Vercel's Root Directory to `stem-path`.

You can also deploy from this folder with Vercel CLI: install it with `npm install --global vercel`, run `vercel login`, then use `npm run deploy:preview` or `npm run deploy:production`. The first deployment links this local project to a Vercel project. The generated `.vercel/` folder is ignored by Git.

## Prototype behavior

- The self-reflection prompts are illustrative questions based on the five dimensions in the supplied website specification. They are not a validated questionnaire or an approved scoring model.
- The three suggested study groups are ranked from all ten answers with an explicit, illustrative weighting across the five dimensions. The weighting is not a validated career-fit model.
- Subject blocks group the STEM subjects in the supplied project materials into illustrative focus and supporting subjects. They are not official admission combinations; confirm requirements with each school's current admission plan.
- Survey answers and planning notes stay in the browser's local storage. Feedback is not sent or saved.
- Stage 2 sends only selected group IDs and a random browser ID to the API. PostgreSQL stores one current row per browser ID and selected group; replacing a user's choices updates their rows rather than counting clicks repeatedly.
- The shared table ranks groups by the number of browser IDs that currently include each group. A browser's choices are not linked to a name or survey answers. Clearing local storage or using another browser/device creates a new ID and can count as a separate participant.
- No names, account information, or individual survey records are published.

## Source material

- `Dac_ta_cau_truc_website.docx` — user-supplied product and experience specification.
- `tổ hợp môn có thể lựa chọn stem.xlsx` — user-supplied subject combination summary.
- `hs12luachonstem.xlsx` — aggregate Grade 12 counts used on the home page; individual student rows are excluded.

