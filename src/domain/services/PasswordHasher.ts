export interface PasswordHasher {
  hacher(motDePasse: string): Promise<string>;
  comparer(motDePasse: string, hash: string): Promise<boolean>;
}