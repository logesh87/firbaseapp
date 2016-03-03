angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope, $firebaseObject, $firebaseArray, $firebaseAuth, $state) {
        var ref = new Firebase("https://logeshfbauth.firebaseio.com/");
        $scope.auth = $firebaseAuth(ref);
        $scope.user = {}
        // any time auth status updates, add the user data to scope
        // $scope.auth.$onAuth(function(authData) {
        //     $scope.authData = authData;
        // });
        // 
        $scope.logout = function () {
            $scope.auth.$unauth();
        };

        function getName(authData) {
            switch (authData.provider) {
                case 'password':
                    return authData.password.email.replace(/@.*/, '');
                case 'google':
                    return authData.google.displayName;
                case 'facebook':
                    return authData.facebook.displayName;
            }
        }

        function getPicURL(id, large) {
            if (id) {
                id = id.replace('facebook:', '');
            }
            return "https://graph.facebook.com/" + (id || this._uid.replace('facebook:', '')) +
                "/picture/?type=" + (large ? "large" : "square") +
                "&return_ssl_resources=1";
        }
        
        $scope.login = function (provider) {

            if (provider && provider == 'facebook') {

                $scope.auth.$authWithOAuthPopup(provider, { scope: "email, user_likes" })
                    .then(function (authData) {
                        var user = {
                        };

                        var displayName = authData.facebook.displayName.split(' ');
                        user.first_name = displayName[0];
                        user.last_name = displayName[displayName.length - 1];
                        user.id = authData.uid;
                        user.email = authData.facebook.email;
                        user.name = authData.facebook.displayName;
                        user.location = '';
                        user.bio = '';
                        user.pic = getPicURL(user.id);
                        $scope.userData = new $firebaseObject(ref.child("users").child(authData.uid));
                        $scope.userData.$value = user;
                        $scope.userData.$save();
                        $state.go('tab.account')
                        
                        //console.log(authData);
                    }).catch(function (error) {
                        console.error("Authentication failed:", error);
                    });

            } else if (provider && provider == 'google') {

                $scope.auth.$authWithOAuthPopup(provider, { scope: "email" })
                    .then(function (authData) {
                        //console.log(authData);
                        var user = {
                            name: getName(authData),
                            provider: authData.provider,
                            email: authData.google.email
                        };
                        user.id = authData.uid;
                        user.pic = authData.google.profileImageURL;
                        $scope.userData = new $firebaseObject(ref.child("users").child(authData.uid));
                        $scope.userData.$value = user;
                        $scope.userData.$save();
                        $state.go('tab.account')
                    }).catch(function (error) {
                        console.error("Authentication failed:", error);
                    });

            } else {

                var username = $scope.user.email;
                var password = $scope.user.password;
                $scope.auth.$authWithPassword({
                    email: username,
                    password: password
                }).then(function (user) {
                    //Success callback
                    console.log('Authentication successful');
                }, function (error) {
                    //Failure callback
                    console.log('Authentication failure');
                });

            }

        };

        $scope.createUser = function (uer) {
            console.log($scope.user);
            $scope.message = null;
            $scope.error = null;

            $scope.auth.$createUser({
                "email": $scope.user.email,
                "password": $scope.user.password
            }).then(function (userData) {
                $scope.message = "User created with uid: " + userData.uid;
            }).catch(function (error) {
                $scope.error = error;
                console.log(error);
            });
        };

        $scope.removeUser = function () {
            $scope.message = null;
            $scope.error = null;

            $scope.auth.$removeUser({
                email: $scope.user.email,
                password: $scope.user.password
            }).then(function () {
                $scope.message = "User removed";
            }).catch(function (error) {
                $scope.error = error;
            });
        };



        $scope.auth.$onAuth(function (authData) {
            if (authData === null) {
                console.log("Not logged in yet");
            } else {
                console.log("Logged in as", authData.uid);
            }
            $scope.authData = authData; // This will display the user's name in our view
        });

    })

    .controller('ChatsCtrl', function ($scope, Chats) {
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //
        //$scope.$on('$ionicView.enter', function(e) {
        //});
  
  

        $scope.chats = Chats.all();
        $scope.remove = function (chat) {
            Chats.remove(chat);
        };
    })

    .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
        $scope.chat = Chats.get($stateParams.chatId);
    })

    .controller('AccountCtrl', function ($scope, $firebaseObject, $firebaseArray) {
        var ref = new Firebase("https://logeshfbauth.firebaseio.com");
        $scope.users = $firebaseArray(ref.child('users'));
        console.log($scope.users);    
    });
