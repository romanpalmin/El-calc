/**
 * Created by Roman Palmin 18.09.2015.*/
$(document).ready(function () {
    Start();
});

function Start() {
    var config = {};
    $.getJSON('assets/data/config.json', function (response) {
        if (response.success) {
            config = response.data;
            Init(config);
        } else {
            console.log(response.error);
        }
    });


}

function Init(config) {
    var utils = new PSEC.Utils();
    var controller = new PSEC.Controller(config, utils);
    new PSEC.Calc(config, controller, utils);
}