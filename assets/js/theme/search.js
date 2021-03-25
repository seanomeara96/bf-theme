import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import FacetedSearch from './common/faceted-search';
// Supermarket Mod
// import compareProducts from './global/compare-products';
import compareProducts from '../emthemes-modez/compare-products';
import urlUtils from './common/url-utils';
import Url from 'url';
import collapsibleFactory from './common/collapsible';
import nod from './common/nod';
import actionBarFactory from '../emthemes-modez/action-bar'; // Papathemes - Supermarket
import bulkOrderFactory from '../emthemes-modez/bulk-order';

export default class Search extends CatalogPage {
    showProducts() {
        const url = urlUtils.replaceParams(window.location.href, {
            section: 'product',
        });

        this.$productListingContainer.removeClass('u-hiddenVisually');
        this.$facetedSearchContainer.removeClass('u-hiddenVisually');
        this.$contentResultsContainer.addClass('u-hiddenVisually');

        $('[data-content-results-toggle]').removeClass('navBar-action-color--active');
        $('[data-content-results-toggle]').addClass('navBar-action');

        $('[data-product-results-toggle]').removeClass('navBar-action');
        $('[data-product-results-toggle]').addClass('navBar-action-color--active');

        urlUtils.goToUrl(url);
    }

    showContent() {
        const url = urlUtils.replaceParams(window.location.href, {
            section: 'content',
        });

        this.$contentResultsContainer.removeClass('u-hiddenVisually');
        this.$productListingContainer.addClass('u-hiddenVisually');
        this.$facetedSearchContainer.addClass('u-hiddenVisually');

        $('[data-product-results-toggle]').removeClass('navBar-action-color--active');
        $('[data-product-results-toggle]').addClass('navBar-action');

        $('[data-content-results-toggle]').removeClass('navBar-action');
        $('[data-content-results-toggle]').addClass('navBar-action-color--active');

        urlUtils.goToUrl(url);
    }

    onReady() {
        // Supermarket Mod
        // compareProducts(this.context.urls);
        compareProducts(this.context);

        const url = Url.parse(window.location.href, true);
        this.$productListingContainer = $('#product-listing-container');
        this.$facetedSearchContainer = $('#faceted-search-container');
        this.$contentResultsContainer = $('#search-results-content');

        // Papathemes - Bulk Order
        if (this.context && (this.context.themeSettings.show_bulk_order_mode || this.context.useBulkOrder)) {
            this.bulkOrder = bulkOrderFactory(this.context);
        }

        actionBarFactory(); // Papathemes - Supermarket

        // Init faceted search
        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        // Init collapsibles
        collapsibleFactory();

        $('[data-product-results-toggle]').on('click', event => {
            event.preventDefault();
            this.showProducts();
        });

        $('[data-content-results-toggle]').on('click', event => {
            event.preventDefault();
            this.showContent();
        });

        if (this.$productListingContainer.find('li.product').length === 0 || url.query.section === 'content') {
            this.showContent();
        } else {
            this.showProducts();
        }
    }

    // Supermarket
    destroy() {
        if (this.facetedSearch) {
            this.facetedSearch.destroy();
        } else {
            hooks.off('sortBy-submitted', this.onSortBySubmit);
        }
    }

    initFacetedSearch() {
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const $searchHeading = $('#search-results-heading');
        const $searchCount = $('#search-results-product-count');
        const productsPerPage = this.context.searchProductsPerPage;
        const requestOptions = {
            template: {
                productListing: 'search/product-listing',
                sidebar: 'search/sidebar',
                heading: 'search/heading',
                productCount: 'search/product-count',
            },
            config: {
                product_results: {
                    limit: productsPerPage,
                },
            },
            showMore: 'search/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);
            $searchHeading.html(content.heading);
            $searchCount.html(content.productCount);

            $('body').triggerHandler('compareReset');

            // Papathemes - Bulk Order
            if (this.bulkOrder) {
                this.bulkOrder.reinit();
            }

            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        });
    }

    initValidation($form) {
        this.$form = $form;
        this.validator = nod({
            submit: $form,
        });

        return this;
    }

    bindValidation($element) {
        if (this.validator) {
            this.validator.add({
                selector: $element,
                validate: 'presence',
                errorMessage: $element.data('errorMessage'),
            });
        }

        return this;
    }

    check() {
        if (this.validator) {
            this.validator.performCheck();
            return this.validator.areAll('valid');
        }

        return false;
    }
}
