export function buildSplashHtml(message: string, detail: string): string {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0f172a;
    color: #e2e8f0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 20px;
    user-select: none;
    -webkit-user-select: none;
  }
  .shield {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #1e40af, #3b82f6);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    box-shadow: 0 4px 24px rgba(59,130,246,0.35);
  }
  .message {
    font-size: 18px;
    font-weight: 600;
    color: #f1f5f9;
    letter-spacing: -0.01em;
  }
  .detail {
    font-size: 13px;
    color: #94a3b8;
    max-width: 340px;
    text-align: center;
    line-height: 1.65;
  }
  .spinner-wrap { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #1e293b;
    border-top-color: #60a5fa;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }
  .spinner-label { font-size: 12px; color: #475569; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
  <div class="shield">🔐</div>
  <div class="message">${message}</div>
  <div class="detail">${detail}</div>
  <div class="spinner-wrap">
    <div class="spinner"></div>
    <span class="spinner-label">Connecting to identity provider...</span>
  </div>
</body>
</html>`;
  return html;
}

export const STANDARD_SPLASH = buildSplashHtml(
  'Signing In',
  'Complete sign-in in this window. You will be redirected automatically once authenticated.',
);
