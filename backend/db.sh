#!/bin/bash

# Scripts para gestionar la base de datos Docker

case "$1" in
  start)
    echo "🚀 Iniciando MySQL en Docker..."
    docker-compose up -d mysql
    echo "✅ MySQL disponible en: localhost:3307"
    echo "📊 phpMyAdmin disponible en: http://localhost:8080"
    ;;
  
  stop)
    echo "🛑 Deteniendo MySQL..."
    docker-compose down
    ;;
  
  restart)
    echo "🔄 Reiniciando MySQL..."
    docker-compose restart mysql
    ;;
  
  logs)
    echo "📋 Logs de MySQL:"
    docker-compose logs -f mysql
    ;;
  
  reset)
    echo "⚠️  Reseteando base de datos (se perderán todos los datos)..."
    read -p "¿Estás seguro? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      docker-compose down -v
      docker-compose up -d mysql
      echo "✅ Base de datos reseteada"
    fi
    ;;
  
  connect)
    echo "🔌 Conectando a MySQL..."
    docker exec -it vocali_mysql mysql -u root -p
    ;;
  
  backup)
    echo "💾 Creando backup..."
    docker exec vocali_mysql mysqldump -u root -ppassword123 vocali_db > backup_$(date +%Y%m%d_%H%M%S).sql
    echo "✅ Backup creado"
    ;;
  
  *)
    echo "🐳 Gestión de Base de Datos Vocali"
    echo ""
    echo "Uso: $0 {start|stop|restart|logs|reset|connect|backup}"
    echo ""
    echo "Comandos:"
    echo "  start    - Iniciar MySQL y phpMyAdmin"
    echo "  stop     - Detener todos los servicios"
    echo "  restart  - Reiniciar MySQL"
    echo "  logs     - Ver logs de MySQL"
    echo "  reset    - Resetear base de datos (⚠️ borra datos)"
    echo "  connect  - Conectar a MySQL CLI"
    echo "  backup   - Crear backup de la base de datos"
    echo ""
    echo "URLs:"
    echo "  MySQL:      localhost:3307"
    echo "  phpMyAdmin: http://localhost:8080"
    ;;
esac
