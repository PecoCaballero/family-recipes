## 1. Author sub-changes

- [ ] 1.1 Create change `whatsapp-design-system` with proposal, design, delta spec, and tasks (web)
- [ ] 1.2 Create change `whatsapp-list-ux` with proposal, design, delta spec, and tasks (web)
- [ ] 1.3 Create change `finish-mvp-features` with proposal, design, delta spec, and tasks (api, web, shared)
- [ ] 1.4 Create change `i18n-and-polish` with proposal, design, delta spec, and tasks (web)
- [ ] 1.5 Create change `google-oauth` with proposal, design, delta spec, and tasks (api, web, shared)
- [ ] 1.6 Create change `recipe-nesting` with proposal, design, delta spec, and tasks (api, web, shared)

## 2. Design system and familiarity

- [ ] 2.1 Implement `whatsapp-design-system` and run `yarn verify` (web)
- [ ] 2.2 Implement `whatsapp-list-ux` and run `yarn verify` (web)

## 3. Finish MVP features

- [ ] 3.1 Implement `finish-mvp-features` and run `yarn verify:full` (api, web, shared)
- [ ] 3.2 Implement `i18n-and-polish` and run `yarn verify` (web)

## 4. Google Sign-In

- [ ] 4.1 Confirm Google OAuth Client ID/secret and redirect URIs are available (web, api)
- [ ] 4.2 Implement `google-oauth` including the Prisma migration, and run `yarn verify:full` (api, web, shared)

## 5. Launch readiness review

- [ ] 5.1 Walk the core journey (register/google sign-in → accept invitation → save/share recipe) in light and dark mode against `mvp-readiness` scenarios (web)
- [ ] 5.2 Confirm no deceptive stub UI remains and all five locales are in sync (web)

## 6. Archive

- [ ] 6.1 Archive each implemented sub-change with `openspec archive <change> -y`
- [ ] 6.2 Archive `mvp-launch` after all sub-changes are archived
