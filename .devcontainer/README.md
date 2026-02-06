# Devcontainer Setup Documentation

This folder contains files, configuration, and scripts for the development container (devcontainer) experience for this project.

## Key Files

- `Dockerfile`: Main build script for the development environment; supports modular installation of Python, R, Julia, Goose, and other tools.
- `devcontainer.json`: VS Code-specific configuration. Controls workspace folder, extensions, user environment, ports, and post-start automation.
- `config.json`: Tuning file for enabling/disabling languages or tools in the build.
- `poststart.sh`: Startup script for auto-installing dependencies when the container is first opened.

---

## Configuration (`config.json`)

You can adjust the behavior of your devcontainer build by editing `.devcontainer/config.json`.
These values are read during the Docker build and mapped to environment variables and build args.

### `lang` section
- `lang.r.enabled: false|true`  
  Installs the R language and common R build dependencies.
- `lang.julia.enabled: false|true`  
  Installs Julia via JuliaUp.

### `platform` section
- `platform.goose.enabled: false|true`  
  Installs the Goose CLI.
- `platform.claude_code.enabled: false|true`  
  Installs the Claude Code CLI.

### `tool` section
- `tool.ralph.enabled: false|true`  
  Auto-downloads the Ralph workflow tool to ~/.config/goose/recipes.

#### Example (defaults)
```json
{
  "lang": {
    "r": {
      "enabled": false
    },
    "julia": {
      "enabled": false
    }
  },
  "platform": {
    "goose": {
      "enabled": false
    },
    "claude_code": {
      "enabled": false
    }
  },
  "tool": {
    "ralph": {
      "enabled": false
    }
  }
}
```

These options also correspond to Docker build arguments (e.g., `INCLUDE_R_ARG`) and will default to false as in the file if not specified.

---

## Build ARGs and Environment Variables

These can also be passed to `docker build` directly if you wish to override them (advanced):

- `INCLUDE_R_ARG` (default false)
- `INCLUDE_JULIA_ARG` (default false)
- `INCLUDE_GOOSE_ARG` (default false)
- `INCLUDE_RALPH_ARG` (default false)

---

## devcontainer.json Quick Reference

- `build.dockerfile`: Which Dockerfile to use (this folder’s `Dockerfile`)
- `customizations.vscode.extensions`: Recommended Code extensions (Python, Julia, Black, Jupyter, etc.)
- `workspaceFolder`: Where all code goes inside the container (`/workspaces`)
- `remoteUser`: Developer user for security
- `forwardPorts`: Common dev ports to forward (8000, 5000, 3000, 8080)
- `postStartCommand`: Script run on container start, auto-installs project dependencies if found (see below)

---

## poststart.sh: Automated Dependency Setup

When the container starts, `poststart.sh` checks for and installs dependencies:
- Installs Python deps from `requirements.txt` or `pyproject.toml` using `uv` if Python is present
- Installs R environment via `renv.lock` if R is present
- Installs Julia deps via `Project.toml` if Julia is present

Logs are output to `/tmp/poststart.log` inside the container for troubleshooting.

---

## Typical Workflow
1. Update `.devcontainer/config.json` to match the tools you need.
2. Rebuild your devcontainer in VS Code ("Rebuild container" if open).
3. Optionally, override build arguments or add settings in `devcontainer.json` for your workflow.
4. Add project-level dependencies in the root of your workspace (requirements, renv, etc.).

---

## Troubleshooting & Tips
- To skip post-start installs, comment out or change the `postStartCommand`.
- For more advanced customizations (e.g. conda/mamba for Python, or special Julia package sources), fork or extend the scripts.

---

For more, see the main project README or contact the maintainers.
