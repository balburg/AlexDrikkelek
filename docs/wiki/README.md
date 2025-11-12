# AlexDrikkelek Wiki Documentation

This directory contains all the documentation that is synced to the [GitHub Wiki](https://github.com/balburg/AlexDrikkelek/wiki).

## Documentation Structure

### Core Pages
- **Home.md** - Main wiki page with overview and quick links
- **_Sidebar.md** - Navigation menu for the wiki

### Getting Started
- **Getting-Started.md** - Installation and setup instructions
- **User-Guide.md** - Complete user guide with screenshots
- **Features.md** - Detailed feature documentation including code sharing

### Architecture & Development
- **Architecture.md** - System architecture, tech stack, and design
- **API-Reference.md** - REST API and WebSocket event documentation
- **Build-and-Run.md** - Development workflow and build instructions
- **Testing.md** - Testing guide with examples

### Operations & Deployment
- **Deployment.md** - Azure deployment guide with detailed steps
- **Troubleshooting.md** - Common issues and solutions

### Contributing
- **Contributing.md** - Contribution guidelines and coding standards
- **Roadmap.md** - Development roadmap and future plans

### Assets
- **screenshots/** - UI screenshots used in documentation

## Automated Sync

Documentation is automatically synced to the GitHub Wiki when:
- Changes are pushed to the `main` branch
- Files in `docs/wiki/` are modified

The sync is handled by the GitHub Actions workflow: `.github/workflows/wiki-sync.yml`

## Manual Updates

If you need to manually update the wiki:

1. Edit the markdown files in `docs/wiki/`
2. Commit and push to the repository
3. The GitHub Actions workflow will automatically sync to the wiki

Alternatively, you can manually trigger the workflow:
1. Go to Actions tab in GitHub
2. Select "Sync Wiki Documentation"
3. Click "Run workflow"

## Viewing the Wiki

Visit: https://github.com/balburg/AlexDrikkelek/wiki

## Contributing to Documentation

When contributing to documentation:

1. **Follow Markdown Best Practices**
   - Use proper heading hierarchy (H1 → H2 → H3)
   - Include code examples with syntax highlighting
   - Add screenshots for visual features
   - Keep paragraphs concise

2. **Update Last Modified Date**
   - Add/update footer: `**Last updated:** DD-MM-YYYY`

3. **Test Links**
   - Verify all internal links work
   - Check external links are valid

4. **Add to Sidebar**
   - Update `_Sidebar.md` if adding new pages
   - Keep navigation organized and logical

5. **Screenshots**
   - Save in `screenshots/` directory
   - Use descriptive filenames (e.g., `01-home-page.png`)
   - Keep file sizes reasonable (<500KB)

## Documentation Standards

### Page Structure
```markdown
# Page Title

Brief introduction paragraph.

## Table of Contents (optional for long pages)

1. [Section 1](#section-1)
2. [Section 2](#section-2)

## Section 1

Content...

### Subsection 1.1

Content...

---

**Last updated:** DD-MM-YYYY
```

### Code Blocks

Use language-specific syntax highlighting:

````markdown
```typescript
const example = 'Use specific language';
```

```bash
npm install
```
````

### Links

- **Internal links**: `[Text](./Page-Name.md)`
- **External links**: `[Text](https://example.com)`
- **Anchors**: `[Text](#section-name)`

### Images

```markdown
![Alt text](./screenshots/image-name.png)
```

## Questions?

For questions about documentation:
- Open an issue on GitHub
- Check the [Contributing Guide](./Contributing.md)
- Contact the maintainers

---

**Last updated:** 12-11-2025
