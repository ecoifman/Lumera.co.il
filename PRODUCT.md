# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences with equal weight (confirmed by Eyal, October 2026):

- **Homeowners** building, buying or renovating a home in Israel who want a smart home
  without opening walls.
- **Professionals** who specify or install the system: architects and interior designers,
  developers and contractors, electricians and installers. Each group has its own page under
  `/professionals/`.

## Product Purpose

The website of Lumera (לומרה סמארט בע״מ, Haifa). It explains Lumera's wireless smart-home system
and turns interest into a consultation. Success is a visitor who starts a WhatsApp conversation
(or calls) already understanding what Lumera does.

Organic search is part of the purpose: the home page ranks first for "בית חכם ללא חציבות" and
"לומרה בית חכם", and keeps its URL, title and topic.

## Positioning

The two differentiators the site leads with (confirmed):

1. **בלי חציבות.** Power runs straight to the light fittings and control travels wirelessly from
   the switch or the phone, so adding or moving a switch does not mean opening a wall.
2. **Designed switches and touch screens with a Hebrew interface** (the L10 series). Each room
   can have its own screen design.

## Operating Context

- The path to a sale: a consultation on WhatsApp or by phone, then a review of the electrical
  plan, then a detailed quote. Installation is done by certified installers whom Lumera
  coordinates.
- Visitors arrive mainly from organic search and from links Lumera shares; the site is in Hebrew,
  right to left.
- The electrical-plan analyzer at `/tool/` is a separate tool and stays as it is.

## Capabilities and Constraints

- Solution areas, one page each: smart switches and touch screens; magnetic and smart lighting
  ("פס צבירה מגנטי"); hidden audio and multiroom; security and entry control; climate, shading and
  energy; no-chasing infrastructure.
- Control from the wall, the app and by voice (Alexa, Google Assistant). Local control does not
  depend on Wi-Fi; remote control from outside the home needs internet.
- Static Astro site on uPress. Keep every URL (trailing slashes), one H1 per page, and the FAQ
  text identical to its FAQPage data.
- Undecided product facts, not to be stated until Eyal confirms them: control protocol (RF or
  Zigbee), neutral-wire requirement, Shabbat mode, public e-mail and Instagram, service area and
  street address, naming the pilot project.

## Brand Commitments

- Name: Lumera / לומרה. English line: "LUMERA · Home Simplicity".
- The explainer film is the brand's main asset. The home hero shows it edge to edge with the
  headline over it (Eyal's request); the full film with sound opens from "צפו בסרטון".
- Voice: Hebrew, plain and specific.
- The logo exists as an SVG in Dropbox (`LOGO SVG.svg`) and is not in the repo yet.

## Evidence on Hand

- The explainer film (`media-src/explainer-master.mp4`, 70.9 s, Hebrew narration with burned-in
  captions) and the frames cut from it (`src/assets/img/film/`).
- Contact: phone and WhatsApp 054-236-3473; Facebook, YouTube and LinkedIn pages.
- Not available and never to be invented: testimonials, client or project names, installation
  photos, certifications, prices, service-area claims.

## Product Principles

1. Lead with "בלי חציבות": every page makes clear that control is added without opening walls.
2. Show the product in real rooms: the switches and screens are a differentiator, not a spec line.
3. Two audiences, one system: homeowners and professionals get equal weight and their own path.
4. Every page ends in a conversation: a WhatsApp consultation is the primary action.
5. Only verified claims: specs, prices, clients and certifications appear after confirmation.

## Accessibility & Inclusion

Israeli Standard IS 5568 (WCAG AA) applies by law to Israeli business websites. The site is in
Hebrew, right to left, and publishes an accessibility statement.
