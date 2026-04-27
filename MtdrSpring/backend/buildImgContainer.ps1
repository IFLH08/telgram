docker stop agilecontainer
docker rm -f agilecontainer
docker rmi agileimage
mvn clean verify
docker build -f DockerfileDev --platform linux/amd64 -t agileimage:0.1 .
docker run --name agilecontainer --env-file ../../.env -e TNS_ADMIN_PATH=/mtdrworkshop/creds --volume "${PWD}/target:/tmp/target:rw" -p 8080:8080 -d agileimage:0.1