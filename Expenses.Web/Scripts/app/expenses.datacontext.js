﻿window.expensesApp = window.expensesApp || {};

window.expensesApp.datacontext = (function () {

    var datacontext = {
        getExpenseReports: getExpenseReports,
        createExpense: createExpense,
        createExpenseReport: createExpenseReport,
        saveNewExpense: saveNewExpense,
        saveNewExpenseReport: saveNewExpenseReport,
        saveChangedExpense: saveChangedExpense,
        saveChangedExpenseReport: saveChangedExpenseReport,
        deleteExpense: deleteExpense,
        deleteExpenseReport: deleteExpenseReport
    };

    return datacontext;

    function getExpenseReports(expenseReportsObservable, errorObservable) {
        return ajaxRequest("get", expenseReportUrl())
            .done(getSucceeded)
            .fail(getFailed);

        function getSucceeded(data) {
            var mappedExpenseReports = $.map(data, function (list) { return new createExpenseReport(list); });
            expenseReportsObservable(mappedExpenseReports);
        }

        function getFailed() {
            errorObservable("Error retrieving expense reports.");
        }
    }
    function createExpense(data) {
        return new datacontext.expense(data); // expense is injected by todo.model.js
    }
    function createExpenseReport(data) {
        return new datacontext.expenseReport(data); // ExpenseReport is injected by todo.model.js
    }
    function saveNewExpense(expense) {
        clearErrorMessage(expense);
        return ajaxRequest("post", expenseUrl(), expense)
            .done(function (result) {
                expense.expenseId = result.expenseId;
            })
            .fail(function () {
                expense.errorMessage("Error adding a new todo item.");
            });
    }
    function saveNewExpenseReport(expenseReport) {
        clearErrorMessage(expenseReport);
        return ajaxRequest("post", expenseReportUrl(), expenseReport)
            .done(function (result) {
                expenseReport.expenseReportId = result.expenseReportId;
                expenseReport.userId = result.userId;
            })
            .fail(function () {
                expenseReport.errorMessage("Error adding a new todo list.");
            });
    }
    function deleteExpense(expense) {
        return ajaxRequest("delete", expenseUrl(expense.expenseId))
            .fail(function () {
                expense.errorMessage("Error removing todo item.");
            });
    }
    function deleteExpenseReport(expenseReport) {
        return ajaxRequest("delete", expenseReportUrl(expenseReport.expenseReportId))
            .fail(function () {
                expenseReport.errorMessage("Error removing todo list.");
            });
    }
    function saveChangedExpense(expense) {
        clearErrorMessage(expense);
        return ajaxRequest("put", expenseUrl(expense.expenseId), expense, "text")
            .fail(function () {
                expense.errorMessage("Error updating todo item.");
            });
    }
    function saveChangedExpenseReport(expenseReport) {
        clearErrorMessage(expenseReport);
        return ajaxRequest("put", expenseReportUrl(expenseReport.expenseReportId), expenseReport, "text")
            .fail(function () {
                expenseReport.errorMessage("Error updating the todo list title. Please make sure it is non-empty.");
            });
    }

    // Private
    function clearErrorMessage(entity) { entity.errorMessage(null); }
    function ajaxRequest(type, url, data, dataType) { // Ajax helper
        var options = {
            dataType: dataType || "json",
            contentType: "application/json",
            cache: false,
            type: type,
            data: data ? data.toJson() : null
        };
        var antiForgeryToken = $("#antiForgeryToken").val();
        if (antiForgeryToken) {
            options.headers = {
                'RequestVerificationToken': antiForgeryToken
            };
        }
        return $.ajax(url, options);
    }
    // routes
    function expenseReportUrl(id) { return "/api/ExpenseReports/" + (id || ""); }
    function expenseUrl(id) { return "/api/Expenses/" + (id || ""); }

})();