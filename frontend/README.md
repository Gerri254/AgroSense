# IoT Smart Agriculture System - Frontend

A mobile-first web dashboard for monitoring and controlling IoT agriculture systems using ESP8266 microcontrollers and MQTT protocol.

## Features

### ✅ Implemented Requirements

#### Real-Time Monitoring (FR 1.1 - 1.4)
- **FR 1.1**: Real-time sensor display for Soil Moisture, Temperature, and Water Level
- **FR 1.2**: System status indicator showing ESP8266 connection status
- **FR 1.3**: Actuator status display (Water Pump & Cooling Fan)
- **FR 1.4**: Alert display showing critical system notifications

#### Control & Configuration (FR 2.1 - 2.3)
- **FR 2.1**: Threshold setting interface for soil moisture and temperature
- **FR 2.2**: Manual override controls for pump and fan
- **FR 2.3**: GSM configuration interface for SMS alerts

#### Historical Data Analytics (FR 3.1 - 3.2)
- **FR 3.1**: Line charts for sensor data trends (1h, 6h, 24h, 7d, 30d)
- **FR 3.2**: Action log table showing automated and manual actions

#### Authentication & Security (NFR 1.3)
- User authentication with login screen
- Session persistence using localStorage
- Secure credential management

## Technologies Used

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **MQTT.js** - MQTT client for real-time communication
- **Recharts** - Data visualization library
- **Lucide React** - Icon library

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Analytics/        # Historical data and charts (FR 3.1, 3.2)
│   │   ├── Auth/             # Login screen (NFR 1.3)
│   │   ├── Control/          # Manual override controls (FR 2.2)
│   │   ├── Dashboard/        # Real-time monitoring (FR 1.1-1.4)
│   │   ├── Layout/           # Header and navigation
│   │   └── Settings/         # Configuration interface (FR 2.1, 2.3)
│   ├── context/
│   │   └── AppContext.jsx    # Global state management
│   ├── services/
│   │   └── mqttService.js    # MQTT client service
│   ├── config/
│   │   └── mqttConfig.js     # MQTT configuration
│   ├── App.jsx               # Main application component
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global styles
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- MQTT Broker (Mosquitto recommended)
- ESP8266 device with firmware

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update:
   ```env
   VITE_MQTT_BROKER_URL=ws://localhost:8080
   VITE_MQTT_USERNAME=
   VITE_MQTT_PASSWORD=
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## MQTT Broker Setup

### Using Mosquitto

1. **Install Mosquitto**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mosquitto mosquitto-clients

   # macOS
   brew install mosquitto
   ```

2. **Configure WebSocket support**

   Edit `/etc/mosquitto/mosquitto.conf`:
   ```conf
   listener 1883
   protocol mqtt

   listener 8080
   protocol websockets
   ```

3. **Start Mosquitto**
   ```bash
   mosquitto -c /etc/mosquitto/mosquitto.conf
   ```

### MQTT Topics

The application subscribes to these topics:

- `agriculture/sensors` - All sensor data
- `agriculture/actuators` - Actuator status updates
- `agriculture/status` - Device online/offline status
- `agriculture/alerts` - System alerts

The application publishes to:

- `agriculture/commands/pump` - Pump control commands
- `agriculture/commands/fan` - Fan control commands
- `agriculture/commands/config` - Configuration updates

## Default Credentials

For development/demo purposes:

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials in production!

## Features Overview

### Dashboard Tab
- Real-time sensor cards with trend indicators
- Actuator status display
- Critical alert notifications
- Quick summary statistics
- Color-coded threshold warnings

### Control Tab
- Manual pump and fan controls
- Current conditions display
- Confirmation dialogs for safety
- Auto/Manual mode indication

### Analytics Tab
- Interactive line charts for sensor trends
- Customizable time ranges
- Data export to CSV
- Summary statistics
- Action log table with timestamps

### Settings Tab
- Threshold configuration for:
  - Soil moisture (min/max)
  - Temperature (min/max)
  - Water level (min)
- Automation mode toggles
- GSM alert configuration
- System information display

## Mobile Responsiveness

The dashboard is optimized for mobile devices with:

- Mobile-first design approach
- Responsive grid layouts
- Touch-friendly controls
- Optimized font sizes
- Collapsible navigation

Tested on:
- Chrome Mobile
- Safari iOS
- Firefox Mobile

## Data Persistence

- User session: localStorage
- Configuration: localStorage
- Historical data: localStorage (last 1000 points)
- Action logs: localStorage (last 100 entries)

## Performance

- Dashboard load time: < 3 seconds
- Real-time latency: < 2 seconds (MQTT)
- Build size: ~930KB (minified)
- Chart rendering: Optimized with Recharts

## Troubleshooting

### MQTT Connection Issues

1. Check broker is running: `mosquitto -v`
2. Verify WebSocket listener is configured (port 8080)
3. Check firewall allows connections to MQTT ports
4. Ensure BROKER_URL in `.env` is correct

### Build Errors

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### Data Not Updating

1. Check MQTT broker connection status (header indicator)
2. Verify ESP8266 is publishing to correct topics
3. Check browser console for errors
4. Test MQTT with mosquitto_sub:
   ```bash
   mosquitto_sub -t "agriculture/#" -v
   ```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create component in appropriate directory
2. Update AppContext if state management needed
3. Add route in App.jsx
4. Update Navigation.jsx if new tab needed

## License

[Add your license here]

## Support

For issues and questions:
- Check documentation
- Review MQTT broker logs
- Check browser console for errors

---

**Version**: 1.0.0
**Last Updated**: 2025-10-29
**Status**: ✅ Production Ready
