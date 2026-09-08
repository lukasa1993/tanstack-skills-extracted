#!/usr/bin/env bash
set -euo pipefail

EXPORTER_VERSION="6.0.0"
REGISTRY="${REGISTRY:-https://registry.npmjs.org}"
TAG="${TAG:-latest}"
MARKER=".tanstack-skills-export.tsv"
QUERY_INTENT_PACKAGE="@tanstack/query-intent"
QUERY_DRAFT_REPO="TanStack/query"
QUERY_DRAFT_REF="taren/query-intent-skills"
QUERY_DRAFT_PR="10879"

SELF_TEST=0
if [[ "${1:-}" == "--self-test" ]]; then
  SELF_TEST=1
  shift
fi
OUT="${1:-./tanstack-skills}"

for cmd in node tar find grep cut wc tr mktemp mkdir mv rm dirname; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "ERROR: required command not found: $cmd" >&2
    exit 1
  }
done

SCRIPT_DIR="$(
  cd -P "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1
  pwd -P
)"

# Resolve through existing parent symlinks, then reject targets whose removal
# could erase a filesystem root, a working tree, or another broad directory.
# FORCE only bypasses the exporter-marker check; it never bypasses these guards.
if ! OUT="$(node - "$OUT" "$SCRIPT_DIR" <<'NODE'
const fs = require('fs')
const os = require('os')
const path = require('path')

const raw = process.argv[2]
const scriptDir = fs.realpathSync(process.argv[3])
const cwd = fs.realpathSync(process.cwd())

function fail(reason) {
  process.stderr.write(`ERROR: unsafe output path ${JSON.stringify(raw)}: ${reason}\n`)
  process.exit(2)
}

if (!raw || /[\u0000-\u001f\u007f]/.test(raw)) {
  fail('the path is empty or contains control characters')
}

const lexical = path.resolve(raw)
if (fs.existsSync(lexical) && fs.lstatSync(lexical).isSymbolicLink()) {
  fail('the target is a symbolic link')
}

// realpathSync requires the full path to exist. Resolve the closest existing
// parent and append any missing components so parent symlinks cannot bypass the
// checks below.
let existing = lexical
const missing = []
while (!fs.existsSync(existing)) {
  const parent = path.dirname(existing)
  if (parent === existing) fail('no existing parent directory could be resolved')
  missing.unshift(path.basename(existing))
  existing = parent
}
const output = path.resolve(fs.realpathSync(existing), ...missing)
const root = path.parse(output).root

function isSameOrAncestor(candidate, child) {
  const rel = path.relative(candidate, child)
  return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel))
}

if (output === root) fail('refusing to target the filesystem root')

const belowRoot = path.relative(root, output).split(path.sep).filter(Boolean)
if (belowRoot.length < 2) fail('refusing to target a top-level system directory')
if (belowRoot.includes('.git')) fail('refusing to target a path inside .git')

if (isSameOrAncestor(output, cwd)) {
  fail(output === cwd ? 'refusing to target the current working directory' : 'refusing to target an ancestor of the current working directory')
}
if (isSameOrAncestor(output, scriptDir)) {
  fail(output === scriptDir ? 'refusing to target the exporter directory' : 'refusing to target an ancestor of the exporter directory')
}

const home = os.homedir()
if (home && fs.existsSync(home) && output === fs.realpathSync(home)) {
  fail('refusing to target the user home directory')
}
if (fs.existsSync(path.join(output, '.git'))) {
  fail('refusing to replace a Git working tree')
}

process.stdout.write(output)
NODE
)"; then
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
PACKS="$TMP/packs"
STAGE="$TMP/stage"
mkdir -p "$PACKS" "$STAGE"

TRANSFORM_JS="$SCRIPT_DIR/scripts/transform-skills.cjs"
FINALIZE_JS="$SCRIPT_DIR/scripts/finalize-skills.cjs"
VALIDATE_JS="$SCRIPT_DIR/scripts/validate-skills.cjs"


