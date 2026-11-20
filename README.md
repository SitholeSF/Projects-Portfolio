# Siziwe Fortunate Sithole — Portfolio

Game Developer | Unity Developer | Extended Reality | Interactive 3D

Live site: https://sitholesf.github.io/Siziwe_Portfolio/

Plain HTML, CSS and JavaScript. No build step, no frameworks, no paid services.

## Structure

```
index.html                         The whole site: hero with technical skills, personal projects, professional experience, contact
assets/
  css/style.css                    All styles (design tokens at the top)
  js/main.js                       Navigation, draft mode, CV and video fallbacks
  js/pdf-viewer.js                 Professional experience document viewer
  documents/
    professional-project-experience.pdf   Zutari project experience CV (unchanged)
    Siziwe Sithole CV.pdf                 Personal CV
  images/projects/                 Project images and video posters
  media/videos/                    Compressed demo videos
  fonts/                           Archivo variable font (OFL licence)
  vendor/pdfjs/                    PDF.js 3.11.174 (Apache 2.0 licence)
404.html  robots.txt  sitemap.xml  .nojekyll
```

## See where content is missing: draft mode

Add `?draft` to the address, for example `http://localhost:8000/?draft`. Dashed purple boxes show every place
waiting for content. Visitors never see them.

## What to add

| What | Where |
|---|---|
| Email address | `index.html`, Contact section: replace `your.email@example.com` (twice, same line) |
| Personal CV | `assets/documents/Siziwe Sithole CV.pdf`. Until it exists, the CV buttons say "available on request" instead of a broken download. |
| Motor mechanics video | Save as `assets/media/videos/vr-motor-mechanics-workshop.mp4`, then in `index.html` replace Project 01's `<img>` with a `<video>` block copied from Project 02 |
| GitHub or demo links | Each project has a commented-out link button under its technologies. Uncomment it and paste your URL. |
| Social preview image | 1200×630 JPG at `assets/images/og-cover.jpg`, then uncomment the `og:image` line in `index.html` |

Search the project for `TODO` to find every spot.

### Skill card colours
Each card in the Technical Skills section (on the first screen) has a colour class: `skill--cyan`, `skill--violet`,
`skill--amber`, `skill--green` or `skill--pink`. Swap the class in `index.html` to
change a card, or edit the hex values under "Skill cards" in `assets/css/style.css`.

### Adding a fourth project (e.g. the VR Robot Assembly Simulator)
Copy one `<article class="project">` block in `index.html` and edit its text, media,
key features and technologies.

### Video tips
Keep videos H.264 MP4, 720p–1080p, under about 15 MB. With ffmpeg:
```
ffmpeg -i input.mp4 -vf scale=1280:-2 -c:v libx264 -crf 27 -preset slow -an -movflags +faststart output.mp4
```
Remove `-an` to keep the audio.

## Preview locally

The PDF viewer needs a web server (browsers block it on `file://`):
```
cd Siziwe_Portfolio
python -m http.server 8000
```
Open http://localhost:8000

## Deploy to GitHub Pages

1. Clone your repository (or open your existing local copy):
   ```
   git clone https://github.com/sitholesf/Siziwe_Portfolio.git
   cd Siziwe_Portfolio
   ```
2. Delete the old files: `index.html`, `PC.mp4`, `MultiplayerVR_Game.mp4` and `3D House.mp4`.
   Compressed copies of those three videos are now in `assets/media/videos/`.
   Keep `Robot simulation_compressed.mp4` only if you plan to add that project; otherwise delete it too.
3. Copy everything from this ZIP into the repository folder, including the hidden `.nojekyll` file.
4. Commit and push:
   ```
   git add -A
   git commit -m "Redesign portfolio"
   git push
   ```
5. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
6. Wait a minute or two, then open https://sitholesf.github.io/Siziwe_Portfolio/

If you rename the repository, update the URLs in `index.html` (canonical, Open Graph, JSON-LD), `sitemap.xml`, `robots.txt` and the `/Siziwe_Portfolio/` paths in `404.html`.
