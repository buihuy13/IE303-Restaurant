#!/bin/bash -e
#deploy.sh <version>

version=$1
tag=v$version

if [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Deploying version $tag"
else
    echo "Invalid version format. Please use semantic versioning (e.g., 1.0.0)."
    exit 1
fi

echo "Checking out git tag: $tag"
git checkout $tag

github_username=buihuy13
registry=ghcr.io

cat ghcr.pem | docker login $registry -u $github_username --password-stdin

services=(
    "api-gateway"
    "user-service"
    "chat-service"
    "notification-service"
    "restaurant-service"
    "service-discovery"
    "frontend"
    "recommendation-service"
)

nodejs_services=("dashboard-service")

# Build and push Docker images
echo "Building images"

build_pids=()
for service in "${services[@]}"; do
    (
        if [ "$service" = "frontend" ]; then
            build_context="../frontend"
            dockerfile="../frontend/Dockerfile"
         elif [[ " ${nodejs_services[@]} " =~ " ${service} " ]]; then
            build_context="../backend/$service"
            dockerfile="../backend/$service/Dockerfile"
        else
            build_context="../backend"
            dockerfile="../backend/$service/Dockerfile"
        fi
        
        echo "  Building $service..."
        if docker build \
            -t $registry/$github_username/$service:$version \
            -f $dockerfile \
            --build-arg MODULE_PATH=$service \
            $build_context; then
            echo "$service built successfully"
        else
            echo "$service build failed"
            exit 1
        fi
    ) &
    build_pids+=($!)
done

# Wait for all builds
build_failed=0
for pid in "${build_pids[@]}"; do
    if ! wait $pid; then
        build_failed=1
    fi
done

if [ $build_failed -eq 1 ]; then
    echo "Some builds failed"
    exit 1
fi

echo "All images built successfully"

echo "Pushing images to $registry"

push_pids=()
for service in "${services[@]}"; do
    (
        echo "  Pushing $service..."
        if docker push $registry/$github_username/$service:$version; then
            echo "$service pushed successfully"
        else
            echo "$service push failed"
            exit 1
        fi
    ) &
    push_pids+=($!)
done

# Wait for all pushes
push_failed=0
for pid in "${push_pids[@]}"; do
    if ! wait $pid; then
        push_failed=1
    fi
done

if [ $push_failed -eq 1 ]; then
    echo "Some pushes failed"
    exit 1
fi

echo "All images pushed successfully"

git checkout develop

deploy_host=20.205.208.223
deploy_host_username=quochuy
deploy_host_private_key=key.pem

remote_dir=/home/$deploy_host_username/restaurant/$tag
echo "Creating remote directory $remote_dir on $deploy_host..."

# ssh vào remote vm và tạo thư mục
ssh -i $deploy_host_private_key $deploy_host_username@$deploy_host mkdir -p $remote_dir

echo "Uploading config and docker-compose files"
scp -r -i $deploy_host_private_key \
    ../caddy/Caddyfile.prod \
    ./update-containers.sh \
    ./docker-compose.prod.yml \
    ./.env \
    ./ghcr.pem \
    ../backend/seed-db \
    ./role-management.sh \
    ./realm.json.sh \
    ./init-keycloak.sh \
    ./docker.sh \
    ../monitoring \
    ../keycloak-config/themes \
    $deploy_host_username@$deploy_host:$remote_dir/

echo "Executing upgrade script on remote host"
ssh -i $deploy_host_private_key $deploy_host_username@$deploy_host "export VERSION=$version GITHUB_USER=$github_username; cd $remote_dir && bash ./update-containers.sh"

echo "Deployment of version $tag completed successfully."