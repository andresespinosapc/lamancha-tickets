#!/usr/bin/env ts-node

import { db } from "~/server/db";
import { hash } from 'bcrypt';

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await db.ticket.deleteMany();
  await db.attendee.deleteMany();
  await db.ticketType.deleteMany();
  await db.sellerInfo.deleteMany();
  await db.user.deleteMany();
  console.log('✅ Cleaned\n');

  // Create users
  console.log('👥 Creating users...');
  const hashedPassword = await hash('test123', 10);

  const adminUser = await db.user.create({
    data: {
      email: 'admin@test.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
    }
  });

  const seller1 = await db.user.create({
    data: {
      email: 'seller1@test.com',
      name: 'Juan Vendedor',
      password: hashedPassword,
      role: 'seller',
      sellerInfo: {
        create: {
          instagram: '@juanvendedor',
          phone: '+56912345678',
          email: 'seller1@test.com',
          preferredContactMethod: 'instagram',
        }
      }
    }
  });

  const seller2 = await db.user.create({
    data: {
      email: 'seller2@test.com',
      name: 'Maria Comerciante',
      password: hashedPassword,
      role: 'seller',
      sellerInfo: {
        create: {
          instagram: '@mariacom',
          phone: '+56987654321',
          email: 'seller2@test.com',
          preferredContactMethod: 'phone',
        }
      }
    }
  });

  const regularUser = await db.user.create({
    data: {
      email: 'user@test.com',
      name: 'Regular User',
      password: hashedPassword,
      role: 'user',
    }
  });

  console.log(`✅ Created ${4} users\n`);

  // Create ticket types
  console.log('🎫 Creating ticket types...');
  const ticketTypes = await Promise.all([
    db.ticketType.create({
      data: {
        name: 'Early Bird',
        price: 5000,
        ticketsIncluded: 1,
      }
    }),
    db.ticketType.create({
      data: {
        name: 'General',
        price: 8000,
        ticketsIncluded: 1,
      }
    }),
    db.ticketType.create({
      data: {
        name: 'VIP',
        price: 15000,
        ticketsIncluded: 1,
      }
    }),
    db.ticketType.create({
      data: {
        name: 'Pareja',
        price: 14000,
        ticketsIncluded: 2,
      }
    }),
    db.ticketType.create({
      data: {
        name: 'Grupo (4 personas)',
        price: 25000,
        ticketsIncluded: 4,
      }
    }),
  ]);
  console.log(`✅ Created ${ticketTypes.length} ticket types\n`);

  // Create attendees and tickets
  console.log('🎟️  Creating attendees and tickets...');

  // Complete tickets
  const attendee1 = await db.attendee.create({
    data: {
      firstName: 'Pedro',
      lastName: 'González',
      email: 'pedro@example.com',
      documentId: '12345678-9',
      phone: '+56911111111',
      tickets: {
        create: {
          ticketTypeId: ticketTypes[0].id,
          sellerId: seller1.id,
          redemptionCode: 'dummy-code-1',
        }
      }
    }
  });

  const attendee2 = await db.attendee.create({
    data: {
      firstName: 'Ana',
      lastName: 'Martinez',
      email: 'ana@example.com',
      documentId: '98765432-1',
      phone: '+56922222222',
      tickets: {
        create: {
          ticketTypeId: ticketTypes[2].id, // VIP
          sellerId: seller2.id,
          redemptionCode: 'dummy-code-2',
        }
      }
    }
  });

  // Blank tickets (incomplete)
  const blankAttendee1 = await db.attendee.create({
    data: {
      email: 'blank1@example.com',
      tickets: {
        create: {
          ticketTypeId: ticketTypes[1].id,
          sellerId: seller1.id,
        }
      }
    }
  });

  const blankAttendee2 = await db.attendee.create({
    data: {
      email: 'blank2@example.com',
      tickets: {
        create: {
          ticketTypeId: ticketTypes[3].id, // Pareja
          sellerId: seller2.id,
        }
      }
    }
  });

  const blankAttendee3 = await db.attendee.create({
    data: {
      email: 'blank3@example.com',
      tickets: {
        create: {
          ticketTypeId: ticketTypes[1].id,
          sellerId: seller1.id,
        }
      }
    }
  });

  // Group tickets
  const groupAttendee1 = await db.attendee.create({
    data: {
      firstName: 'Carlos',
      lastName: 'Rojas',
      email: 'carlos@example.com',
      documentId: '11111111-1',
      phone: '+56933333333',
      tickets: {
        create: {
          ticketTypeId: ticketTypes[4].id, // Grupo 4
          sellerId: seller1.id,
          redemptionCode: 'dummy-code-group',
        }
      }
    }
  });

  console.log('✅ Created attendees and tickets\n');

  // Summary
  const ticketCount = await db.ticket.count();
  const attendeeCount = await db.attendee.count();
  const userCount = await db.user.count();
  const ticketTypeCount = await db.ticketType.count();

  console.log('📊 Database seeded successfully!\n');
  console.log('Summary:');
  console.log(`  👥 Users: ${userCount}`);
  console.log(`  🎫 Ticket Types: ${ticketTypeCount}`);
  console.log(`  👤 Attendees: ${attendeeCount}`);
  console.log(`  🎟️  Tickets: ${ticketCount}`);
  console.log('\n📝 Test credentials:');
  console.log('  Admin:   admin@test.com / test123');
  console.log('  Seller1: seller1@test.com / test123');
  console.log('  Seller2: seller2@test.com / test123');
  console.log('  User:    user@test.com / test123');
}

main()
  .catch(error => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