run_self_test() {
  echo "TanStack published-skills exporter v$EXPORTER_VERSION self-test"
  local fixtures="$TMP/fixtures"
  local test_mappings="$TMP/self-test-mappings.jsonl"
  local upstream_license="$fixtures/UPSTREAM-LICENSE"
  mkdir -p "$fixtures/ai/skills/ai-core/adapter-configuration/references"
  mkdir -p "$fixtures/ai/skills/ai-core/tools"
  mkdir -p "$fixtures/angular/skills/table-state"
  mkdir -p "$fixtures/ember/skills/table-state"
  mkdir -p "$fixtures/query-intent/skills/core/fetch-queries"

  printf '%s\n' 'MIT License' 'Fixture license text.' > "$upstream_license"

  node - "$fixtures/ai/skills/ai-core/SKILL.md" <<'NODE'
const fs = require('fs')
const file = process.argv[2]
const trigger = 'Use whenever an AI adapter must be configured.'
const description = `Core AI routing skill. ${'Preserve detailed routing context for adapters and providers. '.repeat(24)}${trigger}`
fs.writeFileSync(file, `---
name: ai-core
description: ${JSON.stringify(description)}
metadata:
  type: core
  requires: [ai-core/adapter-configuration]
sources:
  - 'TanStack/ai:fixture/core.md'
---
# AI Core
Use [adapter configuration](./adapter-configuration/SKILL.md).
Read \`ai-core/adapter-configuration/SKILL.md\`.
Use [shared tool notes](./tools/notes.md).
`)
NODE

  cat > "$fixtures/ai/skills/ai-core/adapter-configuration/SKILL.md" <<'EOF'
---
name: ai-core/adapter-configuration
description: Configure AI adapters.
license: Apache-2.0
metadata:
  requires: ai-core
---
# Adapter Configuration
Return to [AI core](../SKILL.md).
Read `ai-core/SKILL.md`.
Read **ai-core/SKILL.md** in bold.
Read __ai-core/SKILL.md__ with underscore emphasis.
Read ~~ai-core/SKILL.md~~ with strike emphasis.
See [reference](./references/detail.md).
EOF

  printf '%s\n' '# Detail' > "$fixtures/ai/skills/ai-core/adapter-configuration/references/detail.md"
  printf '%s\n' '# Tool notes' > "$fixtures/ai/skills/ai-core/tools/notes.md"

  cat > "$fixtures/angular/skills/table-state/SKILL.md" <<'EOF'
---
name: table-state
description: Angular table state.
requires:
  - '@tanstack/ai#ai-core'
  - tanstack-ai/core
---
# Angular Table State
Read `ai-core/adapter-configuration/SKILL.md`.
EOF

  cat > "$fixtures/ember/skills/table-state/SKILL.md" <<'EOF'
---
name: table-state
description: Ember getter (() => value) table state.
metadata:
  {
    type: framework,
    framework: ember,
  }
---
# Ember Table State
EOF

  cat > "$fixtures/query-intent/skills/core/fetch-queries/SKILL.md" <<'EOF'
---
name: core/fetch-queries
description: Fetch and observe Query data.
---
# Fetch Queries
EOF

  local query_source_ref='github:TanStack/query@0123456789abcdef0123456789abcdef01234567#packages/query-intent'
  local r1 r2 r3 r4
  r1="$(node "$TRANSFORM_JS" "$fixtures/ai/skills" "$STAGE" '@tanstack/ai' '0.test' 'MIT' "$upstream_license")"
  r2="$(node "$TRANSFORM_JS" "$fixtures/angular/skills" "$STAGE" '@tanstack/angular-table' '9.test' 'MIT' "$upstream_license")"
  r3="$(node "$TRANSFORM_JS" "$fixtures/ember/skills" "$STAGE" '@tanstack/ember-table' '9.test' 'MIT' "$upstream_license")"
  r4="$(node "$TRANSFORM_JS" "$fixtures/query-intent/skills" "$STAGE" '@tanstack/query-intent' '5.101.0' 'MIT' "$upstream_license" "$query_source_ref")"
  printf '%s\n' "$r1" "$r2" "$r3" "$r4" > "$test_mappings"

  node "$FINALIZE_JS" "$STAGE" "$test_mappings" >/dev/null
  node "$VALIDATE_JS" "$STAGE" "$MARKER" "$test_mappings" >/dev/null

  test -f "$STAGE/tanstack-ai-core/SKILL.md"
  test -f "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  test -f "$STAGE/tanstack-angular-table-table-state/SKILL.md"
  test -f "$STAGE/tanstack-ember-table-table-state/SKILL.md"
  test -f "$STAGE/tanstack-query-intent-core-fetch-queries/SKILL.md"
  test -f "$STAGE/tanstack-ai-core/tools/notes.md"
  test -f "$STAGE/tanstack-ai-core-adapter-configuration/references/detail.md"
  test -f "$STAGE/tanstack-ai-core/UPSTREAM-LICENSE"
  test -f "$STAGE/tanstack-angular-table-table-state/UPSTREAM-LICENSE"

  grep -q '^name: tanstack-ai-core-adapter-configuration$' "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  grep -q '../tanstack-ai-core-adapter-configuration/SKILL.md' "$STAGE/tanstack-ai-core/SKILL.md"
  grep -q '../tanstack-ai-core/SKILL.md' "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  grep -Fq 'tanstack-requires: "[\"tanstack-ai-core\"]"' "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  grep -Fq 'tanstack-requires: "[\"tanstack-ai-core-adapter-configuration\"]"' "$STAGE/tanstack-ai-core/SKILL.md"
  grep -Fq 'tanstack-requires: "[\"tanstack-ai-core\"]"' "$STAGE/tanstack-angular-table-table-state/SKILL.md"
  grep -q '^license: "MIT"$' "$STAGE/tanstack-ai-core/SKILL.md"
  grep -q '^license: "Apache-2.0"$' "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  grep -q '^  tanstack-framework: "ember"$' "$STAGE/tanstack-ember-table-table-state/SKILL.md"
  grep -q '^  tanstack-type: "core"$' "$STAGE/tanstack-ai-core/SKILL.md"
  grep -Fq "  tanstack-source-ref: \"$query_source_ref\"" "$STAGE/tanstack-query-intent-core-fetch-queries/SKILL.md"
  grep -Fq "Source: $query_source_ref" "$STAGE/tanstack-query-intent-core-fetch-queries/references/INTENT-SKILL-MAP.md"
  grep -q 'Read `../tanstack-ai-core-adapter-configuration/SKILL.md`' "$STAGE/tanstack-angular-table-table-state/SKILL.md"
  grep -Fq 'Read **../tanstack-ai-core/SKILL.md** in bold' "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  grep -Fq 'Read __../tanstack-ai-core/SKILL.md__ with underscore emphasis' "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  grep -Fq 'Read ~~../tanstack-ai-core/SKILL.md~~ with strike emphasis' "$STAGE/tanstack-ai-core-adapter-configuration/SKILL.md"
  grep -q '| `ai-core/adapter-configuration` | `tanstack-ai-core-adapter-configuration` |' "$STAGE/tanstack-ai-core/references/INTENT-SKILL-MAP.md"

  if grep -Eq '^(type|library|library_version|framework|requires|sources):' "$STAGE"/*/SKILL.md; then
    echo "ERROR: self-test found non-standard top-level frontmatter" >&2
    exit 1
  fi
  node - "$STAGE/tanstack-ai-core/SKILL.md" "$STAGE/tanstack-ember-table-table-state/SKILL.md" <<'NODE'
const fs = require('fs')
for (const file of process.argv.slice(2)) {
  const body = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/)[1]
  const description = JSON.parse(body.match(/^description:\s*(.+)$/m)[1])
  if (Buffer.byteLength(description, 'utf8') > 1024 || /[<>]/.test(description)) throw new Error(`Invalid description: ${file}`)
  if (file.includes('tanstack-ai-core') && !description.endsWith('Use whenever an AI adapter must be configured.')) {
    throw new Error(`Truncated trigger text: ${file}`)
  }
}
NODE

  local broken_ref="$STAGE/tanstack-ai-core/references/BROKEN.md"
  local broken_error="$TMP/broken-validation.err"
  printf '%s\n' 'Read `../../tanstack-missing/SKILL.md`.' > "$broken_ref"
  if node "$VALIDATE_JS" "$STAGE" "$MARKER" "$test_mappings" >/dev/null 2>"$broken_error"; then
    echo "ERROR: validator accepted a broken exported SKILL.md path" >&2
    exit 1
  fi
  grep -q 'broken exported SKILL.md reference' "$broken_error"
  rm -f "$broken_ref" "$broken_error"

  local stale_ref="$STAGE/tanstack-ai-core/references/STALE.md"
  local stale_error="$TMP/stale-validation.err"
  printf '%s\n' 'Read **ai-core/SKILL.md**.' > "$stale_ref"
  if node "$VALIDATE_JS" "$STAGE" "$MARKER" "$test_mappings" >/dev/null 2>"$stale_error"; then
    echo "ERROR: validator accepted a resolvable stale SKILL.md path" >&2
    exit 1
  fi
  grep -q 'unrewritten known SKILL.md reference' "$stale_error"
  rm -f "$stale_ref" "$stale_error"

  echo "PASS: hierarchical Intent names were flattened"
  echo "PASS: Angular/Ember table-state collision was preserved as two skills"
  echo "PASS: nested resources were preserved"
  echo "PASS: same-package and cross-package dependencies were resolved"
  echo "PASS: plain and Markdown SKILL.md paths were rewritten and validated"
  echo "PASS: upstream license identifiers and files were preserved"
  echo "PASS: supplemental source provenance was preserved"
  echo "PASS: frontmatter satisfies the standard field and description limits"
  echo "Self-test passed."
}

if [[ "$SELF_TEST" == "1" ]]; then
  run_self_test
  exit 0
fi

echo "TanStack published-skills exporter v$EXPORTER_VERSION"
echo "Source: npm dist-tag '$TAG' via $REGISTRY"
echo "Output format: flat Agent Skills bundle"
echo

MANIFEST="$TMP/$MARKER"
MAPPINGS_JSONL="$TMP/export-mappings.jsonl"
: > "$MAPPINGS_JSONL"

echo "Discovering all published @tanstack/* packages ..."

node "$SCRIPT_DIR/scripts/acquire-packages.mjs" "$PACKS"
PACKAGES_TXT="$PACKS/packages.tsv"

printf 'package\tversion\tlicense\tpublished_skill_files\texported_skills\toutput_skills\n' > "$MANIFEST"

package_total="$(wc -l < "$PACKAGES_TXT" | tr -d ' ')"
package_index=0
skill_total=0
included_packages=0
supplemental_query_source=""
query_intent_from_npm=0

while IFS=$'\t' read -r pkg pack_filename version; do
  [[ -n "$pkg" ]] || continue
  package_index=$((package_index + 1))
  tgz="$PACKS/$pack_filename"
  tar_list="$TMP/tar-$package_index.list"

  if ! tar -tzf "$tgz" > "$tar_list"; then
    echo "ERROR: could not list npm tarball for $pkg@$version: $tgz" >&2
    exit 1
  fi

  if ! grep -Eq '^package/skills/.*/SKILL\.md$' "$tar_list"; then
    if (( package_index % 25 == 0 || package_index == package_total )); then
      echo "[$package_index/$package_total] scanned published packages ..."
    fi
    rm -f "$tgz"
    continue
  fi

  if grep -Eq '(^|/)\.\.(/|$)|^/' "$tar_list"; then
    echo "ERROR: unsafe absolute or parent-traversal path in $pkg@$version tarball" >&2
    exit 1
  fi
  if ! grep -Fxq 'package/package.json' "$tar_list"; then
    echo "ERROR: $pkg@$version tarball has skills but no package/package.json" >&2
    exit 1
  fi

  license_entry="$(node - "$tar_list" <<'NODE'
const fs = require('fs')
const entries = fs.readFileSync(process.argv[2], 'utf8').split(/\r?\n/)
const licenses = entries
  .filter((entry) => /^package\/(?:licen[cs]e|copying)(?:\.[^/]*)?$/i.test(entry))
  .sort((a, b) => a.length - b.length || a.localeCompare(b))
if (licenses[0]) process.stdout.write(licenses[0])
NODE
  )"

  pkg_stage="$TMP/pkg-$package_index"
  mkdir -p "$pkg_stage"
  extract_members=(package/package.json package/skills)
  if [[ -n "$license_entry" ]]; then
    extract_members+=("$license_entry")
  fi
  if ! tar -xzf "$tgz" \
    -C "$pkg_stage" \
    --no-same-owner \
    --no-same-permissions \
    "${extract_members[@]}"; then
    echo "ERROR: could not extract skills and metadata from $pkg@$version" >&2
    exit 1
  fi
  if [[ -L "$pkg_stage/package/package.json" || ! -f "$pkg_stage/package/package.json" ]]; then
    echo "ERROR: package metadata is missing or is a symlink for $pkg@$version" >&2
    exit 1
  fi
  if [[ -n "$license_entry" && ( -L "$pkg_stage/$license_entry" || ! -f "$pkg_stage/$license_entry" ) ]]; then
    echo "ERROR: upstream license is missing or is a symlink for $pkg@$version: $license_entry" >&2
    exit 1
  fi

  license="$(node - "$pkg_stage/package/package.json" "$pkg" "$version" <<'NODE'
const fs = require('fs')
const file = process.argv[2]
const expectedName = process.argv[3]
const expectedVersion = process.argv[4]
let metadata
try {
  metadata = JSON.parse(fs.readFileSync(file, 'utf8'))
} catch (error) {
  process.stderr.write(`ERROR: invalid package metadata for ${expectedName}@${expectedVersion}: ${error.message}\n`)
  process.exit(2)
}
if (metadata.name !== expectedName || metadata.version !== expectedVersion) {
  process.stderr.write(`ERROR: package metadata identity mismatch: expected ${expectedName}@${expectedVersion}, got ${metadata.name}@${metadata.version}\n`)
  process.exit(2)
}
const raw = typeof metadata.license === 'string'
  ? metadata.license
  : metadata.license && typeof metadata.license.type === 'string'
    ? metadata.license.type
    : ''
const license = raw.trim()
if (!license || /[\u0000-\u001f\u007f]/.test(license)) {
  process.stderr.write(`ERROR: ${expectedName}@${expectedVersion} has no valid string license identifier in package.json\n`)
  process.exit(2)
}
process.stdout.write(license)
NODE
  )"

  upstream_license_file=""
  if [[ -n "$license_entry" ]]; then
    upstream_license_file="$pkg_stage/$license_entry"
  fi

  result_json="$TMP/result-$package_index.json"
  node "$TRANSFORM_JS" \
    "$pkg_stage/package/skills" "$STAGE" "$pkg" "$version" "$license" "$upstream_license_file" > "$result_json"

  node - "$result_json" >> "$MAPPINGS_JSONL" <<'NODE'
