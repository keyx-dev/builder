#!/bin/bash

if [ "$NETLIFY" = "true" ]; then
  # pnpm-workspace.yaml dosyasını oluştur, varsa üzerine yazma
  if [ ! -f ../pnpm-workspace.yaml ]; then
    cat > ../pnpm-workspace.yaml << EOL
packages:
  - core
  - form-builder
EOL
    echo "pnpm-workspace.yaml oluşturuldu."
  else
    echo "pnpm-workspace.yaml zaten var, üzerine yazılmadı."
  fi

  # package.json dosyasını oluştur, varsa üzerine yazma
  if [ ! -f ../package.json ]; then
    cat > ../package.json << EOL
{}
EOL
    echo "package.json oluşturuldu."
  else
    echo "package.json zaten var, üzerine yazılmadı."
  fi
else
  echo "Netlify ortamı değil, preinstall script'i çalıştırılmadı."
fi