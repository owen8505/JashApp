﻿(function () {
    'use strict';

    var Jash = angular.module('Jash', ['ngResource', 'ngRoute', 'ngCookies', 'ngResource', 'ui.router', 'ng-currency', 'mgcrea.ngStrap', 'ngQuickDate', 'angularSpinner'])

        .value('DEFAULT_VALUES', {
            SECTION: {
                DASHBOARD: 0,
                USERS: 1,
                CATALOGS: 2
            },
            SECTIONS: [
                { nav: 1, title: 'Resumen', icon: 'icon-home2', state: '.dashboard', url: '' },
                { nav: 2, title: 'Agenda', icon: 'icon-calendar', state: '', url: 'https://gestoria.sharepoint.com/sites/app/_layouts/15/start.aspx#/Lists/Agenda/calendar.aspx' },
                { nav: 3, title: 'Usuarios', icon: 'icon-users', state: '.users', url: '' },
                { nav: 4, title: 'Catálogos', icon: 'icon-cog', state: '.catalogs', url: '' }
            ],
            SUBSECTION: {
                ALL: 0,
                CERTIFICATES: 1,
                CREDITS: 2,
                OTHERS: 3
            },
            SUBSECTIONS: [
                {title: 'Todos'},
                {title: 'Certificados'},
                {title: 'Créditos'},
                {title: 'Otros'}
            ],
            ITEM_STATES: {
                NEW: {code:1, title:'Nuevo'},
                VIEW: {code:2, title:'Ver'},
                EDIT: {code:3, title:'Editar'},
                LIST: {code:4, title:'Lista'}
            },
            DELIVERY_RANGES: {
                CERTIFICATE: 10,
                CREDIT: 10
            },
            CERTIFICATE_STATUS: {
                NEW: {CODE: 1, NAME: 'Nuevo'},
                WAITING_CONFIRMATION: {CODE: 2, NAME: 'En espera de confirmación'},
                WAITING_SHIPPING: {CODE: 3, NAME: 'En espera de envío'},
                WAITING_DOCS: {CODE: 4, NAME: 'En espera de documentos'},
                DOCS_RECEIVED: {CODE: 5, NAME: 'Documentación recibida'},
                DELIVERED: {CODE: 6, NAME: 'Entregado'},
                CASHED: {CODE: 7, NAME: 'Cobrado'}
            }
        })


        .config(['$stateProvider', function ($stateProvider) {

            $stateProvider.state('home', {
                url: '',
                templateUrl: '../Pages/partials/dashboard_partial.html',
                title: 'Resumen',
            }).state('dashboard', {
                url: '/dashboard',
                templateUrl: '../Pages/partials/dashboard_partial.html',
                title: 'Resumen',
            }).state('calendar', {
                url: '/calendar',
                templateUrl: 'partials/calendar_partial.html',
                title: 'Calendario',
            }).state('certificates', {
                url: '/certificates',
                templateUrl: 'partials/certificates_partial.html',
                title: 'Certificados',
                settings: { section: 'Certificados' }
            }).state('certificates.new', {
                url: '/new',
                templateUrl: 'partials/certificates_partial.new.html',
                title: 'Certificados',
                settings: { section: 'Nuevo Certificado' },
                state: 1
            }).state('certificates.view', {
                url: '/:id/view',
                templateUrl: 'partials/certificates_partial.view.html',
                title: 'Certificados',
                settings: { section: 'Ver Certificado' },
                state: 2
            }).state('certificates.edit', {
                url: '/:id/:mode/edit',
                templateUrl: 'partials/certificates_partial.edit.html',
                title: 'Certificados',
                settings: { section: 'Editar Certificado' },
                state: 3
            }).state('certificates.list', {
                url: '/list',
                templateUrl: 'partials/certificates_partial.list.html',
                title: 'Certificados',
                settings: { section: 'Lista de Certificados' },
                state: 4
            }).state('credits', {
                url: '/credits',
                templateUrl: 'partials/credits_partial.html',
                title: 'Créditos',
                settings: { section: 'Créditos' }
            }).state('credits.new', {
                url: '/new',
                templateUrl: 'partials/credits_partial.new.html',
                title: 'Créditos',
                settings: { section: 'Nuevo Crédito' },
                state: 1
            }).state('users', {
                url: '/users',
                templateUrl: 'partials/users_partial.html',
                title: 'Usuarios',
                settings: { section: 'Usuarios' }
            }).state('catalogs', {
                url: '/catalogs',
                templateUrl: 'partials/catalogs_partial.html',
                title: 'Catálogos',
                settings: { section: 'Catálogos' }
            }).state('managers', {
                url: '/managers',
                templateUrl: 'partials/managers_partial.html',
                title: 'Gestores',
                settings: { section: 'Gestores' }
            }).state('managers.new', {
                url: '/new',
                templateUrl: 'partials/managers_partial.new.html',
                title: 'Gestores',
                settings: { section: 'Nuevo Gestor' },
                state: 1
            }).state('managers.edit', {
                url: '/:id/edit',
                templateUrl: 'partials/managers_partial.edit.html',
                title: 'Gestores',
                settings: { section: 'Editar Gestor' },
                state: 3
            }).state('parcels', {
                url: '/parcels',
                templateUrl: 'partials/parcels_partial.html',
                title: 'Paqueterías',
                settings: { section: 'Paqueterías' }
            }).state('parcels.new', {
                url: '/new',
                templateUrl: 'partials/parcels_partial.new.html',
                title: 'Paqueterías',
                settings: { section: 'Nueva Paquetería' },
                state: 1
            }).state('parcels.edit', {
                url: '/:id/edit',
                templateUrl: 'partials/parcels_partial.edit.html',
                title: 'Paqueterías',
                settings: { section: 'Editar Paquetería' },
                state: 3
            }).state('zones', {
                url: '/zones',
                templateUrl: 'partials/zones_partial.html',
                title: 'Regiones',
                settings: { section: 'Reqiones' }
            }).state('zones.new', {
                url: '/new',
                templateUrl: 'partials/zones_partial.new.html',
                title: 'Regiones',
                settings: { section: 'Nueva Región' },
                state: 1
            }).state('zones.edit', {
                url: '/:id/edit',
                templateUrl: 'partials/zones_partial.edit.html',
                title: 'Regiones',
                settings: { section: 'Editar Región' },
                state: 3
            });

        }])

        .run(function($rootScope){
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $rootScope.sectionTitle = toState.title;
                $rootScope.previousState = fromState.name;
            });
        })

        .filter('capitalize', function() {
            return function(input, scope) {
                if (input!=null)
                    input = input.toLowerCase();
                return input.substring(0,1).toUpperCase()+input.substring(1);
            }
        })

        .filter('zone', function(){
            return function(items, zoneId){
                var managers = [];
                angular.forEach(items, function (item) {
                    if(item.zone.id == zoneId){
                        managers.push(item);
                    }
                })

                return managers;
            }
        })

        .filter('formatDate', function(){
            return function(date){
                if(date){
                    return date.format('LL');
                }
            }
        })

        .filter('capitalize', function () {
            return function (input, all) {
                return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); }) : '';
            }
        });

})();