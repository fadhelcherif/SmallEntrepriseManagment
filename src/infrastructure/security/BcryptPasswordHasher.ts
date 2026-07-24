import bcrypt from "bcryptjs";

import type { PasswordHasher } from "../../domain/services/PasswordHasher";

const SALT_ROUNDS = 10;

export class BcryptPasswordHasher implements PasswordHasher {
  async hacher(motDePasse: string): Promise<string> {
    return bcrypt.hash(motDePasse, SALT_ROUNDS);
  }

  async comparer(motDePasse: string, hash: string): Promise<boolean> {
    return bcrypt.compare(motDePasse, hash);
  }
}