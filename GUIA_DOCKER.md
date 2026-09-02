# 🐳 Guía de Comandos Docker

Referencia rápida con los comandos más importantes de Docker, organizados por categoría.

---

## 0. Parar y Arrancar contenedor existente
```bash
# Solo detiene los contenedores, pero los deja creados
docker compose stop

# Para volver a arrancarlos sin recrear nada:
docker compose start

# Tambien puede ser asi 
docker compose up

```

## 1. Verificar el estado de Docker

```bash
# Ver la versión de Docker instalada
docker --version

# Ver información detallada (versión, sistema, etc.)
docker info

# Comprobar si el daemon de Docker está corriendo
docker ps
# Si Docker NO está corriendo, este comando dará un error de conexión
```

---

## 2. Gestión de imágenes

```bash
# Listar todas las imágenes descargadas localmente
docker images
# o también:
docker image ls

# Descargar (pull) una imagen desde Docker Hub
docker pull nombre_imagen:tag

# Eliminar una imagen
docker rmi nombre_imagen_o_id

# Eliminar todas las imágenes que no están en uso (dangling)
docker image prune

# Eliminar TODAS las imágenes no usadas por ningún contenedor
docker image prune -a

# Ver el historial de capas de una imagen
docker history nombre_imagen

# Construir una imagen desde un Dockerfile
docker build -t nombre_imagen:tag .

# Etiquetar una imagen (útil antes de subirla a un registro)
docker tag imagen_origen nuevo_nombre:tag

# Subir una imagen a Docker Hub (requiere login)
docker push nombre_usuario/nombre_imagen:tag
```

---

## 3. Gestión de contenedores (arrancar / parar / listar)

```bash
# Listar contenedores en ejecución
docker ps

# Listar TODOS los contenedores (incluidos los detenidos)
docker ps -a

# Crear y arrancar un contenedor a partir de una imagen
docker run nombre_imagen

# Arrancar en segundo plano (detached) y asignar un nombre
docker run -d --name mi_contenedor nombre_imagen

# Arrancar con mapeo de puertos (host:contenedor)
docker run -d -p 8080:80 --name mi_contenedor nombre_imagen

# Arrancar de forma interactiva (con terminal)
docker run -it nombre_imagen /bin/bash

# Iniciar un contenedor ya creado (que está detenido)
docker start nombre_contenedor_o_id

# Detener un contenedor en ejecución
docker stop nombre_contenedor_o_id

# Reiniciar un contenedor
docker restart nombre_contenedor_o_id

# Pausar / reanudar un contenedor
docker pause nombre_contenedor_o_id
docker unpause nombre_contenedor_o_id

# Eliminar un contenedor (debe estar detenido, o usar -f para forzar)
docker rm nombre_contenedor_o_id
docker rm -f nombre_contenedor_o_id

# Eliminar todos los contenedores detenidos
docker container prune
```

---

## 4. Inspeccionar y depurar contenedores

```bash
# Ver los logs de un contenedor
docker logs nombre_contenedor

# Ver los logs en tiempo real (como "tail -f")
docker logs -f nombre_contenedor

# Ejecutar un comando dentro de un contenedor ya corriendo
docker exec -it nombre_contenedor /bin/bash
# (si el contenedor es Alpine, a veces se usa /bin/sh en vez de /bin/bash)

# Ver información detallada de un contenedor (JSON con toda su config)
docker inspect nombre_contenedor

# Ver el uso de recursos (CPU, memoria, red) en tiempo real
docker stats

# Ver los procesos que corren dentro de un contenedor
docker top nombre_contenedor

# Copiar archivos entre el host y un contenedor
docker cp archivo.txt nombre_contenedor:/ruta/destino
docker cp nombre_contenedor:/ruta/origen archivo_local.txt
```

---

## 5. Redes (networks)

```bash
# Listar las redes disponibles
docker network ls

# Crear una red personalizada
docker network create mi_red

# Ver detalles de una red
docker network inspect mi_red

# Conectar un contenedor a una red
docker network connect mi_red nombre_contenedor

# Desconectar un contenedor de una red
docker network disconnect mi_red nombre_contenedor

# Eliminar una red
docker network rm mi_red
```

---

## 6. Volúmenes (persistencia de datos)

```bash
# Listar volúmenes
docker volume ls

# Crear un volumen
docker volume create mi_volumen

# Ver detalles de un volumen
docker volume inspect mi_volumen

# Eliminar un volumen
docker volume rm mi_volumen

# Eliminar todos los volúmenes no utilizados
docker volume prune

# Arrancar un contenedor usando un volumen
docker run -d -v mi_volumen:/ruta/en/contenedor nombre_imagen
```

---

## 7. Docker Compose (para proyectos multi-contenedor)

```bash
# Levantar todos los servicios definidos en docker-compose.yml
docker compose up

# Levantar en segundo plano
docker compose up -d

# Detener y eliminar los contenedores del proyecto
docker compose down

# Ver el estado de los servicios
docker compose ps

# Ver logs de todos los servicios
docker compose logs -f

# Reconstruir las imágenes antes de levantar
docker compose up --build

# Ejecutar un comando en un servicio específico
docker compose exec nombre_servicio /bin/bash
```

---

## 8. Limpieza general del sistema

```bash
# Ver el espacio en disco usado por Docker
docker system df

# Eliminar TODO lo que no se esté usando (contenedores, imágenes, redes, caché)
docker system prune

# Igual que el anterior pero incluyendo volúmenes no usados (¡cuidado, borra datos!)
docker system prune -a --volumes
```

---

## 9. Comandos de utilidad rápida

| Necesito...                                   | Comando                          |
|-----------------------------------------------|-----------------------------------|
| Saber si Docker está corriendo                 | `docker info` o `docker ps`      |
| Ver contenedores activos                       | `docker ps`                      |
| Ver TODOS los contenedores                     | `docker ps -a`                   |
| Ver imágenes descargadas                       | `docker images`                  |
| Arrancar un contenedor existente               | `docker start <id/nombre>`       |
| Detener un contenedor                          | `docker stop <id/nombre>`        |
| Eliminar un contenedor                         | `docker rm <id/nombre>`          |
| Eliminar una imagen                            | `docker rmi <id/nombre>`         |
| Ver logs de un contenedor                      | `docker logs -f <id/nombre>`     |
| Entrar a la terminal de un contenedor          | `docker exec -it <id/nombre> bash` |
| Ver uso de recursos                            | `docker stats`                   |
| Limpiar todo lo no usado                       | `docker system prune`            |

---

## 💡 Notas útiles

- Puedes usar **el ID del contenedor** (o solo los primeros caracteres) en lugar del nombre en casi todos los comandos.
- Con **Docker Desktop**, todos estos comandos funcionan igual desde la terminal integrada o desde una terminal externa (PowerShell, CMD, bash, etc.), ya que Docker Desktop simplemente provee la interfaz gráfica y el motor (engine) por debajo.
- Añadir `-a` normalmente significa "todos" (all) y `-f` normalmente significa "forzar" (force) o "seguir" (follow, en logs).
- Si un comando `docker` da error de conexión, revisa que la aplicación **Docker Desktop** esté abierta y el motor iniciado (ícono de la ballena en la barra de tareas/menú).
