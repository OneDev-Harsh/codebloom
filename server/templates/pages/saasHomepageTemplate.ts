export const saasHomepageTemplate = {
  id: 'saas',
  name: 'SaaS Homepage',
  description: 'Product-focused layout with features and pricing',
  code: `
<!DOCTYPE html>
<html>
<head>
  <title>SaaS Homepage</title>
  <style>
    body {
      font-family: sans-serif;
      background: #0f172a;
      color: white;
      margin: 0;
      line-height: 1.6;
    }
    section {
      padding: 80px 40px;
      border-bottom: 1px solid #1e293b;
    }
    h1 {
      font-size: 48px;
      margin-bottom: 16px;
    }
    h2 {
      font-size: 32px;
      margin-bottom: 12px;
    }
    p {
      font-size: 18px;
      opacity: 0.85;
      max-width: 600px;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 24px;
      margin-top: 40px;
    }
    .card {
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 24px;
    }
    button {
      padding: 12px 24px;
      background: #6366f1;
      border: none;
      color: white;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
    }
  </style>
</head>
<body>

<section>
  <h1>Build and scale your SaaS</h1>
  <p>All the tools you need to launch, manage, and grow your software product.</p>
  <button>Start Free Trial</button>
</section>

<section>
  <h2>Features</h2>
  <div class="features">
    <div class="card">
      <h3>Fast Setup</h3>
      <p>Launch your product in minutes, not weeks.</p>
    </div>
    <div class="card">
      <h3>Secure by Default</h3>
      <p>Built with best practices for modern security.</p>
    </div>
    <div class="card">
      <h3>Scalable</h3>
      <p>Designed to grow with your business.</p>
    </div>
  </div>
</section>

<section>
  <h2>Pricing</h2>
  <p>Simple and transparent pricing for teams of all sizes.</p>
</section>

</body>
</html>
`
}