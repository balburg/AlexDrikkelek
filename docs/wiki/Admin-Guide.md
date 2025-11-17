# Administrator Guide

Complete guide for AlexDrikkelek administrators managing the application settings and customization.

## Table of Contents

1. [Overview](#overview)
2. [Accessing Admin Panel](#accessing-admin-panel)
3. [Style Pack Management](#style-pack-management)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)

## Overview

The AlexDrikkelek admin panel provides tools for customizing and managing the application. Administrators can:

- **Manage Style Packs**: Create, activate, and delete custom visual themes
- **Customize Branding**: Match the application's appearance to your organization or event
- **Seasonal Theming**: Switch to festive themes for holidays and special occasions

## Accessing Admin Panel

### Prerequisites

- Administrator account credentials
- Access to the application URL
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Login Process

1. Navigate to the admin page at `/admin`
2. Access the admin dashboard (no authentication required)

**Note:** The admin panel is publicly accessible. In a production environment, you should implement access controls at the infrastructure level (e.g., IP whitelisting, VPN).

### Admin Dashboard

The admin dashboard provides access to all administrative features:

- **🎨 Manage Style Packs** - Theme customization and management
- **📊 Statistics** (Coming Soon) - Game usage analytics
- **⚙️ Settings** (Coming Soon) - Application configuration

## Style Pack Management

### Overview

The Style Pack Management system allows you to customize AlexDrikkelek's visual appearance for different occasions, events, or branding requirements.

**Access:** Navigate to `/admin` → Click "🎨 Manage Style Packs" or go directly to `/admin/styles`

### Viewing Style Packs

The Style Pack Manager displays all available themes in a grid layout:

**Theme Card Information:**
- **Name**: Theme title (e.g., "Christmas", "Summer Vibes")
- **Description**: Brief description of the theme
- **Status Badges**:
  - 🟢 **ACTIVE**: Currently applied theme
  - 🔵 **BUILT-IN**: Protected default theme (cannot be deleted)
- **Color Preview**: Visual representation of the 10 theme colors
- **Timestamps**: Creation and last update dates
- **Actions**: Activate or Delete buttons

**Built-in Themes:**

1. **Default Theme**
   - Original AlexDrikkelek vibrant purple and red color scheme
   - Always available, cannot be deleted
   - Safe fallback option

2. **Christmas Theme**
   - Festive red and green holiday colors
   - Christmas Red (#C41E3A) and Christmas Green (#0F8B3C)
   - Gradient background for festive atmosphere
   - Perfect for December celebrations

3. **Halloween Theme**
   - Spooky orange and black colors
   - Pumpkin Orange (#FF6F00) and Dark Purple-Black (#1A1A2E)
   - Gradient background for eerie effect
   - Ideal for October events

### Activating a Theme

To apply a theme to the entire application:

1. **Locate the Theme**: Find the desired theme in the grid
2. **Click "Activate 🎨"**: Click the activate button on the theme card
3. **Immediate Application**: The theme applies instantly across all active sessions
4. **Visual Confirmation**: The "ACTIVE" badge moves to the newly activated theme

**Important Notes:**
- Only one theme can be active at a time
- The previously active theme is automatically deactivated
- Changes apply immediately without page refresh
- All connected users see the new theme instantly

### Creating a Custom Theme

Create unlimited custom themes to match your branding or event requirements.

**Step-by-Step Process:**

1. **Open Creation Form**
   - Click the "➕ Create New Style Pack" button
   - A form modal appears

2. **Fill in Basic Information**
   - **Name**: Enter a descriptive name (1-100 characters)
     - Examples: "Summer Vibes", "Corporate Blue", "Dark Mode"
   - **Description**: Explain the theme's purpose (1-500 characters)
     - Example: "Bright and sunny theme for summer events"

3. **Choose Colors**
   - Select 10 colors using the color pickers:
     
     **Primary Colors** (main brand identity):
     - **Primary**: Main brand color
     - **Primary Light**: Lighter shade for hover states
     - **Primary Dark**: Darker shade for active states
     
     **Secondary Colors** (accent brand):
     - **Secondary**: Accent brand color
     - **Secondary Light**: Lighter accent shade
     - **Secondary Dark**: Darker accent shade
     
     **Accent Colors** (UI elements):
     - **Accent Blue**: Info messages, links
     - **Accent Orange**: Warnings, highlights
     - **Accent Green**: Success messages, positive actions
     - **Accent Yellow**: Cautions, notifications

4. **Create the Theme**
   - Click "Create Style Pack 🎨"
   - The theme is saved and appears in the grid
   - You can now activate it whenever needed

**Color Selection Tips:**
- Use hex color codes (#RRGGBB format)
- Ensure sufficient contrast for readability
- Test colors across different screen types
- Consider color-blind accessibility
- Light and dark variants should maintain visual hierarchy

**Example Color Scheme - "Ocean Theme":**
```
Primary: #006994 (Deep Ocean Blue)
Primary Light: #0088B8 (Sky Blue)
Primary Dark: #004A6B (Navy)
Secondary: #00C9A7 (Turquoise)
Secondary Light: #2EDFC7 (Aqua)
Secondary Dark: #00A389 (Teal)
Accent Blue: #1E90FF (Dodger Blue)
Accent Orange: #FF8C42 (Coral)
Accent Green: #20C997 (Sea Green)
Accent Yellow: #FFD93D (Sunlight)
```

### Deleting a Custom Theme

Remove custom themes you no longer need.

**Steps to Delete:**

1. **Locate the Theme**: Find the custom theme in the grid
2. **Verify**: Ensure it's not the active theme (deactivate first if needed)
3. **Click "Delete 🗑️"**: Click the delete button
4. **Confirm**: Confirm the deletion in the dialog
5. **Removed**: The theme is permanently deleted

**Protection Rules:**
- ❌ Cannot delete **built-in themes** (Default, Christmas, Halloween)
- ❌ Cannot delete the **currently active theme**
- ✅ Must activate another theme before deleting the active one
- ✅ Only **custom themes** can be deleted

**To Delete an Active Theme:**
1. First, activate a different theme
2. Then delete the custom theme

### Theme Application

How themes are applied across the application:

**Technical Implementation:**
- **CSS Custom Properties**: Themes use CSS variables (`--color-primary`, etc.)
- **Global Application**: All UI components automatically use theme colors
- **Real-time Updates**: Changes apply instantly via ThemeProvider React context
- **Persistent Storage**: Active theme stored in backend in-memory storage
- **Session Consistency**: All connected users see the same theme

**Affected UI Elements:**
- Buttons and interactive elements
- Navigation bars and headers
- Game board colors
- Player cards and avatars
- Challenge modals
- Background gradients
- Success/error messages
- Links and highlights

## Best Practices

### Theme Management Strategy

**1. Plan Seasonal Themes in Advance**
- Create holiday themes before the season
- Test themes on different devices
- Schedule theme switches

**2. Maintain Brand Consistency**
- Use your organization's brand colors
- Create a standard theme for regular use
- Document color codes for recreating themes

**3. Consider User Experience**
- Ensure sufficient color contrast
- Test on different screen sizes
- Verify accessibility for color-blind users
- Avoid jarring color combinations

**4. Backup Theme Configurations**
- Keep a list of custom theme color codes
- Document theme names and descriptions
- Export theme configurations (future feature)

**5. Test Before Production**
- Preview themes on all page types
- Check mobile and desktop views
- Verify game board readability
- Test with different browsers

### Accessibility Guidelines

**Color Contrast:**
- Maintain WCAG AA contrast ratios (4.5:1 for text)
- Test with color contrast analyzers
- Provide high-contrast theme options

**Color-Blind Considerations:**
- Don't rely solely on color for information
- Use patterns, icons, and labels
- Test with color-blind simulation tools

**Visual Clarity:**
- Ensure text remains readable
- Avoid low-contrast combinations
- Test in different lighting conditions

### Seasonal Theme Schedule

**Recommended Schedule:**

- **January-October**: Default theme or custom brand theme
- **November**: Default or custom autumn theme
- **December**: Christmas theme
- **October 15-31**: Halloween theme
- **Special Events**: Custom event-specific themes

## Troubleshooting

### Theme Not Applying

**Issue**: Theme appears activated but colors don't change

**Solutions:**
1. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
2. Clear browser cache
3. Check browser console for errors (F12)
4. Verify Redis connection is working
5. Confirm the theme is marked as "ACTIVE"

### Custom Theme Creation Fails

**Issue**: Error when creating a new theme

**Common Causes & Solutions:**

1. **Missing Required Fields**
   - Fill in both name and description
   - Ensure all 10 colors are selected

2. **Invalid Color Format**
   - Use hex format: #RRGGBB (6 characters)
   - Example: #FF5733 (not FF5733 or #F53)
   - Avoid color names (use hex codes)

3. **Name Too Long**
   - Keep names under 100 characters
   - Keep descriptions under 500 characters

4. **Network Issues**
   - Check internet connection
   - Verify API endpoint is accessible
   - Check browser console for errors

### Cannot Delete Theme

**Issue**: Delete button doesn't work or shows error

**Reasons:**

1. **Active Theme Protection**
   - You cannot delete the currently active theme
   - Solution: Activate another theme first, then delete

2. **Built-in Theme Protection**
   - Default, Christmas, and Halloween themes are protected
   - These themes cannot be deleted (by design)

3. **Permission Issues**
   - Verify you have admin permissions
   - Re-authenticate if session expired

### Colors Look Different on Mobile

**Issue**: Theme colors appear differently on mobile devices

**Explanations:**
- Screen color calibration varies by device
- Some devices apply color filters
- Brightness settings affect perception
- OLED vs LCD displays show colors differently

**Best Practices:**
- Test on multiple devices
- Use standard color values
- Avoid extremely saturated colors
- Check in different lighting conditions

### Theme Changes Don't Persist

**Issue**: Theme resets after page refresh

**Possible Causes:**

1. **Backend Connection Issue**
   - Check backend service status
   - Verify connection configuration
   - Check backend logs

2. **Session Expiry**
   - Theme selection may not be saving
   - Check backend logs for errors
   - Verify API endpoints are working

3. **Browser Issues**
   - Try a different browser
   - Clear browser cache
   - Disable browser extensions

## API Reference

For developers and advanced administrators, Style Pack Management provides REST API endpoints:

- `GET /api/admin/style-packs` - List all style packs
- `GET /api/admin/style-packs/active` - Get active style pack
- `GET /api/theme` - Get current theme (public endpoint)
- `POST /api/admin/style-packs` - Create new style pack
- `POST /api/admin/style-packs/:id/activate` - Activate a style pack
- `DELETE /api/admin/style-packs/:id` - Delete a custom style pack

For detailed API documentation, see [API Reference](./API-Reference.md#get-all-style-packs).

## Future Enhancements

Planned features for Style Pack Management:

- [ ] **Image Upload**: Custom background patterns and images
- [ ] **Import/Export**: Share themes between installations
- [ ] **Theme Preview**: Preview before activation
- [ ] **Scheduled Activation**: Auto-switch themes on specific dates
- [ ] **User-Selectable Themes**: Let users choose their own theme
- [ ] **Theme Templates**: Pre-built color schemes for inspiration
- [ ] **Advanced Gradients**: Multi-color gradient backgrounds
- [ ] **Font Customization**: Match fonts to theme style

## Related Documentation

- [Features Overview](./Features.md#admin-features) - Overview of Style Pack Management
- [API Reference](./API-Reference.md#get-all-style-packs) - Style Pack API endpoints
- [Architecture](./Architecture.md) - Technical implementation details
- [Troubleshooting](./Troubleshooting.md) - General troubleshooting guide

## Support

Need help with Style Pack Management?

- [Open an Issue](https://github.com/balburg/AlexDrikkelek/issues) - Report bugs or request features
- [Troubleshooting Guide](./Troubleshooting.md) - Common issues and solutions
- [Contact Support](https://github.com/balburg/AlexDrikkelek) - Get help from the team

---

**Last updated:** 17-11-2025
