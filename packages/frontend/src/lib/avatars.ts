/**
 * Available avatar options for players
 * Using emojis for simplicity and cross-platform compatibility
 */
export const AVATARS = [
  '🦁', // Lion
  '🐯', // Tiger
  '🐻', // Bear
  '🐼', // Panda
  '🐨', // Koala
  '🐸', // Frog
  '🦊', // Fox
  '🐷', // Pig
  '🐮', // Cow
  '🐵', // Monkey
  '🐶', // Dog
  '🐱', // Cat
  '🐰', // Rabbit
  '🦆', // Duck
  '🐔', // Chicken
  '🦉', // Owl
  '🐧', // Penguin
  '🦄', // Unicorn
  '🐲', // Dragon
  '🦖', // T-Rex
] as const;

export type Avatar = typeof AVATARS[number];

/**
 * Get a random avatar
 */
export function getRandomAvatar(): Avatar {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}