const fs = require('fs')
const value = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
process.stdout.write(`${JSON.stringify(value)}\n`)
NODE

  result_line="$(node - "$result_json" <<'NODE'
const fs = require('fs')
const x = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
process.stdout.write(`${x.skillFiles}\t${x.outputSkills}\t${x.outputRoots.join(',')}`)
NODE
  )"
  IFS=$'\t' read -r skill_count output_count output_roots <<< "$result_line"

  printf '%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$pkg" "$version" "$license" "$skill_count" "$output_count" "$output_roots" >> "$MANIFEST"

  skill_total=$((skill_total + output_count))
  included_packages=$((included_packages + 1))
  if [[ "$pkg" == "$QUERY_INTENT_PACKAGE" ]]; then
    query_intent_from_npm=1
  fi
  echo "[$package_index/$package_total] $pkg@$version: $skill_count published skills -> $output_count flat skills"
  rm -f "$tgz"
done < "$PACKAGES_TXT"

# TanStack Query's official Intent package is currently staged on an official
# TanStack/query branch. Use the PR's immutable head until npm carries the
# package; the normal npm scan then becomes the sole source automatically.
if [[ "$query_intent_from_npm" == "1" ]]; then
  echo "$QUERY_INTENT_PACKAGE is published on npm; supplemental GitHub import is not needed."
