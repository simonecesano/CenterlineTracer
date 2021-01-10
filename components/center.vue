<style scoped>
.styled {
    border: 0;
    line-height: 2;
    padding: 0 20px;
    font-size: 1rem;
    text-align: center;
    color: #fff;
    border-radius: 0px;
    background-color: rgba(220, 0, 0, 1);
}

.styled:hover {
    background-color: rgba(255, 0, 0, 1);
}

.styled:active {
    box-shadow: inset -2px -2px 3px rgba(255, 255, 255, .6),
                inset 2px 2px 3px rgba(0, 0, 0, .6);
}
input[type=range] { margin-top: 0px }


input[type=range][orient=vertical]
{
    writing-mode: bt-lr; /* IE */
    -webkit-appearance: slider-vertical; /* WebKit */
    width: 8px;
    height: 175px;
    padding: 0 5px;
}

#input, #output {
    position: relative;
    display:inline-block;
    top: 0px; left: 0px;
    margin:0; padding:0;
}
div.range { display: table-cell; vertical-align: middle; height: 50px }
div.range label { vertical-align:middle }
div.range input { vertical-align:middle }


</style>
<template>
  <div>
    <h1>Empty</h1>
    <div id="svgSlot" ref="svgSlot">
    </div>
    <button class="favorite styled" @click="calculateCenterline()" type="button">calculate centerline</button>
    <button class="favorite styled" @click="saveVector()" type="button">save as SVG</button>
    <div class="range">
      <label for="scale">Distance</label>
      <input type="range" id="distance" v-model="distance" min="1" max="50" step="1" /> {{ distance }}
    </div>
    <div class="range">
      <label for="scale">Zoom</label>
      <input type="range" id="zoom" v-model="zoom" min="1" max="5" step="0.1" /> {{ zoom }}
    </div>
    <div style="width:100%;height:720px"><canvas
	   v-on:drop.prevent="dropHandler" v-on:dragover.prevent="dragOverHandler"
	   id="output" ref="output"></canvas>
    </div>
  </div>
</template>
    <script>
    module.exports = {
	data: function () {
	    return {
		svg: undefined,
		project: undefined,
		distance: 10,
		zoom: 1,
		canvasKey: (new Date()).getTime(),
		fileName: undefined,
		colors: ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'],
	    };
	},
	mounted: function(){
	    var c = this;
	    paper.install(window);
	    paper.setup(c.$refs.output);
	    paper.view.on('mousedrag', c.mouseDrag);

	    console.log(c.$refs.output.parentNode.offsetWidth, c.$refs.output.parentNode.offsetHeight);

	    c.project = project;

	    console.log()
	    
	    axios.get('./archive/test_03.svg').then(d => { c.loadSVG(d.data) })
	},
	destroyed: function(){

	},
	watch: {
	    zoom: function(a, b) {
		var c = this;
		project.view.zoom = a;
		c.$nextTick(() => {
		    project.view.update()
		})
	    }
	},
	methods: {
	    loadSVG: function(svg){
		var c = this;
		c.project.clear();
		svg = c.project.importSVG(svg);
		c.svg = svg;
		c.project.view.viewSize = new Rectangle(0, 0, c.$refs.output.parentNode.offsetWidth, c.$refs.output.parentNode.offsetHeight);
		// c.project.view.viewSize = c.svg.bounds;
		c.svg.translate(
		    c.project.view.size.width / 2 - c.svg.bounds.width / 2,
		    c.project.view.size.height / 2 - c.svg.bounds.height / 2,
		)
		
		
	    },
	    mouseDrag: function(e){
		console.log(e);
	    },
	    dragOverHandler: function(e){
		e.preventDefault();
	    },
	    dropHandler: function(e){
		var c = this;
		e.preventDefault();
		if (e.dataTransfer.items) {
	    	    for (var i = 0; i < 1; i++) {
	    		if (e.dataTransfer.items[i].kind === 'file' && e.dataTransfer.items[i].type.match(/image.+svg/)) {
			    var file = e.dataTransfer.items[i].getAsFile();
			    c.fileName = file.name;
			    file.text().then(t => { c.loadSVG(t) })
			} else {
			    
			}
	    	    }
		}
	    },
	    
	    saveThing: function(thing, mime, name){
		var file = new Blob([thing], {type: mime});
		var a = document.createElement("a");
		var url = URL.createObjectURL(file);
		a.href = url;
		a.download = name
		document.body.appendChild(a);
		a.click();
		setTimeout(function() { document.body.removeChild(a); window.URL.revokeObjectURL(url) }, 0);
	    },
	    saveVector: function(){
		var c = this;
		var svg = c.project.exportSVG({ asString: true, matchShapes: true, precision: 2 });
		c.saveThing(svg, 'image/svg+xml', 'paper.svg');
	    },
	    calculateCenterline: function(){
		var c = this;
		console.log(c.project.getItems({ recursive: true }).map(i => {
		    return i.className
		}))
		var items = c.project.getItems({ recursive: true, match: function(i) { return i.getPointAt } });

		var colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];

		var sites = [];
		var distance = parseInt(c.distance);
		
		var shape = items[0].parent.className == 'CompoundPath' ?
		    items[0].parent : items[0];
		
		console.log(shape.className);

		console.log(items);

		console.time('sites')
		items.forEach((p, j) => {
		    console.log(p)
		    var l = p.length;
		    if (l < 10) {
			
		    } else {
			var k = 0;
			for (var i = 0; i < l; i += distance) {
			    var c = p.getPointAt(i)
			    sites.push(c);
			}
		    }
		    var w = new Worker('lineWorker.js');
		    w.postMessage({ sites: sites, shape: shape.exportJSON() });
		    w.onmessage = function(e) { project.importJSON(e.data.shape).addTo(project) };
		})
		console.timeEnd('sites')
		console.log(sites.length);
	    },

	    makeLines: function(sites, shape){
		// moved to lineworker
	    },
	}
    }
// m 12.37077,631.5067  9.1685, -6.40368
// m  9.27776,631.97738 3.09301,-0.47068
</script>
