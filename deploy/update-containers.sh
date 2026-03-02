#!/bin/bash -e

VERSION=${VERSION:-latest}
GITHUB_USER=${GITHUB_USER:-buihuy13}
REGISTRY="ghcr.io"

DOCKER_COMPOSE_CMD="docker compose -f docker-compose.prod.yml"

echo "Logging in to pull images from $REGISTRY"
if [ -f ~/ghcr.pem ]; then
    cat ~/ghcr.pem | docker login $REGISTRY -u $GITHUB_USER --password-stdin
else
    echo "Error: ~/ghcr.pem not found"
    exit 1
fi

IMAGES=(
    "rabbitmq:3-management"
    "redis:7-alpine"
    "postgis/postgis:16-3.4"
    "openzipkin/zipkin"
    "caddy:2-alpine"
    "quay.io/keycloak/keycloak:24.0.0"
    "prom/prometheus:latest"
    "grafana/grafana:latest"
    "ghcr.io/$GITHUB_USER/service-discovery:$VERSION"
    "ghcr.io/$GITHUB_USER/api-gateway:$VERSION"
    "ghcr.io/$GITHUB_USER/user-service:$VERSION"
    "ghcr.io/$GITHUB_USER/notification-service:$VERSION"
    "ghcr.io/$GITHUB_USER/chat-service:$VERSION"
    "ghcr.io/$GITHUB_USER/restaurant-service:$VERSION"
    "ghcr.io/$GITHUB_USER/order-service:$VERSION"
    "ghcr.io/$GITHUB_USER/payment-service:$VERSION"
    "ghcr.io/$GITHUB_USER/blog-service:$VERSION"
    "ghcr.io/$GITHUB_USER/frontend:$VERSION"
    "ghcr.io/$GITHUB_USER/dashboard-service:$VERSION"
    "ghcr.io/$GITHUB_USER/recommendation-service:$VERSION"
)

echo "Pull từng image để giảm tải I/O"

for img in "${IMAGES[@]}"; do
    echo "Pulling: $img"
    
    # Thử pull, nếu lỗi thì thử lại tối đa 3 lần
    n=0
    until [ "$n" -ge 3 ]
    do
        docker pull "$img" && break
        n=$((n+1)) 
        echo "Pull lỗi, thử lại lần $n sau 5s"
        sleep 5
    done
    
    if [ "$n" -ge 3 ]; then
       echo "Không thể pull $img -> Dừng deploy."
       exit 1
    fi

    echo "Done: $img"
    sleep 3
done

# Down trước để clean up
docker compose -f docker-compose.prod.yml down --remove-orphans

echo "Starting containers in detached mode..."
./docker.sh up -d

echo "Checking container status..."
#Investigate cải thiện thêm
sleep 180

EXITED=$(docker compose -f docker-compose.prod.yml ps | grep Exit | wc -l)
if [ "$EXITED" -gt 0 ]; then
    echo "Some containers failed to start"
    $DOCKER_COMPOSE_CMD ps
    exit 1
else
    echo "All containers are running successfully"
    $DOCKER_COMPOSE_CMD ps
fi

echo "Clean up unused images"
docker image prune -f
docker logout $REGISTRY

echo "Update completed successfully."