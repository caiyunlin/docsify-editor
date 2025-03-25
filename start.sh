
# link assets if they don't exist
if [ ! -d /var/www/docs/assets ]; then
  ln -s /tmp/docs/assets /var/www/docs/assets
fi

# link index.html if it doesn't exist
if [ ! -f /var/www/docs/index.html ]; then
  ln -s /tmp/docs/index.html /var/www/docs/index.html
fi

# link README.md if it doesn't exist
if [ ! -f /var/www/docs/README.md ]; then
  ln -s /tmp/docs/README.md /var/www/docs/README.md
fi

node server.js