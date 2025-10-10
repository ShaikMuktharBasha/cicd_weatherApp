# Weather App with Authentication

A modern, responsive weather application with user authentication built with HTML, CSS, and JavaScript. Features include current weather conditions, 5-day forecasts, weather maps, user authentication, and a timeline view with precipitation data.

## Features

- 🌤️ Current weather conditions with beautiful glassmorphism UI
- 📍 Location-based weather using geolocation
- 🔍 City search functionality
- 🗺️ Interactive weather maps with Leaflet
- 📊 5-day weather forecast
- ⏰ Hourly weather timeline with precipitation indicators
- 📱 Fully responsive design
- � User authentication (Register/Login/Logout)
- 🔑 JWT-based secure authentication
- �💌 Enhanced feedback system with user context
- 🌍 World weather view
- 👤 User profile management

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Spring Boot with MySQL
- **Authentication**: JWT tokens
- **APIs**: OpenWeatherMap API, Custom Auth API
- **Maps**: Leaflet.js
- **Database**: MySQL
- **Icons**: Font Awesome
- **Email**: Formspree integration + SMTP
- **Styling**: Glassmorphism design with CSS variables

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

### Full Stack Setup

1. **Clone the repository**
2. **Set up the backend:**
   ```bash
   cd auth-backend-springboot
   # Set up database (see backend README)
   ./setup-database.sh  # Linux/Mac
   # or
   setup-database.bat   # Windows
   ```
3. **Start the backend:**
   ```bash
   cd auth-backend-springboot
   mvn spring-boot:run
   ```
4. **Set up the frontend:**
   ```bash
   cd Frontend
   npm install
   ```
5. **Start the frontend:**
   ```bash
   npm run dev
   ```
6. **Open [http://localhost:3000](http://localhost:3000) in your browser**

### Test Authentication

Use these sample accounts for testing:
- **admin@weatherapp.com** / `password123`
- **john.doe@example.com** / `password123`
- **jane.smith@example.com** / `password123` (Student role)

### Docker Deployment

#### Using Docker Compose (Recommended)

1. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

2. Access the application at [http://localhost:3000](http://localhost:3000)

#### Using Docker directly

1. Build the Docker image:
   ```bash
   docker build -t weather-app .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 weather-app
   ```

3. Access the application at [http://localhost:3000](http://localhost:3000)

## API Configuration

The app uses the OpenWeatherMap API. Make sure to:

1. Sign up for a free API key at [OpenWeatherMap](https://openweathermap.org/api)
2. Replace the API key in the JavaScript files (`js/main.js`, `js/search.js`, `js/world.js`)

## Project Structure

```
weather-app/
├── index.html          # Main page
├── search.html         # Search page
├── world.html          # World view page
├── css/
│   ├── style.css       # Main styles
│   ├── search.css      # Search page styles
│   └── world.css       # World page styles
├── js/
│   ├── main.js         # Main page logic
│   ├── search.js       # Search functionality
│   └── world.js        # World view logic
├── img/                # Weather icons
├── public/             # Static assets
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose setup
└── package.json        # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm run serve` - Alternative server command

## CI/CD Deployment

This project includes automated CI/CD pipelines using GitHub Actions for seamless deployment.

### GitHub Actions Workflows

#### 1. Deploy Weather App (`deploy.yml`)
- **Triggers**: Push/PR to main/master/develop branches when Frontend/Backend files change
- **Features**:
  - Pre-deployment testing (validates Dockerfiles and compose files)
  - Parallel builds for backend and frontend using matrix strategy
  - Multi-platform builds (AMD64 + ARM64)
  - Pushes images to GitHub Container Registry (GHCR)
  - Automatic tagging with branch, PR, and commit information
  - Docker layer caching for faster builds

#### 2. Development Build (`dev-build.yml`)
- **Triggers**: Push to develop/feature branches, or manual trigger
- **Features**:
  - Builds development versions of containers
  - Generates local rebuild scripts
  - Supports selective service rebuilding (frontend/backend/all)
  - Environment-specific builds (development/testing)

#### 3. Production Deployment (`production-deploy.yml`)
- **Triggers**: After successful build workflow or manual dispatch
- **Features**:
  - Generates customized deployment scripts for your repository
  - Includes service health checks and monitoring commands
  - Provides manual deployment instructions
  - Environment-specific configurations

#### 4. Health Check (`health-check.yml`)
- **Triggers**: Every 30 minutes automatically, or manual trigger
- **Features**:
  - Monitors application availability
  - Checks both frontend and backend services
  - Sends failure notifications
  - Provides restart commands for quick recovery

### Local Development with Auto-Rebuild

For automatic container rebuilding during development:

#### Linux/macOS:
```bash
chmod +x dev-watch.sh
./dev-watch.sh
```

#### Windows:
```cmd
dev-watch.bat
```

**Features:**
- Automatically detects Frontend file changes
- Rebuilds Docker container instantly
- Provides real-time feedback
- Works with inotifywait (Linux), fswatch (macOS), or polling fallback

### Repository-Specific Configuration

For repository `ShaikMuktharBasha/cicd_weatherApp`:

- **Backend Image**: `ghcr.io/ShaikMuktharBasha/cicd_weatherApp/weather-backend`
- **Frontend Image**: `ghcr.io/ShaikMuktharBasha/cicd_weatherApp/weather-frontend`
- **Registry**: GitHub Container Registry (ghcr.io)

### Setting up CI/CD

1. **Enable GitHub Container Registry**:
   - Go to repository Settings → Packages
   - Ensure packages are public or configure access

2. **Environment Variables** (if needed):
   - The workflow uses GitHub's built-in `GITHUB_TOKEN`
   - Add any additional secrets in repository Settings → Secrets

3. **Production Deployment**:
   - After workflow completion, download the generated `deploy.sh` script
   - Run it on your production server with Docker Compose

### Workflow Files Location
```
.github/
└── workflows/
    ├── deploy.yml              # Main CI/CD pipeline
    ├── dev-build.yml           # Development builds
    ├── production-deploy.yml   # Production deployment
    └── health-check.yml        # Application monitoring
```

### Development Scripts
```
dev-watch.sh                   # Linux/macOS auto-rebuild script
dev-watch.bat                  # Windows auto-rebuild script
```

## Development Workflow

### Auto-Rebuild During Development

1. **Start your containers:**
   ```bash
   docker-compose -f docker-compose.multi.yml up -d
   ```

2. **Run the auto-rebuild script:**
   ```bash
   # Linux/macOS
   ./dev-watch.sh

   # Windows
   dev-watch.bat
   ```

3. **Make changes to Frontend files** - the container will automatically rebuild!

### Manual Rebuild

If you prefer manual control:
```bash
# Rebuild specific service
docker-compose -f docker-compose.multi.yml build frontend
docker-compose -f docker-compose.multi.yml up -d frontend

# Or rebuild everything
docker-compose -f docker-compose.multi.yml up --build -d
```

## Available Scripts

## Docker Commands

```bash
# Build the image
docker build -t weather-app .

# Run the container
docker run -p 3000:3000 weather-app

# Using Docker Compose
docker-compose up --build
docker-compose down
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## License

This project is licensed under the MIT License.
