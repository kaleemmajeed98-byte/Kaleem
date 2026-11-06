<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bf223e3b-ce52-478f-b730-cbc7a0de0ef8

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and configure `JWT_SECRET` with a random value of at least 32 bytes. Set a separate random `BOOTSTRAP_TOKEN` for initial administrator provisioning.
3. Run the app:
   `npm run dev`

There are no seeded login credentials. Once the server is running over HTTPS (or localhost during development), provision the first platform administrator exactly once by sending `POST /api/v1/auth/bootstrap` with the `x-bootstrap-token` header and a JSON body containing `email`, `password` (at least 12 characters), `firstName`, and `lastName`. Use an email not already assigned to a legacy account. Remove `BOOTSTRAP_TOKEN` from the runtime environment after provisioning. Existing accounts with legacy hashes cannot sign in until a platform administrator resets their password with `PATCH /api/v1/users/:id/password` and their PIN with `PATCH /api/v1/users/:id/pin`; new PINs must contain 6 digits.

## Windows POS and KDS apps

Build the two portable Windows executables:

```powershell
npm run build:desktop
```

The files are written to `release/pos/Indolj-POS-1.0.0-Windows-x64.exe` and
`release/kds/Indolj-KDS-1.0.0-Windows-x64.exe`. Start each app and enter the
root URL of the deployed Indolj server (for example, `https://erp.example.com`);
both terminals must use the same server to share orders. Use **Server settings**
from the app menu (or `Ctrl+,`) to change the server later.
