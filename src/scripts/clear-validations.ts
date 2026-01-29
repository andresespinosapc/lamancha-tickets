import { db } from "~/server/db";

async function main() {
  console.log("Clearing all ticket validations...");

  const result = await db.ticketValidation.deleteMany({});

  console.log(`✓ Deleted ${result.count} validation records`);
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
