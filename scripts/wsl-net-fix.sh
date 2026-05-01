#!/bin/bash

# Script to help fix PUSPA-V4 OpenClaw bridge connectivity from WSL to Windows
# Run this inside WSL

WSL_IP=$(ip addr show eth0 | grep inet | awk '{ print $2; exit }' | cut -d/ -f1)
WINDOWS_HOST_IP=$(grep nameserver /etc/resolv.conf | awk '{print $2}')

echo "--- PUSPA-V4 WSL NETWORK DIAGNOSTIC ---"
echo "WSL Internal IP: $WSL_IP"
echo "Windows Host IP: $WINDOWS_HOST_IP"
echo ""
echo "Step 1: Pastikan bridge anda diikat (bound) pada 0.0.0.0"
echo "        Jika anda menggunakan node/express, pastikan app.listen(port, '0.0.0.0')"
echo ""
echo "Step 2: Kemaskini fail .env di Windows (PUSPA-V4 root)"
echo "        Letakkan baris ini:"
echo "        OPENCLAW_BRIDGE_URL=http://$WSL_IP:4000/puspa-bridge"
echo "        (Gantikan 4000 dengan port sebenar bridge anda)"
echo ""
echo "Step 3: Uji sambungan dari Windows PowerShell"
echo "        Jalankan: curl http://$WSL_IP:4000/puspa-bridge/snapshot"
echo ""
echo "---------------------------------------"
