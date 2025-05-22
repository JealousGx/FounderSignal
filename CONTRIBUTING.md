# Contributing to FounderSignal

Thank you for your interest in contributing to FounderSignal! This document provides guidelines for contributing to our real-time micro-validation platform for startup founders.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. We expect all contributors to:

- Be respectful and considerate in communication
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/JealousGx/foundersignal.git
   cd foundersignal
   ```
3. **Add the upstream remote**:
   `git remote add upstream https://github.com/JealousGx/foundersignal.git`
4. **Create a branch** for your changes:
   `git checkout -b feature/your-feature-name`

## Development Setup

Frontend (Next.js)

1. Navigate to the web directory
   `cd web`
2. Copy the example environment file:
   `cp .env.example .env.local`
3. Install dependencies:
   `pnpm install`
4. Run the development server:
   `pnpm dev`

Backend (Go)

1. Navigate to the API directory:
   `cd api`
2. Copy the example environment file:
   `cp .env.example .env`
3. Run the server:
   `go run cmd/server/main.go`

## Making Changes

1. Make your changes in your feature branch
2. Follow the project's code style and conventions
3. Include appropriate tests for your changes
4. Ensure all tests pass
5. Update documentation as needed

## Commit Guidelines

We follow conventional commits for clear and structured history:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes (formatting, etc.)
- `refactor:` for code refactoring
- `test:` for adding or modifying tests
- `chore:` for maintenance tasks

Example: `feat(web): add user feedback component`

## Pull Request Process

1. **Update your fork** with the latest upstream changes:

```bash
git fetch upstream
git rebase upstream/main
```

2. **Push your changes** to your fork:

```bash
git push origin feature/your-feature-name
```

3. Create a pull request
4. Describe your changes in the PR description
5. Link to any related issues by mentioning them in the PR description
6. Wait for review and address any feedback

## Reporting Bugs

When reporting bugs, please include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Your environment (browser, OS, etc.)

## Feature Requests

Feature requests are welcome! Please provide:

- A clear description of the feature
- The problem it solves
- Any design or implementation ideas you have

## License

By contributing to FounderSignal, you agree that your contributions will be licensed under the project's MIT License.

## Questions

If you have any questions, feel free to open an issue or reach out to the maintainers.

##

Thank you for contributing to FounderSignal! Your efforts help make this platform better for startup founders everywhere.
