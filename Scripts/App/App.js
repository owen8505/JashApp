(function () {
    'use strict';

    var Jash = angular.module('Jash', ['ngResource', 'ngRoute', 'ngCookies', 'ngResource', 'ui.router', 'ng-currency', 'mgcrea.ngStrap', 'ngQuickDate'])

        .value('DEFAULT_VALUES', {
            SECTION: {
                DASHBOARD: 0,
                USERS: 1,
                CATALOGS: 2
            },
            SECTIONS: [
                {nav:1, title:'Resumen', icon:'icon-home', state:'.dashboard'},
                {nav:2, title:'Usuarios', icon:'icon-users', state:'.users'},
                {nav:3, title:'Catálogos', icon:'icon-cogs', state:'.catalogs'}
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
                EDIT: {code:3, title:'Editar'}
            },
            DELIVERY_RANGES: {
                CERTIFICATE: 10,
                CREDIT: 10
            }
        })


        .config(['$stateProvider', function ($stateProvider) {

            $stateProvider.state('home', {
                url: '',
                templateUrl: 'Pages/partials/dashboard_partial.html',
                title: 'Resumen',
            }).state('dashboard', {
                url: '/dashboard',
                templateUrl: 'Pages/partials/dashboard_partial.html',
                title: 'Resumen',
            }).state('certificates', {
                url: '/certificates',
                templateUrl: 'Pages/partials/certificates_partial.html',
                title: 'Certificados',
                settings: { section: 'Certificados' },
            }).state('certificates.list', {
                url: '/list',
                templateUrl: 'Pages/partials/certificates_partial.list.html',
                title: 'Certificados',
                settings: { section: 'Lista de Certificados' }
            }).state('certificates.new', {
                url: '/new',
                templateUrl: 'Pages/partials/certificates_partial.new.html',
                title: 'Certificados',
                settings: { section: 'Nuevo Certificado' },
                state: 1
            }).state('certificates.view', {
                url: '/:id/view',
                templateUrl: 'Pages/partials/certificates_partial.view.html',
                title: 'Certificados',
                settings: { section: 'Ver Certificado' },
                state: 2
            }).state('certificates.edit', {
                url: '/:id/edit',
                templateUrl: 'Pages/partials/certificates_partial.edit.html',
                title: 'Certificados',
                settings: { section: 'Editar Certificado' },
                state: 3
            }).state('credits', {
                url: '/credits',
                templateUrl: 'Pages/partials/credits_partial.html',
                title: 'Créditos',
                settings: { section: 'Créditos' },
            }).state('credits.new', {
                url: '/new',
                templateUrl: 'Pages/partials/credits_partial.new.html',
                title: 'Créditos',
                settings: { section: 'Nuevo Crédito' },
                state: 1
            }).state('users', {
                url: '/users',
                templateUrl: 'Pages/partials/users_partial.html',
                title: 'Usuarios',
                settings: { section: 'Usuarios' }
            }).state('catalogs', {
                url: '/catalogs',
                templateUrl: 'Pages/partials/catalogs_partial.html',
                title: 'Catálogos',
                settings: { section: 'Catálogos' }
            }).state('managers', {
                url: '/managers',
                templateUrl: 'Pages/partials/managers_partial.html',
                title: 'Gestores',
                settings: { section: 'Gestores' },
            }).state('managers.new', {
                url: '/new',
                templateUrl: 'Pages/partials/managers_partial.new.html',
                title: 'Gestores',
                settings: { section: 'Nuevo Gestor' },
                state: 1
            });

        }])

        .run(function($location, $rootScope){
            $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
                $rootScope.sectionTitle = current.$$route.title;
                $rootScope.selectedSection = current.$$route.settings.section;
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