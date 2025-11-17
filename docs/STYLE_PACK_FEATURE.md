# Style Pack Management

The Style Pack Management system allows administrators to customize the visual theme of AlexDrikkelek for different occasions and events.

## Overview

The system provides:
- **Built-in Themes**: Default, Christmas, and Halloween themes ready to use
- **Custom Themes**: Create unlimited custom color schemes
- **Dynamic Switching**: Activate themes without restarting the application
- **Admin Interface**: User-friendly dashboard for managing themes

## Accessing the Style Pack Manager

1. Navigate to the admin settings page at `/admin`
2. Click on "🎨 Manage Style Packs" button
3. Or directly visit `/admin/styles`

## Managing Style Packs

### Viewing Style Packs

The Style Pack Manager displays all available themes in a grid layout:
- **Active Badge**: Shows which theme is currently active
- **Built-in Badge**: Indicates default themes that cannot be deleted
- **Color Preview**: Visual representation of the theme colors
- **Update Date**: When the theme was last modified

### Activating a Theme

1. Click the "Activate 🎨" button on any inactive theme
2. The theme will be applied immediately across the entire application
3. Only one theme can be active at a time

### Creating a Custom Theme

1. Click "➕ Create New Style Pack" button
2. Fill in the form:
   - **Name**: Give your theme a memorable name (e.g., "Summer Vibes", "Dark Mode")
   - **Description**: Describe what makes this theme special
   - **Colors**: Select 10 colors using color pickers:
     - Primary (main brand color)
     - Primary Light (lighter variant)
     - Primary Dark (darker variant)
     - Secondary (accent brand color)
     - Secondary Light
     - Secondary Dark
     - Accent Blue
     - Accent Orange
     - Accent Green
     - Accent Yellow
3. Click "Create Style Pack 🎨" to save

### Deleting a Custom Theme

1. Find the custom theme in the grid
2. Click "Delete 🗑️" button
3. Confirm the deletion

**Note**: 
- Active themes cannot be deleted (activate another theme first)
- Built-in themes (Default, Christmas, Halloween) cannot be deleted

## Built-in Themes

### Default Theme
The original AlexDrikkelek vibrant color scheme with purple and red primary colors.

### Christmas Theme
Festive red and green holiday theme with:
- Primary: Christmas Red (#C41E3A)
- Secondary: Christmas Green (#0F8B3C)
- Gradient background effect

### Halloween Theme
Spooky orange and black theme with:
- Primary: Pumpkin Orange (#FF6F00)
- Secondary: Dark Purple-Black (#1A1A2E)
- Gradient background effect

## Database Setup

Before using the style pack system, ensure the database is properly configured:

1. **Run Database Schema**: Execute `database/schema.sql` to create the StylePacks table
2. **Seed Default Themes**: Execute `database/seed_style_packs.sql` to populate the three built-in themes
3. **Configure Connection**: Set database connection variables in `.env`:
   ```
   DB_SERVER=your-server.database.windows.net
   DB_DATABASE=alexdrikkelek
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_ENCRYPT=true
   ```

See `database/README.md` for detailed setup instructions.

## Theme Application

Themes are applied globally across the application using CSS custom properties:
- All UI components automatically use the active theme colors
- Changes take effect immediately without page refresh
- Themes persist in the SQL Server database
- The active theme in the database dictates the application's visual style

## API Endpoints

### Get All Style Packs
```
GET /api/admin/style-packs
```
Returns array of all style packs.

### Get Active Style Pack
```
GET /api/admin/style-packs/active
```
Returns the currently active style pack.

### Create Style Pack
```
POST /api/admin/style-packs
Content-Type: application/json

{
  "name": "Summer Vibes",
  "description": "Bright and sunny theme",
  "theme": {
    "primary": "#FF6B35",
    "primaryLight": "#FF8C61",
    "primaryDark": "#E65A2E",
    "secondary": "#F7B801",
    "secondaryLight": "#FFCA28",
    "secondaryDark": "#D89E01",
    "accentBlue": "#1E90FF",
    "accentOrange": "#FF7F50",
    "accentGreen": "#32CD32",
    "accentYellow": "#FFD700"
  }
}
```

### Activate Style Pack
```
POST /api/admin/style-packs/:id/activate
```
Activates the specified style pack.

### Delete Style Pack
```
DELETE /api/admin/style-packs/:id
```
Deletes a custom style pack (cannot delete built-in themes or active theme).

### Get Current Theme (Public)
```
GET /api/theme
```
Returns the currently active theme colors and name. This endpoint is public and used by the frontend to apply themes.

## Technical Implementation

### Backend
- **Storage**: Azure SQL Database for persistent theme storage
- **Repository**: `stylePackRepository.ts` handles database operations
- **Service**: `stylePackService.ts` handles business logic and CRUD operations
- **Validation**: Input validation for color codes and required fields
- **Protection**: Built-in themes and active themes are protected from deletion
- **Fallback**: Returns built-in themes if database is unavailable

### Frontend
- **ThemeProvider**: React context provides theme to all components
- **CSS Custom Properties**: Dynamic CSS variables for theme colors
- **Tailwind Integration**: Tailwind config uses CSS custom properties
- **Real-time Updates**: Themes apply instantly via CSS variable updates

### Theme Structure
```typescript
interface StylePack {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isDefault: boolean;
  theme: StyleTheme;
  previewImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StyleTheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accentBlue: string;
  accentOrange: string;
  accentGreen: string;
  accentYellow: string;
  background?: string;
  pattern?: string;
}
```

## Use Cases

### Seasonal Themes
Activate the Christmas theme during the holiday season or Halloween theme in October to match the festive mood.

### Brand Customization
Create custom themes to match your brand colors or specific event branding.

### Accessibility
Create high-contrast themes for better accessibility or themes optimized for different lighting conditions.

### Event-Specific Themes
Create and activate special themes for tournaments, special events, or themed game nights.

## Best Practices

1. **Naming**: Use descriptive names that clearly indicate the theme purpose
2. **Color Contrast**: Ensure sufficient contrast between primary and secondary colors
3. **Testing**: Test themes across different pages before activating for production use
4. **Backup**: Keep a list of custom theme colors if you plan to recreate them
5. **Seasonal Planning**: Plan and create seasonal themes in advance

## Troubleshooting

### Theme Not Applying
- Refresh the page to ensure the latest theme is loaded
- Check browser console for any errors
- Verify the theme is marked as "ACTIVE" in the admin panel

### Custom Theme Creation Fails
- Ensure all required fields are filled
- Verify color codes are in valid hex format (#RRGGBB)
- Check the browser console for validation errors

### Cannot Delete Theme
- You cannot delete the currently active theme - activate another theme first
- Built-in themes (Default, Christmas, Halloween) are protected and cannot be deleted

## Future Enhancements

Potential future improvements:
- Image upload for custom background patterns
- Import/export theme configurations
- Preview themes before activation
- Scheduled theme activation (auto-switch for holidays)
- User-selectable themes (not just admin-controlled)
