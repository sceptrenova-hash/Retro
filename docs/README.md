# Retro — focus app landing page

A responsive, single-page landing page for the Retro macOS focus app. It uses a vivid analog-editorial art direction, an interactive Mac-interface concept, a scroll-led session story, an illustrative walkthrough, and a playable sound deck. Built with plain HTML, CSS, and JavaScript; no build step, backend, account system, or external JavaScript library is required.

## Preview locally

1. Unzip the project.
2. Open `index.html` in a browser, or run a local static server from this folder:

   ```sh
   python3 -m http.server 8000
   ```

3. Visit `http://localhost:8000`.

The sound preview starts only after someone presses Play or chooses a track, as required by browser autoplay rules.

## Host it free with GitHub Pages

GitHub Pages is a good fit for this static site. Its free offering supports Pages sites from public repositories; a custom domain is optional and the domain name itself may cost money. Pages serves static files, not a server-side backend. GitHub documents a 1 GB published-site limit and a soft 100 GB monthly bandwidth limit; usage limits may apply.

1. Create a GitHub repository for the site. On GitHub Free, make it public for Pages hosting.
2. Upload the contents of this folder to the repository root (so `index.html`, `styles.css`, `script.js`, and `assets/` are at the top level), then commit the files.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/(root)`, then save.
5. Wait for the Pages deployment, then use the site URL shown in **Settings → Pages**. For a project repository it is usually `https://YOUR-USERNAME.github.io/REPOSITORY/`.

Keep the relative asset paths intact if hosting below a repository path. This public site is only a preview. Retro for Mac is in private beta and is not available for public download; this site does not include or link to a DMG, installer, or Swift-project ZIP. The underlying Swift project still needs a Mac with Xcode to build and test; this page does not claim otherwise.

## Accessibility and behavior

- Keyboard-friendly links and buttons, visible focus states, and a skip link.
- `prefers-reduced-motion` disables scroll-driven movement and decorative animation.
- Responsive layouts for phone, tablet, and desktop widths.
- Sound playback requires an intentional click and uses local audio files.
- The walkthrough is an illustrative interface preview, not a capture from a running Mac app. The interface mockups and timer artwork elsewhere on the page are also illustrative.
- No account data is collected or sent anywhere.

## Contents

- `index.html` — page structure and copy.
- `styles.css` — layout, responsive styles, and motion.
- `script.js` — scroll progress, active section markers, interactive session preview, and local audio playback.
- `assets/retro-campaign.webp` — original editorial campaign artwork.
- `assets/video/retro-walkthrough.mp4` — the 18-second illustrative walkthrough.
- `assets/retro-icon.png` and `assets/retro-mark.png` — supplied Retro identity artwork.
- `assets/audio/*.wav` — the four bundled Retro soundscape files, reproduced for the preview.
