# Photo Annotator

A professional, mobile-first photo annotation tool with advanced markup features including curved arrows, loupe magnification, and full editing capabilities.

![Photo Annotator](https://img.shields.io/badge/React-18.2.0-blue) ![Vite](https://img.shields.io/badge/Vite-5.0-purple) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

### 🎨 Annotation Tools
- **Curved Arrows** - Draw arrows and bend them with control points
- **Straight Arrows** - Simple directional arrows
- **Lines** - Basic line drawing
- **Rectangles** - Both filled and outlined rectangles
- **Circles/Ovals** - Both filled and outlined circles
- **Text** - Add text with customizable size and background
- **Loupe** - Interactive magnification tool with real-time preview

### ✨ Advanced Features
- **Full Undo/Redo** - Unlimited history
- **Object Selection** - Select, move, resize, and rotate any annotation
- **Color Picker** - 8 preset colors (Red, Yellow, Green, Blue, Black, White, Orange, Purple)
- **Fill Toggle** - Switch between filled and outlined shapes
- **Touch Optimized** - Designed for mobile devices
- **High Quality Export** - Save annotated images at full resolution

### 🎯 User Experience
- Mobile-first responsive design
- Smooth animations and transitions
- Glass-morphism UI
- Touch and mouse support
- Pinch-to-zoom (coming soon)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/photo-annotator.git
cd photo-annotator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## Building for Production

To create a production build:

```bash
npm run build
```

The optimized files will be in the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Drag and drop the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)

Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Deploy to GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json` scripts:
```json
"deploy": "npm run build && gh-pages -d dist"
```

3. Update `vite.config.js` with your repository name:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/photo-annotator/', // Replace with your repo name
})
```

4. Deploy:
```bash
npm run deploy
```

## Usage

1. **Upload a Photo** - Click "Choose Photo" to select an image
2. **Select a Tool** - Tap any tool in the bottom toolbar
3. **Draw/Annotate** - Touch and drag on the canvas
4. **Edit Objects** - Tap any object to select it
   - Drag to move
   - Use corner handles to resize
   - Change color using the color picker
   - Toggle fill/outline for shapes
   - Delete with the X button
5. **Curved Arrows** - After drawing an arrow, tap the middle control point and drag to create curves
6. **Loupe Tool** - Tap loupe tool, then drag your finger across the image to preview magnification. Lift finger to place
7. **Save** - Tap the download icon to save your annotated image

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library
- **HTML5 Canvas** - Drawing and rendering
- **CSS-in-JS** - Scoped styling

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Project Structure

```
photo-annotator/
├── src/
│   ├── App.jsx          # Main application component
│   └── main.jsx         # React entry point
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md           # This file
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Adding New Features

The main application logic is in `src/App.jsx`. Key functions:

- `drawCanvas()` - Renders all objects on canvas
- `drawObject()` - Draws individual annotation objects
- `handleCanvasMouseDown/Move/Up()` - Handle drawing interactions
- `addToHistory()` - Manage undo/redo state

## Future Enhancements

- [ ] Line width adjustment
- [ ] Font size selection
- [ ] Text background color options
- [ ] Arrow head configuration (start/end/both/none)
- [ ] Loupe zoom level adjustment (2x/3x/4x)
- [ ] Loupe size adjustment
- [ ] Freehand drawing
- [ ] Blur and pixelate tools
- [ ] Multiple pages/batch processing
- [ ] Cloud storage integration

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ using React and Vite
