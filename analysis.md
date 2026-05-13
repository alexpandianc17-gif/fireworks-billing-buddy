# Billing App Analysis & Solutions

## 1. PDF Generation Error
**Issue:** 
When the user clicks "Generate PDF", the console logs the error: `Attempting to parse an unsupported color function "oklch"`. This causes the PDF generation to fail silently on the UI (or remain stuck).

**Reason:**
The application uses modern Tailwind CSS v4, which defines its color system entirely using the CSS `oklch()` color function. The underlying library used for generating PDFs from the DOM, `html2canvas` (version 1.4.1), uses a custom CSS parser that currently **does not support `oklch()`**. When it attempts to parse the document's injected stylesheets, it encounters the `oklch` tokens, throws an exception, and crashes the render process. This happens even if the specific element being printed does not use `oklch` colors, because `html2canvas` parses all stylesheets on the page globally.

**Solution:**
Replace `html2canvas` with `html-to-image`. The `html-to-image` library leverages the browser's native `<foreignObject>` SVG feature to render the DOM natively onto a canvas, which inherently supports all CSS features the browser supports, including `oklch()` and modern CSS variables. 

## 2. Keyboard Navigation Issues
**Issue:**
The user cannot use keyboard buttons like `Tab`, `Enter`, `Delete`, `Arrow Up/Down`, or `Backspace` for entering data seamlessly in the billing table.

**Reason:**
There are two main reasons:
1. **Empty State Handling in Inputs:** The numeric input fields for `cases`, `qty`, and `rate` strictly map their state to numbers. When a user tries to backspace and clear the field, `Number("")` evaluates to `0`. Consequently, the input is forced to display `0`, making it impossible to fully delete the value.
2. **Missing Key Handlers:** The `billing.tsx` file was missing keyboard event listeners to manually orchestrate focus changes on `Enter` and arrow keys. 

**Solution:**
- Relax the `Row` state type from strictly `number` to `number | string` to properly support empty string representations `""`.
- Update input `onChange` handlers to check for empty strings instead of immediately coercing to `0`.
- Implement an `onKeyDown` handler to listen for `ArrowUp`, `ArrowDown`, and `Enter`, explicitly managing focus and moving the cursor between adjacent rows automatically.

## 3. Duplicate Key Warning & Styles 404
**Issue:**
React throws an error: `Encountered two children with the same key, 'Sparklers 10cm'`. Additionally, there is a 404/Connection Refused error for `styles.css`.

**Reason:**
- **Duplicate Keys:** The `ProductCombobox.tsx` maps over the `filtered` products list and uses `p.name` as the React key. If multiple products have the identical name (but differ by company), the keys will conflict, causing UI glitches.
- **CSS 404 Error:** A missing `src/styles.css` might have been mistakenly imported or referenced if the actual file was missing or misconfigured in `index.html`.

**Solution:**
- Update the `.map()` loop in `ProductCombobox.tsx` and `dashboard.tsx` to include both the product's associated company and the array index in the key (e.g., ``key={`${p.name}-${p.company}-${i}`}``). This guarantees uniqueness.
