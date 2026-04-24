# jacktradesnq.com — design & code rules

## Stack
- HTML statique (pas de framework, pas de build step)
- CSS pur dans style.css (pas de Tailwind, pas de SCSS)
- Déploiement Cloudflare Pages auto via push main
- JS vanilla inline minimal pour animations (pétales, herbes)

## Direction esthétique déclarée (ne PAS dévier)
**Ghibli-organic editorial** — paysage prairie peint main + typographie magazine.
- Mood : Kazuo Oga, Studio Ghibli backgrounds, aquarelle chaude
- Ton : chill, nostalgique, zéro agressif corporate
- Point mémorable : duo image peinte + serif éditorial chaud

## Typographie (OBLIGATOIRE)
- H1/H2 : **Fraunces** (serif warm italique) via Fontshare
- Body : **Satoshi** (sans-serif clean) via Fontshare
- Scale 1.25 (minor third) : 0.75 / 0.875 / 1 / 1.125 / 1.5 / 2.25 / 3.5 rem
- Weights extremes : 300 vs 800 (pas 400/600)

## Couleurs (OKLCH uniquement, pas de hex dans les composants)
3 couches : primitive (valeurs OKLCH brutes) → semantic (bg, fg, card, primary, muted, border, ring) → component overrides.

## Spacing (4pt grid strict)
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 — jamais 13px / 27px.

## Radius (pillowy, direction unique)
4px (inputs) / 12px (cards) / 999px (CTA pills).

## Anti-slop rules (non-négociables)
- JAMAIS : Inter, Roboto, Arial, Open Sans, Lato, Space Grotesk, system-ui seul
- JAMAIS : gradient violet→rose, purple-on-white
- JAMAIS : 3 cards emoji icons + "Fast / Secure / Scalable"
- JAMAIS : "Get Started" + "Learn more" ghost centered hero
- JAMAIS : lorem ipsum
- JAMAIS : emoji en remplacement d'icônes UI
- JAMAIS : ombre noire plate — toujours layered OKLCH alpha
- JAMAIS : mélange glassmorphism + neubrutalism dans un écran

## I18n
Tout en anglais SAUF footer légal FR (mentions légales + disclaimer AMF D.321-1 + confidentialité) pour conformité française.

## Accessibilité
- Focus ring global `:focus-visible`
- Contraste WCAG AA (4.5:1 body, 3:1 large)
- Reduced-motion honoré
- Semantic HTML

## Workflow
- Branche dédiée par feature (JAMAIS main)
- 1 fix = 1 vérif visuelle avant commit
- Après merge : purge Cloudflare cache via dashboard
- Angelo copy-colle les specs depuis le Claude principal vers ce CLI

## <frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design,
this creates what users call the "AI slop" aesthetic. Avoid this: make creative,
distinctive frontends that surprise and delight. Focus on:

Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic
fonts like Arial and Inter; opt instead for distinctive choices that elevate the
frontend's aesthetics.

Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency.
Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
Draw from IDE themes and cultural aesthetics for inspiration.

Motion: Use animations for effects and micro-interactions. Prioritize CSS-only
solutions for HTML. Focus on high-impact moments: one well-orchestrated page load
with staggered reveals creates more delight than scattered micro-interactions.

Backgrounds: Create atmosphere and depth rather than defaulting to solid colors.
Layer CSS gradients, use geometric patterns, or add contextual effects.

Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively. Vary between light and dark themes, different fonts,
different aesthetics. You still tend to converge on common choices (Space Grotesk,
for example) across generations. Think outside the box.
</frontend_aesthetics>
