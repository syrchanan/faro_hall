#syntax=docker/dockerfile:1
FROM python:3

LABEL maintainer="Connor Hanan"
LABEL org.opencontainers.image.title="datascience-ai"
LABEL org.opencontainers.image.authors="Connor Hanan"
LABEL org.opencontainers.image.description="DS & AI Development Container"
LABEL org.opencontainers.image.created="2026-02-03"

# default build args
ARG INCLUDE_R_ARG=false
ARG INCLUDE_JULIA_ARG=false
ARG INCLUDE_GOOSE_ARG=false
ARG INCLUDE_CLAUDE_CODE_ARG=false
ARG INCLUDE_RALPH_ARG=false

# convert to env vars
ENV DEBIAN_FRONTEND=noninteractive \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8 \
    JULIAUP_DEPOT_PATH=/opt/juliaup \
    JULIA_DEPOT_PATH=/opt/julia \
    INCLUDE_R=$INCLUDE_R_ARG \
    INCLUDE_JULIA=$INCLUDE_JULIA_ARG \
    INCLUDE_GOOSE=$INCLUDE_GOOSE_ARG \
    INCLUDE_CLAUDE_CODE=$INCLUDE_CLAUDE_CODE_ARG \
    INCLUDE_RALPH=$INCLUDE_RALPH_ARG

# copy local config file
COPY ./config.json ./

