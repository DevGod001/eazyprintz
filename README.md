# Lifewear Prints - AI-Powered Custom Apparel Platform

A Next.js application for custom print-on-demand apparel with integrated AI design generation using free Hugging Face APIs.

## Features

- 🎨 **AI Design Studio** - Generate custom designs using AI
- 🤖 **Free AI Integration** - Uses Hugging Face's free Inference API
- 📝 **Text Generation** - Get creative design ideas from AI
- 🖼️ **Image Generation** - Create visual designs with Stable Diffusion
- 💨 **Real-time Generation** - Instant AI-powered design creation
- 📱 **Responsive Design** - Works on all devices
- 🎯 **Product Showcase** - T-shirts, Hoodies, Tank Tops

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**:
  - Text Generation: Google Gemini Pro (with API key)
  - Image Generation: Stable Diffusion 2.1 (via Hugging Face)
  - Prompt Enhancement: Gemini-powered optimization

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project folder:

```bash
cd lifewear-prints
```

2. Install dependencies (if not already installed):

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
lifewear-prints/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-design/    # AI text generation endpoint
│   │   │   └── generate-image/     # AI image generation endpoint
│   │   ├── design/                 # AI Design Studio page
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Home page
├── public/                         # Static assets
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── tailwind.config.ts              # Tailwind config
└── next.config.js                  # Next.js config
```

## AI Features

### Design Ideas Generation

The app uses **Google Gemini Pro** to generate professional design concepts:

- Detailed design descriptions with expert fashion advice
- Specific color palettes with hex codes
- Professional composition and style recommendations
- Typography and placement suggestions
- Powered by Google's Gemini API (API key included)

### Image Generation

The app uses **Gemini + Stable Diffusion 2.1** for enhanced image creation:

- Gemini optimizes your prompt for better results
- Stable Diffusion generates the actual design image
- Smart prompt enhancement for professional output
- High-quality, production-ready designs
- Free Hugging Face API (may have rate limits on first use)

### Using the AI Design Studio

1. Navigate to `/design` or click "Start Designing" on the home page
2. Enter a design description in the text area
3. Click "✨ Generate Design Ideas" for text-based concepts
4. Click "🎨 Generate Design Image" for visual designs
5. Wait for the AI to process (may take 5-15 seconds)

### Example Prompts

- "A minimalist mountain landscape with sunset orange and purple colors"
- "Retro 80s style neon geometric patterns with pink, blue, and purple"
- "Cute kawaii style cat wearing sunglasses, pastel colors, anime art"
- "Abstract watercolor flowers in soft pastels"
- "Bold graffiti style text with urban street art vibes"

## API Endpoints

### POST /api/generate-design

Generates creative design descriptions using AI.

**Request Body:**

```json
{
  "prompt": "Your design description"
}
```

**Response:**

```json
{
  "designIdea": "Detailed design concept..."
}
```

### POST /api/generate-image

Generates design images using Stable Diffusion.

**Request Body:**

```json
{
  "prompt": "Your design description"
}
```

**Response:** Image blob (PNG format)

## Important Notes

### Free API Limitations

- **Hugging Face Inference API** is free but has rate limits
- Image generation may take 10-20 seconds on first use (model loading)
- If you see "model is loading" errors, wait a few seconds and try again
- For production use, consider:
  - Getting a free Hugging Face API token
  - Using API keys for higher rate limits
  - Implementing request queuing

### Adding API Token (Optional)

To improve performance and avoid rate limits:

1. Sign up at [Hugging Face](https://huggingface.co/)
2. Get your free API token from Settings > Access Tokens
3. Create a `.env.local` file:

```env
HUGGINGFACE_API_TOKEN=your_token_here
```

4. Update the API routes to use the token in headers:

```typescript
headers: {
  "Authorization": `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
  "Content-Type": "application/json",
}
```

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Deployment

This app can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- Any Node.js hosting platform

For Vercel deployment:

```bash
npm install -g vercel
vercel
```

## Troubleshooting

### "Model is loading" Error

- Wait 30 seconds and try again
- The model needs to warm up on first use

### Slow Image Generation

- Normal for free tier (10-20 seconds)
- Consider adding API token for faster processing

### API Rate Limits

- Free tier has rate limits
- Add API token to increase limits
- Implement client-side request throttling

## Future Enhancements

- [ ] User authentication
- [ ] Save designs to database
- [ ] Shopping cart functionality
- [ ] Payment integration
- [ ] Design templates library
- [ ] Multiple AI model options
- [ ] Design editing tools
- [ ] Print preview on apparel mockups

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please refer to:

- [Hugging Face Documentation](https://huggingface.co/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
