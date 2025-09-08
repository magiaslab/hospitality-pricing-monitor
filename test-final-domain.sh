#!/bin/bash

echo "🌐 Test Dominio Finale: pricecip.it"
echo "=================================="

echo ""
echo "1. Test connessione base:"
curl -I https://pricecip.it

echo ""
echo "2. Test Health Endpoint:"
curl -s -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://pricecip.it/api/health

echo ""
echo "3. Test Active Properties:"
curl -s -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://pricecip.it/api/scraping/active-properties

echo ""
echo "4. Test Login Page:"
curl -I https://pricecip.it/auth/signin

echo ""
echo "5. Test Dashboard (dovrebbe richiedere auth):"
curl -I https://pricecip.it/dashboard

echo ""
echo "✅ Test completato!"
echo ""
echo "🎯 Prossimi passi:"
echo "1. Aggiorna NEXTAUTH_URL=https://pricecip.it su Vercel"
echo "2. Redeploy su Vercel"
echo "3. Aggiorna URL nel workflow n8n"
