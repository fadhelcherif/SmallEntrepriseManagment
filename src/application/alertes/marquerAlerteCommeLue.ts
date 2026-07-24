import type { Alerte } from "../../domain/entities/Alerte";
import type { AlerteRepository } from "../../domain/repositories/AlerteRepository";

export async function marquerAlerteCommeLue(
  repository: AlerteRepository,
  alerteId: string,
): Promise<Alerte> {
  return repository.marquerCommeLue(alerteId);
}