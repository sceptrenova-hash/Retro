# Retro — one thing at a time

A responsive, single-page introduction to Retro for Mac. The experience is shaped around a warm editorial opening, a three-part scroll story, concise feature panels, an illustrative browser demo, and a playable soundtrack deck. It uses plain HTML, CSS, and JavaScript with no build step or backend.

## Preview locally

From this folder, run a static server:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. The audio deck stays silent until someone presses Play. The timer in the browser demo is a compressed, 20-second page-only example; it does not start a Mac session or change device data.

## Publish with GitHub Pages

This repository publishes the `docs/` folder on its `main` branch. Keep the site files and relative asset paths inside `docs/`. After a push, wait for the Pages deployment to finish before checking the live page.

The public page is only a visual introduction. Retro for Mac is in private beta and has no public download. The illustrative scene and Notes preview are not screenshots of a running Mac app. The site does not contain the Swift app source or an installer.

## Accessibility and behavior

- Keyboard-operable links, buttons, and demo tabs; visible focus states and a skip link.
- Responsive layouts for phone, tablet, and desktop widths.
- `prefers-reduced-motion` reduces decorative movement and reveals content without scroll animation.
- Sound playback requires an intentional click and uses local MP3 files.
- The timer is a 20-second browser demonstration with selectable rhythm presets; it does not affect the user's Mac.
- No account data is collected or sent anywhere.

## Contents

- `index.html` — page structure and copy.
- `styles.css` — layout, responsive styles, and motion.
- `script.js` — reading progress, scroll story, browser timer, feature tabs, and track playback.
- `AUDIO-LICENSE.txt` — separate source and license notes for the four preview tracks.
- `assets/retro-campaign.webp`, `assets/retro-launch-key-art.webp`, and `assets/retro-hero.webp` — supplied Retro campaign artwork used as illustrative page visuals.
- `assets/retro-icon.png` and `assets/retro-mark.png` — supplied Retro identity artwork.
- `assets/audio/*.mp3` — the four full bundled soundtrack options, included for preview with their individual credits and license notes.
