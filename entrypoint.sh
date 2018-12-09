#!/bin/sh

cat > /etc/nginx/conf.d/default.conf <<EOF
server {
	listen 80 default_server;
	listen [::]:80 default_server;
	root /usr/src/app/build;

	location = /404.html {
		internal;
	}
}
EOF

npm run-script build
chown -R nginx:nginx build
exec nginx -g "daemon off;"
