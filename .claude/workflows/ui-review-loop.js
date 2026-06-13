export const meta = {
  name: 'ui-review-loop',
  description: 'Chạy local → chụp ảnh giao diện → phân tích UI/UX → lên plan → implement thay đổi',
  phases: [
    { title: 'Setup', detail: 'Khởi động dev server, chuẩn bị thư mục screenshots' },
    { title: 'Capture', detail: 'Dùng Playwright chụp ảnh tất cả màn hình ở 3 viewport' },
    { title: 'Analyze', detail: 'Đọc từng ảnh, phân tích UI/UX theo checklist' },
    { title: 'Plan', detail: 'Tổng hợp findings và viết plan thay đổi' },
    { title: 'Implement', detail: 'Thực hiện các thay đổi đã plan' },
  ],
};

// ────────────────────────────────────────────────────────────────
// UI/UX Review Loop
// Quy trình: Chạy local → Chụp ảnh → Phân tích → Plan → Implement
// ────────────────────────────────────────────────────────────────

const SCREENSHOT_DIR = 'e2e/screenshots';
const BASE_URL = args.baseUrl || 'http://localhost:3003';
const AUTH_EMAIL = args.email || '';
const AUTH_PASSWORD = args.password || '';

// ── Phase 1: Setup ──────────────────────────────────────────────
phase('Setup');

// Check if dev server is running
const serverCheck = await agent(
  `Check if a Next.js dev server is running at ${BASE_URL} with Gia Phả OS content. Run: curl -sf ${BASE_URL} | grep -q "Gia Ph" && echo "RUNNING" || echo "NOT_RUNNING". Also check if port 3003 is available: lsof -i :3003 > /dev/null 2>&1 && echo "PORT_IN_USE" || echo "PORT_FREE". Report both results.`,
  { label: 'check-server', phase: 'Setup' }
);

let serverStarted = false;
if (serverCheck && serverCheck.includes('NOT_RUNNING')) {
  log('Dev server chưa chạy. Đang khởi động với Supabase placeholder env vars...');
  await agent(
    `Start the Next.js dev server with Supabase placeholder env vars on port 3003. Run: cd /Users/loind/Downloads/giapha-os && NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co" NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="placeholder-key" npm run dev -- -p 3003 &
    Then wait up to 30 seconds for the server to respond with Gia Phả OS content (use: for i in $(seq 1 30); do curl -sf http://localhost:3003 | grep -q "Gia Ph" && echo "READY" && break; sleep 1; done). Report when ready or if it fails.`,
    { label: 'start-server', phase: 'Setup' }
  );
  serverStarted = true;
  log('✓ Dev server đã khởi động');
} else {
  log('✓ Dev server đang chạy');
}

// Clean old screenshots
await agent(
  `Clean old screenshots: rm -rf /Users/loind/Downloads/giapha-os/${SCREENSHOT_DIR}/*.png 2>/dev/null; mkdir -p /Users/loind/Downloads/giapha-os/${SCREENSHOT_DIR}`,
  { label: 'clean-screenshots', phase: 'Setup' }
);

// ── Phase 2: Capture screenshots ────────────────────────────────
phase('Capture');

log('Chụp ảnh giao diện ở 3 viewport: mobile (375), tablet (768), desktop (1440)...');

const envPrefix = AUTH_EMAIL ? `AUTH_EMAIL=${AUTH_EMAIL} AUTH_PASSWORD=${AUTH_PASSWORD}` : '';
const captureResult = await agent(
  `Run Playwright screenshot capture. Execute: cd /Users/loind/Downloads/giapha-os && ${envPrefix} BASE_URL=${BASE_URL} npx playwright test --config=playwright.config.ts 2>&1. Then list all .png files in ${SCREENSHOT_DIR}/ with their sizes. Report the full list of captured files.`,
  { label: 'capture-screenshots', phase: 'Capture' }
);

// Count screenshots
const listResult = await agent(
  `List all PNG files in /Users/loind/Downloads/giapha-os/${SCREENSHOT_DIR}/ with sizes. Run: ls -lh /Users/loind/Downloads/giapha-os/${SCREENSHOT_DIR}/*.png 2>/dev/null | awk '{print $5, $NF}'. Report the count and file list.`,
  { label: 'list-screenshots', phase: 'Capture' }
);

log(`✓ Đã chụp ảnh. ${listResult || 'Xem danh sách bên dưới.'}`);

// ── Phase 3: Analyze each screenshot ────────────────────────────
phase('Analyze');

log('Phân tích UI/UX từng màn hình...');

// Get list of unique pages from screenshots
const pagesResult = await agent(
  `List unique page names from screenshot files in /Users/loind/Downloads/giapha-os/${SCREENSHOT_DIR}/. Run: ls /Users/loind/Downloads/giapha-os/${SCREENSHOT_DIR}/*.png 2>/dev/null | xargs -I{} basename {} | sed 's/-mobile\\.png//;s/-tablet\\.png//;s/-desktop\\.png//' | sort -u. Report the list of unique page names.`,
  { label: 'get-pages', phase: 'Analyze' }
);

const pageNames = (pagesResult || '').trim().split('\n').filter(Boolean);

