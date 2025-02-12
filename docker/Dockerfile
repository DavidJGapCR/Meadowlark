# SPDX-License-Identifier: Apache-2.0
# Licensed to the Ed-Fi Alliance under one or more agreements.
# The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
# See the LICENSE and NOTICES files in the project root for more information.

# This file builds a Meadowlark Ed-Fi API container from npm packages on Azure
# Artifacts
ARG ML_VERSION=latest
FROM node:16.17.0-bullseye-slim@sha256:fa84c820c0a1106e170137241a66583f80c899d9b4483e4d2d8a1a9e413c2978 as base
RUN apt-get update && \
  apt-get upgrade -y && \
  # dumb-init is useful for running node properly (not as PID 1)
  apt-get install -y --no-install-recommends dumb-init=1.2.5-1 && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Start a new layer so that we don't need to rebuild everything above
FROM base as build
LABEL maintainer="Ed-Fi Alliance, LLC and Contributors <techsupport@ed-fi.org>"
WORKDIR /app

# Load all packages into Docker
COPY .npmrc /app

# Install the Meadowlark Fastify service TEMPORARY: install Ed-Fi custom antlr4
# from MyGet, because it cannot be deployed through Azure Artifacts due to lack
# of scope.
RUN npm i https://www.myget.org/F/ed-fi/npm/antlr4/-/4.6.1-patched.0.tgz && \
    npm i @edfi/meadowlark-fastify && \
    chown -R node:node /app

EXPOSE 3000
ENV NODE_ENV production
USER node

CMD ["dumb-init", "node", "/app/services/meadowlark-fastify/dist/index.js"]
