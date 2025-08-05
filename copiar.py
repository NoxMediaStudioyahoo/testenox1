import os
import shutil
import json

# 1. Cria a pasta frontend
os.makedirs('frontend', exist_ok=True)

# 2. Lista de arquivos e pastas para copiar
# Adicione aqui todos os arquivos e pastas do seu frontend
to_copy = [
    'components',
    'App.tsx',
    'index.tsx',
    'tsconfig.json'
    # Adicione outros arquivos/pastas conforme necessário
]

for item in to_copy:
    src = item
    dst = os.path.join('frontend', item)
    if os.path.isdir(src):
        shutil.copytree(src, dst, dirs_exist_ok=True)
    elif os.path.isfile(src):
        shutil.copy2(src, dst)

# 3. Cria um package.json básico
package_json = {
    "name": "frontend",
    "version": "1.0.0",
    "private": True,
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "start": "vite preview"
    },
    "dependencies": {
        "react": "^18.0.0",
        "react-dom": "^18.0.0",
        "lucide-react": "^0.263.0",
        "qrcode.react": "^1.0.0"
    },
    "devDependencies": {
        "typescript": "^5.0.0",
        "@types/react": "^18.0.0",
        "@types/react-dom": "^18.0.0",
        "vite": "^4.0.0"
    }
}

with open('frontend/package.json', 'w', encoding='utf-8') as f:
    json.dump(package_json, f, indent=2)

# 4. Cria vite.config.js para rodar em 0.0.0.0
vite_config = '''\
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0'
  }
});
'''

with open('frontend/vite.config.js', 'w', encoding='utf-8') as f:
    f.write(vite_config)

print("Frontend copiado, package.json e vite.config.js criados. Rode npm install e npm run dev na pasta frontend.")