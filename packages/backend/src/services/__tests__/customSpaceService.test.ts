import { CustomSpaceType } from '../../models/types';

// Mock repository
const mockGetAllPacks = jest.fn();
const mockGetActivePacks = jest.fn();
const mockGetPackById = jest.fn();
const mockCreatePack = jest.fn();
const mockUpdatePack = jest.fn();
const mockDeletePack = jest.fn();
const mockCreateSpace = jest.fn();
const mockGetSpaceById = jest.fn();
const mockUpdateSpace = jest.fn();
const mockDeleteSpace = jest.fn();
const mockGetActiveSpaces = jest.fn();
const mockGetActiveSpacesByType = jest.fn();

jest.mock('../../repositories/customSpaceRepository', () => ({
  getAllPacks: (...args: unknown[]) => mockGetAllPacks(...args),
  getActivePacks: (...args: unknown[]) => mockGetActivePacks(...args),
  getPackById: (...args: unknown[]) => mockGetPackById(...args),
  createPack: (...args: unknown[]) => mockCreatePack(...args),
  updatePack: (...args: unknown[]) => mockUpdatePack(...args),
  deletePack: (...args: unknown[]) => mockDeletePack(...args),
  createSpace: (...args: unknown[]) => mockCreateSpace(...args),
  getSpaceById: (...args: unknown[]) => mockGetSpaceById(...args),
  updateSpace: (...args: unknown[]) => mockUpdateSpace(...args),
  deleteSpace: (...args: unknown[]) => mockDeleteSpace(...args),
  getActiveSpaces: (...args: unknown[]) => mockGetActiveSpaces(...args),
  getActiveSpacesByType: (...args: unknown[]) => mockGetActiveSpacesByType(...args),
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
      const mockPack = {
        id: 'test-uuid-1234',
        name: 'Test Pack',
        description: 'A test pack for custom spaces',
        isActive: false,
        spaces: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCreatePack.mockResolvedValue(mockPack);

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
      expect(mockCreatePack).toHaveBeenCalledWith('test-uuid-1234', 'Test Pack', 'A test pack for custom spaces', false);
    });

    it('should create an active pack when isActive is true', async () => {
      const mockPack = {
        id: 'test-uuid-1234',
        name: 'Active Pack',
        description: 'An active pack',
        isActive: true,
        spaces: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCreatePack.mockResolvedValue(mockPack);

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
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockGetPackById.mockResolvedValue(mockPack);

      const pack = await getPackById('pack-1');

      expect(pack).toMatchObject({
        id: 'pack-1',
        name: 'Test Pack',
      });
      expect(mockGetPackById).toHaveBeenCalledWith('pack-1');
    });

    it('should return null when pack does not exist', async () => {
      mockGetPackById.mockResolvedValue(null);

      const pack = await getPackById('non-existent');

      expect(pack).toBeNull();
    });
  });

  describe('getAllPacks', () => {
    it('should return all packs', async () => {
      const mockPacks = [
        {
          id: 'pack-2',
          name: 'Pack 2',
          description: 'Test',
          isActive: false,
          spaces: [],
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: 'pack-1',
          name: 'Pack 1',
          description: 'Test',
          isActive: true,
          spaces: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockGetAllPacks.mockResolvedValue(mockPacks);

      const packs = await getAllPacks();

      expect(packs).toHaveLength(2);
      expect(packs[0].id).toBe('pack-2'); // Sorted by createdAt descending
      expect(packs[1].id).toBe('pack-1');
    });

    it('should return empty array when no packs exist', async () => {
      mockGetAllPacks.mockResolvedValue([]);

      const packs = await getAllPacks();

      expect(packs).toEqual([]);
    });
  });

  describe('getActivePacks', () => {
    it('should return only active packs', async () => {
      const mockPacks = [
        {
          id: 'pack-1',
          name: 'Active Pack',
          description: 'Test',
          isActive: true,
          spaces: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockGetActivePacks.mockResolvedValue(mockPacks);

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

      const updatedPack = {
        ...existingPack,
        name: 'New Name',
        description: 'New Description',
        updatedAt: new Date(),
      };

      mockUpdatePack.mockResolvedValue(updatedPack);

      const updated = await updatePack('pack-1', {
        name: 'New Name',
        description: 'New Description',
      });

      expect(updated.name).toBe('New Name');
      expect(updated.description).toBe('New Description');
      expect(updated.id).toBe('pack-1');
      expect(mockUpdatePack).toHaveBeenCalledWith('pack-1', {
        name: 'New Name',
        description: 'New Description',
      });
    });

    it('should throw error when pack not found', async () => {
      mockUpdatePack.mockRejectedValue(new Error('Pack not found'));

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

      const updatedPack = {
        ...existingPack,
        isActive: true,
        updatedAt: new Date(),
      };

      mockUpdatePack.mockResolvedValue(updatedPack);

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

      const updatedPack = {
        ...existingPack,
        isActive: false,
        updatedAt: new Date(),
      };

      mockUpdatePack.mockResolvedValue(updatedPack);

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

      mockGetPackById.mockResolvedValue(existingPack);
      mockDeletePack.mockResolvedValue(undefined);

      await deletePack('pack-1');

      expect(mockDeletePack).toHaveBeenCalledWith('pack-1');
    });

    it('should throw error when pack not found', async () => {
      mockGetPackById.mockResolvedValue(null);

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

      const mockSpace = {
        id: 'test-uuid-1234',
        name: 'Challenge Space',
        description: 'A challenge space',
        type: CustomSpaceType.CHALLENGE,
        logoUrl: 'http://example.com/logo.png',
        backgroundColor: '#FF0000',
        packId: 'pack-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetPackById.mockResolvedValue(existingPack);
      mockCreateSpace.mockResolvedValue(mockSpace);

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
      expect(mockCreateSpace).toHaveBeenCalled();
    });

    it('should throw error when pack not found', async () => {
      mockGetPackById.mockResolvedValue(null);

      await expect(
        createSpace('non-existent', 'Space', 'Desc', CustomSpaceType.CHALLENGE)
      ).rejects.toThrow('Pack not found');
    });
  });

  describe('updateSpace', () => {
    it('should update space properties', async () => {
      const updatedSpace = {
        id: 'space-1',
        name: 'New Name',
        description: 'Old Desc',
        type: CustomSpaceType.CHALLENGE,
        logoUrl: 'http://example.com/new-logo.png',
        packId: 'pack-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUpdateSpace.mockResolvedValue(updatedSpace);

      const updated = await updateSpace('space-1', {
        name: 'New Name',
        logoUrl: 'http://example.com/new-logo.png',
      });

      expect(updated.name).toBe('New Name');
      expect(updated.logoUrl).toBe('http://example.com/new-logo.png');
      expect(mockUpdateSpace).toHaveBeenCalledWith('space-1', {
        name: 'New Name',
        logoUrl: 'http://example.com/new-logo.png',
      });
    });

    it('should throw error when space not found', async () => {
      mockUpdateSpace.mockRejectedValue(new Error('Space not found'));

      await expect(updateSpace('non-existent', { name: 'New Name' })).rejects.toThrow('Space not found');
    });
  });

  describe('deleteSpace', () => {
    it('should delete a space from pack', async () => {
      mockDeleteSpace.mockResolvedValue(undefined);

      await deleteSpace('space-1');

      expect(mockDeleteSpace).toHaveBeenCalledWith('space-1');
    });

    it('should throw error when space not found', async () => {
      mockDeleteSpace.mockRejectedValue(new Error('Space not found'));

      await expect(deleteSpace('non-existent')).rejects.toThrow('Space not found');
    });
  });

  describe('getActiveSpaces', () => {
    it('should return all spaces from active packs', async () => {
      const space1 = {
        id: 'space-1',
        name: 'Space 1',
        description: '',
        type: CustomSpaceType.CHALLENGE,
        packId: 'pack-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const space2 = {
        id: 'space-2',
        name: 'Space 2',
        description: '',
        type: CustomSpaceType.DRINKING,
        packId: 'pack-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetActiveSpaces.mockResolvedValue([space1, space2]);

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
        description: '',
        type: CustomSpaceType.CHALLENGE,
        packId: 'pack-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetActiveSpacesByType.mockResolvedValue([challengeSpace]);

      const spaces = await getActiveSpacesByType(CustomSpaceType.CHALLENGE);

      expect(spaces).toHaveLength(1);
      expect(spaces[0].type).toBe(CustomSpaceType.CHALLENGE);
      expect(spaces[0].id).toBe('space-1');
    });
  });
});