elif cut -f1 "$PACKAGES_TXT" | grep -Fxq "$QUERY_INTENT_PACKAGE"; then
  echo "ERROR: $QUERY_INTENT_PACKAGE is published on npm but its tarball contains no skills; refusing to remove the Query skills." >&2
  exit 1
else
  echo "Importing unpublished $QUERY_INTENT_PACKAGE from $QUERY_DRAFT_REPO pull request #$QUERY_DRAFT_PR ..."

  query_archive="$PACKS/query-intent-draft.tgz"
  IFS=$'\t' read -r query_sha query_pr_state < "$PACKS/query-source.tsv"

  query_tar_list="$TMP/query-intent-draft.list"
  if ! tar -tzf "$query_archive" > "$query_tar_list"; then
    echo "ERROR: could not list official Query draft archive for commit $query_sha" >&2
    exit 1
  fi
  if grep -Eq '(^|/)\.\.(/|$)|^/' "$query_tar_list"; then
    echo "ERROR: unsafe absolute or parent-traversal path in official Query draft archive $query_sha" >&2
    exit 1
  fi

  query_archive_root="query-$query_sha"
  query_package_root="$query_archive_root/packages/query-intent"
  for required_entry in \
    "$query_package_root/package.json" \
    "$query_package_root/skills/core" \
    "$query_archive_root/LICENSE"; do
    if ! grep -Fxq "$required_entry" "$query_tar_list" && ! grep -Fxq "$required_entry/" "$query_tar_list"; then
      echo "ERROR: official Query draft commit $query_sha is missing $required_entry" >&2
      exit 1
    fi
  done
  if ! grep -Eq "^$query_package_root/skills/.*/SKILL\\.md$" "$query_tar_list"; then
    echo "ERROR: official Query draft commit $query_sha contains no query-intent SKILL.md files" >&2
    exit 1
  fi

  query_stage="$TMP/query-intent-draft"
  mkdir -p "$query_stage"
  if ! tar -xzf "$query_archive" \
    -C "$query_stage" \
    --no-same-owner \
    --no-same-permissions \
    "$query_package_root/package.json" \
    "$query_package_root/skills" \
    "$query_archive_root/LICENSE"; then
    echo "ERROR: could not extract official Query draft commit $query_sha" >&2
    exit 1
  fi

  extracted_query_package="$query_stage/$query_package_root"
  extracted_query_license="$query_stage/$query_archive_root/LICENSE"
  if [[ -L "$extracted_query_package/package.json" || ! -f "$extracted_query_package/package.json" ]]; then
    echo "ERROR: package metadata is missing or is a symlink in official Query draft commit $query_sha" >&2
    exit 1
  fi
  if [[ -L "$extracted_query_license" || ! -f "$extracted_query_license" ]]; then
    echo "ERROR: repository license is missing or is a symlink in official Query draft commit $query_sha" >&2
    exit 1
  fi
  if find "$extracted_query_package/skills" -type l -print -quit | grep -q .; then
    echo "ERROR: symlink found in official Query draft skills tree at commit $query_sha" >&2
    exit 1
  fi

  query_metadata="$(node - "$extracted_query_package/package.json" "$QUERY_INTENT_PACKAGE" <<'NODE'
