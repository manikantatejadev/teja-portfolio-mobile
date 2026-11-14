# Manikanta Teja — Personal Portfolio

A mobile-first, installable-feeling portfolio built with **React + Vite**, handcrafted CSS, and Lucide icons. Every piece of content comes from the resume; nothing is invented. Themes, photos, audio, and resume files stay on the visitor's device.

---

## Run it locally

Requires **Node.js 20.19+ or 22.12+** (tested on Node 24).

```bash
npm install
npm run dev
```

Open the URL Vite prints, usually **http://localhost:5173**.

### Other commands

```bash
npm run build     # production build into dist/
npm run preview   # serve the built dist/ locally
```

The build output is a static site: deploy the contents of `dist/` to any static host (Netlify, Vercel, GitHub Pages, Azure Static Web Apps, IIS, etc.).

---

## Using the portfolio

### Visitor view

Four destinations are always available from the bottom navigation:

| Destination | Contents |
| --- | --- |
| **Home** | Intro, portrait, audio introduction, quick links, featured project |

On phones, the hero portrait drifts with the device's tilt once motion access is granted. iOS asks on the first tap, or use the **Enable tilt** pill under the portrait. It falls back to the existing float animation when sensors or permission are unavailable, and stays static for reduced-motion users. Sensors require HTTPS.
| **My Journey** | Work experience timeline and education |
| **My Work** | Project case studies with technology filters |
| **About Me** | Summary, skills, certifications, achievements, languages, contact |

Tap a timeline item or project card for a detail sheet. The theme button opens **Appearance** (three themes plus text size). Theme and text size are remembered.

### Studio (owner editing)

Open **Customize portfolio** in the top bar. The five-step wizard works entirely in the browser:

1. **Resume** — resume text is pre-filled from the bundled PDF. Paste different text or edit it, then choose **Extract my details**.
2. **Review** — confirm the detected name, location, title, and section counts. Anything uncertain is kept in **Needs your review** instead of being discarded.
3. **Edit** — change identity, summary, skills, experience, projects, education, certifications, achievements, languages/interests, contact links, section order, and section visibility.
4. **Media** — upload and frame a photo (horizontal/vertical offset + zoom), record or upload an audio introduction, and replace the resume file. Everything can be previewed and deleted before saving.
5. **Preview** — open a read-only visitor preview or save and finish.

**Save** persists content to `localStorage`; photos, audio, and attached resumes go to `IndexedDB`. **Open visitor preview** hides Studio, edit buttons, and content controls but keeps navigation, themes, audio, contact actions, and the resume viewer working. Use **Exit preview** or `Escape` to return.

### Replacing the default assets

- **Portrait placeholder:** replace `public/avatar-illustration.svg` with another SVG/PNG and update the `photo.src` value in `src/data/defaultPortfolio.js` if the filename changes.
- **Bundled resume:** replace `public/Manikanta_Teja_Resume.pdf`. Keep the same filename, or update `resume.builtinUrl` / `resume.fileName` in `src/data/defaultPortfolio.js`.
- **Default content:** edit `src/data/defaultPortfolio.js` for the shipped resume content, section definitions, themes, and the introduction script.

Uploaded media overrides these defaults for that browser only.

---

## Privacy and storage

Nothing is uploaded to a server. All processing happens in the browser.

| What | Where |
| --- | --- |
| Content, theme, text size, last save time | `localStorage` (`manikanta-portfolio-v1`, `-theme`, `-text-size`) |
| Photo, audio, uploaded resume | `IndexedDB` database `manikanta-portfolio-media` |

- Audio never autoplays.
- Device-voice narration is clearly labeled as generated speech, not the owner's voice.
- Contact copy uses the Clipboard API with a manual fallback.
- Resume and contact actions open real `mailto:`, `tel:`, and external links; there is no simulated messaging.

### Reset to defaults

In the browser console:

```js
localStorage.clear()
indexedDB.deleteDatabase('manikanta-portfolio-media')
location.reload()
```

Or clear site data for the origin in the browser settings.

---

## Project structure

```
public/
  avatar-illustration.svg      Default illustrated portrait
  Manikanta_Teja_Resume.pdf    Bundled resume
  favicon.svg
src/
  App.jsx                      State, hash routing, sheets, media hydration
  main.jsx                     Entry point and stylesheet imports
  data/
    defaultPortfolio.js        Resume-derived content and theme/section config
    resumeText.js              Extracted PDF text used to prefill Studio
  lib/
    mediaStore.js              IndexedDB helpers
    resumeParser.js            Local resume extraction and merge
    utils.js                   Audio controller, contact helpers, formatting
  components/
    AudioCard.jsx              Audio empty state and player
    PhotoFrame.jsx             Portrait framing and display
    BottomNav.jsx  TopBar.jsx  Sheet.jsx  ThemeSheet.jsx  Toast.jsx
    screens/                   Home, Journey, Work, About
    sheets/                    Detail sheets (experience, project, contact, …)
    studio/                    Five-step Studio wizard, content/media editors
  styles/
    base.css  home.css  screens.css  sheets.css  studio.css
```

## Accessibility notes

- Keyboard navigation, visible focus styles, and labelled controls throughout.
- Bottom sheets and Studio trap focus, close on `Escape`, and restore the previous view.
- `prefers-reduced-motion` disables the splash animation, reveals, and transitions.
- Audio has a seek slider, replay, speed control, and transcript; empty and error states are explicit.
- Responsive from small phones to desktop, with safe-area padding for notched devices.

## Troubleshooting

- **Port already in use:** stop the other process or run `npm run dev -- --port 5174`.
- **Photo/audio missing after a browser cleanup:** local browser data was cleared; re-add it in Studio.
- **Clipboard blocked:** the app falls back to selecting and copying; if the browser blocks both, it shows a manual-copy message.
- **Stale production build:** rerun `npm run build` after content changes.
