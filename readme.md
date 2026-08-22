
# Start Deving

## Start DB
in root
docker compose up -d postgres

## Start Frontend and Backend
cd frontend
npm run dev

cd backend
npm run dev

# During Dev

migrate the db after changing schema prisma

cd backend
npx prisma migrate dev --name add_card_activated_at
npx prisma generate



### CONNECT EXISTING DATABASE:
  1. Configure your DATABASE_URL in prisma.config.ts
  2. Run prisma db pull to introspect your database.

### CREATE NEW DATABASE:
  Local: npx prisma dev (runs Postgres locally in your terminal)
  Cloud: npx create-db (creates a free Prisma Postgres database)

Then, define your models in prisma/schema.prisma and run prisma migrate dev to apply your schema.

Learn more: https://pris.ly/getting-started