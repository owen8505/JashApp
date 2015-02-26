Jash.factory('UserService', ["$http", "$q", "$rootScope", "ContextService", "DEFAULT_VALUES", function ($http, $q, $rootScope, ContextService, DEFAULT_VALUES) {

    var users = [];
    var spWeb;

    var getUserById = function (userId) {
        var user = undefined;
        for (var userIndex = 0; userIndex < users.length; userIndex++) {

            if (users[userIndex].id == userId) {
                user = users[userIndex];
                break;
            }
        }        
        return user;
    };

    var deleteUserById = function (userId) {
        var user = undefined;
        for (var userIndex = 0; userIndex < users.length; userIndex++) {

            if (users[userIndex].id == userId) {
                users.splice(userIndex, 1);
                break;
            }
        }
    };

    var getAllUsers = function () {
        
        users = [];

       var url = spWeb.appWebUrl + "/_api/SP.AppContextSite(@target)" +
            "/web/lists/getbytitle('Usuarios')/items?" +
            "@target='" + spWeb.hostUrl + "'";

       var executor = new SP.RequestExecutor(spWeb.appWebUrl);
       executor.executeAsync({
           url: url,
           method: 'GET',
           headers: { "accept": "application/json; odata=verbose" },
           success: function (data) {
               var items = (eval(JSON.parse(data.body).d).results);               
               angular.forEach(items, function (item) {                   
                   var user = {
                       id: item.Id,
                       name: item.Title,
                       mail: item.Correo_x0020_electronico,
                       phone: item.Telefono,
                       cellphone: item.Celular
                   };

                   users.push(user);                                      

               });
               $rootScope.$broadcast('initDataLoaded');               
           },
           error: function (response) {
               console.log(response)
           }
       });

        return users;
    };

    var createUser = function () {

        var user = {
            id: 0,
            name: undefined,
            mail: undefined,
            phone: undefined,
            cellphone: undefined,            
        };

        return user;
    };

    var saveUser = function (user) {
        
        $.ajax({
            url: spWeb.appWebUrl + "/_api/contextinfo",
            method: "POST",
            headers: { "Accept": "application/json; odata=verbose" },
            success: function (data) {
                var requestDigest = data.d.GetContextWebInformation.FormDigestValue;
                
                var url = spWeb.appWebUrl + "/_api/SP.AppContextSite(@target)" +
                    "/web/lists/getbytitle('Usuarios')/items?" +
                    "@target='" + spWeb.hostUrl + "'";

                var executor = new SP.RequestExecutor(spWeb.appWebUrl);
                executor.executeAsync({
                    url: url,
                    method: "POST",
                    body: JSON.stringify({
                        '__metadata': {
                            'type': 'SP.Data.UsuariosListItem'
                        },
                        'Title': user.name,
                        'Correo_x0020_electronico': user.mail,
                        'Telefono': user.phone,
                        'Celular': user.cellphone
                    }),
                    headers: {
                        "Accept": "application/json; odata=verbose",
                        "X-RequestDigest": requestDigest,                        
                        "content-type": "application/json;odata=verbose"
                    },
                    success: function (data) {
                        
                        var item = (eval(JSON.parse(data.body).d));
                        var user = {
                            id: item.Id,
                            name: item.Title,
                            mail: item.Correo_x0020_electronico,
                            phone: item.Telefono,
                            cellphone: item.Celular,
                        };
                        
                        users.push(user);

                        $rootScope.$broadcast('itemSaved');
                    },
                    error: function (response) {
                        console.log(response)
                    }
                    
                });
            },
            error: function (data, errorCode, errorMessage) {
                console.log(errorMessage)
            }
        });
    };

    var updateUser = function (user) {
        
        $.ajax({
            url: spWeb.appWebUrl + "/_api/contextinfo",
            method: "POST",
            headers: { "Accept": "application/json; odata=verbose" },
            success: function (data) {
                var requestDigest = data.d.GetContextWebInformation.FormDigestValue;

                var url = spWeb.appWebUrl + "/_api/SP.AppContextSite(@target)" +
                    "/web/lists/getbytitle('Usuarios')/items('" + user.id + "')?" +
                    "@target='" + spWeb.hostUrl + "'";

                var executor = new SP.RequestExecutor(spWeb.appWebUrl);
                executor.executeAsync({
                    url: url,
                    method: "POST",
                    body: JSON.stringify({
                        '__metadata': {
                            'type': 'SP.Data.UsuariosListItem'
                        },
                        'Title': user.name,
                        'Correo_x0020_electronico': user.mail,
                        'Telefono': user.phone,
                        'Celular': user.cellphone
                    }),
                    headers: {
                        "Accept": "application/json; odata=verbose",
                        "X-RequestDigest": requestDigest,
                        "IF-MATCH": "*",
                        "X-HTTP-Method": "MERGE",
                        "content-type": "application/json;odata=verbose"
                    },
                    success: function (data) {                                                
                        
                        var originalElement = getUserById(user.id);                        
                        originalElement.id = user.id;
                        originalElement.name = user.name;
                        originalElement.mail = user.mail;
                        originalElement.phone = user.phone;
                        originalElement.cellphone = user.cellphone;
                        
                        $rootScope.$broadcast('itemUpdated');
                    },
                    error: function (response) {
                        console.log(response)
                    }

                });
            },
            error: function (data, errorCode, errorMessage) {
                console.log(errorMessage)
            }
        });
    };

    var deleteUser = function (user) {
        $.ajax({
            url: spWeb.appWebUrl + "/_api/contextinfo",
            method: "POST",
            headers: { "Accept": "application/json; odata=verbose" },
            success: function (data) {
                var requestDigest = data.d.GetContextWebInformation.FormDigestValue;

                var url = spWeb.appWebUrl + "/_api/SP.AppContextSite(@target)" +
                    "/web/lists/getbytitle('Usuarios')/items('" + user.id + "')?" +
                    "@target='" + spWeb.hostUrl + "'";

                var executor = new SP.RequestExecutor(spWeb.appWebUrl);
                executor.executeAsync({
                    url: url,
                    method: "POST",                    
                    headers: {
                        "Accept": "application/json; odata=verbose",
                        "X-RequestDigest": requestDigest,
                        "IF-MATCH": "*",
                        "X-HTTP-Method": "DELETE",                        
                    },
                    success: function (data) {

                        deleteUserById(user.id);

                        $rootScope.$broadcast('itemDeleted');
                    },
                    error: function (response) {
                        console.log(response)
                    }

                });
            },
            error: function (data, errorCode, errorMessage) {
                console.log(errorMessage)
            }
        });
    };

    var init = function () {
        spWeb = ContextService.getSpWeb();
    };

    init();

    return {
        getAllUsers: getAllUsers,
        getUserById: getUserById,
        deleteUserById: deleteUserById,
        createUser: createUser,
        saveUser: saveUser,
        updateUser: updateUser,
        deleteUser: deleteUser
    }

}]);