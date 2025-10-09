# Mockup Templates

This folder contains mockup templates for displaying designs on various products.

## Folder Structure

- `baby/` - Baby-sized clothing mockups (onesies, baby tees, etc.)
- `kids/` - Kids-sized clothing mockups
- `adult/` - Adult-sized clothing mockups

## Adding Mockup Images

For each category, add PNG images with transparent backgrounds showing the product. The design will be overlaid on the mockup.

### Recommended Files to Add:

**Baby Category** (`baby/`):

- `baby-onesie.png` - Baby onesie/bodysuit
- `baby-tshirt.png` - Baby t-shirt
- `baby-hoodie.png` - Baby hoodie

**Kids Category** (`kids/`):

- `kids-tshirt.png` - Kids t-shirt
- `kids-hoodie.png` - Kids hoodie
- `kids-sweatshirt.png` - Kids sweatshirt

**Adult Category** (`adult/`):

- `tshirt-front.png` - Adult t-shirt (front view)
- `tshirt-back.png` - Adult t-shirt (back view)
- `hoodie-front.png` - Adult hoodie (front view)
- `hoodie-back.png` - Adult hoodie (back view)
- `sweatshirt-front.png` - Adult sweatshirt (front view)
- `sweatshirt-back.png` - Adult sweatshirt (back view)
- `hat-front.png` - Adult hat/cap (front view)
- `hat-back.png` - Adult hat/cap (back view)

**Note for Hats**: Hat mockups are CRITICAL because hats have a unique shape. You must add:

- `hat-front.png` - Shows the front panel of the cap where designs are typically placed
- `hat-back.png` - Shows the back panel of the cap for back designs
  These images should clearly show the placement area for designs to align correctly.

## Image Specifications

- **Format**: PNG with transparent background
- **Resolution**: 1200x1400px minimum
- **Color**: White or light neutral colors work best
- **View**: Flat lay or front-facing product shot
- **Design Area**: The center chest area should be clear for design overlay

## Usage

The system automatically detects the target audience from the design prompt:

- Detects "baby", "infant", "newborn" → Uses baby mockups
- Detects "kid", "child", "toddler" → Uses kids mockups
- Otherwise → Uses adult mockups

You can source mockup images from:

- Placeit.net
- Mockup World
- Freepik
- Custom photography
