# Migrate From React Router — Cleanup

[Guide and prerequisites](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb.md) · Published skill · `@tanstack/react-router@1.170.46`.

## Cleanup

- [ ] **Remove React Router and verify**

```bash
npm uninstall react-router react-router-dom
grep -r "from 'react-router" src/  # find stale imports
npx tsc --noEmit                    # verify clean build
```

- [ ] **Test all routes** — verify rendering, navigation (incl. back/forward), search params, dynamic params, and loaders
