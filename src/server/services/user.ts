import { db } from "../db";
import { hash } from 'bcrypt';

export const ROLE_CHOICES = ['user', 'seller', 'admin'] as const;
export type Role = typeof ROLE_CHOICES[number];

export class UserService {
  async createUser(data: {
    email: string;
    name?: string;
    password: string;
    role?: Role;
  }) {
    const hashedPassword = await hash(data.password, 10);
    await db.user.create({
      data: {
        ...data,
        password: hashedPassword,
      }
    });
  }
}
