import { CustomSpace, CustomSpacePack, CustomSpaceType } from '../models/types';
import { getInMemoryStore } from '../config/inMemoryStore';
import { v4 as uuidv4 } from 'uuid';

const store = getInMemoryStore();

// Storage keys
const PACK_KEY_PREFIX = 'customspace:pack:';
const PACKS_LIST_KEY = 'customspace:packs';
const SPACE_KEY_PREFIX = 'customspace:space:';

/**
 * Get all custom space packs
 */
export async function getAllPacks(): Promise<CustomSpacePack[]> {
  try {
    const packIds = await store.smembers(PACKS_LIST_KEY);
    const packs: CustomSpacePack[] = [];

    for (const packId of packIds) {
      const packData = await store.get(`${PACK_KEY_PREFIX}${packId}`);
      if (packData) {
        const pack = JSON.parse(packData);
        // Convert date strings back to Date objects
        pack.createdAt = new Date(pack.createdAt);
        pack.updatedAt = new Date(pack.updatedAt);
        packs.push(pack);
      }
    }

    return packs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error getting all packs:', error);
    return [];
  }
}

/**
 * Get active custom space packs
 */
export async function getActivePacks(): Promise<CustomSpacePack[]> {
  const allPacks = await getAllPacks();
  return allPacks.filter(pack => pack.isActive);
}

/**
 * Get a custom space pack by ID
 */
export async function getPackById(packId: string): Promise<CustomSpacePack | null> {
  try {
    const packData = await store.get(`${PACK_KEY_PREFIX}${packId}`);
    if (!packData) {
      return null;
    }
    const pack = JSON.parse(packData);
    // Convert date strings back to Date objects
    pack.createdAt = new Date(pack.createdAt);
    pack.updatedAt = new Date(pack.updatedAt);
    return pack;
  } catch (error) {
    console.error('Error getting pack by ID:', error);
    return null;
  }
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
  const now = new Date();

  const pack: CustomSpacePack = {
    id: packId,
    name,
    description,
    isActive,
    spaces: [],
    createdAt: now,
    updatedAt: now,
  };

  await store.sadd(PACKS_LIST_KEY, packId);
  await store.set(`${PACK_KEY_PREFIX}${packId}`, JSON.stringify(pack));

  return pack;
}

/**
 * Update a custom space pack
 */
export async function updatePack(
  packId: string,
  updates: Partial<Omit<CustomSpacePack, 'id' | 'spaces' | 'createdAt' | 'updatedAt'>>
): Promise<CustomSpacePack> {
  const pack = await getPackById(packId);
  if (!pack) {
    throw new Error('Pack not found');
  }

  const updatedPack: CustomSpacePack = {
    ...pack,
    ...updates,
    id: packId,
    spaces: pack.spaces,
    createdAt: pack.createdAt,
    updatedAt: new Date(),
  };

  await store.set(`${PACK_KEY_PREFIX}${packId}`, JSON.stringify(updatedPack));

  return updatedPack;
}

/**
 * Activate/deactivate a custom space pack
 */
export async function togglePackActivation(packId: string, isActive: boolean): Promise<CustomSpacePack> {
  return await updatePack(packId, { isActive });
}

/**
 * Delete a custom space pack
 */
export async function deletePack(packId: string): Promise<void> {
  const pack = await getPackById(packId);
  if (!pack) {
    throw new Error('Pack not found');
  }

  // Delete all spaces in the pack
  for (const space of pack.spaces) {
    await store.del(`${SPACE_KEY_PREFIX}${space.id}`);
  }

  // Delete the pack itself
  await store.del(`${PACK_KEY_PREFIX}${packId}`);
  await store.srem(PACKS_LIST_KEY, packId);
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
  const now = new Date();

  const space: CustomSpace = {
    id: spaceId,
    name,
    description,
    type,
    logoUrl: options?.logoUrl,
    backgroundUrl: options?.backgroundUrl,
    imageUrl: options?.imageUrl,
    backgroundColor: options?.backgroundColor,
    textColor: options?.textColor,
    packId,
    createdAt: now,
    updatedAt: now,
  };

  // Add space to pack
  pack.spaces.push(space);
  pack.updatedAt = now;

  // Save space and updated pack
  await store.set(`${SPACE_KEY_PREFIX}${spaceId}`, JSON.stringify(space));
  await store.set(`${PACK_KEY_PREFIX}${packId}`, JSON.stringify(pack));

  return space;
}

/**
 * Update a custom space
 */
export async function updateSpace(
  spaceId: string,
  updates: Partial<Omit<CustomSpace, 'id' | 'packId' | 'createdAt' | 'updatedAt'>>
): Promise<CustomSpace> {
  const spaceData = await store.get(`${SPACE_KEY_PREFIX}${spaceId}`);
  if (!spaceData) {
    throw new Error('Space not found');
  }

  const space = JSON.parse(spaceData) as CustomSpace;
  const pack = await getPackById(space.packId);
  if (!pack) {
    throw new Error('Pack not found');
  }

  const updatedSpace: CustomSpace = {
    ...space,
    ...updates,
    id: spaceId,
    packId: space.packId,
    createdAt: space.createdAt,
    updatedAt: new Date(),
  };

  // Update space in pack
  const spaceIndex = pack.spaces.findIndex(s => s.id === spaceId);
  if (spaceIndex !== -1) {
    pack.spaces[spaceIndex] = updatedSpace;
    pack.updatedAt = new Date();
    await store.set(`${PACK_KEY_PREFIX}${space.packId}`, JSON.stringify(pack));
  }

  await store.set(`${SPACE_KEY_PREFIX}${spaceId}`, JSON.stringify(updatedSpace));

  return updatedSpace;
}

/**
 * Delete a custom space
 */
export async function deleteSpace(spaceId: string): Promise<void> {
  const spaceData = await store.get(`${SPACE_KEY_PREFIX}${spaceId}`);
  if (!spaceData) {
    throw new Error('Space not found');
  }

  const space = JSON.parse(spaceData) as CustomSpace;
  const pack = await getPackById(space.packId);
  if (!pack) {
    throw new Error('Pack not found');
  }

  // Remove space from pack
  pack.spaces = pack.spaces.filter(s => s.id !== spaceId);
  pack.updatedAt = new Date();
  await store.set(`${PACK_KEY_PREFIX}${space.packId}`, JSON.stringify(pack));

  // Delete space
  await store.del(`${SPACE_KEY_PREFIX}${spaceId}`);
}

/**
 * Get all spaces from active packs
 */
export async function getActiveSpaces(): Promise<CustomSpace[]> {
  const activePacks = await getActivePacks();
  return activePacks.flatMap(pack => pack.spaces);
}

/**
 * Get spaces by type from active packs
 */
export async function getActiveSpacesByType(type: CustomSpaceType): Promise<CustomSpace[]> {
  const activeSpaces = await getActiveSpaces();
  return activeSpaces.filter(space => space.type === type);
}
