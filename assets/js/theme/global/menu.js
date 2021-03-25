import collapsibleFactory from '../common/collapsible';
import collapsibleGroupFactory from '../common/collapsible-group';
import mediaQueryListFactory from '../common/media-query-list'; // papathemes-beautyfeatures

const PLUGIN_KEY = 'menu';

const mediumMediaQueryList = mediaQueryListFactory('medium'); // papathemes-beautyfeatures

/*
 * Manage the behaviour of a menu
 * @param {jQuery} $menu
 */
class Menu {
    constructor($menu) {
        this.$menu = $menu;
        this.$body = $('body');
        this.hasMaxMenuDisplayDepth = this.$body.find('.navPages-list').hasClass('navPages-list-depth-max');

        // Init collapsible
        this.collapsibles = collapsibleFactory('[data-collapsible]', { $context: this.$menu });
        this.defaultCollapsibles = collapsibleFactory('.is-default[data-collapsible]', { $context: this.$menu }); // papathemes-beautyfeatures
        this.collapsibleGroups = collapsibleGroupFactory($menu);

        // papathemes-beautyfeatures: fix not collapse others if an element has is-open class at init.
        this.collapsibleGroups.forEach(group => {
            const _arr = collapsibleFactory($('.is-open[data-collapsible]', group.$component).first());
            if (_arr.length > 0) {
                // eslint-disable-next-line no-param-reassign
                group.openCollapsible = _arr[0];
            }
        });

        // Auto-bind
        this.onMenuClick = this.onMenuClick.bind(this);
        this.onDocumentClick = this.onDocumentClick.bind(this);

        // Listen
        this.bindEvents();
    }

    collapseAll() {
        // this.collapsibles.forEach(collapsible => collapsible.close()); // papathemes - supermarket: fix issue when click body dropdown menu being hidden
        this.collapsibleGroups.forEach(group => group.close());

        // papathemesb-beautyfeatures
        // Re-open the firt menu item
        if (mediumMediaQueryList.matches) {
            this.defaultCollapsibles.forEach(group => group.open());
        }
    }

    collapseNeighbors($neighbors) {
        const $collapsibles = collapsibleFactory('[data-collapsible]', { $context: $neighbors });

        $collapsibles.forEach($collapsible => $collapsible.close());
    }

    bindEvents() {
        this.$menu.on('click', this.onMenuClick);
        this.$body.on('click', this.onDocumentClick);
    }

    unbindEvents() {
        this.$menu.off('click', this.onMenuClick);
        this.$body.off('click', this.onDocumentClick);
    }

    onMenuClick(event) {
        // papathemes-beautyfeatures
        if ($(event.target).is('[data-menu-excluded-scope]') || $(event.target).closest('[data-menu-excluded-scope]').length > 0) {
            return;
        }

        event.stopPropagation();

        if (this.hasMaxMenuDisplayDepth) {
            const $neighbors = $(event.target).parent().siblings();

            this.collapseNeighbors($neighbors);
        }
    }

    onDocumentClick() {
        this.collapseAll();
    }
}

/*
 * Create a new Menu instance
 * @param {string} [selector]
 * @return {Menu}
 */
export default function menuFactory(selector = `[data-${PLUGIN_KEY}]`) {
    const $menu = $(selector).eq(0);
    const instanceKey = `${PLUGIN_KEY}Instance`;
    const cachedMenu = $menu.data(instanceKey);

    if (cachedMenu instanceof Menu) {
        return cachedMenu;
    }

    const menu = new Menu($menu);

    $menu.data(instanceKey, menu);

    return menu;
}
