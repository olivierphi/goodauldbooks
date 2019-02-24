#!/bin/bash
# @link https://serverfault.com/questions/368054/run-an-interactive-bash-subshell-with-initial-commands-without-returning-to-the
bash --init-file <(echo "source /app/.venv/bin/activate")
