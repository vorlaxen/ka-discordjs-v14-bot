# KA-BOT

KA-BOT is a modular, scalable Discord bot framework built with TypeScript and Node.js, designed for maintainability, high performance, and extensibility. It follows a layered architecture separating commands, events, infrastructure, and utilities for clean code practices and efficient team collaboration.

---

## Table of Contents

* [Features](#features)
* [Architecture](#architecture)
* [Installation](#installation)
* [Configuration](#configuration)
* [Directory Structure](#directory-structure)
* [Usage](#usage)
* [Contributing](#contributing)
* [License](#license)

---

## Features

* **Command Handling:** Supports both prefix-based and slash commands.
* **Event Handling:** Modular event system for Discord client events.
* **Database Integration:** PostgreSQL with connection pooling and optional SSL support.
* **Caching:** Redis caching support with configurable options.
* **Logging:** Flexible logging system with multiple transports and log levels.
* **Moderation:** Auto-delete and logging features for moderation events.
* **Configuration Management:** Environment-based configuration for development and production.

---

## Architecture

The bot is designed with separation of concerns in mind:

* **Commands:** Organized into `all`, `prefix`, and `slash` for different command types.
* **Events:** Divided by event type and scope, allowing clean extension.
* **Handlers:** Centralized command and event handling for scalable interaction management.
* **Infrastructure:** Encapsulates database, cache, Discord, and logger services.
* **Models:** Database models organized by domain (e.g., Guilds).
* **Utilities:** Shared helper functions for string manipulation, encryption, datetime handling, and bot presence management.

This structure promotes maintainability and scalability, making it easy to extend functionality without cluttering the codebase.

---

## Installation

```bash
# Clone the repository
git clone https://github.com/vorlaxen/ka-discordjs-v14-bot.git
cd ka-discordjs-v14-bot

# Install dependencies
npm install

# Compile TypeScript
npm run build

# Start bot
npm run start
```

---

## Configuration

The bot relies on environment variables for sensitive credentials and runtime configuration. Copy `.env.example` to `.env` and fill in your values.

```env
NODE_ENV=development
BOT_TOKEN=
BOT_CLIENT_SECRET=
BOT_APP_ID=
BOT_OWNER_IDS=
BOT_PREFIX=!
BOT_TEST_SERVER=

DB_USERNAME=postgres
DB_PASSWORD=
DB_NAME=ka-bot
DB_HOST=localhost
DB_PORT=5432
DB_POOL_MAX=10
DB_POOL_MIN=0
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
DB_LOGGING=false
DB_TIMEZONE=+00:00
DB_SSL=false

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TLS_ENABLED=false
REDIS_PREFIX=ka-bot:
REDIS_CONNECT_TIMEOUT=10000
REDIS_MAX_RETRIES=5
REDIS_OFFLINE_QUEUE=true
REDIS_RETRY_MAX=10
```

---

## Directory Structure

```
KA-BOT/
├── logs/                 # Log files
├── src/
│   ├── commands/        # Command modules
│   ├── config/          # Configurations
│   ├── events/          # Discord event handlers
│   ├── handlers/        # Centralized event/command handlers
│   ├── infrastructure/  # Database, cache, Discord client, logger
│   ├── models/          # Database models
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── app.ts           # Bot entry point
├── .env
├── package.json
├── tsconfig.json
└── nodemon.json
```

---

## Usage

* Add new commands by creating files in `src/commands/all`, `src/commands/prefix`, or `src/commands/slash`.
* Add new event handlers in `src/events/bot`.
* Utilize the `infrastructure` services for database or Redis interactions.
* Log custom events using the `loggerService`.

The bot automatically loads all commands and events on startup, maintaining a clean runtime environment.

---

## Contributing

* Follow the existing code style (TypeScript, modular structure).
* Ensure new features include proper typings and error handling.
* Use environment variables for all sensitive data.

---

## License

MIT License
