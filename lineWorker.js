importScripts(
    'https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.11/paper-full.min.js',
    "./rhill-voronoi-core.js",
    "./MultiLevelMap.js"
)

paper.install(this);
paper.setup([1500, 1500]);

var colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];

console.log(typeof window === 'undefined');

console.log(typeof this);

console.log(this);
console.log(typeof DedicatedWorkerGlobalScope);


onmessage = function(event) {
    var shape = paper.importJSON(event.data.shape)
    var sites = event.data.sites;
    
    var voronoi =  new Voronoi();
    
    var bbox = { xl: shape.bounds.x,
		 xr: shape.bounds.x + shape.bounds.width,
		 yt: shape.bounds.y,
		 yb: shape.bounds.y + shape.bounds.height };

    console.time('voronoi');
    var diagram = voronoi.compute(sites, bbox);
    console.timeEnd('voronoi');
    var ad = new AdjacencyMap();
    
    console.time('edges');
    
    var edges = diagram.edges
	.filter(e => {
	    var a = new Point(e.va.x, e.va.y);
	    var b = new Point(e.vb.x, e.vb.y);
	    return shape.contains(a) && shape.contains(b)
	});
    console.timeEnd('edges');

    console.time('draw');
    edges.forEach(e => {
	var from = [e.va.x, e.va.y];
	var to   = [e.vb.x, e.vb.y];
	
	ad.add(from, to)
    });
    console.timeEnd('draw');
    
    var roots = ad.roots;

    console.time('paths');
    roots.forEach((root, i) => {
	var route = ad.iterate(root);

	var path = new Path();
	
	path.strokeColor = colors[i % colors.length];
	path.strokeWidth = 6;
	route.map(r => new Point(...r)).forEach(p => { path.add(p) });
	path.simplify();
	postMessage({ shape: path.exportJSON() });
    });
}
