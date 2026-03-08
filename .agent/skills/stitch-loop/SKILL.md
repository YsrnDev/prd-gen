---
name: stitch-loop
description: Iterative verification and fixing loop to match implemented web pages precisely with Stitch designs using Playwright and Stitch MCP.
---

# Stitch-Loop Skill

This skill defines the methodology for meticulously matching the local implementation of a web application to its original design in Stitch.

## Goal
Achieve pixel-perfect or structurally exact implementations of UI designs, minimizing discrepancies in layout, spacing, typography, colors, and overall visual balance.

## The Loop Process

For every page or screen that needs to be fixed, follow these precise steps:

### Phase 1: Context Gathering
1. **Fetch Stitch Design:**
   - Use `mcp_StitchMCP_list_screens` to find the target screen ID.
   - Use `mcp_StitchMCP_get_screen` to get the screen's details. Find the `htmlCode.downloadUrl` or `screenshot.downloadUrl`.
   - Read the HTML code from the downloadUrl to understand the exact structure, Tailwind classes, and inline styles used by Stitch.

2. **Capture Local Implementation:**
   - Ensure the Next.js development server is running.
   - Use `mcp_playwright_browser_navigate` to visit the local page route (e.g., `http://localhost:3000`).
   - Use `mcp_playwright_browser_take_screenshot` to capture the current state of the page.

### Phase 2: Analysis & Comparison
3. **Compare & Contrast:**
   - Mentally or literally compare the Playwright screenshot of the local app with the structure/styles from the Stitch HTML.
   - Identify discrepancies: Missing sections, incorrect spacing/margins/padding, wrong background colors, misaligned flex containers, incorrect typography classes.
   - Focus specifically on structural container classes (flex, grid, max-w-*, paddings) and theming variables.

### Phase 3: Implementation Correction
4. **Modify Local Code:**
   - Use `view_file` to read the corresponding Next.js page or component file.
   - Use `multi_replace_file_content` or `replace_file_content` to apply the exact Tailwind classes and layout structure found in the Stitch HTML.
   - Ensure that React/Next.js specific components (like `<Link>`, next/image) are used correctly while preserving the exact styling.
   - Pay close attention to CSS variables mapping (if the global css maps to specific hex values, use them correctly).

### Phase 4: Verification
5. **Re-Test with Playwright:**
   - Refresh or navigate playwright again.
   - Take a new screenshot.
   - Confirm the discrepancies are resolved. If not, return to Phase 2.

## Important Rules for Stitch Translation
- **Tailwind Exactness:** Stitch uses standard Tailwind HTML. Copy over the *exact* classes (e.g., `flex flex-col gap-6 px-4 py-8 max-w-5xl mx-auto`).
- **Icons & Images:** Ensure SVGs or lucide-react icons match the visual weight of the design.
- **Backgrounds & Gradients:** Pay specific attention to layered backgrounds, gradients (`bg-gradient-to-*`), and absolute positioned aesthetic elements.

Do NOT stop the loop until the page substantially matches the original intent and layout structure of the Stitch design.
