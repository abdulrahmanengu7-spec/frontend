# GitHub Pages Deploy Guide

This frontend is ready for GitHub Pages deployment.

## Repository
Use this repository:

```text
https://github.com/abdulrahmanengu7-spec/frontend.git
```

## GitHub Pages settings
Go to:

```text
GitHub repo > Settings > Pages
```

Set:

```text
Source: GitHub Actions
```

## Push commands
Run these commands inside the frontend folder:

```bash
git init
git branch -M main
git remote add origin https://github.com/abdulrahmanengu7-spec/frontend.git
git add .
git commit -m "GitHub Pages ready frontend"
git push -u origin main
```

If remote already exists:

```bash
git remote set-url origin https://github.com/abdulrahmanengu7-spec/frontend.git
git push -u origin main
```

## Live URL
After GitHub Actions completes, the site URL will be:

```text
https://abdulrahmanengu7-spec.github.io/frontend/
```

## Future updates
After every frontend code/design change, run:

```bash
git add .
git commit -m "update frontend"
git push
```

GitHub Actions will automatically rebuild and publish the website.

## Backend CORS
Add this GitHub Pages URL in your backend/Vercel `FRONTEND_URL` environment variable:

```text
https://abdulrahmanengu7-spec.github.io/frontend
```

If you already have other frontend URLs, comma-separate them.
