const path = require('path');
const express = require('express');

function polyglitLocalEnabled() {
  const v = process.env.REACT_APP_USE_FIXTURES_FLAG;
  return String(v ?? '').trim().toLowerCase() === 'true';
}

module.exports = function (app) {
  if (!polyglitLocalEnabled()) return;

  const fixturesRoot = path.resolve(__dirname, '../../fixtures');
  app.use('/fixtures', express.static(fixturesRoot));
};
