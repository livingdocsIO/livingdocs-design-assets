# Shared Neutral Assets

Store language-neutral assets here to avoid duplicating files across animation folders.

Examples:
- cursor shapes
- generic user avatars
- neutral user labels

## Resolution Strategy

Animations should resolve assets in this order:
1. Local animation assets (`./assets/<file>`)
2. Shared neutral assets (`../assets/shared/<file>`)

A helper script is available at `../asset-resolver.js` and can be used from each animation `index.html`.

All current highlight EN/DE pages already include this helper.
If an image in `assets/` is missing, the helper automatically retries the same filename from `../assets/shared/`.
