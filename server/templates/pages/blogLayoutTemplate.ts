export const blogLayoutTemplate = {
  id: 'blog',
  name: 'Blog Layout',
  description: 'Blog homepage with posts and sidebar',
  code: `
<!DOCTYPE html>
<html>
<head>
  <title>Blog</title>
  <style>
    body {
      font-family: sans-serif;
      background: #0f172a;
      color: white;
      margin: 0;
      line-height: 1.6;
    }
    header {
      padding: 80px 40px;
      text-align: center;
      border-bottom: 1px solid #1e293b;
    }
    main {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 40px;
      padding: 60px 40px;
    }
    article {
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 42px;
      margin-bottom: 12px;
    }
    h2 {
      font-size: 24px;
      margin-bottom: 8px;
    }
    p {
      opacity: 0.85;
    }
    aside {
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 24px;
      height: fit-content;
    }
    a {
      color: #818cf8;
      text-decoration: none;
      font-size: 14px;
    }
  </style>
</head>
<body>

<header>
  <h1>Our Blog</h1>
  <p>Insights, updates, and stories from our team.</p>
</header>

<main>
  <section>
    <article>
      <h2>Blog post title</h2>
      <p>Short summary of the blog post goes here.</p>
      <a href="#">Read more →</a>
    </article>

    <article>
      <h2>Another post</h2>
      <p>Another short summary of a blog post.</p>
      <a href="#">Read more →</a>
    </article>
  </section>

  <aside>
    <h3>Categories</h3>
    <p>Product</p>
    <p>Engineering</p>
    <p>Design</p>
  </aside>
</main>

</body>
</html>
`
}