const forms = require("forms");

const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

const bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

const createProductForm = function(brands, countries, types, skin_types, status){
    return forms.create({
        "brand_id":fields.string({
            'label': 'Brand',
            'required':true,
            'errorAfterField':true,
            'widget': widgets.select(),
            'choices': brands
        }),
        "name":fields.string({
            'required':true,
            'errorAfterField':true
        }),
        "country_id":fields.string({
            'label': 'Country',
            'required':true,
            'errorAfterField':true,
            'widget': widgets.select(),
            'choices': countries
        }),
        "type_id":fields.string({
            'label': 'Type',
            'required':true,
            'errorAfterField':true,
            'widget': widgets.select(),
            'choices': types
        }),
        "cost":fields.string({
            'required':true,
            'errorsAfterField':true,
            'validators': [validators.integer(), validators.min(0)]
        }),
        "description":fields.string({
            'required':true,
            'errorAfterField':true
        }),
        "skin_types":fields.string({
            'required': true,
            'errorAfterField':true,
            'widget': widgets.multipleSelect(),
            'choices':skin_types
        }),
        "sunscreen_filters":fields.string({
            'required':true,
            'errorAfterField':true
        }),
        "year_of_expiry":fields.string({
            'required':true,
            'errorAfterField':true,
            'validators': [validators.integer(), validators.min(2022)]
        }),
        "status_id":fields.string({
            'label': 'Status',
            'required':true,
            'errorAfterField':true,
            'widget': widgets.select(),
            'choices': status
        }),
        "stock_no":fields.string({
            'required':true,
            'errorAfterField':true,
            'validators': [validators.integer(), validators.min(0)]
        }),
        "image_url":fields.string({
            'required':true,
            'errorAfterField':true,
            'widget': widgets.hidden()
        })
    })
}

const createRegistrationForm = function(roles) {
    return forms.create({
        "role_id":fields.string({
            'label': 'Role',
            'required':true,
            'errorAfterField':true,
            'widget': widgets.select(),
            'choices': roles
        }),
        'username': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'email': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'first_name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'last_name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        // 'address_line_1': fields.string({
        //     required: true,
        //     errorAfterField: true,
        //     cssClasses: {
        //         label: ['form-label']
        //     }
        // }),
        // 'address_line_2': fields.string({
        //     required: true,
        //     errorAfterField: true,
        //     cssClasses: {
        //         label: ['form-label']
        //     }
        // }),
        // 'postal_code': fields.string({
        //     required: true,
        //     errorAfterField: true,
        //     cssClasses: {
        //         label: ['form-label']
        //     }
        // }),
        // 'phone_number': fields.string({
        //     required: true,
        //     errorAfterField: true,
        //     cssClasses: {
        //         label: ['form-label']
        //     }
        // }),
        'password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'confirm_password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.matchField('password')]
        })
    })
}

const createLoginForm = function() {
    return forms.create({
        'username': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        })
    })
}

const createSearchForm = function(brands, countries, types, status){
    return forms.create({
        'name': fields.string({
            required: false
        }),
        // 'min_cost': fields.string({
        //     required:false,
        //     errorAfterField: true,
        //     validators: [validators.integer(), validators.min(0)]
        // }),
        // 'max_cost': fields.string({
        //     required:false,
        //     errorAfterField: true,
        //     validators: [validators.integer(), validators.min(0)]
        // }),
        'brand_id': fields.string({
            label: 'Brand',
            required:false,
            widget: widgets.select(),
            choices: brands
        }),
        // 'country_id': fields.string({
        //     label: 'Country',
        //     required:false,
        //     widget: widgets.select(),
        //     choices: countries
        // }),
        // 'type_id': fields.string({
        //     label: 'Type',
        //     required:false,
        //     widget: widgets.select(),
        //     choices: types
        // }),
        'status_id': fields.string({
            label: 'Status',
            required:false,
            widget: widgets.select(),
            choices: status
        })
    })
}

const createCustomerSearchForm = function(){
    return forms.create({
        'username': fields.string({
            required: false
        }),
        'email': fields.string({
            required: false
        }),
    })
}

const createOrderSearchForm = function(shipping){
    return forms.create({
        "order_id":fields.string({
            'required':false
        }),
        "shipping_id":fields.string({
            'label': 'Shipping',
            'required':false,
            'widget': widgets.select(),
            'choices': shipping
        }),
    })
}

const createBrandForm = function(){
    return forms.create({
        "brand_name":fields.string({
            'required':true,
            'errorAfterField':true
        })
    })
}

const createCountryForm = function(){
    return forms.create({
        "country":fields.string({
            'required':true,
            'errorAfterField':true
        })
    })
}

const createShippingForm = function(shipping){
    return forms.create({
        "shipping_id":fields.string({
            'label': 'Shipping',
            'required':true,
            'errorAfterField':true,
            'widget': widgets.select(), // dropdown select
            'choices': shipping
        }),
    })
}

module.exports = {bootstrapField, createProductForm, createRegistrationForm, createLoginForm, createSearchForm, createCustomerSearchForm, createOrderSearchForm, createBrandForm, createCountryForm, createShippingForm };