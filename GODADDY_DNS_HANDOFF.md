# nevup.in — DNS changes to point the domain at the new Vercel

Please make these changes in **GoDaddy → nevup.in → DNS → Manage Zones**.
Only ONE new record type is required (the two TXT lines). The A record is
already correct, so nothing there needs to change.

---

## 1. ADD — TXT verification records (REQUIRED)

Add **two** TXT records, both on the same host `_vercel`:

| Type | Name / Host | Value | TTL |
|------|-------------|-------|-----|
| TXT  | `_vercel`   | `vc-domain-verify=nevup.in,761a1f6ac8acba869f6f`     | 1 hour (default) |
| TXT  | `_vercel`   | `vc-domain-verify=www.nevup.in,416f60a7639b78214ba9` | 1 hour (default) |

> GoDaddy allows multiple TXT records on the same host — add both.
> Enter the Value EXACTLY as shown (including the `vc-domain-verify=` prefix
> and the comma). Do not add quotes.

This proves control of the domain and moves it to the new Vercel account.

---

## 2. A record — NO CHANGE NEEDED

The apex `@` A record already points to `216.198.79.1`, which is correct for
Vercel. Leave it as-is.

(If GoDaddy ever asks you to re-add it: Type `A`, Host `@`, Value `216.198.79.1`.)

---

## 3. www — NO CHANGE NEEDED

`www.nevup.in` already CNAMEs to `nevup.in`, which is fine. Leave as-is.

---

## After you save

Nothing else for you to do. DNS usually propagates in 5–30 minutes. Once the
TXT records are visible, the domain automatically switches to the new
deployment. You can confirm the TXT is live with:

    nslookup -type=TXT _vercel.nevup.in 8.8.8.8

You should see both `vc-domain-verify=...` values.

Thanks!
