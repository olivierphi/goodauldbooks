# PHP setup on Ubuntu:

```bash
sudo add-apt-repository ppa:ondrej/php
sudo apt-get update
sudo apt install php7.3-cli php7.3-json php7.3-common php7.3-readline php7.3-zip php7.3-mbstring php7.3-xml  php7.3-pgsql
# dev only:
sudo apt install php7.3-xdebug
```

### Xdebug config:

```ini
# /etc/php/7.3/cli/conf.d/20-xdebug.ini

zend_extension=xdebug.so

xdebug.remote_autostart=1
xdebug.default_enable=1
xdebug.remote_port=9000
xdebug.remote_host=127.0.0.1
xdebug.remote_connect_back=1
xdebug.remote_enable=1
xdebug.idekey=PHPSTORM

```
