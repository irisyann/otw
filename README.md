# Is It OTW? - Route Deviation Checker

Fully vibe-coded with Claude. Helps you figure out if your stops are actually on the way.

## Features
<img width="178" height="404" alt="mobile view" src="https://github.com/user-attachments/assets/4ae20784-e805-4b10-847c-68478c447167" />
<img width="800" height="404" alt="desktop view" src="https://github.com/user-attachments/assets/01eb6be5-621f-4443-ba53-a152fa1870bb" />



- **Route Planning** - Set your start and end points with Google Places autocomplete
- **Stop Analysis** - Add multiple stops and see how much extra distance/time each one adds
- **Visual Comparison** - See both direct route (gray) and route with stops (orange) on the map
- **Nearby Transit Finder** - Discover LRT/MRT stations along your route with minimal deviation
- **Deviation Indicators**:
  - 🟢 **Go for it** (< 10%) - Basically on the way
  - 🟡 **Slight detour** (10-25%) - Worth considering
  - 🔴 **Think twice** (> 25%) - That's a real detour

## Tech Stack

- **React 18** + **Vite** - Fast development and builds
- **Tailwind CSS** - Mobile-first styling
- **Google Maps APIs** - Maps, Places, Directions

## Setup

1. **Clone and install**
   ```bash
   cd otw
   npm install
   ```

2. **Configure Google Maps API Key**

   Create a `.env.local` file:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

   Your API key needs these APIs enabled in Google Cloud Console:
   - Maps JavaScript API
   - Places API (New)
   - Directions API

3. **Run the dev server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## How It Works

1. Enter your **Start** and **End** locations
2. The app calculates the direct route as a baseline
3. Add stops to see how much each one deviates from the direct route
4. Toggle "Find Nearby LRT/MRT" to discover transit stations along your route
5. Click any suggested station to add it as a stop

## License

MIT
