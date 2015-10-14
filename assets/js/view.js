/**
 * Created by Roman on 18.09.2015.
 * Скрипт расчета прибыли Элевруса с учетом реинвестов
 */
var PSEC = {};

PSEC.Calc = function (config, controller, utils) {

    //  inputs
    var amountInput;
    var monthsInput;
    var reinvestPercentInput;
    var amountInputControl;
    var periodInputControl;
    var percentInputControl;

    var inputsList = [];

    //  sliders
    var sliderAmount;
    var sliderPercent;
    var sliderPeriod;


    //  buttons
    var amountMinusBtn;
    var amountPlusBtn;
    var percentPlusBtn;
    var percentMinusBtn;
    var periodPlusBtn;
    var periodMinusBtn;

    //  blocks
    var resultTable;
    var resultSummary;

    //  vars
    var amount = 0;
    var period = 12;
    var months = 12;

    // валютные коэффициенты
    //var currencyCoefficient = 0.016;//1;
    //var minAmountCoefficient = 8.33334;

    var currentController;
    var calc;

    init();


    //  первичная инициализация срипта
    function init() {
        //console.warn(config.amount.min);
        //config.amount.min = config.amount.min * currencyCoefficient;
        //console.warn(config.amount.min);
        //console.warn(config.amount.min * minAmountCoefficient);
        //config.amount.max = config.amount.max * currencyCoefficient;
        renderPage();
    }

    /**
     * Формируем страницу из шаблонов
     */
    function renderPage() {
        // строим форму
        var calculateForm = '';
        var user = {login: config.person.login, homepage: config.person.homepage};
        dust.render('calculate-form.dust', user, function (err, out) {
            calculateForm = out;
            $('#calculate-form').html(calculateForm);

            //  inputs
            amountInput = $('.b-elcalc-amount');
            monthsInput = $('.b-elcalc-months');
            reinvestPercentInput = $('.b-elcalc-percent');

            amountInputControl = $('#amount');
            periodInputControl = $('#period');
            percentInputControl = $('#percent');

            inputsList = [amountInput, monthsInput, reinvestPercentInput,
                amountInputControl, percentInputControl, periodInputControl];

            sliderAmount = $('.b-elcalc-slider_amount');
            sliderPercent = $('.b-elcalc-slider_percent');
            sliderPeriod = $('.b-elcalc-slider_period');

            //  buttons
            amountMinusBtn = $('.b-elcalc-minus-btn_amount');
            amountPlusBtn = $('.b-elcalc-plus-btn_amount');
            percentPlusBtn = $('.b-elcalc-plus-btn_percent');
            percentMinusBtn = $('.b-elcalc-minus-btn_percent');
            periodPlusBtn = $('.b-elcalc-plus-btn_period');
            periodMinusBtn = $('.b-elcalc-minus-btn_period');

            // result
            resultTable = $('.b-result');
            resultSummary = $('.b-result-summary');


            //  vars
            var amount = 0;
            var period = config.months;
            var months = config.months;

            bindButtons();
            bindInputs();
            bindSliders();
            setDefaultValue();

        });
    }

    function setDefaultValue() {
        periodInputControl.val(months).trigger('input');
        percentInputControl.val(50).trigger('input');
        //console.log(config.amount.min);
        //console.log(minAmountCoefficient);
        //console.log(config.amount.min * minAmountCoefficient);
        //amountInputControl.val(3400);
        amountInputControl.val(25000).trigger('input');//(utils.Round(config.amount.min * minAmountCoefficient)).trigger('input');
    }

    //  привязываем поведение инпутов
    function bindInputs() {
        inputsList.forEach(function (item) {
            item.bind("change keyup input click", function (elem) {
                if (elem.target.value.match(/[^0-9]/g)) {
                    elem.target.value = this.value.replace(/[^0-9]/g, '');
                }
            });
        });
        periodInputControl.on('input', function (item) {
            if (item.currentTarget.value > config.period.max) {
                item.currentTarget.value = config.period.max;
            }

            if (item.currentTarget.value >= config.period.min && item.currentTarget.value <= config.period.max) {
                sliderPeriod.slider("value", item.currentTarget.value);
                reBuildResult();
            }
            else {
                console.log('Период некорректен.');
            }
        });

        amountInputControl.on('input', function (item) {
            if (item.currentTarget.value > config.amount.max) {
                item.currentTarget.value = config.amount.max;
            }

            if (item.currentTarget.value >= config.amount.min && item.currentTarget.value <= config.amount.max) {
                sliderAmount.slider("value", item.currentTarget.value);
                reBuildResult();
            }
            else {
                console.log('Минимальная сумма вклада: 3000 Р');
            }
        });

        percentInputControl.on('input', function (item) {
            if (item.currentTarget.value > config.reinvest.max) {
                item.currentTarget.value = config.reinvest.max;
            }

            if (item.currentTarget.value >= config.reinvest.min && item.currentTarget.value <= config.reinvest.max) {
                sliderPercent.slider("value", item.currentTarget.value);
                reBuildResult();
            }
        });

    }

    function bindSliders() {
        sliderAmount.slider({
            min: config.amount.min,
            max: config.amount.max,
            orientation: "horizontal",
            range: "min",
            animate: true,
            slide: function (event, ui) {
                amountInputControl.val(ui.value).trigger('input');
            }
        });

        sliderPercent.slider({
            min: config.reinvest.min,
            max: config.reinvest.max,
            orientation: "horizontal",
            range: "min",
            animate: true,
            slide: function (event, ui) {
                percentInputControl.val(ui.value).trigger('input');
            }
        });
        sliderPeriod.slider({
            min: config.period.min,
            max: config.period.max,
            orientation: "horizontal",
            range: "min",
            animate: true,
            slide: function (event, ui) {
                periodInputControl.val(ui.value).trigger('input');
            }
        });
    }

    function reBuildResult() {
        var res;
        var _currentAmount = amountInputControl.val();
        var _currentPercent = percentInputControl.val();
        var _currentPeriod = periodInputControl.val();
        res = controller.Calculate(_currentAmount, _currentPercent, _currentPeriod, controller.periodType.MONTH);
        resultTable.html(formHtml(res).htmlTable);
        resultSummary.html(formHtml(res).htmlSummary);
    }

    //  привязываем поведение кнопок
    function bindButtons() {
        amountMinusBtn.on('click', function () {
            amountInputControl.val(1 * amountInputControl.val() - 1).trigger('input');
        });

        amountPlusBtn.on('click', function () {
            amountInputControl.val(1 * amountInputControl.val() + 1).trigger('input');
        });

        periodMinusBtn.on('click', function () {
            periodInputControl.val(1 * periodInputControl.val() - 1).trigger('input');
        });

        periodPlusBtn.on('click', function () {
            periodInputControl.val(1 * periodInputControl.val() + 1).trigger('input');
        });

        percentMinusBtn.on('click', function () {
            percentInputControl.val(1 * percentInputControl.val() - 1).trigger('input');
        });

        percentPlusBtn.on('click', function () {
            percentInputControl.val(1 * percentInputControl.val() + 1).trigger('input');
        });
    }


    function formHtml(res) {
        var arr = res.summaryAmounts;
        var retHtml;
        var htmlTable;
        var htmlSummary;
        var htmlSummaryContent;
        var hrmlTableFooter;
        var htmlTableContent = [];
        var htmlTableHeader = [
            '<table class="b-result-table">',
            '<thead> ',
            '<th>Месяц</th>',
            '<th>Взнос</th>',
            '<th>Общий взнос</th>',
            '<th>Доход со взноса</th>',
            '<th>Реинвест</th>',
            '<th> Вывод </th>',
            '<th> Общий вывод</th>',
            '</thead>',
            '<tbody>'];

        arr.forEach(function (item) {
            htmlTableContent = htmlTableContent.concat(['<tr class="b-result-table-row">',
                '<td>',
                utils.Round(item.periodIterator + 1),
                '</td>',
                '<td>',
                utils.FormatRound(item.amount),
                '</td>',
                '<td>',
                utils.FormatRound(item.totalAmount),
                '</td>',
                '<td>',
                utils.FormatRound(item.feeInPeriod),
                '</td>',
                '<td>',
                utils.FormatRound(item.reinvest),
                '</td>',
                '<td class="b-strong">',
                utils.FormatRound(item.cash),
                '</td>',
                '<td>',
                utils.FormatRound(item.totalCash),
                '</td>',
                '</tr>']);
        });
        hrmlTableFooter = ['</tbody></table>'];
        htmlTable = htmlTableHeader.concat(htmlTableContent, hrmlTableFooter).join('');

        htmlSummaryContent = [
            '<h2 class="calc_choice_vklad_summ_title">',
            'Сумма взносов на конец периода:  <span class="b-elcalc-summary_amount">', utils.FormatRound(res.currentSumAmounts), ' Р',
            '</span><br>',
            'Сумма выплат на конец периода:  <span class="b-elcalc-summary_amount">', utils.FormatRound(res.summaryCash), ' Р',
            '</span>'
        ];

        if (res.restInBalance > 0) {
            htmlSummaryContent = htmlSummaryContent.concat([
                    '<br>Остаток на балансе на конец периода: <span class="b-elcalc-summary_amount">', utils.FormatRound(res.restInBalance), ' Р',
                    '</span>'
                ]
            );
        }
        else {
            htmlSummaryContent = htmlSummaryContent.concat(['</h2>']);
        }
        htmlSummary = htmlSummaryContent.join('');
        retHtml = {htmlTable: htmlTable, htmlSummary: htmlSummary};
        return retHtml;
    }
};