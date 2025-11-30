# Extract Images from Elements.svg

Your `Elements.svg` file contains all the illustrations. You need to extract individual images and save them as separate files.

## Required Images

Based on your designs, you need these images:

### Onboarding Screens
1. **onboarding-1.svg** - Shopping bag with people (Welcome to Kitchen Pal)
2. **onboarding-2.svg** - Recipe book with people (Ingredient Alchemy)
3. **onboarding-3.svg** - Person with floating ingredients (Your Culinary Profile)

### Auth Screens
4. **login-character.svg** - Small character with pizza (top right of login)
5. **check-email.svg** - Mailbox with envelope illustration

## How to Extract (Option 1: Manual)

1. Open `public/assets/Elements.svg` in a vector editor (Figma, Illustrator, Inkscape)
2. Select each illustration
3. Export as individual SVG files with the names above
4. Save them in `public/assets/`

## How to Extract (Option 2: Using Figma)

If your Elements.svg is from Figma:

1. Open the file in Figma
2. Find each illustration by name or visual
3. Select the illustration
4. Right-click → Copy as SVG
5. Create new file with the name (e.g., `onboarding-1.svg`)
6. Paste the SVG code
7. Save in `public/assets/`

## Quick Fix (Temporary)

If you want to test the app immediately without extracting images:

1. Take screenshots of each illustration from your design
2. Save as PNG files with the correct names
3. Place in `public/assets/`

The app will work with either SVG or PNG files.

## File Structure After Extraction

```
public/assets/
├── Elements.svg (original)
├── onboarding-1.svg (or .png)
├── onboarding-2.svg (or .png)
├── onboarding-3.svg (or .png)
├── login-character.svg (or .png)
└── check-email.svg (or .png)
```

## Alternative: Use Emoji Temporarily

If you want to keep using emoji while you extract the images, the current code will work. Just comment out the image tags and uncomment the emoji divs.

## Verify Images Work

After extracting, visit:
- `http://localhost:3000/onboarding` - Should show 3 different illustrations
- `http://localhost:3000/login` - Should show character in top right
- `http://localhost:3000/forgot-password` - Should show mailbox after submitting

## Need Help?

If you're having trouble extracting the images, you can:
1. Share the Figma link (if available)
2. Use the emoji placeholders for now
3. Or I can help you create a script to split the SVG file
