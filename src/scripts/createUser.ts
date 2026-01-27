#!/usr/bin/env ts-node

import { type Role, ROLE_CHOICES, UserService } from "~/server/services/user";
import { input, select } from '@inquirer/prompts';

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};

  for (const arg of args) {
    const match = arg.match(/^--([^=]+)=(.+)$/);
    if (match && match[1] && match[2]) {
      parsed[match[1]] = match[2];
    }
  }

  return parsed;
}

async function main() {
  const args = parseArgs();

  // If all required args are provided, use them directly
  const hasAllArgs = args.email && args.password && args.role;

  let email: string;
  let name: string | undefined;
  let password: string;
  let role: Role;

  if (hasAllArgs) {
    email = args.email!;
    name = args.name;
    password = args.password!;
    role = args.role as Role;

    if (!ROLE_CHOICES.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${ROLE_CHOICES.join(', ')}`);
    }

    console.log('Creating user with provided arguments...');
  } else {
    // Interactive mode
    email = await input({ message: 'Email:' });
    name = await input({ message: 'Name:' });
    password = await input({ message: 'Password:' });
    role = await select({ message: 'Role:', choices: ROLE_CHOICES });
  }

  await new UserService().createUser({
    email,
    name,
    password,
    role,
  });

  console.log('✅ User created successfully!');
  console.log(`   Email: ${email}`);
  console.log(`   Name: ${name || 'N/A'}`);
  console.log(`   Role: ${role}`);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
