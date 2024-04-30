// Getting existing or creating the window.tainacan_extra_components object
window.tainacan_extra_components = typeof window.tainacan_extra_components != "undefined" ? window.tainacan_extra_components : {};

// Creating your own VueJS component and passing it
const SomeTainacanPluginComponent = {
    name: "SomeTainacanPluginComponent",
    data: {
        // ...
    },
    methods: {
        // ...
    },
    template: `
     <!-- Here goes the template, including any components that we desire -->
    `
}
window.tainacan_extra_components["some-tainacan-plugin-component"] = SomeTainacanPluginComponent;