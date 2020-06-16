/**
 * Copyright © O2TI. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    "jquery",
    "underscore",
    "uiComponent",
    "ko",
    "Magento_Checkout/js/model/quote",
    "Magento_Checkout/js/model/step-navigator",
    "Magento_Checkout/js/model/payment-service",
    "Magento_Checkout/js/model/payment/method-converter",
    "Magento_Checkout/js/action/get-payment-information",
    "Magento_Checkout/js/model/checkout-data-resolver",
    "mage/translate"
], function (
    $,
    _,
    Component,
    ko,
    quote,
    stepNavigator,
    paymentService,
    methodConverter,
    getPaymentInformation,
    checkoutDataResolver,
    $t
) {
    "use strict";

    paymentService.setPaymentMethods(methodConverter(window.checkoutConfig.paymentMethods));

    return Component.extend({
        defaults: {
            template: "Magento_Checkout/payment",
            activeMethod: ""
        },
        isVisible: ko.observable(quote.isVirtual()),
        quoteIsVirtual: quote.isVirtual(),
        isPaymentMethodsAvailable: ko.computed(function () {
            return paymentService.getAvailablePaymentMethods().length > 0;
        }),

        /** @inheritdoc */
        initialize() {
            this._super();
            checkoutDataResolver.resolvePaymentMethod();
            stepNavigator.registerStep(
                "payment",
                null,
                $t("Review & Payments"),
                this.isVisible,
                _.bind(this.navigate, this),
                this.sortOrder
            );

            return this;
        },

        /**
         * Navigate method.
         */
        navigate() {
            var self = this;

            if (!self.hasShippingMethod()) {
                this.isVisible(false);
                stepNavigator.setHash("shipping");
            } else {
                getPaymentInformation().done(function () {
                    self.isVisible(true);
                });
            }
        },

        /**
         * @return {Boolean}
         */
        hasShippingMethod() {
            return window.checkoutConfig.selectedShippingMethod !== null;
        },

        /**
         * @return {*}
         */
        getFormKey() {
            return window.checkoutConfig.formKey;
        }
    });
});