if (pageNames.length === 0) {
  log('⚠ Không tìm thấy screenshot nào. Kiểm tra lại dev server và Playwright.');
} else {
  log(`Tìm thấy ${pageNames.length} màn hình: ${pageNames.join(', ')}`);

  // Analyze each page (desktop viewport preferred for analysis)
  const analyses = await parallel(
    pageNames.map(pageName => () =>
      agent(
        `You are a UI/UX expert analyzing a screenshot of a Vietnamese family genealogy web app.

Read the screenshot at: /Users/loind/Downloads/giapha-os/${SCREENSHOT_DIR}/${pageName}-desktop.png
If desktop doesn't exist, try: /Users/loind/Downloads/giapha-os/${SCREENSHOT_DIR}/${pageName}-tablet.png
If tablet doesn't exist, try: /Users/loind/Downloads/giapha-os/${SCREENSHOT_DIR}/${pageName}-mobile.png

Also read the mobile version for responsive comparison: /Users/loind/Downloads/giapha-os/${SCREENSHOT_DIR}/${pageName}-mobile.png

Analyze against these criteria (score 1-5 each):
1. **Visual Hierarchy** — Is the most important content prominent? Clear heading structure?
2. **Color & Contrast** — Good color palette? Sufficient contrast (4.5:1 for text)?
3. **Typography** — Readable font sizes? Good line-height? Consistent scale?
4. **Spacing & Layout** — Consistent spacing? Good use of whitespace? No cramped elements?
5. **Interactive Elements** — Clear clickable elements? Good button styles? Hover states visible?
6. **Empty States** — If applicable, helpful empty state with illustration/action?
7. **Mobile Responsiveness** — Does mobile layout work well? No horizontal scroll? Touch targets ≥44px?
8. **Dark Mode** — (if dark screenshot available) Good contrast? Borders visible?
9. **Accessibility** — Focus states visible? aria-labels? Skip nav?
10. **Overall Polish** — Professional feel? Consistent design system? No visual bugs?

Return a JSON object with this exact structure:
{
  "page": "${pageName}",
  "scores": { "visual_hierarchy": N, "color_contrast": N, "typography": N, "spacing_layout": N, "interactive": N, "empty_states": N, "mobile": N, "dark_mode": N, "accessibility": N, "overall_polish": N },
  "average_score": N.N,
  "strengths": ["...", "..."],
  "issues": [
    { "severity": "critical|high|medium|low", "category": "...", "description": "...", "suggestion": "..." }
  ],
  "top_3_improvements": ["...", "...", "..."]
}`,
        { label: `analyze:${pageName}`, phase: 'Analyze', schema: {
          type: 'object',
          properties: {
            page: { type: 'string' },
            scores: {
              type: 'object',
              properties: {
                visual_hierarchy: { type: 'number' },
                color_contrast: { type: 'number' },
                typography: { type: 'number' },
                spacing_layout: { type: 'number' },
                interactive: { type: 'number' },
                empty_states: { type: 'number' },
                mobile: { type: 'number' },
                dark_mode: { type: 'number' },
                accessibility: { type: 'number' },
                overall_polish: { type: 'number' },
              }
            },
            average_score: { type: 'number' },
            strengths: { type: 'array', items: { type: 'string' } },
            issues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                  category: { type: 'string' },
                  description: { type: 'string' },
                  suggestion: { type: 'string' },
                }
              }
            },
            top_3_improvements: { type: 'array', items: { type: 'string' } },
          }
        }}
      )
    )
  );

  const validAnalyses = analyses.filter(Boolean);
  log(`✓ Đã phân tích ${validAnalyses.length}/${pageNames.length} màn hình`);

  // ── Phase 4: Write Plan ──────────────────────────────────────
  phase('Plan');

  log('Tổng hợp findings và viết plan thay đổi...');

  // Synthesize all analyses into a plan
  const planResult = await agent(
    `You are a UI/UX architect. Based on the following analysis results from multiple pages of a Vietnamese family genealogy web app (Next.js 16 + Tailwind CSS v4 + Framer Motion), write a prioritized improvement plan.

Analysis results:
${JSON.stringify(validAnalyses, null, 2)}

The project uses:
- Tailwind CSS v4 with custom design tokens in app/globals.css
- Framer Motion 12 for animations
- Lucide React for icons
- Custom ThemeProvider (light/dark/system)
- Inter + Playfair Display fonts

Write the plan as a Markdown file to: /Users/loind/Downloads/giapha-os/plans/ui-review-${new Date().toISOString().slice(0,10)}.md

Structure:
# UI/UX Review Plan — [date]

## Summary
- Average scores per page
- Overall assessment

## Critical Issues (fix first)
## High Priority
## Medium Priority
## Low Priority / Nice-to-have

## Implementation Plan
For each change:
- File(s) to modify
- What to change
- Why (reference the analysis finding)

## Verification
- How to verify each change

Be specific — include Tailwind classes, CSS values, and code snippets where possible.`,
    { label: 'write-plan', phase: 'Plan' }
  );

  log('✓ Plan đã được ghi. Đọc file plan để xem chi tiết.');

  // ── Phase 5: Present to user ─────────────────────────────────
  log('');
  log('═══════════════════════════════════════════════════════');
  log('📋 Kết quả:');
  log('═══════════════════════════════════════════════════════');
  log('');
  log(`   Screenshots: ${SCREENSHOT_DIR}/`);
  log(`   Plan: plans/ui-review-${new Date().toISOString().slice(0,10)}.md`);
  log('');
  log('   Bước tiếp theo:');
  log('   1. Đọc plan và review các thay đổi đề xuất');
  log('   2. Approve plan để bắt đầu implement');
  log('   3. Sau khi implement, chạy lại workflow để verify');
}

// Cleanup: stop dev server if we started it
if (serverStarted) {
  log('');
  log('💡 Dev server vẫn đang chạy. Dừng bằng: kill $(lsof -t -i:3000)');
}
