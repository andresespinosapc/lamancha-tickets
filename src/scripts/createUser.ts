#!/usr/bin/env ts-node

import { type Role, ROLE_CHOICES, UserService } from "~/server/services/user";
import { input, select } from '@inquirer/prompts';

async function main() {
  const email = await input({ message: 'Email:' });
  const name = await input({ message: 'Name:' });
  const password = await input({ message: 'Password:' });
  const role: Role = await select({ message: 'Role:', choices: ROLE_CHOICES });

  await new UserService().createUser({
    email,
    name,
    password,
    role,
  });
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
