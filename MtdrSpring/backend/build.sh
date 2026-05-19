#!/bin/bash

export IMAGE_NAME=todolistapp-springboot
if [ -z "$IMAGE_VERSION" ]; then
    export IMAGE_VERSION=${OCI_PRIMARY_SOURCE_COMMIT_HASH:-$(date '+%Y%m%d%H%M%S')}
fi
export BuildServiceDemoVersion=$IMAGE_VERSION

if [ -z "$DOCKER_REGISTRY" ]; then
    export DOCKER_REGISTRY=$(state_get DOCKER_REGISTRY)
    echo "DOCKER_REGISTRY set."
fi
if [ -z "$DOCKER_REGISTRY" ]; then
    echo "Error: DOCKER_REGISTRY env variable needs to be set!"
    exit 1
fi

export IMAGE=${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_VERSION}

BACKEND_DIR=$(pwd)
REPO_ROOT=$(cd "$BACKEND_DIR/../.." && pwd)
PORTAL_TARGET_DIR="$BACKEND_DIR/src/main/resources/static/portal"

echo "Repository root: $REPO_ROOT"
echo "Backend dir: $BACKEND_DIR"

echo "Installing frontend dependencies..."
cd "$REPO_ROOT" || exit 1
pnpm install --frozen-lockfile

echo "Building portal frontend..."
VITE_BASE_PATH=/portal/ pnpm build

echo "Copying frontend build into Spring static resources..."
rm -rf "$PORTAL_TARGET_DIR"
mkdir -p "$PORTAL_TARGET_DIR"
cp -R "$REPO_ROOT/dist/"* "$PORTAL_TARGET_DIR/"

echo "Packaging Spring Boot application..."
cd "$BACKEND_DIR" || exit 1
mvn clean package spring-boot:repackage

echo "Building Docker image $IMAGE ..."
docker build -f Dockerfile -t $IMAGE .

echo "Pushing Docker image..."
docker push $IMAGE
if [ $? -eq 0 ]; then
    docker rmi "$IMAGE"
fi