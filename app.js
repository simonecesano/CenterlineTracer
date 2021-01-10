var app = new Vue({
    el: '#app',
    mounted: function(){

    },
    router: (new VueRouter({
	routes: [
	    { path: '/',         redirect: '/center' },
	    { path: '/center',  component: httpVueLoader('components/center.vue') },
	]})),
    data: {
	screen: {}
    }
})
