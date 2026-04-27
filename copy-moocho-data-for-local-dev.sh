#!/usr/bin/env bash
set -euo pipefail

cp ../moocho/troves/little-prince/little-prince.json ./fixtures/public
cp ../moocho/troves/languages/{languages.iso639-1.json,languages.iso639-3-augmented.json,iso15924.json} ./frontend/public/fixtures/languages/
