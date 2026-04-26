#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const repoRoot = path.resolve(process.argv[2] || process.cwd())

const trackedFiles = readLines(runGit('ls-files'))
  .map((file) => file.trim())
  .filter(Boolean)

const scannedFiles = walk(repoRoot)
  .map((file) => path.relative(repoRoot, file).replace(/\\/g, '/'))
  .filter((file) =>
    /^(src|backend\/src|public|tests)\//.test(file) ||
    ['index.html', 'playwright.config.ts', 'vite.config.js', 'eslint.config.js'].includes(file),
  )

const existing = new Set(
  scannedFiles.filter((file) => fs.existsSync(path.join(repoRoot, file))),
)

const entrypoints = [
  'index.html',
  'src/main.tsx',
  'src/main.jsx',
  'backend/src/server.ts',
  'playwright.config.ts',
  'vite.config.js',
  'eslint.config.js',
]
  .filter((file) => existing.has(file) || fs.existsSync(path.join(repoRoot, file)))

const resolvedByFallback = new Map()
const graph = new Map()

for (const file of existing) {
  graph.set(file, resolveDependencies(file))
}

const reachable = new Set()
const queue = [...entrypoints]

while (queue.length > 0) {
  const current = queue.shift()
  if (!current || reachable.has(current)) {
    continue
  }

  if (!existing.has(current) && !entrypoints.includes(current)) {
    continue
  }

  reachable.add(current)
  const dependencies = graph.get(current) || []

  for (const dependency of dependencies) {
    if (!reachable.has(dependency)) {
      queue.push(dependency)
    }
  }
}

const unreachable = [...existing]
  .filter((file) => !reachable.has(file))
  .sort()

const report = {
  repoRoot,
  entrypoints,
  reachable: [...reachable].sort(),
  unreachable,
  trackedUnreachable: unreachable.filter((file) => trackedFiles.includes(file)),
  untrackedUnreachable: unreachable.filter((file) => !trackedFiles.includes(file)),
  resolvedByFallback: Object.fromEntries([...resolvedByFallback.entries()].sort()),
}

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)

function resolveDependencies(file) {
  const absolute = path.join(repoRoot, file)
  const contents = fs.readFileSync(absolute, 'utf8')
  const dependencies = new Set()

  if (file.endsWith('.html')) {
    for (const specifier of extractHtmlSpecifiers(contents)) {
      const resolved = resolveFromHtml(specifier)
      if (resolved) {
        dependencies.add(resolved)
      }
    }
    return [...dependencies]
  }

  if (file.endsWith('.css')) {
    for (const specifier of extractCssSpecifiers(contents)) {
      const resolved = resolvePublicOrRelative(file, specifier)
      if (resolved) {
        dependencies.add(resolved)
      }
    }
    return [...dependencies]
  }

  for (const specifier of extractModuleSpecifiers(contents)) {
    const resolved = resolvePublicOrRelative(file, specifier)
    if (resolved) {
      dependencies.add(resolved)
    }
  }

  if (file === 'playwright.config.ts') {
    for (const testFile of existing) {
      if (testFile.startsWith('tests/')) {
        dependencies.add(testFile)
      }
    }
  }

  return [...dependencies]
}

function extractModuleSpecifiers(contents) {
  const matches = [
    ...contents.matchAll(/\bimport\s+[^'"]*?from\s+['"]([^'"]+)['"]/g),
    ...contents.matchAll(/\bimport\s+['"]([^'"]+)['"]/g),
    ...contents.matchAll(/\bexport\s+[^'"]*?from\s+['"]([^'"]+)['"]/g),
    ...contents.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g),
    ...contents.matchAll(/\brequire\(\s*['"]([^'"]+)['"]\s*\)/g),
  ]

  return matches.map((match) => match[1]).filter(Boolean)
}

function extractHtmlSpecifiers(contents) {
  const matches = [
    ...contents.matchAll(/\bsrc=['"]([^'"]+)['"]/g),
    ...contents.matchAll(/\bhref=['"]([^'"]+)['"]/g),
  ]

  return matches.map((match) => match[1]).filter(Boolean)
}

function extractCssSpecifiers(contents) {
  const matches = [...contents.matchAll(/url\((['"]?)([^)'"]+)\1\)/g)]
  return matches.map((match) => match[2]).filter(Boolean)
}

function resolveFromHtml(specifier) {
  if (specifier.startsWith('http://') || specifier.startsWith('https://')) {
    return null
  }

  if (specifier.startsWith('/')) {
    const withoutSlash = specifier.slice(1)
    return resolveWithFallback(withoutSlash) ?? resolveWithFallback(`public/${withoutSlash}`)
  }

  return resolveWithFallback(specifier)
}

function resolvePublicOrRelative(fromFile, specifier) {
  if (!specifier || specifier.startsWith('node:') || specifier.startsWith('@')) {
    return null
  }

  if (specifier.startsWith('http://') || specifier.startsWith('https://')) {
    return null
  }

  if (specifier.startsWith('/')) {
    const withoutSlash = specifier.slice(1)
    return resolveWithFallback(withoutSlash) ?? resolveWithFallback(`public/${withoutSlash}`)
  }

  if (specifier.startsWith('.')) {
    const baseDir = path.posix.dirname(fromFile)
    const candidate = path.posix.normalize(path.posix.join(baseDir, specifier))
    return resolveWithFallback(candidate)
  }

  return null
}

function resolveWithFallback(specifier) {
  const variants = buildVariants(specifier)

  for (const variant of variants) {
    if (existing.has(variant)) {
      if (variant !== specifier) {
        resolvedByFallback.set(specifier, variant)
      }
      return variant
    }

    if (trackedFiles.includes(variant) && fs.existsSync(path.join(repoRoot, variant))) {
      if (variant !== specifier) {
        resolvedByFallback.set(specifier, variant)
      }
      return variant
    }
  }

  return null
}

function buildVariants(specifier) {
  const clean = specifier.replace(/\\/g, '/')
  const ext = path.posix.extname(clean)
  const knownExtensions = new Set([
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.mjs',
    '.cjs',
    '.css',
    '.svg',
    '.json',
    '.html',
  ])
  const hasKnownExtension = knownExtensions.has(ext)
  const variants = [clean]

  if (!hasKnownExtension) {
    for (const suffix of ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.svg']) {
      variants.push(`${clean}${suffix}`)
    }
    for (const suffix of ['index.ts', 'index.tsx', 'index.js', 'index.jsx', 'index.mjs', 'index.cjs']) {
      variants.push(path.posix.join(clean, suffix))
    }
  } else if (ext === '.jsx') {
    variants.push(clean.slice(0, -4) + '.tsx')
    variants.push(clean.slice(0, -4) + '.ts')
    variants.push(clean.slice(0, -4) + '.js')
  } else if (ext === '.js') {
    variants.push(clean.slice(0, -3) + '.ts')
    variants.push(clean.slice(0, -3) + '.tsx')
  }

  return [...new Set(variants)]
}

function runGit(args) {
  return execFileSync('git', args.split(' '), {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
}

function readLines(text) {
  return text.split(/\r?\n/)
}

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (['.git', 'node_modules', 'dist', 'test-results', '.agents', 'project-context'].includes(entry.name)) {
      continue
    }

    const absolute = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...walk(absolute))
    } else if (entry.isFile()) {
      files.push(absolute)
    }
  }

  return files
}
