import { getProjectId } from './localStore';

export async function seedDatabase() {
  return getProjectId();
}
