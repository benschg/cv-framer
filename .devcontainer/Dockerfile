FROM oven/bun:1

# Install Chromium dependencies for Puppeteer + Node.js for Claude Code CLI
RUN apt-get update && apt-get install -y \
    bash \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set bash as default shell
RUN chsh -s /bin/bash

# Install global CLI tools
RUN bun install -g @anthropic-ai/claude-code vercel supabase