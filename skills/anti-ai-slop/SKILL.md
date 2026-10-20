
---
name: anti-ai-slop
description: Builds and refactors web applications with intentional UI design, strong visual hierarchy, consistent design systems, clean maintainable code, and functional interactions. Use when creating or modifying frontend UI, React components, layouts, or styles.
---

# Anti-AI-Slop Development Skill

## 1. Core Principles

- Build interfaces that look intentionally designed, not automatically generated.
- Prioritize usability, clarity, visual hierarchy, and consistency.
- Understand the existing project before changing code.
- Follow the existing stack, architecture, naming conventions, and design system.
- Make the smallest necessary changes. Never rewrite unrelated code.
- Do not add features, dependencies, or decorative elements without a clear reason.

## 2. Avoid Generic AI Design

Do not automatically use:
- Purple-blue gradients and excessive glowing effects.
- Glassmorphism without a clear design purpose.
- **Box shadows**: Do not use box shadows (`shadow-sm`, `shadow-md`, `shadow-lg`, or floating panels) on cards and page containers. Use clean flat surfaces with subtle high-contrast borders (`border-slate-800` or `border-white/10`).
- **Excessive Icons**: Do not litter every header, title, or stat box with decorative icons (e.g. random award, scale, shield, or activity icons next to every heading). Rely on strong typography and clean data layout.
- Repeated card grids for every section.
- Oversized headings and excessive empty space.
- Emoji as a substitute for proper icons.
- Fake statistics, testimonials, logos, or placeholder content presented as real.
- The same hero, feature grid, and CTA layout for every website.

## 2.1 Color Discipline & Financial Palette Standards
- **Monochrome Base**: Prioritize clean black and crisp white (`#080808` / `#0c0d12` dark background, white text, muted slate `#94a3b8`).
- **No Neon Colors**: NEVER use neon glowing greens, cyan, or neon magentas/purples.
- **Authentic Financial Green**:
  - Badge / Sentiment Pill: Deep forest pine background (`bg-[#062c19]` / `bg-[#0d2818]`, border `border-[#0e4429]`, text `#34d399` / `#2fe695`).
  - Solid Price / Change Tag: Deep forest emerald (`bg-[#008a4b]` / `bg-[#059669]`, text `#ffffff` font-bold).
- **Authentic Financial Red**:
  - Solid Price / Negative Tag: Deep crimson / brick red (`bg-[#c52838]` / `bg-[#dc2626]`, text `#ffffff` font-bold).
  - Negative Pill: Deep burgundy background (`bg-[#2a0e12]`, border `border-[#4c151c]`, text `#f87171`).
- **Neutral Badges**: Deep muted slate (`bg-slate-800/80` or `bg-[#1a1f2c]`, border `border-slate-700`, text `text-slate-300`).

These styles are strictly enforced across all components and pages.

## 3. Design Before Coding

Before implementing:
1. Identify the page's purpose and target users.
2. Inspect existing components, styles, assets, and routes.
3. Establish the visual hierarchy and page structure.
4. Reuse the existing design system where appropriate.
5. Choose typography, spacing, colors, borders, and imagery deliberately.
6. Review relevant design references when available.
7. Create a short implementation plan for complex changes.

## 4. Frontend Quality

- Use semantic HTML and accessible controls.
- Make layouts responsive across mobile, tablet, and desktop.
- Use consistent spacing, typography, colors, and component states.
- Implement real interactions; do not create decorative buttons that do nothing.
- Include loading, empty, error, and success states where relevant.
- Use appropriate image assets and preserve their aspect ratios.
- Avoid unnecessary dependencies and duplicated components.
- Follow the project's existing conventions instead of introducing another pattern.

## 5. Code Quality

- Keep components focused and reasonably small.
- Extract reusable components only when reuse or clarity justifies it.
- Use descriptive variable, function, and component names.
- Avoid duplicated logic, dead code, unnecessary abstractions, and deeply nested conditionals.
- Handle API failures and missing data safely.
- Never invent API fields or assume data exists without checking.
- Do not suppress errors just to make the build pass.

## 6. Change Management

Before editing:
- Read the relevant files and understand their dependencies.
- Identify exactly which files need changes.
- Preserve existing functionality and user data.
- Do not replace working code with a new implementation without a reason.

After editing:
- Review the diff.
- Check for unintended changes.
- Fix issues introduced by the modification.

## 7. Verification Checklist

Before declaring the task complete:
- Run the available lint, type-check, tests, and production build as appropriate.
- Run the application and inspect the actual result when possible.
- Check responsive layouts and important interaction states.
- Check browser console errors and failed API requests when available.
- Verify that the result matches the requested design and existing conventions.
- Report what was tested and what could not be verified.

Never claim a test passed unless it was actually run successfully.
