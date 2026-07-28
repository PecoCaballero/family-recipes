# Family Recipes API

This backend is a lightweight Express API scaffold for the Family Recipes app.
It is currently built with in-memory sample data and covers the app screens and mocked data patterns used in `apps/web`.

## Current coverage

- `GET /health`
- `POST /v1/auth/login`
- `POST /v1/auth/register`
- `GET /v1/users/me`
- `PATCH /v1/users/me/settings`
- `POST /v1/users/me/logout`
- `GET /v1/groups`
- `GET /v1/groups/:id`
- `POST /v1/groups`
- `PATCH /v1/groups/:id`
- `POST /v1/groups/:id/recipes`
- `GET /v1/recipes`
- `GET /v1/recipes/:id`
- `POST /v1/recipes`
- `PATCH /v1/recipes/:id`
- `DELETE /v1/recipes/:id`
- `POST /v1/recipes/:id/save`
- `POST /v1/recipes/:id/unsave`
- `POST /v1/recipes/:id/groups`

## Data model

The app currently requires the following entities:

- `User`
  - profile data
  - settings (`language`, `privacyLevel`, `notifications`, `theme`)
  - saved recipes
  - account stats
- `Recipe`
  - author, content, ingredients, instructions
  - nested recipe references
  - group membership
  - saved-by state
- `Group`
  - metadata, icon, last updated
  - recipe membership

The current data shapes are intentionally similar to the mock objects in `apps/web/src/app/__mocks__`.

## Cloud deployment recommendation

### AWS (recommended for your familiarity)

- API: AWS Lambda + API Gateway
- Database: DynamoDB
- Auth: Amazon Cognito for email/password, Google, and Apple authentication
- Benefits:
  - low operational cost at low traffic
  - pay-per-request pricing
  - native integration for serverless APIs and auth

### GCP alternative

- API: Cloud Functions or Cloud Run
- Database: Firestore or Cloud SQL
- Auth: Firebase Auth or Google Identity Platform
- Best if you already want Google Cloud managed auth / real-time sync.

### Cheaper / easiest path

For a small app with low traffic, AWS Lambda + DynamoDB is the best balance of cost and scalability.
A separate dedicated Express server on a tiny container or instance is cheaper only when you need persistent socket state; otherwise serverless is better.

## Next steps

1. Replace the frontend mocks with API calls to `/v1/*`.
2. Add persistent storage behind `apps/api` using DynamoDB or Firestore.
3. Add Cognito/Firebase auth flows and secure routes.
4. Extend the API to support recipe sharing, group membership, search and notification settings.

## Run locally

```bash
cd apps/api
npm install
npm start
```

Then point `NEXT_PUBLIC_API_BASE_URL` in `apps/web` to `http://localhost:4001`.
