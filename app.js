var BugdetController = (function() {
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calculatePercentage = function(total) {
        this.percentage = total === 0 ? -1 : Math.round((this.value / total) * 100);
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var data = {
        items: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    var calculateTotal = function(type) {
        var total = 0;

        data.items[type].forEach(function(current, index, array) {
            total += current.value;
        });

        data.total[type] = total;
    };

    return {
        addItem: function(type, description, value) {
            var items = data.items[type];
            var ID = items.length === 0 ? 0 : (items[items.length - 1].id + 1);
            var item = type === 'exp' ? new Expense(ID, description, value) : new Income(ID, description, value);

            data.items[type].push(item);
            return item;
        },
        calculateBudget: function() {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.total.inc - data.total.exp;
            data.percentage = data.total.inc === 0 ? -1 : Math.round((data.total.exp / data.total.inc) * 100);
        },
        getBuget: function() {
            return {
                budget: data.budget,
                income: data.total.inc,
                expense: data.total.exp,
                percentage: data.percentage
            }
        },
        deleteItem: function(type, id) {
            var ids = data.items[type].map(function(current) {
                return current.id;
            });

            var index = ids.indexOf(id);
            if (index !== -1) {
                data.items[type].splice(index, 1);
            }
        },
        calculatePercentage: function() {
            data.items.exp.forEach(function(current) {
                current.calculatePercentage(data.total.inc);
            });
        },
        getPercentage: function() {
            var items = data.items.exp.map(function(current) {
                return current.getPercentage();
            });

            return items;
        }
    }
})();

var UIController = (function() {
    var Dom = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetValue: '.budget__value',
        incomeValue: '.budget__income--value',
        expenseValue: '.budget__expenses--value',
        expensePercentage: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage',
        date: '.budget__title--month'
    }

    var formatNumber = function(num, type) {
        num = Math.abs(num);
        num = num.toFixed(2);

        var numSplit = num.split('.');
        var int = numSplit[0];
        var dec = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(Dom.inputType).value,
                description: document.querySelector(Dom.inputDescription).value,
                value: parseFloat(document.querySelector(Dom.inputValue).value)
            }
        },
        getDom: function() {
            return Dom;
        },
        addItem: function(obj, type) {
            var html, element;

            if (type === 'inc') {
                element = Dom.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = Dom.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            html = html.replace('%id%', obj.id);
            html = html.replace('%description%', obj.description);
            html = html.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },
        clearInput: function() {
            var input = document.querySelectorAll(Dom.inputDescription + ',' + Dom.inputValue);
            var array = Array.prototype.slice.call(input);

            array.forEach(function(current, index, array) {
                current.value = '';
            });

            array[0].focus();
        },
        displayBudget: function(obj) {
            document.querySelector(Dom.budgetValue).textContent = formatNumber(obj.budget, obj.budget >= 0 ? 'inc' : 'exp');
            document.querySelector(Dom.incomeValue).textContent = formatNumber(obj.income, 'inc');
            document.querySelector(Dom.expenseValue).textContent = formatNumber(obj.expense, 'exp');
            document.querySelector(Dom.expensePercentage).textContent = obj.percentage > 0 ? obj.percentage + '%' : '---';
        },
        deleteItem: function(id) {
            var element = document.getElementById(id);
            element.parentNode.removeChild(element);
        },
        displayPercentage: function(items) {
            var elements = document.querySelectorAll(Dom.itemPercentage);

            nodeForEach(elements, function(current, index) {
                current.textContent = items[index] > 0 ? items[index] + '%' : '---';
            });
        },
        displayMonth: function() {
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var date = new Date();
            var year = date.getFullYear();
            var month = months[date.getMonth()];
            document.querySelector(Dom.date).textContent = month + ' ' + year;
        },
        changeType: function() {
            var elements = document.querySelectorAll(
                Dom.inputType + ',' + Dom.inputDescription + ',' + Dom.inputValue
            );

            nodeForEach(elements, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(Dom.inputButton).classList.toggle('red');
        }
    };
})();

var Controller = (function(BudgetCtrl, UICtrl) {
    var setupEventListener = function() {
        var Dom = UICtrl.getDom();

        document.querySelector(Dom.inputButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(Dom.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(Dom.inputType).addEventListener('change', UICtrl.changeType);
    };

    var ctrlAddItem = function() {
        var input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            var item = BudgetCtrl.addItem(input.type, input.description, input.value);
            UICtrl.addItem(item, input.type);
            UICtrl.clearInput();
            updateBudget();
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            var item = itemID.split('-');
            var type = item[0];
            var ID = parseInt(item[1]);

            BudgetCtrl.deleteItem(type, ID);
            UICtrl.deleteItem(itemID);
            updateBudget();
            updatePercentage();
        }
    };

    var updateBudget = function() {
        BudgetCtrl.calculateBudget();
        var budget = BudgetCtrl.getBuget();
        UICtrl.displayBudget(budget);
    };

    var updatePercentage = function() {
        BudgetCtrl.calculatePercentage();
        var items = BudgetCtrl.getPercentage();
        UICtrl.displayPercentage(items);
    };

    return {
        init: function() {
            UICtrl.displayBudget({
                budget: 0,
                income: 0,
                expense: 0,
                percentage: -1
            });
            UICtrl.displayMonth();
            setupEventListener();
        }
    }
})(BugdetController, UIController);

Controller.init();