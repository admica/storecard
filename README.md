# StoreCard App

A Next.js application to manage your store cards.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fadmica%2Fstorecard&env=DATABASE_URL,DIRECT_URL,AUTH_SECRET,BLOB_READ_WRITE_TOKEN&envDescription=Required%20environment%20variables%20for%20the%20app&project-name=storecard&repository-name=storecard)


## Tech Stack

- **Framework**: Next.js 16
- **Database**: PostgreSQL (Prisma)
- **Auth**: NextAuth.js
- **Storage**: Vercel Blob (for card images)
- **Styling**: Tailwind CSS

## Local Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Database**:
    ```bash
    docker-compose up -d
    ```

3.  **Setup Environment**:
    Create a `.env` file based on `.env.example`:
    ```env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/storecards?schema=public"
    AUTH_SECRET="your-secret-key"
    BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
    ```

4.  **Run Migrations**:
    ```bash
    npx prisma migrate dev
    ```

5.  **Start App**:
    ```bash
    npm run dev
    ```

## Vercel Deployment

1.  **Push to GitHub/GitLab/Bitbucket**.
2.  **Import Project** in Vercel.
3.  **Configure Storage**:
    - Add a **Postgres** database (Vercel Postgres, Neon, etc.).
    - Add **Vercel Blob** storage.
4.  **Environment Variables**:
    - `DATABASE_URL`: Connection string to your Postgres DB (pooled).
    - `DIRECT_URL`: Connection string to your Postgres DB (non-pooled/direct).
    - `AUTH_SECRET`: Generate one with `npx auth secret`.
    - `BLOB_READ_WRITE_TOKEN`: Automatically added if you add Vercel Blob storage.
5.  **Deploy**!