const fs = require('fs')
const file = process.argv[2]
const expectedName = process.argv[3]
let metadata
try {
  metadata = JSON.parse(fs.readFileSync(file, 'utf8'))
} catch (error) {
  process.stderr.write(`ERROR: invalid package metadata for ${expectedName}: ${error.message}\n`)
  process.exit(2)
}
if (metadata.name !== expectedName || typeof metadata.version !== 'string' || !metadata.version.trim()) {
  process.stderr.write(`ERROR: package identity mismatch in official Query draft: expected ${expectedName} with a version\n`)
  process.exit(2)
}
const raw = typeof metadata.license === 'string'
  ? metadata.license
  : metadata.license && typeof metadata.license.type === 'string'
    ? metadata.license.type
    : ''
const license = raw.trim()
if (!license || /[\u0000-\u001f\u007f]/.test(license)) {
  process.stderr.write(`ERROR: ${expectedName}@${metadata.version} has no valid string license identifier\n`)
  process.exit(2)
}
process.stdout.write(`${metadata.version}\t${license}`)
NODE
  )"
  IFS=$'\t' read -r query_version query_license <<< "$query_metadata"

  supplemental_query_source="github:$QUERY_DRAFT_REPO@$query_sha#packages/query-intent"
  query_result_json="$TMP/result-query-intent-draft.json"
  node "$TRANSFORM_JS" \
    "$extracted_query_package/skills" "$STAGE" "$QUERY_INTENT_PACKAGE" \
    "$query_version" "$query_license" "$extracted_query_license" \
    "$supplemental_query_source" > "$query_result_json"

  node - "$query_result_json" >> "$MAPPINGS_JSONL" <<'NODE'
