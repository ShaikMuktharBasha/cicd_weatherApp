# Weather App - Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the Weather App to a Kubernetes cluster.

## Architecture

The application consists of three main components:

- **Frontend**: React/Vite application served by nginx (port 3000)
- **Backend**: Spring Boot application with REST API (port 8080)
- **Database**: MySQL 8.0 database (port 3306)

## Prerequisites

- Kubernetes cluster (v1.19+)
- kubectl configured to access your cluster
- NGINX Ingress Controller installed
- cert-manager (optional, for SSL certificates)
- Docker registry access for custom images

## Quick Start

1. **Build and push Docker images:**
   ```bash
   # Build backend image
   cd Backend
   docker build -t your-registry/weather-app-backend:latest .
   docker push your-registry/weather-app-backend:latest

   # Build frontend image
   cd ../Frontend
   docker build -t your-registry/weather-app-frontend:latest .
   docker push your-registry/weather-app-frontend:latest
   ```

2. **Update image references in k8s manifests:**
   Edit `k8s/backend.yaml` and `k8s/frontend.yaml` to use your registry images.

3. **Deploy to Kubernetes:**
   ```bash
   chmod +x deploy-k8s.sh
   ./deploy-k8s.sh
   ```

4. **Update Ingress host:**
   Edit `k8s/ingress.yaml` and replace `weather-app.example.com` with your domain.

## Manual Deployment

Apply manifests in order:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mysql-init.yaml
kubectl apply -f k8s/mysql.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

## Configuration

### Environment Variables

**Backend:**
- `SPRING_PROFILES_ACTIVE`: Spring profile (default: prod)
- `SPRING_DATASOURCE_URL`: MySQL connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password

**Frontend:**
- `BACKEND_URL`: Backend service URL (default: http://backend.weather-app.svc.cluster.local:8080)

### Database

Default credentials (change in `k8s/secret.yaml`):
- Root Password: `rootpassword`
- User: `weatheruser`
- Password: `weatherpass`
- Database: `weatherapp`

## Monitoring

### Health Checks

All services include health checks:
- **MySQL**: `mysqladmin ping`
- **Backend**: `/actuator/health`
- **Frontend**: `/health`

### Resource Limits

- **Backend**: 512Mi-1Gi RAM, 250-500m CPU
- **Frontend**: 128-256Mi RAM, 100-200m CPU
- **MySQL**: Uses PVC with 5Gi storage

## Scaling

### Horizontal Pod Autoscaling

To enable HPA for backend:

```bash
kubectl autoscale deployment backend --cpu-percent=70 --min=2 --max=10 -n weather-app
```

### Database Scaling

MySQL uses StatefulSet for data persistence. To scale:
```bash
kubectl scale statefulset mysql --replicas=2 -n weather-app
```

## Troubleshooting

### Check pod status:
```bash
kubectl get pods -n weather-app
kubectl describe pod <pod-name> -n weather-app
```

### View logs:
```bash
kubectl logs -f deployment/backend -n weather-app
kubectl logs -f deployment/frontend -n weather-app
kubectl logs -f statefulset/mysql -n weather-app
```

### Database connection issues:
```bash
kubectl exec -it statefulset/mysql -n weather-app -- mysql -u weatheruser -p weatherapp
```

### Port forwarding for local testing:
```bash
kubectl port-forward svc/frontend 3000:3000 -n weather-app
kubectl port-forward svc/backend 8080:8080 -n weather-app
```

## Security Considerations

1. **Change default passwords** in `k8s/secret.yaml`
2. **Use SSL/TLS** with cert-manager for production
3. **Network policies** can be added for pod-to-pod communication
4. **RBAC** should be configured for production deployments
5. **Secrets management** - consider using external secret managers

## Backup and Recovery

### Database Backup:
```bash
kubectl exec -it statefulset/mysql -n weather-app -- mysqldump -u weatheruser -p weatherapp > backup.sql
```

### PVC Backup:
Configure backup solutions like Velero for persistent volume backups.

## Production Deployment

For production:

1. Use production-grade storage classes
2. Configure proper resource limits and requests
3. Set up monitoring (Prometheus + Grafana)
4. Configure log aggregation
5. Set up CI/CD pipelines for automated deployments
6. Use Helm charts for easier management

## File Structure

```
k8s/
├── namespace.yaml          # Namespace definition
├── configmap.yaml          # Application configuration
├── secret.yaml            # Sensitive data (passwords)
├── mysql-init.yaml        # Database initialization scripts
├── mysql.yaml             # MySQL StatefulSet and Service
├── backend.yaml           # Backend Deployment and Service
├── frontend.yaml          # Frontend Deployment and Service
└── ingress.yaml           # Ingress for external access

deploy-k8s.sh              # Deployment script
```

## Support

For issues with the Kubernetes deployment, check:
1. Pod status and logs
2. Service endpoints
3. Network policies
4. Resource constraints