# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Server Commands
- `bun run dev` - Start development server with hot reload on port 3000
- `bun run start` - Start production server
- `bun run build` - Build the application for production

### CLI Commands for Test Data Generation
- `bun run cli` - Show CLI help
- `bun run generate` - Generate test data with default parameters
- `bun run show` - Show test data statistics

### Environment Variables
- `PORT` - Server port (default: 3000)
- `SSO_PROVIDER` - SSO provider type (e.g., "test")
- `TEST_DATA_FILE` - Path to test data JSON file (default: ./test-data.json)
- `TEST_USER_USERNAME` - Specify a specific user for SSO authentication (optional, uses random user if not set)

## Architecture Overview

This is a FastGPT SSO test suite designed to test SSO login and user/organization synchronization functionality.

### Core Components

**Server Architecture (`src/index.ts`)**
- Express.js server with SSO authentication endpoints
- Supports both OAuth and SAML 2.0 authentication flows
- Middleware-based request handling with authentication

**Provider System (`src/provider/`)**
- Pluggable provider architecture for different SSO implementations
- Test provider (`test.ts`) generates mock authentication data
- Supports dynamic test data loading from JSON files

**CLI Tool (`src/cli.ts`)**
- Command-line tool for generating large-scale test data
- Supports customizable user counts and organization hierarchies
- Can generate/load data from configuration files
- Provides data visualization and statistics

### Key Endpoints
- `/login/oauth/getAuthURL` - Get OAuth authorization URL
- `/login/oauth/callback` - Handle OAuth callback
- `/login/oauth/getUserInfo` - Get user information
- `/user/list` - Get user list (requires auth)
- `/org/list` - Get organization list (requires auth)
- `/login/saml/metadata.xml` - SAML metadata endpoint
- `/login/saml/assert` - SAML assertion endpoint

### Test Data Structure

**Users**: Contains username, memberName, avatar, contact, and organization memberships
**Organizations**: Hierarchical structure with id, name, and parentId relationships

The test provider automatically loads test data from the configured JSON file and provides realistic mock responses for authentication flows.

### Data Generation
Use the CLI tool to generate test data with various scales:
- Small scale: `bun run generate -u 10 -d 2 -b 2`
- Medium scale: `bun run generate -u 100 -d 4 -b 3` 
- Large scale: `bun run generate -u 1000 -d 5 -b 4`

### Runtime Configuration
The test provider dynamically loads data from `TEST_DATA_FILE` environment variable, allowing easy switching between different test datasets without code changes.