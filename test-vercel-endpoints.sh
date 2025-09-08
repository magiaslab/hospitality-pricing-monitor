#!/bin/bash

echo "🧪 Test Endpoints Vercel"
echo "========================"

echo ""
echo "1. Test Health Endpoint:"
curl -s -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://hospitality-pricing-monitor.vercel.app/api/health | jq .

echo ""
echo "2. Test Active Properties:"
curl -s -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://hospitality-pricing-monitor.vercel.app/api/scraping/active-properties | jq .

echo ""
echo "✅ Test completato!"
