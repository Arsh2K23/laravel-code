# Multi-Restaurant Inventory Management SaaS

A comprehensive SaaS solution for restaurant inventory management with multi-warehouse support, built on Laravel + Vue.js.

## Features

### Core Features
- **Multi-Tenant Architecture**: Support for multiple restaurants and warehouses
- **Super Admin Dashboard**: Centralized management of all tenants
- **Restaurant Management**: Individual restaurant dashboards and inventory tracking
- **Warehouse Management**: Multi-warehouse inventory distribution
- **Real-time Ordering**: Restaurant-to-warehouse ordering system
- **Advanced Analytics**: Comprehensive reporting and analytics
- **Role-based Access Control**: Granular permissions system

### Technical Stack
- **Backend**: Laravel 10+ with PostgreSQL
- **Frontend**: Vue.js 3 with Composition API
- **Cache**: Redis for session and cache management
- **Storage**: DigitalOcean Spaces for file storage
- **Queue**: Laravel Queues with Redis driver
- **Real-time**: Laravel Broadcasting with Pusher/Socket.io

## Installation

1. Clone the repository
2. Install dependencies: `composer install && npm install`
3. Configure environment variables
4. Run migrations: `php artisan migrate`
5. Seed initial data: `php artisan db:seed`
6. Start the application: `php artisan serve`

## Architecture

The system follows a modular architecture with clear separation of concerns:
- Multi-tenant database design
- Service-oriented architecture
- Event-driven communication
- RESTful API design
- Real-time notifications

## Deployment

Optimized for DigitalOcean deployment with:
- App Platform integration
- Managed PostgreSQL database
- Redis cluster support
- DigitalOcean Spaces integration
- Load balancer ready