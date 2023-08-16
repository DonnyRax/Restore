# Restore App 

# docker build postgres db
docker run --name restoredev -e POSTGRES_USER=appuser -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres:latest

# Build docker image
docker build -t donnyrax/restore .

# Run docker image
docker run --rm -it -p 8080:80 donnyrax/restore

# Push to docker hub
docker push donnyrax/restore:latest