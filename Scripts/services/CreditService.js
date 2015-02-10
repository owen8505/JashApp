Jash.factory('CreditService', ["$http", "$q", "DEFAULT_VALUES", function($http, $q, DEFAULT_VALUES){

    var credits = [];
    var warningList = [
        {
            id: 1,
            type: 'CREDIT',
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
            type: 'CREDIT',
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

    var getCreditById = function(creditId){
        var credit = undefined;
        for(var creditIndex=0; creditIndex<credits.length; creditIndex++){
            if(credits[creditIndex].id == creditId){
                credit = credits[creditIndex];
                break;
            }
        }

        for(var creditIndex=0; creditIndex<warningList.length; creditIndex++){
            if(warningList[creditIndex].id == creditId){
                credit = warningList[creditIndex];
                break;
            }
        }

        return credit;
    };

    var getAllCredits = function () {
        return credits;
    }

    var getWarningCredits = function () {
        return warningList;
    }

    var createCredit = function () {

        var now = moment().locale('es');

        var credit = {
            id: 0,
            type: 'CREDIT',
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

        return credit;
    };

    var saveCredit = function (credit) {
        credit.push(credit);
        return credits;
    };

    var updateCredit = function (credit) {
        var originalCredit = getCreditById(credit.id);

        originalCredit.anomaly = credit.anomaly;
        originalCredit.folio = credit.folio;
        originalCredit.owner = credit.owner;
        originalCredit.description = credit.description;
        originalCredit.inscription = credit.inscription;
        originalCredit.attachments = credit.attachments;
        originalCredit.status = credit.attachments;
        originalCredit.zone = credit.zone;
        originalCredit.manager = credit.manager;
        originalCredit.committedDate = credit.committedDate;
        originalCredit.cost = credit.cost;
        originalCredit.payment = credit.payment;
        originalCredit.parcel = credit.parcel;
        originalCredit.trackingNumber = credit.trackingNumber;
        originalCredit.documents = credit.documents;
        originalCredit.invoices = credit.invoices;
        originalCredit.cashed = credit.cashed;

        return credits;
    };

    return {
        createCredit : createCredit,
        getAllCredits: getAllCredits,
        getWarningCredits: getWarningCredits,
        getCreditById: getCreditById,
        updateCredit: updateCredit,
        saveCredit: saveCredit

    }

}]);

