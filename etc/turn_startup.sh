#!/bin/bash
EXTIP=$(curl -H "Metadata-Flavor: Google" http://metadata/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip)
cp -f /etc/turnserver.init /etc/turnserver.conf
sed -i "s|externalip-here|$EXTIP|" /etc/turnserver.conf
systemctl restart coturn
