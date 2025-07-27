#!/bin/bash

echo "🔍 Diagnostic NAS - Magic Links"
echo "================================"

echo ""
echo "1. Vérification des containers Docker :"
docker ps | grep metube

echo ""
echo "2. Vérification des ports :"
netstat -tulpn | grep :8083

echo ""
echo "3. Test de l'API de validation :"
curl -s "https://home.regispailler.fr/api/validate-magic-link?token=61708784d9f9d882f7cdd96e46c810b1fb21b7c57e1006dbdbc2195dbcda52fe&user=4ff83788-7bdb-4633-a693-3ad98006fed5&module=IAmetube"

echo ""
echo "4. Test du container gateway :"
curl -s "http://localhost:8083/?token=test&user=test&module=test" | head -20

echo ""
echo "5. Logs du container gateway :"
docker logs metube-gateway --tail 10

echo ""
echo "6. Logs du container metube :"
docker logs metube --tail 5

echo ""
echo "✅ Diagnostic terminé" 