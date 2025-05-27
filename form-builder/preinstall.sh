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
{
  "packageManager": "pnpm@10.11.0"
}
EOL
    echo "package.json oluşturuldu."
  else
    echo "package.json zaten var, üzerine yazılmadı."
  fi

  # package.json dosyasını oluştur, varsa üzerine yazma
  if [ ! -f ../pnpm-lock.yaml ]; then
    cat > ../pnpm-lock.yaml << EOL

EOL
    echo "pnpm-lock.yaml oluşturuldu."
  else
    echo "pnpm-lock.yaml zaten var, üzerine yazılmadı."
  fi
else
  echo "Netlify ortamı değil, preinstall script'i çalıştırılmadı."
fi