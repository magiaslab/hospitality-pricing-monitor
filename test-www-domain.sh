#!/bin/bash

echo "🌐 Test Dominio Finale: www.pricecip.it"
echo "======================================"

echo ""
echo "1. Test connessione base:"
curl -I https://www.pricecip.it

echo ""
echo "2. Test redirect da pricecip.it:"
curl -I https://pricecip.it

echo ""
echo "3. Test Health Endpoint:"
curl -s -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://www.pricecip.it/api/health

echo ""
echo "4. Test Active Properties:"
curl -s -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://www.pricecip.it/api/scraping/active-properties

echo ""
echo "5. Test Login Page:"
curl -I https://www.pricecip.it/auth/signin

echo ""
echo "6. Test Dashboard (dovrebbe richiedere auth):"
curl -I https://www.pricecip.it/dashboard

echo ""
echo "✅ Test completato!"
echo ""
echo "🎯 Configurazione n8n (https://n8n.magiaslab.com):"
echo "- Get Active Properties: https://www.pricecip.it/api/scraping/active-properties"
echo "- Get Competitors: https://www.pricecip.it/api/properties/{{id}}/competitors" 
echo "- Save Data: https://www.pricecip.it/api/scraping/webhook/save-price"
echo ""
echo "🔑 Credenziale n8n:"
echo "- Type: HTTP Header Auth"
echo "- Name: PriceCip API"
echo "- Header: Authorization"
echo "- Value: Bearer pricecip_api_secret_2024"
