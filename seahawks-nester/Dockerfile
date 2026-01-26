FROM python:3.11-slim

# Métadonnées
LABEL maintainer="support@seahawks-monitoring.com"
LABEL version="1.0.0"
LABEL description="Seahawks Nester - Supervision centralisée"

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Création d'un utilisateur non-root
RUN useradd -m -u 1000 nester && \
    mkdir -p /app/data /app/data/probes /app/data/reports /app/data/logs && \
    chown -R nester:nester /app

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers
COPY --chown=nester:nester requirements.txt .
COPY --chown=nester:nester nester.py .
COPY --chown=nester:nester templates/ templates/

# Installation des dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Configuration Gunicorn
COPY --chown=nester:nester <<EOF /app/gunicorn_config.py
bind = "0.0.0.0:8000"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
errorlog = "/app/data/logs/gunicorn_error.log"
accesslog = "/app/data/logs/gunicorn_access.log"
loglevel = "info"
EOF

# Changement vers l'utilisateur non-root
USER nester

# Exposition du port
EXPOSE 8000

# Variables d'environnement
ENV PYTHONUNBUFFERED=1
ENV SECRET_KEY="change-this-in-production"

# Point d'entrée
CMD ["gunicorn", "--config", "gunicorn_config.py", "nester:app"]
