/**
 * This file is added by Supermarket theme.
 */

import PageManager from '../page-manager';
import initProductsByCategories from '../emthemes-modez/products-by-category';
import initSpecialProductsTabs from '../emthemes-modez/special-products-tabs';
import { debounce } from 'lodash';

export default class Home extends PageManager {
    onReady() {
        this.initProductsByCategorySection();
        this.initSpecialProductsTabsSection();
        // this.initMainCarouselSection(); // papathemes-beautyfeatures commented
        this.fixHomeBrandsCarousel();

        // papathemes-beautyfeatures
        $('#yotpo_testimonials_btn_copy').on('click', (event) => {
            event.preventDefault();
            $('#yotpo_testimonials_btn').trigger('click');
        });
    }

    initProductsByCategorySection() {
        if (this.context.hasProductsByCategorySortingTabs) {
            initProductsByCategories();
        }
    }

    initSpecialProductsTabsSection() {
        // Refresh products carousel when tab is open
        if (this.context.hasSpecialProductsTabs) {
            initSpecialProductsTabs({ context: this.context });
        }
    }

    /* papathemes-beautyfeatures commented
    initMainCarouselSection() {
        if (this.context.hasMainCarousel) {
            //
            // Update main slideshow min-height to equal the vertical categories menu
            //
            const $categoriesMenu = $('body.papaSupermarket-layout--default .emthemesModez-verticalCategories--open');

            const updateMainSlideshowHeight = () => {
                $('.heroCarousel-slide').css('min-height', $(window).width() > 768 ? `${$categoriesMenu.height() + 20}px` : '');
            };

            if ($categoriesMenu.length > 0) {
                updateMainSlideshowHeight();
                $(window).on('resize', () => updateMainSlideshowHeight());
            }
        }
    }
    */

    fixHomeBrandsCarousel() {
        const $slick = $('[data-home-brands-slick]');

        if ($slick.length === 0) {
            return;
        }

        const { responsive, ...data } = $slick.data('homeBrandsSlick');
        const breakpoints = responsive.map(r => ({
            ...data,
            breakpoint: r.breakpoint,
            ...r.settings,
        }));

        const getBreakpoint = () => {
            const width = $(window).innerWidth();
            return breakpoints.reduce((prev, current) => (current.breakpoint >= width ? current : prev), data);
        };

        let { breakpoint: currentBreakpoint, ...currentData } = getBreakpoint();

        $slick.slick(currentData);

        $(window).on('resize', debounce(() => {
            const { breakpoint: newBreakpoint, ...newData } = getBreakpoint();
            if (newBreakpoint !== currentBreakpoint) {
                currentBreakpoint = newBreakpoint;
                currentData = newData;
                $slick.slick('unslick').slick(currentData);
            }
        }, 500));
    }
}
