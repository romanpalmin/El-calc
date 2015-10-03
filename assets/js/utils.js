/**
 * Created by Roman on 22.09.2015.
 * Хелперы
 */
PSEC.Utils = function(){

    /**
     * округление числа до целого
     * @param val
     * @returns {number}
     */
    this.Round = function(val) {
        var ret = Math.round(val);
        return ret;
    };

    /**
     * формматирование числа по разрядам
     * @param val
     * @returns {string}
     */
    this.Format = function(val) {
        var ret = val + '';
        return ret.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
    };

    /**
     * Форматирование округленного числа
     * @param val
     * @returns {string}
     * @constructor
     */
    this.FormatRound = function(val){
        return this.Format(this.Round(val));
    };
};