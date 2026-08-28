#!/usr/bin/env node

import { expectedProductSkills } from './catalog-config.mjs'

process.stdout.write(`${expectedProductSkills.join('\n')}\n`)
