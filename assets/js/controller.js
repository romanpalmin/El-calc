/**
 * Created by Roman on 22.09.2015.
 */
PSEC.Controller = function (config, utils) {
    //  vars
    var isDebug = false;

    //  public vars
    this.periodType = {
        DAY: 1,
        WEEK: 2,
        MONTH: 3,
        properties: {
            1: {name: "day", value: 1, inYear: 365, days: 1},
            2: {name: "week", value: 2, inYear: 52, days: 7},
            3: {name: "month", value: 3, inYear: 12, days: config.days / config.months}
        }
    };
    var _types = this.periodType;

    //  public methods
    /**
     Возвращает данные по всем активным вкладам
     * @param amount
     * @param percent
     * @param period
     * @param periodType
     * @returns {*}
     * @constructor
     */
    this.Calculate = function (amount, percent, period, periodType) {
        return calculate(amount, percent, period, periodType);
    };


    //  private methods
    /**
     * Возвращает процентную ставку для указанной суммы вклада
     * @param val
     * @returns {number}
     */
    function getRate(val) {
        var rate = 0;
        if (val >= 3000 && val < 100000) {
            rate = config.rates.rate1;
        }
        else if (val >= 100000 && val < 400000) {
            rate = config.rates.rate2;
        }
        else if (val >= 400000 && val <= 500000) {
            rate = config.rates.rate3;
        }
        else {
            rate = 0;
        }
        return rate;
    }

    /**
     * Рассчитывает сумму дохода с указанной суммы за указанный период
     * @param fee
     * @param type
     * @returns {number}
     * @constructor
     */
    function CalculatePeriodRent(fee, type) {
        // todo доделать для других типов периодов
        var _days = _types.properties[type].days;
        return _days ? utils.Round(getRate(fee) / 100 * fee * _days) : 0;
    }

    /**
     * Основная функция расчета доходности
     */
    function calculate(p_amount, percent, period, periodType) {
        var retObject;
        var _index; //  переменная циклов
        var _prevFee = {};
        var _innerReinvest = 0;
        var _reinvestPercent = percent / 100;
        var currentProfit;
        var _totalAmount = 0;
        var _totalCash = 0;

        var activeAmounts = []; //  массив активных вкладов, длина массива <= 12
        var summaryAmounts = []; //  массив всех вкладов за указанный период

        var periodIterator = 0;
        var amount = p_amount;
        var feeInPeriod = 0;
        var reinvest = 0;
        var cash = 0;
        var balance = 0;

        // строка вклада/реинвеста/сохранения
        var _fee = {
            periodIterator: 0,
            amount: 0,
            feeInPeriod: 0,
            reinvest: 0,
            cash: 0,
            balance: 0
        };

        for (_index = 0; _index < period; _index++) {
            cash = 0;
            periodIterator = _index;

            //  если в массиве текущих вкладов уже 12 вкладов, удаляем со сдвигом первый элемент
            if (activeAmounts.length === 12) {
                activeAmounts.shift();
            }

            // если это первый вклад
            if (summaryAmounts.length === 0) {
                if (isDebug) {
                    console.log('Первый вклад');
                }
                amount = amount;
                feeInPeriod = CalculatePeriodRent(amount, periodType);
                _innerReinvest = (+feeInPeriod) * (+_reinvestPercent);
                _totalAmount = amount;


                if (_innerReinvest >= config.amount.min) { //  если сумма дохода за период больше мин.вклада, реинвест
                    if (isDebug) {
                        console.log('Первый вклад, хватило на реинвест');
                    }
                    reinvest = _innerReinvest;
                    balance = 0;
                    cash = feeInPeriod - balance - reinvest;
                }
                else { //  если меньше, складываем все на баланс
                    if (isDebug) {
                        console.log('Первый вклад, не хватило на реинвест, скидываем на баланс');
                    }
                    reinvest = 0;
                    balance = _innerReinvest;
                    cash = feeInPeriod - balance - reinvest;
                }
                _totalCash = cash;
            } else { //  если не первый вклад, то проверяем
                if (isDebug) {
                    console.log('Не первый вклад');
                }
                _prevFee = summaryAmounts[_index - 1];
                // если суммы реинвеста хватает
                //--------------------------------------------------------------------------//
                if (_prevFee.reinvest >= config.amount.min) {
                    if (isDebug) {
                        console.log('Есть реинвест с предыдущего');
                    }

                    amount = _prevFee.reinvest;
                    feeInPeriod = CalculatePeriodRent(amount, periodType);

                    currentProfit = GetActiveSummary(activeAmounts).feeInPeriod + feeInPeriod;

                    _innerReinvest = (+currentProfit) * (+_reinvestPercent);
                    if (_innerReinvest >= config.amount.min) {
                        if (isDebug) {
                            console.log('Есть реинвест с предыдущего и есть средства на следующий');
                        }
                        reinvest = _innerReinvest;
                        balance = 0;
                        cash = currentProfit - reinvest;
                    }
                    else {
                        if (isDebug) {
                            console.log('Есть реинвест с предыдущего, но нет бабла на новый. Нищебродский взнос.');
                        }
                        reinvest = 0;
                        balance += _innerReinvest;
                        cash = currentProfit - balance;
                    }
                }
                else { // если суммы реинвеста не хватает
                    if (isDebug) {
                        console.log('Не хватает на реинвест, скидываем на баланс');
                    }
                    currentProfit = GetActiveSummary(activeAmounts).feeInPeriod;
                    _innerReinvest = currentProfit * (+_reinvestPercent); // доход за месяц
                    if (isDebug) {
                        console.log('Не первый вклад, не хватает на реинвест');
                    }


                    /*******************************/
                    amount = 0;
                    reinvest = 0;
                    feeInPeriod = 0;
                    cash = currentProfit - _innerReinvest;
                    balance += _innerReinvest;
                    if (balance >= config.amount.min) {
                        if (isDebug) {
                            console.log('Проверяем баланс, если хватает на реинвест, пересчитываем');
                        }
                        reinvest = balance;
                        balance = 0;
                    }


                   
                }
                _totalAmount = GetActiveSummary(activeAmounts).totalAmount + amount;
                _totalCash = GetActiveSummary(summaryAmounts).totalCash + cash;
            }

            // проверяем на максимум, если реинвест больше максимума, лишку выводм
            if (reinvest > config.amount.max) {
                cash += reinvest - config.amount.max;
                _totalCash += cash;
                reinvest = config.amount.max;
            }

            _fee = {
                periodIterator: periodIterator,
                amount: utils.Round(amount),
                totalAmount: utils.Round(_totalAmount),
                totalCash: utils.Round(_totalCash),
                feeInPeriod: utils.Round(feeInPeriod),
                reinvest: utils.Round(reinvest),
                cash: utils.Round(cash),
                balance: utils.Round(balance)
            };

            //  добавляем очередную строку
            activeAmounts.push(_fee);
            summaryAmounts.push(_fee);
        }

        retObject = {
            activeAmounts: activeAmounts,
            summaryAmounts: summaryAmounts,
            currentSumAmounts: GetActiveSummary(activeAmounts).totalAmount,
            summaryCash: GetActiveSummary(summaryAmounts).totalCash,
            restInBalance: GetActiveSummary(activeAmounts).restInBalance
        };
        return retObject;
    }

    /**
     * Возвращает данные по всем активным вкладам
     * @param arr
     * @returns {{}}
     * @constructor
     */
    var GetActiveSummary = function (arr) {
        var res = {};
        var feeInPeriodTotal = 0;
        var listOfFees = [];
        var totalAmount = 0;
        var totalCash = 0;
        for (var i = 0; i < arr.length; i++) {
            feeInPeriodTotal += arr[i].feeInPeriod;
            totalAmount += arr[i].amount;
            listOfFees.push(arr[i].feeInPeriod);
            totalCash += arr[i].cash;
        }
        res.restInBalance = arr[arr.length - 1].balance;
        res.feeInPeriod = feeInPeriodTotal;
        res.listOfFees = listOfFees;
        res.totalAmount = totalAmount;
        if (arr.length === 12) {
            res.totalAmount -= arr[0].amount;
        }
        res.totalCash = totalCash;
        return res;
    };
};