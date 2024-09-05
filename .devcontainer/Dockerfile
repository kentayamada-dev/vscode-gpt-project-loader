FROM debian:bookworm-slim

ARG USER_NAME
ARG UID
ARG NODE_VERSION
ARG PNPM_VERSION
ARG HOME=/home/$USER_NAME
ARG WORKSPACE=$HOME/workspace
ARG PNPM_HOME=$HOME/.local/share/pnpm

ENV SHELL=/bin/zsh
ENV PATH=$PNPM_HOME:${PATH}
ENV PNPM_HOME=$PNPM_HOME

RUN apt update && apt --yes install --no-install-recommends git ca-certificates zsh curl \
    # setup pnpm
    && mkdir --parents ${PNPM_HOME} \
    && curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=$PNPM_VERSION sh - \
    && pnpm env use --global $NODE_VERSION && pnpm config set store-dir $HOME/.pnpm-store \
    # setup local user
    && useradd --uid $UID --create-home --shell /bin/zsh $USER_NAME \
    && ln --symbolic --force $WORKSPACE/.devcontainer/.zshrc $HOME/.zshrc \
    && chown --recursive $USER_NAME $HOME && install --directory --owner=$USER_NAME $WORKSPACE/node_modules

USER $USER_NAME
