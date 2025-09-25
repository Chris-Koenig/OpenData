# Zurich Traffic Accidents Visualization

A responsive React Single Page Application that visualizes traffic accident data from Zurich, Switzerland.

## Features

- 📍 **Interactive Map**: Displays over 66,000 traffic accident locations in Zurich
- 🎯 **Smart Filtering**: Filter accidents by type (Pedestrian, Bicycle, Other vehicles)
- 📱 **Mobile Responsive**: Optimized for both desktop and mobile devices
- 🗺️ **70% Map Coverage**: Map takes up 70% of screen space as requested
- 🎨 **Color-Coded Markers**: Different colors for different accident types
- ℹ️ **Detailed Popups**: Click markers to see accident details
- 📊 **Real-time Counter**: Shows number of filtered vs total accidents

## Data Source

The application uses open data from the City of Zurich:
- **Source**: [Stadt Zürich Open Data Portal](https://data.stadt-zuerich.ch/dataset/sid_dav_strassenverkehrsunfallorte)
- **Dataset**: Road Traffic Accident Locations
- **Format**: CSV with Swiss LV95 coordinates
- **Size**: ~66,000+ accident records

## Technologies Used

- **React 18** with TypeScript
- **Leaflet** for interactive mapping
- **React-Leaflet** for React integration
- **Papa Parse** for CSV data processing
- **CSS3** with Flexbox and Grid for responsive design

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start the development server
npm start
```

The application will open in your browser at `http://localhost:3000`.

## Mobile Features

The application is fully optimized for mobile devices:

- **Responsive Layout**: On mobile, the filter panel moves below the map
- **Touch-Friendly**: Large touch targets for filter controls
- **Optimized Map Height**: Map takes exactly 70% of screen height on mobile
- **Condensed UI**: Legend hidden on mobile to save space
- **Fast Performance**: Efficient rendering even with thousands of markers

## Filter Options

### Available Filters
1. **Pedestrian Accidents** (Red markers) - Accidents involving pedestrians
2. **Bicycle Accidents** (Green markers) - Accidents involving bicycles  
3. **Other Vehicle Accidents** (Blue markers) - All other traffic accidents
4. **Mixed Accidents** (Orange markers) - Accidents involving both pedestrians and bicycles

### Filter Logic
- Filters can be combined (e.g., show only pedestrian AND bicycle accidents)
- Real-time counter updates as you change filters
- All filters enabled by default

## Building for Production

```bash
# Create production build
npm run build
```

## License

This project is open source. The accident data is provided by the City of Zurich under their open data license.
