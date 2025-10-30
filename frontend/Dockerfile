# Dockerfile de desarrollo para React + Vite usando npm
FROM node:18-alpine

WORKDIR /app

# Copiamos los ficheros de gestión de dependencias
COPY package.json package-lock.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el código restante
COPY . .

# Exponemos el puerto 5173 (Vite)
EXPOSE 5173

# Arrancamos el dev server de Vite
CMD ["npm", "run", "dev", "--", "--host"]
