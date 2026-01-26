#!/usr/bin/env python3
"""
Gestionnaire de secrets pour Seahawks Monitoring
Utilise le chiffrement Fernet pour stocker les secrets
"""

from cryptography.fernet import Fernet
from pathlib import Path
import json
import os


class SecretsManager:
    """Gestionnaire de secrets chiffrés"""
    
    def __init__(self, key_file: str = ".secrets.key"):
        self.key_file = Path(key_file)
        self.secrets_file = Path(".secrets.enc")
        self.key = self._load_or_create_key()
        self.cipher = Fernet(self.key)
    
    def _load_or_create_key(self) -> bytes:
        """Charge ou crée la clé de chiffrement"""
        if self.key_file.exists():
            with open(self.key_file, 'rb') as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(self.key_file, 'wb') as f:
                f.write(key)
            # Sécuriser le fichier de clé (permissions)
            os.chmod(self.key_file, 0o600)
            return key
    
    def save_secret(self, key: str, value: str):
        """Sauvegarde un secret chiffré"""
        secrets = self._load_secrets()
        secrets[key] = value
        self._save_secrets(secrets)
    
    def get_secret(self, key: str, default=None):
        """Récupère un secret"""
        secrets = self._load_secrets()
        return secrets.get(key, default)
    
    def delete_secret(self, key: str):
        """Supprime un secret"""
        secrets = self._load_secrets()
        if key in secrets:
            del secrets[key]
            self._save_secrets(secrets)
    
    def list_secrets(self):
        """Liste les clés disponibles (pas les valeurs)"""
        secrets = self._load_secrets()
        return list(secrets.keys())
    
    def _load_secrets(self) -> dict:
        """Charge tous les secrets"""
        if not self.secrets_file.exists():
            return {}
        
        with open(self.secrets_file, 'rb') as f:
            encrypted_data = f.read()
        
        decrypted_data = self.cipher.decrypt(encrypted_data)
        return json.loads(decrypted_data.decode('utf-8'))
    
    def _save_secrets(self, secrets: dict):
        """Sauvegarde tous les secrets"""
        data = json.dumps(secrets).encode('utf-8')
        encrypted_data = self.cipher.encrypt(data)
        
        with open(self.secrets_file, 'wb') as f:
            f.write(encrypted_data)
        
        # Sécuriser le fichier (permissions)
        os.chmod(self.secrets_file, 0o600)


def main():
    """Interface CLI pour gérer les secrets"""
    import sys
    
    manager = SecretsManager()
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python secrets_manager.py set <key> <value>")
        print("  python secrets_manager.py get <key>")
        print("  python secrets_manager.py delete <key>")
        print("  python secrets_manager.py list")
        return
    
    command = sys.argv[1]
    
    if command == "set" and len(sys.argv) == 4:
        key = sys.argv[2]
        value = sys.argv[3]
        manager.save_secret(key, value)
        print(f"✅ Secret '{key}' sauvegardé")
    
    elif command == "get" and len(sys.argv) == 3:
        key = sys.argv[2]
        value = manager.get_secret(key)
        if value:
            print(f"🔑 {key}: {value}")
        else:
            print(f"❌ Secret '{key}' introuvable")
    
    elif command == "delete" and len(sys.argv) == 3:
        key = sys.argv[2]
        manager.delete_secret(key)
        print(f"🗑️  Secret '{key}' supprimé")
    
    elif command == "list":
        secrets = manager.list_secrets()
        if secrets:
            print("🔐 Secrets disponibles:")
            for key in secrets:
                print(f"  - {key}")
        else:
            print("Aucun secret enregistré")
    
    else:
        print("❌ Commande invalide")


if __name__ == "__main__":
    main()
