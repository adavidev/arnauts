package com.mygdx.game.core;

import com.badlogic.gdx.math.Vector3;

import java.util.ArrayList;

/**
 * Created by al on 4/7/2016.
 */
public abstract class NodeHolder {
    public static Vector3 rotAxis = new Vector3(0,0,1);
    public NodeHolder parent;
    public ArrayList<NodeHolder> nodes;
    public Vector3 pos;
    public Vector3 globalPos = new Vector3(0,0,0);
    public float rot;
    public Vector3 lastPos;
    public float lastRot;
    public int globalRot;
    public Vector3 localpos;
    public Vector3 center = Vector3.Zero;
    public float width = 10;
    public float height = 10;

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

    public void setSize(int x,int y){
        this.width = x;
        this.height = y;
        this.center.setZero();
        this.center.add(x/2,y/2,0);
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

        globalRot += rot;

        if (parent != null){
            globalRot += parent.rot;
        }

        globalPos = ancestralPos();

        pos.rotate(NodeHolder.rotAxis, -lastRot);
        pos.rotate(NodeHolder.rotAxis, globalRot);

        for(NodeHolder node : nodes){
            node.render();
        }

        lastRot = globalRot;
    }

    public Vector3 ancestralPos(){
        Vector3 total = new Vector3(0,0,0);
        for (NodeHolder node : ancestors()) {
            total.add(node.pos);
        }

        return total;
    }

    public Vector3 basicPos(){
        return new Vector3(pos).rotate(NodeHolder.rotAxis, -globalRot);
    }

    public Vector3 getCenter(){
        return new Vector3(center).rotate(NodeHolder.rotAxis, globalRot).add(pos);
    }

    public Vector3 basicCenter(){
        return basicPos().add(center);
    }

    public static void main(String[] args){
        NodeHolder a = new NodeHolder() { };
        NodeHolder b = new NodeHolder(a) { };
        NodeHolder c = new NodeHolder(b) { };

        System.out.println(c.ancestors());
    }
}
