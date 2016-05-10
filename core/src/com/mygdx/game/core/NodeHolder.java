package com.mygdx.game.core;

import com.badlogic.gdx.math.Vector3;

import java.util.ArrayList;

/**
 * Created by al on 4/7/2016.
 */
public abstract class NodeHolder {
    public NodeHolder parent;
    public ArrayList<NodeHolder> nodes;
    public Vector3 pos;
    public Vector3 globalPos = new Vector3(0,0,0);
    public float rot;
    public Vector3 lastPos;
    public float lastRot;
    public int globalRot;

    public NodeHolder(NodeHolder holder) {
        if (holder != null)
            holder.add((NodeHolder) this);

        parent = holder;

        nodes = new ArrayList<NodeHolder>();
        pos = new Vector3(0,0,0);

        lastPos = new Vector3(this.pos);
        lastRot=0;
    }

    public NodeHolder() {
        this(null);
    }

    private ArrayList<NodeHolder> ancestors(){
        ArrayList<NodeHolder> parents = new ArrayList<NodeHolder>();

        if (parent == null){
            return parents;
        } else
        {
            parents.add(this);
            parents.addAll(parent.ancestors());
            return parents;
        }
    }

    public void add(NodeHolder e) {
        nodes.add(e);
        e.parent = this;
    }

    public void remove(NodeHolder e) {
        nodes.remove(e);
    }

    public void load(){
        for(NodeHolder node : nodes){
            node.load();
        }
    }

    public void render(){
        globalPos.setZero();
        globalRot = 0;

//        globalPos.add(pos);
        globalRot += rot;

        if (parent != null){
            globalRot += parent.rot;
        }

        for (NodeHolder node : ancestors()) {
            globalPos.add(node.pos);
//            globalRot += node.rot;
        }

        pos.rotate(new Vector3(0,0,1), -lastRot);
        pos.rotate(new Vector3(0,0,1), globalRot);

        for(NodeHolder node : nodes){
            node.render();
        }

//        rot = globalRot;


//        for(NodeHolder node : nodes){
//
//            node.globalPos.setZero();
//            node.pos.rotate(new Vector3(0,0,1), -lastRot);
//            node.pos.rotate(new Vector3(0,0,1), rot);
//            node.rot = rot;
//
//            node.globalPos.add(pos).add(node.pos);
//
//            node.render();
//        }

//        lastPos = pos;
        lastRot = globalRot;
    }

    public static void main(String[] args){
        NodeHolder a = new NodeHolder() { };
        NodeHolder b = new NodeHolder(a) { };
        NodeHolder c = new NodeHolder(b) { };

        System.out.println(c.ancestors());
    }
}