const fs = require('fs')
const value = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
process.stdout.write(`${JSON.stringify(value)}\n`)
NODE

  query_result_line="$(node - "$query_result_json" <<'NODE'
const fs = require('fs')
const x = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
process.stdout.write(`${x.skillFiles}\t${x.outputSkills}\t${x.outputRoots.join(',')}`)
NODE
  )"
  IFS=$'\t' read -r query_skill_count query_output_count query_output_roots <<< "$query_result_line"

  printf '%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$QUERY_INTENT_PACKAGE" "$query_version" "$query_license" \
    "$query_skill_count" "$query_output_count" "$query_output_roots" >> "$MANIFEST"

  skill_total=$((skill_total + query_output_count))
  included_packages=$((included_packages + 1))
  echo "$QUERY_INTENT_PACKAGE@$query_version from PR #$QUERY_DRAFT_PR $query_pr_state commit $query_sha: $query_skill_count draft skills -> $query_output_count flat skills"
fi

finalization="$(node "$FINALIZE_JS" "$STAGE" "$MAPPINGS_JSONL")"
validation="$(node "$VALIDATE_JS" "$STAGE" "$MARKER" "$MAPPINGS_JSONL")"
validated_count="$(node -e 'const x=JSON.parse(process.argv[1]); process.stdout.write(String(x.skillCount))' "$validation")"

