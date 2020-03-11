import * as d3 from 'd3';

import {throttle} from './throttledebance'




let nodes ;

let edges;


let imageWidth = 50;
let imageHeight = 50;






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
  
    // let lines = svg.selectAll('.edge').select('line')
    //                 .attr('x1',(d)=>d.source.x)
    //                 .attr('y1',(d)=>d.source.y)
    //                 .attr('x2',(d)=>d.target.x)
    //                 .attr('y2',(d)=>d.target.y);
    svg.selectAll('.edge').select('path')
            .attr('d',function(d){ 
                return `M${d.source.x} ${d.source.y} L${d.target.x} ${d.target.y}` ;
            });
    

    // svg.selectAll('.node').select('circle')
    //         .attr('cx',(d)=>d.x)
    //         .attr('cy',(d)=>d.y);
    svg.selectAll('.node').select('image')
            .attr('x',(d)=>d.x-imageWidth/2)
            .attr('y',(d)=>d.y-imageHeight/2);
    svg.selectAll('.node').select('.imageborder')
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
  
    let h,w;
    svg = d3.select(domid);
    svg.attr("i-s",function(d){
        h = this.parentElement.offsetWidth;
        w= this.parentElement.offsetHeight;
        return "";
    });
    let preX=null;
    let preY=null;
    let startEle = null;
    let endEle = null;
    if(!simulation){
        let mousemoveHandler = throttle(function(e){
            //right btn clicked
            if(e.buttons===4 && preX && preY){
                let cen = simulation.force("center");
            // console.log("mousemove",cen.x() + e.offsetX-preX,cen.y()+e.offsetY-preY);

                cen.x(cen.x() + e.offsetX-preX).y(cen.y()+e.offsetY-preY);

                preX = e.offsetX;
                preY = e.offsetY;
                simulation.restart();
            }else if(e.buttons===4){
                preX = e.offsetX;
                preY = e.offsetY;
            }else{
                preX = null;
                preY = null;
            }


            if(e.buttons===2 && startEle){
                
                svg.select('#templine').attr('x2',e.offsetX)
                                        .attr('y2',e.offsetY)
            }else if(e.buttons===2 && !startEle){
                // console.log("start",startEle , new Date().getTime(),e)
                startEle = simulation.find(e.offsetX , e.offsetY  ,55);
                if(startEle){
                    svg.append('line')
                    .attr('stroke',"#999")
                    .attr('id','templine')
                    .attr('x1',startEle.x)
                    .attr('y1',startEle.y)
                    .attr('x2',startEle.x)
                    .attr('y2',startEle.y)
                }
            }else if(startEle ){
                console.log("end",e.buttons)
                d3.select('#templine').remove();
                endEle = simulation.find(e.offsetX, e.offsetY ,55);
                if(endEle){
                    insertEdge({
                        source:startEle.id,
                        target:endEle.id,
                        relaUnit:{id:-1}
                    });    
                console.log(startEle , endEle ,e);
                    endEle = null;

                }
                startEle = null;
            }
            // else 
            // {
            //     startEle = null;
            //     endEle = null;
            // }

        } , 10);
        // TODO mousemove always called twice !! I tried throttle function dont work, also as stopPropagation, I dont know why ,
        // anyway fix it by add check in insertEdge func
        document.getElementById(domid.slice(1)).addEventListener('mousemove',function(e){
            e.stopPropagation();
            e.preventDefault();
            mousemoveHandler(e);
        });

        document.getElementById(domid.slice(1)).addEventListener('contextmenu' ,function(e){e.preventDefault();})
    }
    nodes = ns;
    edges = es;
    simulation = d3.forceSimulation(nodes)
                    .force("link" , d3.forceLink(edges).id((d)=>{return d.id;}).iterations(10).distance(150))
                    .force("charge", d3.forceManyBody().strength(-100))
                    .force("center",d3.forceCenter().x(w/2).y(h/2))
                    // .force("center",d3.forceCenter().x(svg.attr('width')/2).y(svg.attr('height')/2))
                    .on('tick',ticked);
 
    
    updateSimu(nodes, edges);
}

function updateSimu(gnodes, gedges){
    // svg.attr('width',function(){return this.parentElement.offsetWidth;})
    //     .attr('height' , function(){return this.parentElement.offsetHeight});
    // svg.attr('viewBox' , function(){
    //     return `0 0 ${this.parentElement.offsetWidth} ${this.parentElement.offsetHeight}`;
    // });
    simulation.nodes(gnodes);
    simulation.force('link').links(gedges);

    let edgeEles = svg.select('.edgegroup').selectAll('.edge')
                      .data(gedges);

    edgeEles.exit().remove();

    let edgeElesEnter = edgeEles.enter()
                // .datum(d=>{
                //     console.log("in update",d)
                //     return d;
                // })
                .append('g')
                .attr('class','edge')
                .on('click', function(d){
                    app.clickRela(d);
                   
                })
    edgeElesEnter.append('path')
            .attr('id' , function(d){return "path"+d.relaUnit.id})
            .attr('marker-end','url(#arrowhead)')
            .attr('class','edgeline');
    edgeElesEnter.append('text')
                 .attr('class','edgetext')
                 .style('text-anchor','middle')
                //  .attr('alignment-baseline','middle')
                 .append('textPath')
                 .attr('href',d=>`#path${d.relaUnit.id}`)
                 .attr('startOffset','50%')
                 .text(d=>d.relaUnit.relationName);


    let nodeEles = svg.select('.nodegroup').selectAll('.node').data(gnodes);

    nodeEles.exit().remove();

    let nodeElesEnter = nodeEles.enter()
                .append('g')
                .attr('class', 'node')
                .call(d3.drag()
                        .on('start',started)
                        .on('drag',dragged)
                        .on('end',ended))
                .on("click",function(d){
                    app.clickNode(d);
                    console.log("force click",d)
                });

    // nodeElesEnter.append('circle')
    //             .attr('r','5');
    nodeElesEnter.append('image')
                .attr("xlink:href" , d=>{
                    if(app.moduleMap[d.mainLabel])
                    return app.baseURL +"/image/"+app.moduleMap[d.mainLabel].avatarUri;
                    return "./static/moduleavatar.png";
                })
                .attr('width',imageWidth)
                .attr('height',imageHeight)
                .attr('clip-path','url(#circlepath)')
    nodeElesEnter.append('circle')
                    .attr('class','imageborder')
                    .attr('r',imageHeight/2);

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
    let flag=false;
    edges.forEach(d=>{
        if (d.relaUnit.id===edge.relaUnit.id ){
            flag = true;
        }
    })
    if(flag){
        console.log("reject insert edge");
        return;
    }
    edge.relaUnit.id=-2;
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

export default {genforceSimu  ,updateSimu, insertNode, deleNode , insertEdge , deleEdge};

// genforceSimu("#can" , nodes, edges);