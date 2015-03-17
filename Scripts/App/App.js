(function () {
    'use strict';

    var Jash = angular.module('Jash', ['ngResource', 'ngRoute', 'ngCookies', 'ngResource', 'ui.router', 'ng-currency', 'mgcrea.ngStrap', 'ngQuickDate', 'angularSpinner'])

        .value('DEFAULT_VALUES', {
            SECTION: {
                DASHBOARD: 0,
                INVOICES: 1,
                AGENDA: 2,
                USERS: 3,
                CATALOGS: 4
            },
            SECTIONS: [
                { nav: 1, title: 'Resumen', icon: 'icon-home2', state: '.dashboard', url: '' },
                { nav: 2, title: 'Facturas', icon: 'icon-credit-card', state: '.invoices.list', url: '' },
                { nav: 3, title: 'Agenda', icon: 'icon-calendar', state: '', url: 'https://gestoria.sharepoint.com/sites/app/_layouts/15/start.aspx#/Lists/Agenda/calendar.aspx' },
                { nav: 4, title: 'Usuarios', icon: 'icon-users', state: '.users.list', url: '' },
                { nav: 5, title: 'Catálogos', icon: 'icon-cog', state: '.catalogs', url: '' }
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
            },
            CREDIT_STATUS: {
                NEW: {CODE: 1, NAME: 'Nuevo'},
                WAITING_CONFIRMATION: {CODE: 2, NAME: 'En espera de confirmación'},
                WAITING_SHIPPING: {CODE: 3, NAME: 'En espera de envío'},
                WAITING_DOCS: {CODE: 4, NAME: 'En espera de documentos'},
                DOCS_RECEIVED: {CODE: 5, NAME: 'Documentación recibida'},
                DELIVERED: {CODE: 6, NAME: 'Entregado'},
                CASHED: {CODE: 7, NAME: 'Cobrado'}
            },
            ANOMALY_STATUS: {
                WARNING: 'indicator-yellow',
                ERROR: 'indicator-red'
            }
        })


        .config(['$stateProvider', function ($stateProvider) {

            $stateProvider.state('home', {
                url: '',
                templateUrl: '../Pages/partials/dashboard_partial.html',
                title: 'Resumen'
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
                url: '/:mode/new',
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
                url: '/:mode/new',
                templateUrl: 'partials/credits_partial.new.html',
                title: 'Créditos',
                settings: { section: 'Nuevo Crédito' },
                state: 1
            }).state('credits.edit', {
                url: '/:id/:mode/edit',
                templateUrl: 'partials/credits_partial.edit.html',
                title: 'Créditos',
                settings: { section: 'Editar Crédito' },
                state: 3
            }).state('credits.list', {
                url: '/list',
                templateUrl: 'partials/credits_partial.list.html',
                title: 'Créditos',
                settings: { section: 'Lista de Créditos' },
                state: 4
            }).state('users', {
                url: '/users',
                templateUrl: 'partials/users_partial.html',
                title: 'Usuarios',
                settings: { section: 'Usuarios' }                
            }).state('users.list', {
                url: '/list',
                templateUrl: 'partials/users_partial.list.html',
                title: 'Usuarios',
                settings: { section: 'Usuarios' },
                state: 4
            }).state('users.new', {
                url: '/new',
                templateUrl: 'partials/users_partial.new.html',
                title: 'Usuarios',
                settings: { section: 'Usuarios' },
                state: 1
            }).state('users.edit', {
                url: '/:id/edit',
                templateUrl: 'partials/users_partial.edit.html',
                title: 'Usuarios',
                settings: { section: 'Usuarios' },
                state: 3
            }).state('invoices', {
                url: '/invoices',
                templateUrl: 'partials/invoices_partial.html',
                title: 'Facturas',
                settings: { section: 'Facturas' }
            }).state('invoices.list', {
                url: '/list',
                templateUrl: 'partials/invoices_partial.list.html',
                title: 'Invoices',
                settings: { section: 'Facturas' },
                state: 4
            }).state('invoices.new', {
                url: '/new',
                templateUrl: 'partials/invoices_partial.new.html',
                title: 'Facturas',
                settings: { section: 'Facturas' },
                state: 1
            }).state('invoices.edit', {
                url: '/:id/edit',
                templateUrl: 'partials/invoices_partial.edit.html',
                title: 'Facturas',
                settings: { section: 'Facturas' },
                state: 3
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

        .directive('numbersOnly', function(){
            return {
                require: 'ngModel',
                link: function(scope, element, attrs, modelCtrl) {
                    modelCtrl.$parsers.push(function (inputValue) {
                        // this next if is necessary for when using ng-required on your input. 
                        // In such cases, when a letter is typed first, this parser will be called
                        // again, and the 2nd time, the value will be undefined
                        if (inputValue == undefined) return '' 
                        var transformedInput = inputValue.replace(/[^0-9]/g, ''); 
                        if (transformedInput!=inputValue) {
                            modelCtrl.$setViewValue(transformedInput);
                            modelCtrl.$render();
                        }         

                        return transformedInput;         
                    });
                }
            };
        })

        .directive('ngPopover', function ($popover) {
            return {
                restrict: 'A',
                replace: true,
                scope: {                    
                    manager: '=',
                    sendMailFunction: '='
                },
                template: '<a ng-disabled="!isManagerSelected()" class="btn btn-default" id="request-info-trigger">Solicitar información</a>',
                link: function (scope, elements, attrs) {
                                       
                    scope.subject, scope.observations;

                    scope.mailPopover = $popover(elements, {
                        scope: scope,
                        template: "templates/request_info_template.html",
                        title: 'Enviar correo',
                        autoClose: true,
                    });

                    scope.$on('mailSent', function () {
                        scope.subject = undefined;
                        scope.observations = undefined;
                        scope.mailPopover.hide();
                    });

                    scope.isManagerSelected = function () {
                        return (scope.manager) ? true : false;
                    };

                    scope.sendMail = function (subject, observations) {                        
                        scope.sendMailFunction(subject, observations);                        
                    };

                    scope.isValidEmailForm = function (fields) {                        
                        var isValidForm = true;                        
                        for (var indexField in fields) {
                            var field = fields[indexField];
                            if (!field) {
                                isValidForm = false;
                                break;
                            }
                        }
                        
                        return isValidForm;
                    };
                }
            }
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