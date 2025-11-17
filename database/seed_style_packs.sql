-- Seed Default Style Packs
-- This script populates the StylePacks table with default themes

-- Insert Default Style Pack
INSERT INTO StylePacks (
    Id, Name, Description, IsActive, IsDefault,
    ThemePrimary, ThemePrimaryLight, ThemePrimaryDark,
    ThemeSecondary, ThemeSecondaryLight, ThemeSecondaryDark,
    ThemeAccentBlue, ThemeAccentOrange, ThemeAccentGreen, ThemeAccentYellow
)
VALUES (
    NEWID(),
    'Default',
    'The original AlexDrikkelek vibrant theme',
    1, -- IsActive (default is active)
    1, -- IsDefault
    '#46178F', '#6938A5', '#2D0E5A', -- Primary colors
    '#E21B3C', '#FF4560', '#B31530', -- Secondary colors
    '#1368CE', '#FF8C1A', '#26890D', '#FFD602' -- Accent colors
);

-- Insert Christmas Style Pack
INSERT INTO StylePacks (
    Id, Name, Description, IsActive, IsDefault,
    ThemePrimary, ThemePrimaryLight, ThemePrimaryDark,
    ThemeSecondary, ThemeSecondaryLight, ThemeSecondaryDark,
    ThemeAccentBlue, ThemeAccentOrange, ThemeAccentGreen, ThemeAccentYellow,
    ThemeBackground, ThemePattern, PreviewImage
)
VALUES (
    NEWID(),
    'Christmas',
    'Festive red and green holiday theme',
    0, -- IsActive
    0, -- IsDefault
    '#C41E3A', '#E63946', '#8B0000', -- Primary colors (Christmas red)
    '#0F8B3C', '#28B463', '#0A5A28', -- Secondary colors (Christmas green)
    '#2E86AB', '#F77F00', '#06D6A0', '#FFD23F', -- Accent colors
    'linear-gradient(135deg, #C41E3A 0%, #0F8B3C 100%)', -- Background
    'snowflakes', -- Pattern
    '/themes/christmas-preview.png' -- Preview image
);

-- Insert Halloween Style Pack
INSERT INTO StylePacks (
    Id, Name, Description, IsActive, IsDefault,
    ThemePrimary, ThemePrimaryLight, ThemePrimaryDark,
    ThemeSecondary, ThemeSecondaryLight, ThemeSecondaryDark,
    ThemeAccentBlue, ThemeAccentOrange, ThemeAccentGreen, ThemeAccentYellow,
    ThemeBackground, ThemePattern, PreviewImage
)
VALUES (
    NEWID(),
    'Halloween',
    'Spooky orange and black theme',
    0, -- IsActive
    0, -- IsDefault
    '#FF6F00', '#FF8F00', '#E65100', -- Primary colors (Pumpkin orange)
    '#1A1A2E', '#2E2E4E', '#0F0F1E', -- Secondary colors (Dark purple-black)
    '#6A4C93', '#FF9E00', '#7CB342', '#FFC107', -- Accent colors
    'linear-gradient(135deg, #1A1A2E 0%, #FF6F00 100%)', -- Background
    'spiders', -- Pattern
    '/themes/halloween-preview.png' -- Preview image
);

-- Verify the insertion
SELECT Id, Name, Description, IsActive, IsDefault FROM StylePacks;
