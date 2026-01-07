export const landingPageTemplate = {
  id: 'landing',
  name: 'Landing Page',
  description: 'Hero, features, and call-to-action',
  code: `
<!DOCTYPE html>
<html>
<head>
  <title>Landing Page</title>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: white; margin: 0; }
    section { padding: 80px 40px; }
    h1 { font-size: 48px; margin-bottom: 16px; }
    p { font-size: 18px; opacity: 0.85; }
    button { padding: 12px 24px; background: #6366f1; border: none; color: white; border-radius: 8px; }
  </style>
</head>
<body>

<section>
  <h1>Your Product Name</h1>
  <p>Short value proposition goes here.</p>
  <button>Get Started</button>
</section>

</body>
</html>
`
}