if [[ "$validated_count" -ne "$skill_total" ]]; then
  echo "ERROR: validation count mismatch: expected $skill_total, got $validated_count" >&2
  exit 1
fi

{
  printf '# exporter_version=%s\n' "$EXPORTER_VERSION"
  printf '# source_registry=%s\n' "$REGISTRY"
  printf '# source_tag=%s\n' "$TAG"
  if [[ -n "$supplemental_query_source" ]]; then
    printf '# supplemental_query_source=%s\n' "$supplemental_query_source"
    printf '# supplemental_query_pr=%s#%s\n' "$QUERY_DRAFT_REPO" "$QUERY_DRAFT_PR"
    printf '# supplemental_query_pr_state=%s\n' "$query_pr_state"
    printf '# supplemental_query_branch=%s\n' "$QUERY_DRAFT_REF"
  fi
  cat "$MANIFEST"
} > "$STAGE/$MARKER"

if [[ -e "$OUT" ]]; then
  if [[ ! -f "$OUT/$MARKER" && "${FORCE:-0}" != "1" ]]; then
    echo "ERROR: output exists and was not created by this exporter: $OUT" >&2
    echo "       Use another output path, remove it, or set FORCE=1." >&2
    exit 1
  fi
  rm -rf "$OUT"
fi

mkdir -p "$(dirname "$OUT")"
mv "$STAGE" "$OUT"

echo
echo "Done."
echo "Packages with skills: $included_packages"
echo "Exported skills:      $skill_total"
echo "Validated skills:     $validated_count"
echo "Output:               $OUT"
echo "Manifest:             $OUT/$MARKER"