# install base packages and setup environment based on config - exit on error
RUN bash <<'ENV_SETUP_EOF'
    set -e
    apt-get update && apt-get install -y --no-install-recommends \
        git curl vim wget htop tree zip unzip jq less sudo locales \
        build-essential pkg-config \
        openssh-client ca-certificates gnupg \
        ripgrep

    echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
    locale-gen

    # var_name|yaml_key
    VARS="
    INCLUDE_R|lang.r.enabled
    INCLUDE_JULIA|lang.julia.enabled
    INCLUDE_GOOSE|platform.goose.enabled
    INCLUDE_CLAUDE_CODE|platform.claude_code.enabled
    INCLUDE_RALPH|tool.ralph.enabled
    "

    CONFIG_FILE=./config.json
    rm -f /env.out

    for entry in $VARS; do
        varname=${entry%%|*}
        jqkey=${entry##*|}
        jqexpr=".$jqkey"  # ensure expression starts with dot

        val=""
        if [ -f "$CONFIG_FILE" ]; then
            val="$(jq -r "${jqexpr}" "$CONFIG_FILE" 2>/dev/null || true)"
        fi

        eval fallback="\$$varname"
        val="${val:-$fallback}"
        val="${val:-false}"

        # Normalize
        if [ "$val" = "1" ] || [ "$val" = "true" ]; then
            val="true"
        else
            val="false"
        fi

        echo "$varname=$val" >> /env.out
    done

    # update environment variables
    set -a
    source /env.out
    set +a
    rm -f /env.out

    # -------------------------------------
    # LANGUAGES
    # -------------------------------------
    # PYTHON (Base Image) ----
    pip install --no-cache-dir --upgrade pip uv
    # R ----
    if [ "$INCLUDE_R" = "true" ]; then
        apt-get update && apt-get install -y --no-install-recommends \
            r-base r-base-dev libcurl4-openssl-dev libssl-dev libxml2-dev
        ln -sf /usr/bin/Rscript /usr/local/bin/Rscript
    fi
    # JULIA ----
    if [ "$INCLUDE_JULIA" = "true" ]; then
        curl -fsSL https://install.julialang.org | sh -s -- --yes --path /opt/juliaup
        mkdir -p /opt/julia
        chmod -R 777 /opt/julia
        chmod -R 777 /opt/juliaup
        ln -sf /opt/juliaup/bin/julia /usr/local/bin/julia
    fi
    # -------------------------------------
    # PLATFORMS
    # -------------------------------------
    # GOOSE ----
    if [ "$INCLUDE_GOOSE" = "true" ]; then
        mkdir -p /tmp/goose-extract
        curl -fsSL https://github.com/block/goose/releases/download/stable/goose-x86_64-unknown-linux-gnu.tar.bz2 -o /tmp/goose-extract/goose.tar.bz2
        tar -xjf /tmp/goose-extract/goose.tar.bz2 -C /tmp/goose-extract
        mv /tmp/goose-extract/goose /usr/local/bin/goose
        chmod +x /usr/local/bin/goose
        rm -rf /tmp/goose-cli.tar.bz2 /tmp/goose-extract
        goose --version
    fi
    # CLAUDE CODE ----
    if [ "$INCLUDE_CLAUDE_CODE" = "true" ]; then
        curl -fsSL https://claude.ai/install.sh | bash
        CLAUDE_BASE="/root/.local/share/claude"
        CLAUDE_VER=$(ls $CLAUDE_BASE/versions | sort -V | tail -n1)
        mkdir -p /usr/local/share/claude
        cp -r $CLAUDE_BASE/versions/$CLAUDE_VER /usr/local/share/claude/
        cp -r $CLAUDE_BASE/data /usr/local/share/claude/ 2>/dev/null || true
        ln -sf /usr/local/share/claude/$CLAUDE_VER /usr/local/bin/claude
        chmod -R a+rx /usr/local/share/claude
    fi
    # -------------------------------------
    # TOOLS
    # -------------------------------------
    # RALPH ----
    if [ "$INCLUDE_RALPH" = "true" ]; then
        mkdir -p /home/developer/.config/goose/recipes
        # sparse checkout ralph folder from ai_tooling repo
        git clone --filter=blob:none --no-checkout https://github.com/syrchanan/ai_tooling.git /tmp/ai_tooling
        cd /tmp/ai_tooling
        git sparse-checkout init --cone
        git sparse-checkout set ralph
        git checkout main
        mv ralph/* /home/developer/.config/goose/recipes/
        cd /
        rm -rf /tmp/ai_tooling
    fi
    # CLEANUP ----
    apt-get clean
    rm -rf /var/lib/apt/lists/*
    rm -f ./config.json
ENV_SETUP_EOF

# Create dev user, workspace and .ssh directories - exit on error
RUN bash <<USER_EOF
    set -ex
    # create developer user with sudo permissions
    useradd -ms /bin/bash developer
    echo "developer ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
    # create workspace and other dirs
    mkdir -p /workspaces /home/developer/.github /home/developer/.ssh /commandhistory
    chown -R developer:developer /workspaces /home/developer/.github /home/developer/.ssh /commandhistory 
    # change perms for .ssh dir
    chmod 700 /home/developer/.ssh
USER_EOF

# create bashenv additions
COPY --chown=developer:developer <<'BASHENV_EOF' /home/developer/.bashenv
export PATH="/usr/local/bin:/opt/juliaup/bin:$PATH"
export PYTHONPATH="${PYTHONPATH}:/workspaces"
export GOOSE_DISABLE_KEYRING=1
BASHENV_EOF

# create bashrc additions - exit on error
COPY --chown=developer:developer <<'BASHRC_EOF' /home/developer/.bashrc
# source bashenv and juliaup root if it exists
[ -f ~/.bashenv ] && source ~/.bashenv
[ -f /root/.bashrc ] && source /root/.bashrc
# set history file to shared volume
export HISTFILE=/commandhistory/.bash_history
export HISTSIZE=10000
export HISTFILESIZE=20000
shopt -s histappend
export PROMPT_COMMAND="history -a; $PROMPT_COMMAND"
# make aliases
alias ll='ls -laF'
alias la='ls -la'
alias ..='cd ..'
alias grep='grep --color=auto'
# welcome message if interactive
if [[ $- == *i* ]]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║  DS & AI Development Container                         ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    echo " Python:   $(python --version 2>&1)"
    if command -v R >/dev/null 2>&1; then
    echo " R:        $(R --version | head -n 1 2>&1)"
    fi
    if command -v julia >/dev/null 2>&1; then
    echo " Julia:    $(julia --version 2>&1)"
    fi
    if command -v goose >/dev/null 2>&1; then
    echo " goose:   $(goose --version 2>&1)"
    fi
    if command -v claude >/dev/null 2>&1; then
    echo " claude:   $(claude --version 2>&1)"
    fi
    echo ""
    echo ""
    echo " Notes:"
    echo "  - Your workspace is located at /workspaces"
    echo "  - Prefer 'uv' to 'pip' for installing Python packages"
    echo ""
    if command -v goose >/dev/null 2>&1; then
    echo " Useful Commands:"
    echo "  - goose configure         Configure your goose environment"
    echo "  - goose session           Start a new goose session"
    echo "  - goose session -r        Resume last goose session"
    echo "  - goose web --open        Start goose web interface (experimental)"
    echo ""
    echo " Visit https://block.github.io/goose/docs/category/guides for more information."
    echo ""
    fi
fi
BASHRC_EOF

# create bash profile to source bashrc - exit on error
COPY --chown=developer:developer <<'BASHPROFILE_EOF' /home/developer/.bash_profile
if [ -f ~/.bashrc ]; then
    . ~/.bashrc
fi
BASHPROFILE_EOF

# set working directory and user
RUN chown -R developer:developer /home/developer
WORKDIR /workspaces
USER developer

# set bash as default shell in container
CMD [ "/bin/bash" ]