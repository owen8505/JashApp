﻿<!DOCTYPE html>

<%@ Page Language="C#" %>

<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="PublishingWebControls" Namespace="Microsoft.SharePoint.Publishing.WebControls" Assembly="Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="SearchWebControls" Namespace="Microsoft.Office.Server.Search.WebControls" Assembly="Microsoft.Office.Server.Search, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>


<WebPartPages:AllowFraming runat="server" />

<html lang="es-mx" xmlns="http://www.w3.org/1999/xhtml" ng-app="Jash">
<head>
    
    <meta charset="utf-8">
    <meta name="WebPartPageExpansion" content="full" />

    <title>Jash App</title>
    <link rel="icon" type="image/png" href="../Images/favicon.png">

    <link href="../Content/global.css" rel="stylesheet" />
    <script src="../Scripts/vendor/modernizr.js"></script>

    <!-- SharePoint Scripts -->
    <script src="/_layouts/15/MicrosoftAjax.js"></script>
    <script src="/_layouts/15/init.js"></script>
    <script src="/_layouts/15/SP.Core.js"></script>
    <script src="/_layouts/15/SP.Runtime.js"></script>
    <script src="/_layouts/15/SP.RequestExecutor.js"></script>
    <script src="/_layouts/15/SP.js"></script>

</head>
<body ng-controller="RootController as RootCtrl">

    <WebPartPages:SPWebPartManager id="m" runat="Server"/>        
    <input type="hidden" name="__REQUESTDIGEST" />
    <span us-spinner spinner-key="main-spinner"></span>

        
    <div class="top-bar container-fluid">
        <div class="row">
            <h1 class="logo col-lg-10">
                <a href="/" title="Resumen">
                    <img src="../Images/Logo_Jash.png" alt="Logo Jash" /></a>
            </h1>
            <div class="username col-lg-2">{{ userName | capitalize }}</div>
        </div>
    </div>

    <div class="container">
        <div class="row">
            <nav class="col-lg-2">
                <ul class="global-nav">
                    <li ng-repeat="section in SECTIONS | orderBy:nav" ng-class="{'selected':isCurrentSection(section)}">
                        <a ng-if="section.state" ui-sref="{{ section.state }}" ng-click="setCurrentSection(section)"><span ng-class="section.icon"></span>{{ section.title }}</a>
                        <a ng-if="!section.state && section.url" ng-href="{{ section.url }}" target="_blank"><span ng-class="section.icon"></span>{{ section.title }}</a>
                    </li>
                </ul>
            </nav>
            <div class="content col-lg-10">
                <h3 class="section-title">{{ sectionTitle }}</h3>
                <div ui-view></div>
            </div>
        </div>
    </div>


    <!-- Vendor Scripts -->
    <script src="../Scripts/vendor/jquery-2.1.3.min.js"></script>
    <script src="../Scripts/vendor/prefixfree.js"></script>
    <script src="../Scripts/vendor/moment-with-locales.js"></script>


    <!-- Angular Libraries -->
    <script src="../Scripts/lib/angular.js"></script>
    <script src="../Scripts/lib/angular-resource.js"></script>
    <script src="../Scripts/lib/angular-animate.js"></script>
    <script src="../Scripts/lib/angular-sanitize.js"></script>
    <script src="../Scripts/lib/angular-cookies.js"></script>
    <script src="../Scripts/lib/angular-route.js"></script>
    <script src="../Scripts/lib/angular-ui-router.min.js"></script>
    <script src="../Scripts/lib/angular-strap.js"></script>
    <script src="../Scripts/lib/angular-strap.tpl.js"></script>
    <script src="../Scripts/lib/ng-quick-date.min.js"></script>
    <script src="../Scripts/lib/spin.js"></script>
    <script src="../Scripts/lib/angular-spinner.js"></script>

    <!-- Angular external resources -->
    <script src="../Scripts/lib/ng-currency.js"></script>

    <!-- Application Script -->
    <script src="../Scripts/App/App.js"></script>
    <!--script src="../Scripts/App/config.js"></script-->
    <!--script src="../Scripts/App/config.exceptionHandler.js"></script-->

    <!-- Controllers -->
    <script src="../Scripts/controllers/RootController.js"></script>
    <script src="../Scripts/controllers/CatalogController.js"></script>
    <script src="../Scripts/controllers/CertificateController.js"></script>
    <script src="../Scripts/controllers/CreditController.js"></script>
    <script src="../Scripts/controllers/DashboardController.js"></script>
    <script src="../Scripts/controllers/InvoiceController.js"></script>
    <script src="../Scripts/controllers/ManagerController.js"></script>
    <script src="../Scripts/controllers/ParcelController.js"></script>
    <script src="../Scripts/controllers/PetitionController.js"></script>
    <script src="../Scripts/controllers/SeizureController.js"></script>
    <script src="../Scripts/controllers/UserController.js"></script>
    <script src="../Scripts/controllers/ZoneController.js"></script>

    <!-- Services -->
    <script src="../Scripts/services/CertificateService.js"></script>
    <script src="../Scripts/services/ContextService.js"></script>
    <script src="../Scripts/services/CreditService.js"></script>
    <script src="../Scripts/services/InvoiceService.js"></script>
    <script src="../Scripts/services/ManagerService.js"></script>
    <script src="../Scripts/services/ParcelService.js"></script>
    <script src="../Scripts/services/PetitionService.js"></script>
    <script src="../Scripts/services/SearchService.js"></script>
    <script src="../Scripts/services/SeizureService.js"></script>
    <script src="../Scripts/services/StateService.js"></script>
    <script src="../Scripts/services/StatusService.js"></script>
    <script src="../Scripts/services/UserService.js"></script>
    <script src="../Scripts/services/ZoneService.js"></script>

    <!-- Directives -->

</body>

</html>
