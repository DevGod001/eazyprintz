# Product Images Directory

This directory contains product photos for the store catalog.

## Image Naming Convention

Product images should be named to match the product IDs in `src/data/products.ts`.

### Required Images Per Product

Each product should have **3 images**:

1. **Main product image** - For shop display: `{product-id}.jpg`
2. **Front view** - For mockup customization: `{product-id}-front.jpg`
3. **Back view** - For mockup customization: `{product-id}-back.jpg`

### T-Shirts

- `ts-001.jpg` - Main shop image (Premium Cotton T-Shirt)
- `ts-001-front.jpg` - Front view for mockup
- `ts-001-back.jpg` - Back view for mockup

- `ts-002.jpg` - Main shop image (Adult Heavy Cotton T-Shirt)
- `ts-002-front.jpg` - Front view for mockup
- `ts-002-back.jpg` - Back view for mockup

- `ts-003.jpg` - Main shop image (Ladies V-Neck T-Shirt)
- `ts-003-front.jpg` - Front view for mockup
- `ts-003-back.jpg` - Back view for mockup

### Hoodies

- `hd-001.jpg` - Main shop image (Heavyweight Pullover Hoodie)
- `hd-001-front.jpg` - Front view for mockup
- `hd-001-back.jpg` - Back view for mockup

- `hd-002.jpg` - Main shop image (Zip-Up Hoodie)
- `hd-002-front.jpg` - Front view for mockup
- `hd-002-back.jpg` - Back view for mockup

### Sweatshirts

- `sw-001.jpg` - Main shop image (Crewneck Sweatshirt)
- `sw-001-front.jpg` - Front view for mockup
- `sw-001-back.jpg` - Back view for mockup

### Polos

- `pl-001.jpg` - Main shop image (Performance Polo Shirt)
- `pl-001-front.jpg` - Front view for mockup
- `pl-001-back.jpg` - Back view for mockup

- `pl-002.jpg` - Main shop image (Cotton Pique Polo)
- `pl-002-front.jpg` - Front view for mockup
- `pl-002-back.jpg` - Back view for mockup

### Kids

- `ks-001.jpg` - Main shop image (Youth Premium T-Shirt)
- `ks-001-front.jpg` - Front view for mockup
- `ks-001-back.jpg` - Back view for mockup

- `ks-002.jpg` - Main shop image (Youth Pullover Hoodie)
- `ks-002-front.jpg` - Front view for mockup
- `ks-002-back.jpg` - Back view for mockup

### Baby

- `bb-001.jpg` - Main shop image (Soft Cotton Baby Onesie)
- `bb-001-front.jpg` - Front view for mockup
- `bb-001-back.jpg` - Back view for mockup

- `bb-002.jpg` - Main shop image (Baby T-Shirt)
- `bb-002-front.jpg` - Front view for mockup
- `bb-002-back.jpg` - Back view for mockup

## Image Specifications

### Main Product Image (for shop display)

**Recommended:**

- Format: JPG or PNG
- Size: 800x800px to 1200x1200px
- Background: White or transparent
- File size: Under 500KB for optimal loading
- Angle: Front view, flat lay, or 3/4 angle

### Front/Back Views (for mockup customization)

**Critical Requirements:**

- Format: JPG or PNG
- Size: 1000x1200px to 1500x1800px (portrait orientation)
- Background: **MUST be white or transparent**
- The apparel should be **flat and straight** (like a ghost mannequin photo)
- Full front or back view showing entire garment
- **Centered** in the frame
- No model, no hands, no hangers visible
- Consistent lighting, no harsh shadows

**Why this matters:**
These front/back images will be used as the actual mockup background during customization. Users will see their design overlaid on YOUR real product photo in the actual color they selected. This gives them an accurate preview of how the final product will look.

**Photography Tips:**

- Use a mannequin or lay flat method
- Ensure the garment is wrinkle-free
- Center the garment in the frame
- Keep consistent distance/scale across all products
- White background makes design overlay cleaner

## How to Upload Images

1. Take or download your product photos
2. Rename them according to the product ID (e.g., `ts-001.jpg`)
3. Place the images in this directory (`public/products/`)
4. The website will automatically display the real images instead of emoji placeholders

## Additional Product Views (Optional)

You can add additional lifestyle or detail images:

- `ts-001-detail.jpg` - Close-up of fabric/texture
- `ts-001-worn.jpg` - Product being worn
- `ts-001-lifestyle.jpg` - Lifestyle shot

These are optional and for future enhancements. The system currently uses:

- `{id}.jpg` for shop display
- `{id}-front.jpg` for front mockup view
- `{id}-back.jpg` for back mockup view

## Fallback Behavior

### Shop Display

If the main product image (`{id}.jpg`) is not found:

- Tries `{id}.png` as backup
- Falls back to emoji placeholder (👕 🧥 👔 etc.)

### Mockup Customization

If front/back product images are not found:

- Falls back to generic SVG mockups
- Generic mockups show the basic apparel shape
- Real product photos provide accurate color and style preview

**Priority:** Upload front/back views first for the best customer experience!

## Testing

After adding images:

1. Refresh the shop page
2. Images should load automatically
3. Check browser console for any loading errors
4. Verify images display correctly on product cards and detail modals
