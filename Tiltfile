# Dev loop against the homelab cluster.
#
#   tilt up        # build, deploy to josh-home, watch for changes
#
# Source edits under src/ are synced straight into the running pod and
# Vite HMR picks them up — no image rebuild. Dependency changes trigger
# `npm install` inside the container; Dockerfile/chart changes rebuild.
#
# When the (compiled) backend lands, its resource will follow the same
# pattern: build the binary locally, live_update-sync the bin into the
# pod, and restart the process.

allow_k8s_contexts('josh-home')
if k8s_context() != 'josh-home':
    fail('This Tiltfile deploys to the josh-home cluster; current context is %s' % k8s_context())

load('ext://namespace', 'namespace_create')
namespace_create('anki')

docker_build(
    'ghcr.io/reedjosh/anki-frontend',
    '.',
    target='dev',
    live_update=[
        sync('./src', '/app/src'),
        sync('./index.html', '/app/index.html'),
        run('cd /app && npm install', trigger=['./package.json', './package-lock.json']),
    ],
)

k8s_yaml(helm(
    './chart',
    name='anki-frontend',
    namespace='anki',
    set=[
        'containerPort=5173',   # dev image runs the Vite dev server
        'ingress.enabled=false' # reach it via the Tilt port-forward instead
    ],
))

k8s_resource('anki-frontend', port_forwards='5173:5173', labels=['frontend'])
