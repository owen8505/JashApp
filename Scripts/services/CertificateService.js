Jash.factory('CertificateService', ["$http", "$q", "DEFAULT_VALUES", function($http, $q, DEFAULT_VALUES){

    var certificates = [];
    var warningList = [
        {
            id: 1,
            type: 'CERTIFICATE',
            anomaly: true,
            folio: 3033,
            creationDate: moment().locale('es'),
            deliveryDate: moment().locale('es'),
            owner: undefined,
            description: undefined,
            inscription: undefined,
            attachments: [],
            status: {code:1, title:'Nuevo'},
            zone: undefined,
            manager: undefined,
            committedDate: undefined,
            cost: undefined,
            payment: false,
            parcel: undefined,
            trackingNumber: undefined,
            documents: [],
            invoices: [],
            cashed: false

        },
        {
            id: 2,
            type: 'CERTIFICATE',
            anomaly: true,
            folio: 3034,
            creationDate: moment().locale('es'),
            deliveryDate: moment().locale('es'),
            owner: undefined,
            description: undefined,
            inscription: undefined,
            attachments: [],
            status: {code:1, title:'Nuevo'},
            zone: undefined,
            manager: undefined,
            committedDate: undefined,
            cost: undefined,
            payment: false,
            parcel: undefined,
            trackingNumber: undefined,
            documents: [],
            invoices: [],
            cashed: false

        }
    ];

    var getDeliveryDate = function(date){
        var copyDate = angular.copy(date);
        return copyDate.add(DEFAULT_VALUES.DELIVERY_RANGES.CERTIFICATE, 'days');

    }

    var getCertificateById = function(certificateId){
        var certificate = undefined;
        for(var certificateIndex=0; certificateIndex<certificates.length; certificateIndex++){
            if(certificates[certificateIndex].id == certificateId){
                certificate = certificates[certificateIndex];
                break;
            }
        }

        for(var certificateIndex=0; certificateIndex<warningList.length; certificateIndex++){
            if(warningList[certificateIndex].id == certificateId){
                certificate = warningList[certificateIndex];
                break;
            }
        }

        return certificate;
    };

    var getAllCertificates = function () {
        return certificates;
    }

    var getWarningCertificates = function () {
        return warningList;
    }

    var createCertificate = function () {

        var now = moment().locale('es');

        var certificate = {
            id: 0,
            type: 'CERTIFICATE',
            anomaly: false,
            folio: undefined,
            creationDate: now,
            deliveryDate: getDeliveryDate(now),
            owner: undefined,
            description: undefined,
            inscription: undefined,
            attachments: [],
            status: {code:1, title:'Nuevo'},
            zone: undefined,
            manager: undefined,
            committedDate: undefined,
            cost: undefined,
            payment: false,
            parcel: undefined,
            trackingNumber: undefined,
            documents: [],
            invoices: [],
            cashed: false

        };

        return certificate;
    };

    var saveCertificate = function (certificate) {
        certificates.push(certificate);
        return certificates;
    };

    var updateCertificate = function (certificate) {
        var originalCertificate = getCertificateById(certificate.id);

        originalCertificate.anomaly = certificate.anomaly;
        originalCertificate.folio = certificate.folio;
        originalCertificate.owner = certificate.owner;
        originalCertificate.description = certificate.description;
        originalCertificate.inscription = certificate.inscription;
        originalCertificate.attachments = certificate.attachments;
        originalCertificate.status = certificate.attachments;
        originalCertificate.zone = certificate.zone;
        originalCertificate.manager = certificate.manager;
        originalCertificate.committedDate = certificate.committedDate;
        originalCertificate.cost = certificate.cost;
        originalCertificate.payment = certificate.payment;
        originalCertificate.parcel = certificate.parcel;
        originalCertificate.trackingNumber = certificate.trackingNumber;
        originalCertificate.documents = certificate.documents;
        originalCertificate.invoices = certificate.invoices;
        originalCertificate.cashed = certificate.cashed;

        return certificates;
    };

    return {
        createCertificate : createCertificate,
        getAllCertificates: getAllCertificates,
        getWarningCertificates: getWarningCertificates,
        getCertificateById: getCertificateById,
        updateCertificate: updateCertificate,
        saveCertificate: saveCertificate

    }

}]);

