
# copy assets if they don't exist
if [ ! -d /var/www/docs/assets ]; then
  cp -r /tmp/docs/assets /var/www/docs/assets
fi

# copy index.html if it doesn't exist
if [ ! -f /var/www/docs/index.html ]; then
  cp /tmp/docs/index.html /var/www/docs/index.html
fi

# copy README.md if it doesn't exist
if [ ! -f /var/www/docs/README.md ]; then
  cp /tmp/docs/README.md /var/www/docs/README.md
fi

node server.js