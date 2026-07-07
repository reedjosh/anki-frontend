# Dev loop against the homelab cluster.
#
#   ./dev.sh   # tilt up with an isolated josh-home kubeconfig
#
# Frontend: src/ edits sync straight into the pod; Vite HMR applies them.
# Backend: app/ edits sync into the pod; uvicorn --reload restarts the
# process — the interpreted-language analog of syncing a rebuilt binary.
# Both are served at https://anki.thereedfamily.rocks (frontend at /,
# API at /api) even during dev.

allow_k8s_contexts('josh-home')
if k8s_context() != 'josh-home':
    fail('This Tiltfile deploys to the josh-home cluster; current context is %s' % k8s_context())

load('ext://namespace', 'namespace_create')
namespace_create('anki')

docker_build(
    'ghcr.io/reedjosh/anki-frontend',
    './frontend',
    target='dev',
    live_update=[
        sync('./frontend/src', '/app/src'),
        sync('./frontend/index.html', '/app/index.html'),
        run('cd /app && npm install', trigger=['./frontend/package.json', './frontend/package-lock.json']),
    ],
)

docker_build(
    'ghcr.io/reedjosh/anki-backend',
    './backend',
    target='dev',
    live_update=[
        sync('./backend/app', '/app/app'),
    ],
)

k8s_yaml(helm(
    './chart',
    name='anki-frontend',
    namespace='anki',
    set=[
        'containerPort=5173',  # dev image runs the Vite dev server
        # PUBLIC_HOST points Vite's HMR websocket at the ingress hostname.
        'env.PUBLIC_HOST=anki.thereedfamily.rocks',
    ],
))

k8s_resource('anki-frontend', port_forwards='5173:5173', labels=['frontend'])
k8s_resource('anki-frontend-backend', port_forwards='8000:8000', labels=['backend'])
