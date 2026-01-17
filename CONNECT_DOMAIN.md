# Connecting `thehumancompany.ai`

Since your website is a Next.js application, the easiest way to connect your domain is by deploying to **Vercel**.

## Step 1: Push to GitHub
1. Create a repository on GitHub.
2. Push your code:
   ```bash
   git add .
   git commit -m "Initial launch"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

## Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** -> **"Project"**.
3. Import your `humancompany-website` repository.
4. Click **Deploy**.

## Step 3: Connect Domain
1. Once deployed, go to your project **Settings** -> **Domains**.
2. Enter `thehumancompany.ai` and click **Add**.
3. Vercel will give you DNS records (A Record and CNAME).
4. Go to your domain registrar (where you bought the domain) and add these records.

Your site will be live at `https://thehumancompany.ai` shortly after!
