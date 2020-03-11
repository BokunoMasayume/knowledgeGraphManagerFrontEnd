import * as d3 from 'd3';






let nodes = [
    {
        "id": 13,
        "labels": [
            "testmain1",
            "F5e4802af6278bd3ebf72a300",
            "test1",
            "U5e46bb31afe811358c43522c"
        ],
        "properties": {
            "country": "grama",
            "name": "Allen"
        },
        "mainLabel": "testmain1",
        "delete": false
    },
    {
        "id": 17,
        "labels": [
            "F5e4802af6278bd3ebf72a300",
            "U5e46bb31afe811358c43522c",
            "firstModule"
        ],
        "properties": {
            "country": "grama",
            "name": "Allen",
            "anumber": 45
        },
        "mainLabel": "firstModule",
        "delete": false
    },
    {
        "id": 20,
        "labels": [
            "F5e4802af6278bd3ebf72a300",
            "U5e46bb31afe811358c43522c",
            "firstModule"
        ],
        "properties": {
            "country": "grama",
            "proptest": true,
            "name": "Kanda"
        },
        "mainLabel": "firstModule",
        "delete": false
    }
]; 

let edges =[
    {
        "relaUnit": {
            "id": 10,
            "relationName": "testrname",
            "properties": {
                "bb": "sdfdsf",
                "aa": "aa",
                "dfds": 444.0,
                "jjki": true
            },
            "delete": false
        },
        "source": 17,
        "target": 20
    },
    {
        "relaUnit": {
            "id": 9,
            "relationName": "testrname",
            "properties": {
                "aa": "aa"
            },
            "delete": false
        },
        "source": 17,
        "target": 13
    }
]









/**
 * when d3 drag  start 
 * @param {node object} d  
 */
function started(d){
    // forceSimu.alpha(1).restart();
    simulation.alphaTarget(0.3).restart();

    d.fx = d.x;
    d.fy = d.y;
}
/**
 * when d3 drag continue
 * @param {node object} d 
 */
function dragged(d){
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

/**
 * when d3 drag end
 * @param {node object} d 
 */
function ended(d){
    simulation.alphaTarget(0);

    d.fx = null;
    d.fy = null;
}

let svg , simulation ;
function ticked(){
    let lines = svg.selectAll('.edge').select('line')
                    // .datum(function(d,i){
                    //     console.log(d);
                    //     if(!d.target || !d.source){
                    //         edges.splice(i,1);
                    //         updateSimu(nodes,edges);
                            
                    //     }
                    //     return d;
                    // })
                    .attr('x1',(d)=>d.source.x)
                    .attr('y1',(d)=>d.source.y)
                    .attr('x2',(d)=>d.target.x)
                    .attr('y2',(d)=>d.target.y);

    svg.selectAll('.node').select('circle')
                    .attr('cx',(d)=>d.x)
                    .attr('cy',(d)=>d.y);
}

/**
 * 
 * @param {string} domid - root svg select str, like '#svgid'
 * @param {Array} ns - init nodes list of the graph
 * @param {Array} es - init edges list of the graph
 */
function genforceSimu(domid , ns , es){
    svg = d3.select(domid);
    nodes = ns;
    edges = es;
    simulation = d3.forceSimulation(nodes)
                    .force("link" , d3.forceLink(edges).id((d)=>{return d.id;}).iterations(10).distance(100))
                    .force("charge", d3.forceManyBody())
                    .force("center",d3.forceCenter().x(svg.attr('width')/2).y(svg.attr('height')/2))
                    .on('tick',ticked);
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10 ')
        .attr('refX',13)
        .attr('refY',0)
        .attr('orient', 'auto')
        .attr('markerWidth',13)
        .attr('markerHeight',13)
        .attr('xoverflow', 'visible')
        .append('path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill','#999')
        .style('stroke','none');

    updateSimu(nodes, edges);
}

function updateSimu(gnodes, gedges){
    simulation.nodes(gnodes);
    simulation.force('link').links(gedges);

    let edgeEles = svg.selectAll('.edge')
                      .data(gedges);

    edgeEles.exit().remove();

    let edgeElesEnter = edgeEles.enter()
                // .datum(d=>{
                //     console.log("in update",d)
                //     return d;
                // })
                .append('g')
                .attr('class','edge')
    edgeElesEnter.append('line')
            .attr('marker-end','url(#arrowhead)')
            .attr('class','edgeline');


    let nodeEles = svg.selectAll('.node').data(gnodes);

    nodeEles.exit().remove();

    let nodeElesEnter = nodeEles.enter()
                .append('g')
                .attr('class', 'node')
                .call(d3.drag()
                        .on('start',started)
                        .on('drag',dragged)
                        .on('end',ended))
                .on("click",function(d){
                    console.log('click' ,d);
                });

    nodeElesEnter.append('circle')
                .attr('r','5');



    simulation.restart();
}

/**
 * insert a node into the graph
 * will also change the origin data?
 * @param {object} node - the node to be insert in the graph
 */
function insertNode(node){
    nodes.push(node);
    updateSimu(nodes,edges);
}
/**
 * will also change the origin data?
 * @param {string|number} nodeid - the id of the node to be delete from the graph 
 */
function deleNode(nodeid){
    nodes = nodes.filter(e=>{
        return e.id!=nodeid;
    });

    edges = edges.filter(e=>{
        return e.source.id!=nodeid && e.target.id!=nodeid;
    })

    updateSimu(nodes,edges);

}
 /**
 * will also change the origin data?
  * 
  * @param {object} edge - edge object will be inserted
  */
function insertEdge(edge){
    edges.push(edge);

    updateSimu(nodes,edges);

}
/**
 * will also change the origin data?
 * 
 * @param {string | number} edgeid -id of the edge will be delete
 */
function deleEdge(edgeid){
    edges = edges.filter(e=>{
        return e.relaUnit.id!=edgeid;
    })

    updateSimu(nodes,edges);

}

export default {genforceSimu  , insertNode, deleNode , insertEdge , deleEdge};

// genforceSimu("#can" , nodes, edges);