import { CustomSpaceType } from '../../models/types';

// Mock Redis
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockDel = jest.fn();
const mockSadd = jest.fn();
const mockSrem = jest.fn();
const mockSmembers = jest.fn();

jest.mock('../../config/redis', () => ({
  getRedisClient: jest.fn(() => ({
    get: mockGet,
    set: mockSet,
    del: mockDel,
    sadd: mockSadd,
    srem: mockSrem,
    smembers: mockSmembers,
  })),
}));

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

import {
  getAllPacks,
  getActivePacks,
  getPackById,
  createPack,
  updatePack,
  togglePackActivation,
  deletePack,
  createSpace,
  updateSpace,
  deleteSpace,
  getActiveSpaces,
  getActiveSpacesByType,
} from '../customSpaceService';

describe('customSpaceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPack', () => {
    it('should create a new custom space pack', async () => {
      mockSadd.mockResolvedValue(1);
      mockSet.mockResolvedValue('OK');

      const pack = await createPack('Test Pack', 'A test pack for custom spaces', false);

      expect(pack).toMatchObject({
        id: 'test-uuid-1234',
        name: 'Test Pack',
        description: 'A test pack for custom spaces',
        isActive: false,
        spaces: [],
      });
      expect(pack.createdAt).toBeInstanceOf(Date);
      expect(pack.updatedAt).toBeInstanceOf(Date);
      expect(mockSadd).toHaveBeenCalledWith('customspace:packs', 'test-uuid-1234');
      expect(mockSet).toHaveBeenCalled();
    });

    it('should create an active pack when isActive is true', async () => {
      mockSadd.mockResolvedValue(1);
      mockSet.mockResolvedValue('OK');

      const pack = await createPack('Active Pack', 'An active pack', true);

      expect(pack.isActive).toBe(true);
    });
  });

  describe('getPackById', () => {
    it('should return a pack when it exists', async () => {
      const mockPack = {
        id: 'pack-1',
        name: 'Test Pack',
        description: 'Test',
        isActive: false,
        spaces: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockGet.mockResolvedValue(JSON.stringify(mockPack));

      const pack = await getPackById('pack-1');

      expect(pack).toMatchObject({
        id: 'pack-1',
        name: 'Test Pack',
      });
      expect(mockGet).toHaveBeenCalledWith('customspace:pack:pack-1');
    });

    it('should return null when pack does not exist', async () => {
      mockGet.mockResolvedValue(null);

      const pack = await getPackById('non-existent');

      expect(pack).toBeNull();
    });
  });

  describe('getAllPacks', () => {
    it('should return all packs', async () => {
      const mockPack1 = {
        id: 'pack-1',
        name: 'Pack 1',
        description: 'Test',
        isActive: true,
        spaces: [],
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
      };
      const mockPack2 = {
        id: 'pack-2',
        name: 'Pack 2',
        description: 'Test',
        isActive: false,
        spaces: [],
        createdAt: new Date('2024-01-02').toISOString(),
        updatedAt: new Date('2024-01-02').toISOString(),
      };

      mockSmembers.mockResolvedValue(['pack-1', 'pack-2']);
      mockGet
        .mockResolvedValueOnce(JSON.stringify(mockPack1))
        .mockResolvedValueOnce(JSON.stringify(mockPack2));

      const packs = await getAllPacks();

      expect(packs).toHaveLength(2);
      expect(packs[0].id).toBe('pack-2'); // Sorted by createdAt descending
      expect(packs[1].id).toBe('pack-1');
    });

    it('should return empty array when no packs exist', async () => {
      mockSmembers.mockResolvedValue([]);

      const packs = await getAllPacks();

      expect(packs).toEqual([]);
    });
  });

  describe('getActivePacks', () => {
    it('should return only active packs', async () => {
      const mockPack1 = {
        id: 'pack-1',
        name: 'Active Pack',
        description: 'Test',
        isActive: true,
        spaces: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const mockPack2 = {
        id: 'pack-2',
        name: 'Inactive Pack',
        description: 'Test',
        isActive: false,
        spaces: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockSmembers.mockResolvedValue(['pack-1', 'pack-2']);
      mockGet
        .mockResolvedValueOnce(JSON.stringify(mockPack1))
        .mockResolvedValueOnce(JSON.stringify(mockPack2));

      const packs = await getActivePacks();

      expect(packs).toHaveLength(1);
      expect(packs[0].id).toBe('pack-1');
      expect(packs[0].isActive).toBe(true);
    });
  });

  describe('updatePack', () => {
    it('should update pack properties', async () => {
      const existingPack = {
        id: 'pack-1',
        name: 'Old Name',
        description: 'Old Description',
        isActive: false,
        spaces: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockGet.mockResolvedValue(JSON.stringify(existingPack));
      mockSet.mockResolvedValue('OK');

      const updated = await updatePack('pack-1', {
        name: 'New Name',
        description: 'New Description',
      });

      expect(updated.name).toBe('New Name');
      expect(updated.description).toBe('New Description');
      expect(updated.id).toBe('pack-1');
      expect(mockSet).toHaveBeenCalled();
    });

    it('should throw error when pack not found', async () => {
      mockGet.mockResolvedValue(null);

      await expect(updatePack('non-existent', { name: 'New Name' })).rejects.toThrow('Pack not found');
    });
  });

  describe('togglePackActivation', () => {
    it('should activate a pack', async () => {
      const existingPack = {
        id: 'pack-1',
        name: 'Test Pack',
        description: 'Test',
        isActive: false,
        spaces: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockResolvedValue(JSON.stringify(existingPack));
      mockSet.mockResolvedValue('OK');

      const updated = await togglePackActivation('pack-1', true);

      expect(updated.isActive).toBe(true);
    });

    it('should deactivate a pack', async () => {
      const existingPack = {
        id: 'pack-1',
        name: 'Test Pack',
        description: 'Test',
        isActive: true,
        spaces: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockResolvedValue(JSON.stringify(existingPack));
      mockSet.mockResolvedValue('OK');

      const updated = await togglePackActivation('pack-1', false);

      expect(updated.isActive).toBe(false);
    });
  });

  describe('deletePack', () => {
    it('should delete a pack and all its spaces', async () => {
      const existingPack = {
        id: 'pack-1',
        name: 'Test Pack',
        description: 'Test',
        isActive: false,
        spaces: [
          { id: 'space-1', packId: 'pack-1' },
          { id: 'space-2', packId: 'pack-1' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockResolvedValue(JSON.stringify(existingPack));
      mockDel.mockResolvedValue(1);
      mockSrem.mockResolvedValue(1);

      await deletePack('pack-1');

      expect(mockDel).toHaveBeenCalledWith('customspace:space:space-1');
      expect(mockDel).toHaveBeenCalledWith('customspace:space:space-2');
      expect(mockDel).toHaveBeenCalledWith('customspace:pack:pack-1');
      expect(mockSrem).toHaveBeenCalledWith('customspace:packs', 'pack-1');
    });

    it('should throw error when pack not found', async () => {
      mockGet.mockResolvedValue(null);

      await expect(deletePack('non-existent')).rejects.toThrow('Pack not found');
    });
  });

  describe('createSpace', () => {
    it('should create a new custom space in a pack', async () => {
      const existingPack = {
        id: 'pack-1',
        name: 'Test Pack',
        description: 'Test',
        isActive: false,
        spaces: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockResolvedValue(JSON.stringify(existingPack));
      mockSet.mockResolvedValue('OK');

      const space = await createSpace(
        'pack-1',
        'Challenge Space',
        'A challenge space',
        CustomSpaceType.CHALLENGE,
        {
          logoUrl: 'http://example.com/logo.png',
          backgroundColor: '#FF0000',
        }
      );

      expect(space).toMatchObject({
        id: 'test-uuid-1234',
        name: 'Challenge Space',
        description: 'A challenge space',
        type: CustomSpaceType.CHALLENGE,
        logoUrl: 'http://example.com/logo.png',
        backgroundColor: '#FF0000',
        packId: 'pack-1',
      });
      expect(mockSet).toHaveBeenCalledTimes(2); // Once for space, once for updated pack
    });

    it('should throw error when pack not found', async () => {
      mockGet.mockResolvedValue(null);

      await expect(
        createSpace('non-existent', 'Space', 'Desc', CustomSpaceType.CHALLENGE)
      ).rejects.toThrow('Pack not found');
    });
  });

  describe('updateSpace', () => {
    it('should update space properties', async () => {
      const existingSpace = {
        id: 'space-1',
        name: 'Old Name',
        description: 'Old Desc',
        type: CustomSpaceType.CHALLENGE,
        packId: 'pack-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existingPack = {
        id: 'pack-1',
        name: 'Test Pack',
        description: 'Test',
        isActive: false,
        spaces: [existingSpace],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet
        .mockResolvedValueOnce(JSON.stringify(existingSpace))
        .mockResolvedValueOnce(JSON.stringify(existingPack));
      mockSet.mockResolvedValue('OK');

      const updated = await updateSpace('space-1', {
        name: 'New Name',
        logoUrl: 'http://example.com/new-logo.png',
      });

      expect(updated.name).toBe('New Name');
      expect(updated.logoUrl).toBe('http://example.com/new-logo.png');
      expect(mockSet).toHaveBeenCalledTimes(2); // Once for space, once for pack
    });

    it('should throw error when space not found', async () => {
      mockGet.mockResolvedValue(null);

      await expect(updateSpace('non-existent', { name: 'New Name' })).rejects.toThrow('Space not found');
    });
  });

  describe('deleteSpace', () => {
    it('should delete a space from pack', async () => {
      const existingSpace = {
        id: 'space-1',
        name: 'Test Space',
        description: 'Test',
        type: CustomSpaceType.CHALLENGE,
        packId: 'pack-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existingPack = {
        id: 'pack-1',
        name: 'Test Pack',
        description: 'Test',
        isActive: false,
        spaces: [existingSpace],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet
        .mockResolvedValueOnce(JSON.stringify(existingSpace))
        .mockResolvedValueOnce(JSON.stringify(existingPack));
      mockSet.mockResolvedValue('OK');
      mockDel.mockResolvedValue(1);

      await deleteSpace('space-1');

      expect(mockDel).toHaveBeenCalledWith('customspace:space:space-1');
      expect(mockSet).toHaveBeenCalled(); // Pack updated
    });

    it('should throw error when space not found', async () => {
      mockGet.mockResolvedValue(null);

      await expect(deleteSpace('non-existent')).rejects.toThrow('Space not found');
    });
  });

  describe('getActiveSpaces', () => {
    it('should return all spaces from active packs', async () => {
      const space1 = {
        id: 'space-1',
        name: 'Space 1',
        type: CustomSpaceType.CHALLENGE,
        packId: 'pack-1',
      };
      const space2 = {
        id: 'space-2',
        name: 'Space 2',
        type: CustomSpaceType.DRINKING,
        packId: 'pack-1',
      };

      const activePack = {
        id: 'pack-1',
        name: 'Active Pack',
        description: 'Test',
        isActive: true,
        spaces: [space1, space2],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const inactivePack = {
        id: 'pack-2',
        name: 'Inactive Pack',
        description: 'Test',
        isActive: false,
        spaces: [{ id: 'space-3', name: 'Space 3', type: CustomSpaceType.QUIZ, packId: 'pack-2' }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockSmembers.mockResolvedValue(['pack-1', 'pack-2']);
      mockGet
        .mockResolvedValueOnce(JSON.stringify(activePack))
        .mockResolvedValueOnce(JSON.stringify(inactivePack));

      const spaces = await getActiveSpaces();

      expect(spaces).toHaveLength(2);
      expect(spaces[0].id).toBe('space-1');
      expect(spaces[1].id).toBe('space-2');
    });
  });

  describe('getActiveSpacesByType', () => {
    it('should return spaces of specific type from active packs', async () => {
      const challengeSpace = {
        id: 'space-1',
        name: 'Challenge Space',
        type: CustomSpaceType.CHALLENGE,
        packId: 'pack-1',
      };
      const drinkingSpace = {
        id: 'space-2',
        name: 'Drinking Space',
        type: CustomSpaceType.DRINKING,
        packId: 'pack-1',
      };

      const activePack = {
        id: 'pack-1',
        name: 'Active Pack',
        description: 'Test',
        isActive: true,
        spaces: [challengeSpace, drinkingSpace],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockSmembers.mockResolvedValue(['pack-1']);
      mockGet.mockResolvedValue(JSON.stringify(activePack));

      const spaces = await getActiveSpacesByType(CustomSpaceType.CHALLENGE);

      expect(spaces).toHaveLength(1);
      expect(spaces[0].type).toBe(CustomSpaceType.CHALLENGE);
      expect(spaces[0].id).toBe('space-1');
    });
  });
});
