#!/bin/bash
set -e

check_command() {
  command -v "$1" >/dev/null 2>&1
}

process_files() {
  local desc="$1"
  local pattern="$2"
  local action="$3"
  local cmd="$4"
  if ! check_command "$cmd"; then
    echo "WARNING: Required command '$cmd' not found. Skipping $desc."
    return
  fi
  echo "Searching for $desc..."
  FILES=$(find /workspaces -type f -name "$pattern")
  if [ -n "$FILES" ]; then
    echo "Processing $desc..."
    echo "$FILES" | while read -r file; do
      eval "$action"
    done
  else
    echo "No $desc found."
  fi
  echo "Done processing $desc."
}

process_files "requirements.txt files" "requirements.txt" 'uv pip install -r "$file"' "uv"
process_files "pyproject.toml files" "pyproject.toml" 'uv pip install "$(dirname \"$file\")"' "uv"
process_files "renv.lock files" "renv.lock" 'Rscript -e "if (!requireNamespace(\"renv\", quietly=TRUE)) install.packages(\"renv\"); renv::restore()" --project=\"$(dirname \"$file\")\"' "Rscript"
process_files "Julia Project.toml files" "Project.toml" 'julia --project=\"$(dirname \"$file\")\" -e "using Pkg; Pkg.instantiate()"' "julia"