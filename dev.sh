#!/usr/bin/env bash
# Start the Tilt dev loop against josh-home without touching the global
# kubeconfig context (so a work Tilt on another cluster can keep running).
set -euo pipefail
cd "$(dirname "$0")"

kubeconfig=.kubeconfig.josh-home
kubectl --context josh-home config view --flatten --minify > "$kubeconfig"

exec env KUBECONFIG="$kubeconfig" TILT_PORT="${TILT_PORT:-10351}" tilt up "$@"
