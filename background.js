class containersTheme {
  constructor() {
    browser.tabs.onActivated.addListener(() => {
      this.getCurrentContainer();
    });
    browser.windows.onFocusChanged.addListener(() => {
      this.getCurrentContainer();
    });
    this.getCurrentContainer();
  }

  async getCurrentContainer() {
    const activeTabs = await browser.tabs.query({
      active: true
    });
    const hasUnpainted = activeTabs.some((tab) => {
      return this.isUnpaintedTheme(tab.cookieStoreId);
    });
    const containers = await this.getContainers();
    if (hasUnpainted) {
      this.resetTheme();
    }
    activeTabs.forEach((tab) => {
      const cookieStoreId = tab.cookieStoreId;
      if (!this.isUnpaintedTheme(cookieStoreId)) {
        this.changeTheme(cookieStoreId,
          tab.windowId,
          containers.get(cookieStoreId));
      }
    });
  }

  async getContainers() {
    const containersMap = new Map();
    const containers = await browser.contextualIdentities.query({});
    containers.forEach((container) => {
      containersMap.set(container.cookieStoreId, container);
    });
    return containersMap;
  }

  isUnpaintedTheme(currentCookieStore) {
    return (currentCookieStore == "firefox-default" ||
            currentCookieStore == "firefox-private");
  }

  resetTheme() {
    // Because of the following, we loop through all active windows after a reset
    // this means when we have unpained tabs the browser flickers
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1401691
    browser.theme.reset();
  }

  // https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
  shadeColor(color, percent) {   
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
  }

  async changeTheme(currentCookieStore, windowId, container) {
    this.cachedCookieStore = currentCookieStore;
    const newColor = this.shadeColor(container.colorCode, 0.6);
    return browser.theme.update(windowId, {
      images: {
        headerURL: "",
      },
      colors: {
        accentcolor: newColor,
        textcolor: "#111",
      }
    });
  }

}

new containersTheme();
