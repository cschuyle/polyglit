const path = require('path');
const express = require('express');

function polyglitLocalEnabled() {
  const v = process.env.POLYGLIT_LOCAL;
  return Boolean(v && v !== '0' && v !== 'false');
}

module.exports = function (app) {
  if (!polyglitLocalEnabled()) return;

  const fixturesRoot = path.resolve(__dirname, '../../fixtures');
  app.use('/fixtures', express.static(fixturesRoot));
};
