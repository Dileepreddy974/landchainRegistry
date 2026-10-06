# LandChain

LandChain is a standalone React/Vite prototype for a government-authorized digital land registry.

It demonstrates:

- Digital Land Titles with blockchain-style proof records
- SHA-256 document integrity verification
- Document tamper detection
- Registrar-controlled ownership transfers
- Court dispute freezes and releases
- Bank property verification
- Immutable-style registry audit history
- Profile-specific workspaces with restricted navigation
- Owner registration applications and registrar approval

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Build

```bash
npm run build
```

This is intentionally independent from the SecureNet project. It lives in its own folder and currently uses local demo data so the hackathon flows work without a backend or wallet connection.

## Explore the role workflows

1. Choose **Property Owner** at the profile gate.
2. Complete the three-step property registration form.
3. Switch to **Government** with the profile selector.
4. Open the verification queue and approve the submitted application.
5. Switch to **Bank** to generate a read-only property verification report.
6. Switch to **Court** to freeze or release a disputed property.

Each profile only receives the navigation and actions that belong to its authority. The shared demo registry is available to institutional profiles; owners see only their own submitted properties.
