FROM python:3.11-slim

# Métadonnées
LABEL maintainer="support@seahawks-monitoring.com"
LABEL version="1.0.0"
LABEL description="Seahawks Harvester - Agent de scan réseau"

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    nmap \
    net-tools \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

# Création d'un utilisateur non-root (principe du moindre privilège)
RUN useradd -m -u 1000 harvester && \
    mkdir -p /app/reports /app/logs && \
    chown -R harvester:harvester /app

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers
COPY --chown=harvester:harvester requirements.txt .
COPY --chown=harvester:harvester harvester.py .
COPY --chown=harvester:harvester dashboard.py .
COPY --chown=harvester:harvester config.json .
COPY --chown=harvester:harvester templates/ templates/

# Installation des dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Changement vers l'utilisateur non-root
USER harvester

# Exposition du port pour le dashboard
EXPOSE 5000

# Variables d'environnement
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=dashboard.py

# Point d'entrée
CMD ["python", "harvester.py"]
