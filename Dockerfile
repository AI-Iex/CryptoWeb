
# 1. Partimos de una imagen base ligera de Python
FROM python:3.11-slim

# 2. Establece el directorio de trabajo en el contenedor
WORKDIR /app

# 3. Copiamos la carpeta Backend entera dentro de /app/Backend
COPY Backend/ /app/Backend/

# 4. Instala dependencias a partir de Backend/requirements.txt
RUN pip install --no-cache-dir -r /app/Backend/requirements.txt

# 5. Exponemos el puerto 8000 (FastAPI)
EXPOSE 8000

# 6. Arrancamos Uvicorn apuntando a Backend.main:app
CMD ["uvicorn", "Backend.main:app", "--host", "0.0.0.0", "--port", "8000"]