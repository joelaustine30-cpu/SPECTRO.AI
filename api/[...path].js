'use strict';

// Vercel routes requests under /api/* to this catch-all function. Reuse the
// same Express app as the local and Docker deployments so /api/chat behaves
// consistently in every environment.
const { createApp } = require('../server');

module.exports = createApp();
