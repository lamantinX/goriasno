#!/bin/bash
gh secret set SERVER_HOST -b"$SERVER_HOST" -R lamantinX/goriasno
gh secret set SERVER_USER -b"$SERVER_USER" -R lamantinX/goriasno
gh secret set SERVER_SSH_KEY -b"$SERVER_SSH_KEY" -R lamantinX/goriasno
echo "Secrets configured in GitHub."
