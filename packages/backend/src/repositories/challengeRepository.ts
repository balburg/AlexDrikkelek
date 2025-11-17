import { sql, getConnection } from '../config/database';
import { Challenge, ChallengeType, AgeRating } from '../models/types';

/**
 * Challenge Repository
 * Handles all database operations for Challenges
 */

interface ChallengeRow {
  Id: string;
  ChallengeType: string;
  Category: string;
  AgeRating: string;
  Question: string | null;
  Answers: string | null;
  CorrectAnswer: number | null;
  Action: string | null;
  Points: number;
  IsActive: boolean;
  CreatedAt: Date;
}

/**
 * Convert database row to Challenge model
 */
function mapRowToChallenge(row: ChallengeRow): Challenge {
  const base = {
    id: row.Id,
    type: row.ChallengeType as ChallengeType,
    category: row.Category,
    ageRating: row.AgeRating as AgeRating,
    points: row.Points,
  };

  // For TRIVIA challenges
  if (row.ChallengeType === 'TRIVIA' && row.Question && row.Answers !== null && row.CorrectAnswer !== null) {
    return {
      ...base,
      question: row.Question,
      answers: JSON.parse(row.Answers),
      correctAnswer: row.CorrectAnswer,
    };
  }

  // For ACTION, DARE, DRINKING challenges
  if (row.Action) {
    return {
      ...base,
      action: row.Action,
    };
  }

  // Fallback for unexpected data
  return {
    ...base,
    action: row.Action || '',
  };
}

/**
 * Get all active challenges from the database
 */
export async function getAllChallenges(): Promise<Challenge[]> {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query<ChallengeRow>('SELECT * FROM Challenges WHERE IsActive = 1 ORDER BY CreatedAt DESC');
    
    return result.recordset.map(mapRowToChallenge);
  } catch (error) {
    console.debug('Database query failed in getAllChallenges:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Get a challenge by ID from the database
 */
export async function getChallengeById(id: string): Promise<Challenge | null> {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .query<ChallengeRow>('SELECT * FROM Challenges WHERE Id = @id');
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    return mapRowToChallenge(result.recordset[0]);
  } catch (error) {
    console.debug('Database query failed in getChallengeById:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Get challenges by type and age rating
 */
export async function getChallengesByTypeAndAge(
  type?: ChallengeType,
  ageRating: AgeRating = AgeRating.ALL
): Promise<Challenge[]> {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    let query = 'SELECT * FROM Challenges WHERE IsActive = 1';
    
    // Add type filter if specified
    if (type) {
      query += ' AND ChallengeType = @type';
      request.input('type', sql.NVarChar(20), type);
    }
    
    // Add age rating filter - include ALL and the specified rating
    query += ' AND (AgeRating = @ageRating OR AgeRating = @all)';
    request.input('ageRating', sql.NVarChar(20), ageRating);
    request.input('all', sql.NVarChar(20), AgeRating.ALL);
    
    query += ' ORDER BY CreatedAt DESC';
    
    const result = await request.query<ChallengeRow>(query);
    return result.recordset.map(mapRowToChallenge);
  } catch (error) {
    console.debug('Database query failed in getChallengesByTypeAndAge:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Create a new challenge in the database
 */
export async function createChallenge(id: string, data: Omit<Challenge, 'id'>): Promise<Challenge> {
  try {
    const pool = await getConnection();
    const now = new Date();
    
    const request = pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('challengeType', sql.NVarChar(20), data.type)
      .input('category', sql.NVarChar(50), data.category)
      .input('ageRating', sql.NVarChar(20), data.ageRating)
      .input('points', sql.Int, data.points)
      .input('isActive', sql.Bit, true)
      .input('createdAt', sql.DateTime2, now);
    
    // Handle TRIVIA challenges
    if (data.type === ChallengeType.TRIVIA && 'question' in data) {
      request
        .input('question', sql.NVarChar(1000), data.question)
        .input('answers', sql.NVarChar(sql.MAX), JSON.stringify(data.answers))
        .input('correctAnswer', sql.Int, data.correctAnswer)
        .input('action', sql.NVarChar(500), null);
    } else if ('action' in data) {
      // Handle ACTION, DARE, DRINKING challenges
      request
        .input('question', sql.NVarChar(1000), null)
        .input('answers', sql.NVarChar(sql.MAX), null)
        .input('correctAnswer', sql.Int, null)
        .input('action', sql.NVarChar(500), data.action);
    }
    
    await request.query(`
      INSERT INTO Challenges (
        Id, ChallengeType, Category, AgeRating, Question, Answers, CorrectAnswer, Action, Points, IsActive, CreatedAt
      ) VALUES (
        @id, @challengeType, @category, @ageRating, @question, @answers, @correctAnswer, @action, @points, @isActive, @createdAt
      )
    `);
    
    return {
      id: id.toString(),
      ...data,
    };
  } catch (error) {
    console.error('Error creating challenge in database:', error);
    throw error;
  }
}

/**
 * Update a challenge in the database
 */
export async function updateChallenge(
  id: string,
  updates: Partial<Omit<Challenge, 'id'>>
): Promise<Challenge> {
  try {
    const pool = await getConnection();
    
    const setParts: string[] = [];
    const request = pool.request();
    request.input('id', sql.UniqueIdentifier, id);
    
    if (updates.type !== undefined) {
      setParts.push('ChallengeType = @challengeType');
      request.input('challengeType', sql.NVarChar(20), updates.type);
    }
    
    if (updates.category !== undefined) {
      setParts.push('Category = @category');
      request.input('category', sql.NVarChar(50), updates.category);
    }
    
    if (updates.ageRating !== undefined) {
      setParts.push('AgeRating = @ageRating');
      request.input('ageRating', sql.NVarChar(20), updates.ageRating);
    }
    
    if (updates.points !== undefined) {
      setParts.push('Points = @points');
      request.input('points', sql.Int, updates.points);
    }
    
    if ('question' in updates && updates.question !== undefined) {
      setParts.push('Question = @question');
      request.input('question', sql.NVarChar(1000), updates.question);
    }
    
    if ('answers' in updates && updates.answers !== undefined) {
      setParts.push('Answers = @answers');
      request.input('answers', sql.NVarChar(sql.MAX), JSON.stringify(updates.answers));
    }
    
    if ('correctAnswer' in updates && updates.correctAnswer !== undefined) {
      setParts.push('CorrectAnswer = @correctAnswer');
      request.input('correctAnswer', sql.Int, updates.correctAnswer);
    }
    
    if ('action' in updates && updates.action !== undefined) {
      setParts.push('Action = @action');
      request.input('action', sql.NVarChar(500), updates.action);
    }
    
    if (setParts.length === 0) {
      const existing = await getChallengeById(id);
      if (!existing) {
        throw new Error('Challenge not found');
      }
      return existing;
    }
    
    await request.query(`UPDATE Challenges SET ${setParts.join(', ')} WHERE Id = @id`);
    
    const updated = await getChallengeById(id);
    if (!updated) {
      throw new Error('Challenge not found after update');
    }
    
    return updated;
  } catch (error) {
    console.error('Error updating challenge in database:', error);
    throw error;
  }
}

/**
 * Delete a challenge from the database (soft delete by setting IsActive = 0)
 */
export async function deleteChallenge(id: string): Promise<void> {
  try {
    const pool = await getConnection();
    
    await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .query('UPDATE Challenges SET IsActive = 0 WHERE Id = @id');
  } catch (error) {
    console.error('Error deleting challenge from database:', error);
    throw error;
  }
}
