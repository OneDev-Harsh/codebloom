export const portfolioPageTemplate = {
  id: 'portfolio',
  name: 'Portfolio',
  description: 'Personal introduction and projects',
  code: `
<!DOCTYPE html>
<html>
<head>
  <title>Portfolio</title>
  <style>
    body { font-family: sans-serif; background: #020617; color: white; padding: 40px; }
    h1 { font-size: 40px; }
    .project { margin-top: 24px; padding: 20px; border: 1px solid #1e293b; border-radius: 8px; }
  </style>
</head>
<body>

<h1>Your Name</h1>
<p>Short bio about you.</p>

<div class="project">
  <h3>Project One</h3>
  <p>Description of the project.</p>
</div>

</body>
</html>
`
}
