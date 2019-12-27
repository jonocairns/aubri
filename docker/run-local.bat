echo "running..."
docker run --env-file ./.env -v C:/DEV/data:/usr/src/data -p 6969:6969/tcp server 
echo "commpleted"