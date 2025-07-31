# 🚀 Guía de Despliegue - Vocali

## Arquitectura de Producción

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │    │  AWS CloudFront │    │    Frontend     │
│                 │────│      (CDN)      │────│   (Nuxt/S3)     │
│  Push to main   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Backend API   │    │   Load Balancer │    │     AWS EC2     │
│  (Node.js/API)  │────│      (ALB)      │────│   Auto Scaling  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                               │
         │                                               │
┌─────────────────┐                            ┌─────────────────┐
│    Supabase     │                            │     AWS S3      │
│   (Database)    │                            │ (Audio Files)   │
└─────────────────┘                            └─────────────────┘
```
