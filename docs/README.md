# Retro — focus app landing page

A responsive, single-page scrollytelling site for the Retro macOS focus app. It uses plain HTML, CSS, and JavaScript; there is no build step, backend, account system, or external JavaScript library. The four local WAV files power the interactive sound-deck preview. The supplied Retro app icon is used as the site mark.

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

Keep the relative asset paths intact if hosting below a repository path. This is a promotional site, not an installer: it does not include a signed/notarized macOS app download or a hosted Swift-project ZIP link. The underlying Swift project still needs a Mac with Xcode to build and test; this page does not claim otherwise.

## Accessibility and behavior

- Keyboard-friendly links, buttons, track selection, and ARIA labels for interactive controls.
- `prefers-reduced-motion` disables scroll-driven movement and decorative animation.
- Responsive layout for phone, tablet, and desktop widths.
- No account data is collected or sent anywhere. Sound files load from this site's own `assets/audio/` folder.
- The focus timer shown in the hero and feature panels is illustrative artwork, not a live timer or screenshot of the running app.

## Contents

- `index.html` — page structure and copy.
- `styles.css` — layout, responsive styles, and motion.
- `script.js` — scroll progress/reveals, story steps, and local audio preview.
- `assets/retro-icon.png` — supplied Retro app icon used as the site identity.
- `assets/audio/*.wav` — the four bundled Retro soundscape files, reproduced for the preview.
