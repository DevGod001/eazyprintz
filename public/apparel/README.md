# Apparel Images Directory

This directory contains real product images for the unified shop apparel preview.

## Directory Structure

```
apparel/
├── adult/
│   ├── tshirt-white.png
│   ├── tshirt-black.png
│   ├── hoodie-white.png
│   ├── hoodie-black.png
│   ├── sweatshirt-white.png
│   ├── sweatshirt-black.png
│   └── polo-white.png
├── kids/
│   ├── tshirt-white.png
│   ├── tshirt-black.png
│   ├── hoodie-white.png
│   ├── hoodie-black.png
│   └── sweatshirt-white.png
└── baby/
    ├── onesie-pink.png
    ├── onesie-blue.png
    ├── tshirt-white.png
    └── hoodie-white.png
```

## Image Requirements

### Format

- **Format:** PNG with transparent background preferred
- **Size:** Approximately 800x800px to 1200x1200px
- **Background:** White or transparent background
- **View:** Front-facing flat lay or mannequin view

### Naming Convention

- Format: `{type}-{color}.png`
- Examples: `tshirt-white.png`, `hoodie-black.png`, `onesie-pink.png`
- Use lowercase for consistency

### Color Variations

Include images for popular colors:

- **White** (most important)
- **Black** (most important)
- **Navy** (optional)
- **Gray** (optional)
- **Red** (optional)

### Tips for Best Results

1. Use high-quality product photos from your supplier
2. Images should be clean and well-lit
3. Consistent sizing across all products
4. Remove any distracting backgrounds
5. Ensure the apparel takes up most of the image space

## Usage in App

These images will be displayed in:

- The unified shop live preview (left side of modal)
- Real-time preview as customers customize color, size, and design placement
- Replaces the emoji icons (👕🧥👶) with actual product photos

## How to Add Images

1. Save your apparel images in the appropriate folder (adult/kids/baby)
2. Follow the naming convention above
3. The app will automatically load them when available
4. If an image is missing, the app falls back to emoji icons

## Example Integration

```javascript
// The app looks for images like this:
<img src="/apparel/adult/tshirt-white.png" alt="White T-Shirt" />
<img src="/apparel/kids/hoodie-black.png" alt="Black Kids Hoodie" />
<img src="/apparel/baby/onesie-pink.png" alt="Pink Baby Onesie" />
```

## Need Images?

Popular sources for apparel mockup images:

- Your DTF print supplier's product catalog
- Stock photo sites (with proper licensing)
- Professional product photography
- Mockup generators (Placeit, Smartmockups, etc.)

---

**Note:** Start with at least white and black versions of your most popular items (t-shirts, hoodies). You can add more colors and products over time.
