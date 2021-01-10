class MultiLevelMap {
    constructor(){
	this.points = new Map();
	this.adjmap = new Map();
    }
    has(p){
	var r = p.reduce((acc, key, i, p) => {
	    if (acc && acc.has(key)) {
		var item = acc.get(key)
		return item;
	    } else {
		return undefined;
	    }
	}, this.adjmap)
	return (typeof r !== 'undefined');
    }
    get(p){
	return p.reduce((acc, key, i, p) => {
	    if (acc && acc.has(key)) {
		var item = acc.get(key)
		return item;
	    } else {
		return undefined;
	    }
	}, this.adjmap)
    }
    set(p, v){
	this.points.set(p, 1);
	return p.reduce((acc, key, i, p) => {
	    if (i == p.length - 1) { acc.set(key, v); return this }

	    if (acc.has(key)) {
		var item = acc.get(key)
		return item;
	    } else {
		acc.set(key, new Map())
		var item = acc.get(key)
		return item;
	    }
	}, this.adjmap)
    }
}

class FixedLevelMap extends MultiLevelMap {
    constructor(levels) {
	super()
	this.levels = levels;
    }
    has(p) {
	if (p.length != this.levels) {
	    return false
	} else {
	    return super.has(p);
	}
    }
    get(p) {
	if (p.length != this.levels) {
	    return undefined
	} else {
	    // console.log(this.levels)
	    return super.get(p);
	}
    }
    set(p, v){
	if (p.length != this.levels) {
	    throw(new TypeError(`key has ${p.length} keys on a ${this.levels}-level map`))
	} else {
	    return super.set(p, v);
	}
    }    
}

class AdjacencyMap extends FixedLevelMap {
    constructor() {
	super(2)
    }
    addOne(p, b){
	if (this.has(p)){
	    super.get(p).push(b)
	} else {
	    super.set(p, [ b ]);
	}
    }
    addBoth(p, b){
	this.addOne(p, b);
	this.addOne(b, p);	
    }
    add(p, b){
	this.addBoth(p, b);
    }
    get roots() {
	var roots = [];
	this.points.forEach((p, i) => {
	    var a = this.get(i);
	    if (a.length == 1) {
		roots.push(i);
	    }
	})
	return roots;
    }
    next(p, seen){
	var nexts = this.get(p).filter(n => !seen.has(n));
	if (nexts.length) {
	    seen.set(nexts[0], 1);
	    return nexts[0]
	} else {
	    return undefined;
	}
    }
    iterate(start) {
	var seen = new FixedLevelMap(2);
	var route = [];
	seen.set(start, 1);
	var n = this.next(start, seen);
	while (n) {
	    route.push(n);
	    n = this.next(n, seen);
	}
	return route;
    }
}

// only run inside node.js
if (typeof window === 'undefined' && typeof DedicatedWorkerGlobalScope === 'undefined') {

    var n = new AdjacencyMap()
    
    console.log(n.add([1.1, 2], [1.6, 2.9]));
    console.log(n.add([1.1, 2], [3.6, 2.9]));
    console.log(n.add([1.1, 4], [3.6, 2.9]));
    
    console.log('12', n.get([1.1, 2]));
    
    console.log('16', n.get([1.1, 4]));
    
    console.log('undefined', n.get([1, 'c']));
    
    console.log('undefined', n.get([1]));
    
    console.log('false', n.has([1, 4]));
    
    console.log(n.roots);
    console.log(n.iterate(n.roots[0]));
    
    console.log(n);
}
