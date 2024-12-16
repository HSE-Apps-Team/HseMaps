# HseMaps

An efficient and reusable indoor navigation system for educational institutions.

## Architecture

The project follows a modular architecture with clear separation of concerns:

- **Core Modules**
  - `DataModule`: Data management and initialization
  - `StateManager`: Global state management with validation
  - `RenderingModule`: SVG rendering and visualization
  - `PathfindingModule`: Path calculation algorithms

- **Support Modules**
  - `ColorModule`: Progress visualization
  - `DOMCache`: Efficient DOM element caching
  - `UtilityModule`: Common utilities
  - `EventHandlingModule`: User interaction handling

## Code Quality

- **Readability**: Consistent code style, clear naming conventions
- **Reusability**: Modular design, decoupled components
- **Documentation**: Comprehensive JSDoc comments
- **Efficiency**: Optimized algorithms, caching mechanisms

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm start`
4. Build production: `npm run build`

## Testing

Run tests with: `npm test`

## Contributing

1. Fork the repository
2. Create feature branch
3. Submit pull request

## License

MIT License