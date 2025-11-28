#!/bin/bash

# Weather App Kubernetes Deployment Script

echo "🚀 Deploying Weather App to Kubernetes..."

# Apply all Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mysql-init.yaml
kubectl apply -f k8s/mysql.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml

echo "⏳ Waiting for deployments to be ready..."

# Wait for MySQL to be ready
kubectl wait --for=condition=ready pod -l app=mysql -n weather-app --timeout=300s

# Wait for backend to be ready
kubectl wait --for=condition=ready pod -l app=backend -n weather-app --timeout=300s

# Wait for frontend to be ready
kubectl wait --for=condition=ready pod -l app=frontend -n weather-app --timeout=300s

echo "✅ Weather App deployed successfully!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://weather-app.example.com"
echo "   Backend API: http://weather-app.example.com/api"
echo ""
echo "📊 Check status:"
echo "   kubectl get pods -n weather-app"
echo "   kubectl get services -n weather-app"
echo "   kubectl get ingress -n weather-app"