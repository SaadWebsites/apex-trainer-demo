# APEX — Gym / Personal Trainer Demo Site

A complete, ready-to-use demo website for a personal training business, with an
**appointment booking page that emails the owner instantly** (free, via
[FormSubmit](https://formsubmit.co) — no signup or backend needed).

## Live demo

- Home: https://saadwebsites.github.io/apex-trainer-demo/
- Booking: https://saadwebsites.github.io/apex-trainer-demo/book.html

## How the owner gets notified

Every booking on `book.html` is emailed to the owner in real time (client name,
session, date/time, location, phone, booking code).

**One-time activation:** the first booking triggers an activation email to the
owner address — click **"Activate Form"** once. Done forever after.

To point bookings at a different owner, edit one line in `assets/site.js`:

```js
const OWNER_EMAIL = 'owner@example.com'
```

Set it to `''` for demo mode (no emails, confirmations still shown).

## Using this for your own business

1. Edit the text in `index.html` and `book.html` (name, services, prices, contact).
2. Replace the Unsplash image URLs with your own photos.
3. Change `OWNER_EMAIL` in `assets/site.js` to your email.
4. Upload the folder to your host (drag-and-drop on [Netlify Drop](https://app.netlify.com/drop) works).

## Run locally

```
node server.mjs
```

Then open http://localhost:4173/

## Stack

Plain HTML + Tailwind (CDN) + vanilla JS. No build step, no dependencies —
it cannot break the way a framework app can.
