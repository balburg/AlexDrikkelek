import { CustomSpace, CustomSpacePack, CustomSpaceType } from '../models/types';
import { v4 as uuidv4 } from 'uuid';
import * as customSpaceRepository from '../repositories/customSpaceRepository';

/**
 * Get all custom space packs
 */
export async function getAllPacks(): Promise<CustomSpacePack[]> {
  return await customSpaceRepository.getAllPacks();
}

/**
 * Get active custom space packs
 */
export async function getActivePacks(): Promise<CustomSpacePack[]> {
  return await customSpaceRepository.getActivePacks();
}

/**
 * Get a custom space pack by ID
 */
export async function getPackById(packId: string): Promise<CustomSpacePack | null> {
  return await customSpaceRepository.getPackById(packId);
}

/**
 * Create a new custom space pack
 */
export async function createPack(
  name: string,
  description: string,
  isActive: boolean = false
): Promise<CustomSpacePack> {
  const packId = uuidv4();
  return await customSpaceRepository.createPack(packId, name, description, isActive);
}

/**
 * Update a custom space pack
 */
export async function updatePack(
  packId: string,
  updates: Partial<Omit<CustomSpacePack, 'id' | 'spaces' | 'createdAt' | 'updatedAt'>>
): Promise<CustomSpacePack> {
  return await customSpaceRepository.updatePack(packId, updates);
}

/**
 * Activate/deactivate a custom space pack
 */
export async function togglePackActivation(packId: string, isActive: boolean): Promise<CustomSpacePack> {
  return await customSpaceRepository.updatePack(packId, { isActive });
}

/**
 * Delete a custom space pack
 */
export async function deletePack(packId: string): Promise<void> {
  const pack = await getPackById(packId);
  if (!pack) {
    throw new Error('Pack not found');
  }
  
  await customSpaceRepository.deletePack(packId);
}

/**
 * Create a custom space in a pack
 */
export async function createSpace(
  packId: string,
  name: string,
  description: string,
  type: CustomSpaceType,
  options?: {
    logoUrl?: string;
    backgroundUrl?: string;
    imageUrl?: string;
    backgroundColor?: string;
    textColor?: string;
  }
): Promise<CustomSpace> {
  const pack = await getPackById(packId);
  if (!pack) {
    throw new Error('Pack not found');
  }

  const spaceId = uuidv4();
  return await customSpaceRepository.createSpace(spaceId, packId, name, description, type, options);
}

/**
 * Update a custom space
 */
export async function updateSpace(
  spaceId: string,
  updates: Partial<Omit<CustomSpace, 'id' | 'packId' | 'createdAt' | 'updatedAt'>>
): Promise<CustomSpace> {
  return await customSpaceRepository.updateSpace(spaceId, updates);
}

/**
 * Delete a custom space
 */
export async function deleteSpace(spaceId: string): Promise<void> {
  await customSpaceRepository.deleteSpace(spaceId);
}

/**
 * Get all spaces from active packs
 */
export async function getActiveSpaces(): Promise<CustomSpace[]> {
  return await customSpaceRepository.getActiveSpaces();
}

/**
 * Get spaces by type from active packs
 */
export async function getActiveSpacesByType(type: CustomSpaceType): Promise<CustomSpace[]> {
  return await customSpaceRepository.getActiveSpacesByType(type);
}
