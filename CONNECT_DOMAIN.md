# How to Switch to `thehumancompany.ai`

No problem! It's easy to switch the connected domain.

## Step 1: Update Vercel
1.  Go to **Vercel** > **Settings** > **Domains**.
2.  Enter `thehumancompany.ai` and click **Add**.
3.  (Optional) You can delete `theappcompany.ai` from the list.

## Step 2: Configure Cloudflare
1.  Go to **Cloudflare** and select **`thehumancompany.ai`**.
2.  Go to **DNS** > **Records**.
3.  Add the following two records (or edit them if they exist):

### Record 1 (Root)
*   **Type:** `A`
*   **Name:** `@`
*   **IPv4 address:** `76.76.21.21`
*   **Proxy status:** **DNS Only** (Grey Cloud)

### Record 2 (WWW)
*   **Type:** `CNAME`
*   **Name:** `www`
*   **Target:** `cname.vercel-dns.com`
*   **Proxy status:** **DNS Only** (Grey Cloud)

## Step 3: Done
Vercel should show the blue checks for `thehumancompany.ai` within a minute or two.